/**
 * 目标：设置投影矩阵 为 canvas 的 一般 导致 图形投影 变形
 */
let VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec4 a_Color;
  uniform mat4 u_ProjMatrix;
  varying vec4 v_Color;
  void main() {
    gl_Position = u_ProjMatrix * a_Position;
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
  if (!initShaders(gl,VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("获取着色器失败");
    return;
  }
  let n = initVertexColorBuffer(gl);
  if (n < 0) {
    console.log("初始化缓冲区对象失败");
    return
  }

  // 获取uniform projMatrix
  let u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
  if (!u_ProjMatrix) {
    console.log("获取存储值失败");
    return;
  }
  let projMatrix = new Matrix4();
  /**
   * 如果可视空间 近裁剪面 的宽高比与canvas不一致 显示的物体会被压缩变形  左右  上下 
   * canvas 的大小没有变化 但表示的左右 可视空间 缩小了一半 左右会被压缩
   */
  // projMatrix.setOrtho(-0.5, 0.5, -0.5, 0.5, 0.0, 0.5);
  projMatrix.setOrtho(-0.5, 0.5, -1, 1, 0.0, 0.5);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

//  传递值
  gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

  // 绘制
  gl.drawArrays(gl.TRIANGLES, 0, n);

}
function initVertexColorBuffer(gl) { 
  let vertexColors = new Float32Array([
    0.0,  0.6,  -0.4,  0.4,  1.0,  0.4, // The back green one
    -0.5, -0.4,  -0.4,  0.4,  1.0,  0.4,
     0.5, -0.4,  -0.4,  1.0,  0.4,  0.4, 
   
     0.5,  0.4,  -0.2,  1.0,  0.4,  0.4, // The middle yellow one
    -0.5,  0.4,  -0.2,  1.0,  1.0,  0.4,
     0.0, -0.6,  -0.2,  1.0,  1.0,  0.4, 

     0.0,  0.5,   0.0,  0.4,  0.4,  1.0, // The front blue one 
    -0.5, -0.5,   0.0,  0.4,  0.4,  1.0,
     0.5, -0.5,   0.0,  1.0,  0.4,  0.4, 
  ])
  let n = 9;
  let vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log("初始化缓冲区对象失败");
    return -1
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexColors, gl.STATIC_DRAW);
  let FSIZE = vertexColors.BYTES_PER_ELEMENT;
  // 获取attribute 存储值
  let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  let a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if (a_Position < 0 || a_Color < 0) {
    console.log("获取存储值失败");
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  // 开启链接
  gl.enableVertexAttribArray(a_Position);
  gl.enableVertexAttribArray(a_Color);
  return n;
}