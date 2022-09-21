/**
 * 目标: 使用单个 顶点、顶点大小数据对象 和 单个缓冲区 分配数据
 */
//顶点着色器
let VSHARDER_SOURCE = `
  attribute vec4 a_Position;
  attribute float a_PointSize;
  void main()  {
    gl_Position = a_Position;
    gl_PointSize = a_PointSize;
  }
`;
// 片元着色器
let FSHARDER_SOURCE = `
  void main() {
    gl_FragColor = vec4(1.0,0.0,0.0,1.0);
  }
`;
// js 入口函数
function main() { 
  let canvas = document.getElementById('myCanvas');
  let gl = getWebGLContext(canvas);
  if (!gl) {
    console.log("获取webgl绘图上下文失败");
    return;
  }
  // 初始化顶点着色器
  if (!initShaders(gl,VSHARDER_SOURCE, FSHARDER_SOURCE)) {
    console.log("初始化着色器失败");
    return;
  }
  // 初始化顶点缓冲区
  let n = initVertexBuffers(gl);
  if (n< 0) {
    console.log("创建顶点缓冲区对象失败");
    reutrn;
  }
  //设置背景颜色
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  //清除
  gl.clear(gl.COLOR_BUFFER_BIT);
  // 绘制
  gl.drawArrays(gl.POINTS, 0, n);
}
function initVertexBuffers(gl) { 
  // 顶点和顶点大小数据
  let vertices = new Float32Array([
    0, 0.5, 10.0,
    -0.5, -0.5, 20.0,
    0.5, -0.5, 30.0
  ]);
  let n = 3;

  // 创建缓冲区对象
  let vertexSizeBuffer = gl.createBuffer();
  if (!vertexSizeBuffer) {
    console.log("创建缓冲区对象异常");
    return -1;
  }
  // 绑定目标对象
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexSizeBuffer);
  // 分配数据
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  //获取每个 vertices 数据占用的字节数  用于后续的偏移
  let FSIZE = vertices.BYTES_PER_ELEMENT;

  // 获取a_Position 内存地址
  let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log("获取a_Position 内存失败");
    return -1;
  }
  // 分配数据
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 3, 0);
  // 开启链接
  gl.enableVertexAttribArray(a_Position);

  // 获取 a_PointSize 内存地址
  let a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');

  if (a_PointSize < 0) {
    console.log("获取a_PointSize存储地址异常")
    return -1;
  }
  // 分配值
  gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, FSIZE * 3, FSIZE * 2);
  // 开启链接
  gl.enableVertexAttribArray(a_PointSize);
  return n;

}