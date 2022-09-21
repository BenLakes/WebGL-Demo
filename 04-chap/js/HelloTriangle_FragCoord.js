/**
 * 目标: 使用内置的片元变量 gl_FragCoord 内置变量的 第1 2 参数 表示片元 在canvas 画布坐标系
 * 窗口中的坐标位置
 */
// 顶点着色器
let VSHARDER_SOURCE = `
  // 顶点坐标数据 
  attribute vec4 a_Position;

  void main() {
    /* 
      gl_Position 接收到数据后  会马上进入图元装配区 并缓存起来 等所有顶点都执行 
      就根据 drawArrays 第一个参数 进行装配  装配完成 后进行光删化 形成片元
    */
    gl_Position = a_Position;
  }
`;

// 片元着色器
let FSHADER_SOURCE = `
 precision mediump float;
 uniform float u_Width; 
 uniform float u_Height; 
 void main() {
   gl_FragColor = vec4(gl_FragCoord.x / u_Width, 0.0, gl_FragCoord.y / u_Height, 1.0);
  }
`;

function main() { 
  let canvas = document.getElementById('myCanvas');
  let gl = getWebGLContext(canvas);
  if (!gl) {
    console.log("获取WebGL 上下文失败");
    return;
  }
  // 初始化着色器
  if (!initShaders(gl, VSHARDER_SOURCE, FSHADER_SOURCE)) {
    console.log("初始化着色器程序失败");
    return;
  }
  let n = initVertexBuffers(gl);
  if (n < 0) {
    console.log("初始化缓冲区对象失败");
    return;
  }
  // 清除背景颜色
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // 清除内容
  gl.clear(gl.COLOR_BUFFER_BIT);
  //绘制
  // gl.drawArrays(gl.TRIANGLES, 0, n);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
}
function initVertexBuffers(gl) { 
  let verties = new Float32Array([-1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0,1.0])
  let n = 4;
  // 创建缓冲区
  let vertexArrayBuffer = gl.createBuffer();
  if (!vertexArrayBuffer) {
    console.log("创建缓冲区对象失败");
    return -1;
  }
  // 绑定数据
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexArrayBuffer);
  // 缓冲区 写入数据
  gl.bufferData(gl.ARRAY_BUFFER, verties, gl.STATIC_DRAW);
  // 获取 attribute 分配值
  let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log("获取属性内存失败");
    return -1;
  }
  // 分配数据
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  // 获取u_Width / u_Height  赋予 canvas 的 宽高值 
  let u_Width = gl.getUniformLocation(gl.program, 'u_Width');
  let u_Height = gl.getUniformLocation(gl.program, 'u_Height');
  if (!u_Width || !u_Height) {
    console.log("获取uniform 相关地址失败");
    return -1;
  }
  // 赋予 颜色缓冲区值 实际就是 canvas 宽高 值 
  gl.uniform1f(u_Width, gl.drawingBufferWidth);
  gl.uniform1f(u_Height, gl.drawingBufferHeight);
  // 链接
  gl.enableVertexAttribArray(a_Position);
  return n;
}