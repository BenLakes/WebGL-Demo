/**
 * 目标：在js 层面 计算视图矩阵 和 模型矩阵  传递给顶点着色器
 */
// 顶点着色器
let VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec4 a_Color;
  varying vec4 v_Color;
  // 视图矩阵 和 模型矩阵 乘积
  uniform mat4 u_ModelViewMatrix;
  void main() {
    gl_Position = u_ModelViewMatrix * a_Position;
    v_Color = a_Color;
  }
`;
// 片元着色器
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
  let n = initVertexColorBuffers(gl);
  if (n < 0) {
    console.log("初始化缓冲区对象失败");
    return;
  }
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  // 获取视图矩阵  模型矩阵 
  let modelViewMatrix = new Matrix4();
  modelViewMatrix.setLookAt(0.0, 0.2, 0.3, 0, 0, 0, 0, 1, 0).rotate(10, 0, 0);
  let u_ModelViewMatrix = gl.getUniformLocation(gl.program, 'u_ModelViewMatrix');
  if (!u_ModelViewMatrix) {
    console.log("获取矩阵存储位置失败");
    return;
  }
  // 传递值
  gl.uniformMatrix4fv(u_ModelViewMatrix,false, modelViewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
}
function initVertexColorBuffers(gl) { 
  // 初始化顶点
  let verticesColors = new Float32Array([
    // 最后面 绿色
    0.0, 0.5, -0.4, 0.4, 1.0, 0.4,
    -0.5, -0.5, -0.4, 0.4, 1.0, 0.4,
    0.5, -0.5, -0.4, 0.0,1.0, 1.0,
    // 中间 蓝色
    0.5, 0.4, -0.2, 0.4, 0.4, 1.0,
    -0.5, 0.4, -0.2, 0.4, 0.4, 1.0,
    0.0, -0.6, -0.2, 1.0, 0.4, 1.0,

    // 最前面 红色
    0.0, 0.5, 0, 1.0, 0.4, 0.2,
    -0.5, -0.5, 0, 1.0, 0.4, 0.2,
    0.5, -0.5, 0, 1.0, 0.4, 0.2,
  ])
  let n = 9;
  let vertexColorBuffer = gl.createBuffer();
  if (!vertexColorBuffer) {
    console.log("创建缓冲区对象失败");
    return -1
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);
  let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  let a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if (a_Position < 0 || a_Color < 0) {
    console.log("获取attribute失败");
    return -1
  }
  let FSIZE = verticesColors.BYTES_PER_ELEMENT;
  // 分配数据
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  // 开启链接
  gl.enableVertexAttribArray(a_Position)
  gl.enableVertexAttribArray(a_Color)
  return n;
}
