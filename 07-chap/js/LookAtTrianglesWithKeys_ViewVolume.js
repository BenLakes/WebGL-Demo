/**
 * 目标：视图矩阵 结合 正交投影矩阵的方式 控制可视空间(水平区域、垂直区域和可视深度)、观察者视点
 */
let VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec4 a_Color;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjMatrix;
  varying vec4 v_Color;
  void main() {
    gl_Position = u_ProjMatrix * u_ViewMatrix * a_Position;
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
  let canvas = document.getElementById("myCanvas");
  let gl = getWebGLContext(canvas);
  if (!gl) {
    console.log("获取webGL上下文失败");
    return;
  }
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("初始化着色器程序失败");
    return;
  }
  let n = initVertexColorBuffer(gl);
  if (n < 0) {
    console.log("初始化缓冲区对象失败");
    return;
  }
  // 获取视图矩阵 和  投影 矩阵存储位置
  let u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  let u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
  if (!u_ViewMatrix || !u_ProjMatrix) {
    console.log("获取矩阵存储地址失败");
    return;
  }
  let viewMatrix = new Matrix4();
  let projMatrix = new Matrix4();

  gl.clearColor(0.0,0.0,0.0,1.0)


  projMatrix.setOrtho(-1.0, 1.0, -1.0, 1.0, 0.0, 2.0);
  gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

  
  document.onkeydown = function (ev) { 
    keyDown(ev, gl, n, u_ViewMatrix, viewMatrix);
  }
  draw(gl, n, u_ViewMatrix, viewMatrix);
}
let g_EyeX = 0.20, g_EyeY = 0.25, g_EyeZ = 0.25;
function keyDown(ev, gl, n, u_ViewMatrix, viewMatrix) {
  if (ev.keyCode === 39) {
    g_EyeX += 0.01;
  } else if (ev.keyCode === 37) {
    g_EyeX -= 0.01
  } else { 
    return;
  }
  draw(gl, n, u_ViewMatrix, viewMatrix);
 }
function draw(gl, n, u_ViewMatrix, viewMatrix) { 
  // 设置 视图矩阵
  viewMatrix.setLookAt(g_EyeX, g_EyeY, g_EyeZ, 0, 0, 0, 0, 1, 0);
  // 设置值
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  // 清除
  gl.clear(gl.COLOR_BUFFER_BIT);
  // 绘制
  gl.drawArrays(gl.TRIANGLES, 0, n);
}
function initVertexColorBuffer(gl) { 
  let vertexColors = new Float32Array([
    // Vertex coordinates and color
    0.0,  0.5,  -0.4,  0.4,  1.0,  0.4, // The back green one
    -0.5, -0.5,  -0.4,  0.4,  1.0,  0.4,
     0.5, -0.5,  -0.4,  1.0,  0.4,  0.4, 
   
     0.5,  0.4,  -0.2,  1.0,  0.4,  0.4, // The middle yellow one
    -0.5,  0.4,  -0.2,  1.0,  1.0,  0.4,
     0.0, -0.6,  -0.2,  1.0,  1.0,  0.4, 

     0.0,  0.5,   0.0,  0.4,  0.4,  1.0,  // The front blue one 
    -0.5, -0.5,   0.0,  0.4,  0.4,  1.0,
     0.5, -0.5,   0.0,  1.0,  0.4,  0.4, 
  ]);
  let n = 9;
  let vertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexColors, gl.STATIC_DRAW);
  // 获取属性值
  let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  let a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if (a_Position < 0 || a_Color < 0) {
    console.log("获取属性值失败");
    return -1;
  }
  let FSIZE = vertexColors.BYTES_PER_ELEMENT;
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  // 开启链接
  gl.enableVertexAttribArray(a_Position);
  gl.enableVertexAttribArray(a_Color);
  return n;
}