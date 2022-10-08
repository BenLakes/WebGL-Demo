/**
 * 目标：使用gl.drawElement 结合索引缓冲区 绘制cube
 * 使用 drawArrays()方法可以绘制出立方体 问题是会有很多重复点  或 需要调用多次的 drawArrays() 方法
 * webGL使用gl.drawElements() 替代gl.drawArrays() 函数进行绘制,能够避免重复定义顶点 保持顶点数量最小
 * 为此需要增加一个索引值缓冲区对象数据 将立方体拆成6个面 前后左右上下 每个面两个三角形组成
 * gl.drawElements() 1. 绘制类型  2. 指定绘制点的个数 3. 指定索引值数据类型 (gl.UNSIGNED_BYTE/gl.UNSIGNED_SHORT)
 *  4. 指定索引数组中开始绘制位置偏移量 字节为单位
 * 
 * 
 */
let VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec4 a_Color;
  uniform mat4 u_mvpMatrix;
  varying vec4 v_Color;
  void main() {
    gl_Position = u_mvpMatrix * a_Position;
    v_Color = a_Color;
  }
`;
let FSHADER_SOURCE = `
#ifdef GL_ES
 precision mediump float;
#endif
  varying vec4 v_Color;
  void main() {
    gl_FragColor = v_Color;
  }
`;

function main() { 
  let canvas = document.getElementById('myCanvas');
  let gl = getWebGLContext(canvas);
  if (!gl) {
    console.log("获取webGL上下文失败");
    return;
  }
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("初始化着色器失败");
    return;
  }
  let n = initVertexBuffer(gl);
  if (n < 0) {
    console.log("初始化缓冲区对象失败");
    return;
  }
  gl.clearColor(0.0, 0.0, 0.0, 1);
  gl.enable(gl.DEPTH_TEST);
  let u_mvpMatrix = gl.getUniformLocation(gl.program, 'u_mvpMatrix');
  if (!u_mvpMatrix) {
    console.log("获取Uniform失败");
    return
  }
  let mvpMatrix = new Matrix4();
  mvpMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100);
  mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
  gl.uniformMatrix4fv(u_mvpMatrix, false, mvpMatrix.elements);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  /**
   * 绘制
   * 第2个参数n表示顶点索引数组的长度, 也是顶点着色器执行的次数  与 vertices的顶点个数不一样 会更多
   * 调用drawElements()函数时，WebGL首先从绑定到 gl.ELEMENT_ARRAY_BUFFER 目标缓冲区也就是indexBuffer中获取顶点的
   * 索引值 然后根据索引值去 顶点缓冲区中获取顶点的坐标、颜色信息 然后传递给attribute传给顶点着色器
   * 每个索引值都这样做 最后就绘制出了整个正方体， 调用一次函数 从而 循环利用顶点信息 控制内存开销，但比起 drawArrays的代价是
   * 需要通过索引来间接地访问顶点, 在某种程度事程序复杂化  所以  两种绘制方式 各有优劣
   */
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}
function initVertexBuffer(gl) { 
   //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3
  let vertices = new Float32Array([
    1.0, 1.0, 1.0, 1.0, 1.0, 1.0,  //V0
    -1.0, 1.0, 1.0, 1.0, 0.0, 1.0,  //V1
    -1.0, -1.0, 1.0, 1.0, 0.0, 0.0, //V2
    1.0, -1.0, 1.0, 1.0, 1.0, 0.0, //V3

    1.0, -1.0, -1.0, 0.0, 1.0, 1.0, //V4
    1.0, 1.0, -1.0, 0.0, 1.0, 1.0, //V5
    -1.0, 1.0, -1.0, 0.0, 0.0, 1.0, //V6
    -1.0, -1.0, -1.0, 0.0, 0.0, 0.0 //V7
  ]);
  /**
   * indices 以数组形式存储了绘制点的顺序 
   */
  let indices = new Uint8Array([
    0, 1, 2, 0, 2, 3,  //前
    0, 3, 4, 0, 4, 5,//右
    0, 5, 6, 0, 6, 1,// 上
    1, 6, 7, 1, 7, 2,// 左
    7, 4, 3, 7, 3, 2,// 下
    4, 7, 6, 4, 6, 5// 后
  ]);
  // 顶点缓冲区
  let vertexColorBuffer = gl.createBuffer();
  // 索引缓冲区
  let indexBuffer = gl.createBuffer();
  if (!vertexColorBuffer || !indexBuffer) {
    console.log("创建缓冲区对象失败");
    return -1;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  let FSIZE = vertices.BYTES_PER_ELEMENT;
  let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  let a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if (a_Position < 0 || a_Color < 0) {
    console.log("获取attribute属性值失败");
    return -1;
  }
  // 分配数据
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  // 开启链接
  gl.enableVertexAttribArray(a_Position);
  gl.enableVertexAttribArray(a_Color);

  // 绑定索引值缓冲区
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  // 返回 索引值的长度 表示多少顶点
  return indices.length;
}