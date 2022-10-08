/**
 * 目标：当几何体表面 深度值 极为接近时,就会出现新的问题 使得表面看上去斑斑驳驳  这种现象深度冲突
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
    return
  }
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("初始化着色器失败");
    return
  }
  let n = initVertexColorsBuffer(gl);
  if (n < 0) {
    console.log("创建缓冲区对象失败");
    return;
  }

  gl.clearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST);
  let u_mvpMatrix = gl.getUniformLocation(gl.program, 'u_mvpMatrix');
  if (!u_mvpMatrix) {
    console.log("获取uniform失败");
    return;
  }
  let mvpMatrix = new Matrix4();
  mvpMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100);
  mvpMatrix.lookAt(1, 1, 15.0, 0, 0, -2, 0, 1, 0);
  gl.uniformMatrix4fv(u_mvpMatrix, false, mvpMatrix.elements);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFEER_BIT);
  /**
   * 之所以产生深度冲突 因为两个表面过于接近，深度缓冲区有限精度已经不能区分哪个在前  哪个在后
   * WebGL提供一种被称为多边形偏移的机制来解决 深度冲突的问题  该机制将自动在Z值加上一个偏移量 WebGL有自己的运算机制
   * 启用多边形偏移
   * gl.enable(gl.POLYGON_OFFSET_FILL);
   * 指定用来计算偏移量的参数
   * gl.polygonOffset(1.0,1.0);
   */
  gl.enable(gl.POLYGON_OFFSET_FILL);
  // 绘制 0 - 3
  /**
   * 两个三角形 的数据存储在同一个深度缓冲区中 drawArrays 第2个参数 表示开始绘制顶点的编号 
   *   第3个参数表示该次操作绘制的顶点个数
   */
  gl.drawArrays(gl.TRIANGLES, 0, n / 2);
  // 设置偏移
  gl.polygonOffset(1.0, 1.0);
  // 绘制 3 后面 3个 
  gl.drawArrays(gl.TRIANGLES, n / 2, n / 2);

}
function initVertexColorsBuffer(gl) { 
  let verticesColors = new Float32Array([
    0.0,  2.5,  -5.0,  0.4,  1.0,  0.4, // The green triangle
    -2.5, -2.5,  -5.0,  0.4,  1.0,  0.4,
     2.5, -2.5,  -5.0,  1.0,  0.4,  0.4, 

     0.0,  3.0,  -5.0,  1.0,  0.4,  0.4, // The yellow triagle
    -3.0, -3.0,  -5.0,  1.0,  1.0,  0.4,
     3.0, -3.0,  -5.0,  1.0,  1.0,  0.4, 
  ]);
  let n = 6;
  let vertexColorBuffer = gl.createBuffer();
  if (!vertexColorBuffer) {
    console.log("初始化缓冲区对象失败");
    return -1;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);
  let FSIZE = verticesColors.BYTES_PER_ELEMENT;
  let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  let a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if (a_Position < 0 || a_Color < 0) {
    console.log("获取失败属性值失败");
    return -1;
  }
  // 分配数据
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(a_Position);
  gl.enableVertexAttribArray(a_Color);

  return n;
}