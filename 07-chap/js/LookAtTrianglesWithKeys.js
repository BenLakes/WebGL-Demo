/**
 * 目标：使用键盘控制 视点的 x轴 大小
 */
let VSHADER_SOURCE = `
 attribute vec4 a_Position;
 attribute vec4 a_Color;
 varying vec4 v_Color;
//  视图矩阵 和 模型矩阵乘积
uniform mat4 u_ViewModelMatrix;
 void main() {
  gl_Position = u_ViewModelMatrix * a_Position;
  v_Color = a_Color;
 }
`
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
    console.log("获取WebGL绘图上下文失败");
    return;
  }
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("初始化着色器程序失败");
    return;
  }
  let n = initVertexColorBuffers(gl);
  if (n<0) {
    console.log("初始化缓冲区对象失败");
    return;
  }
  // 获取视图模型矩阵
  let u_ViewModelMatrix4 = gl.getUniformLocation(gl.program, "u_ViewModelMatrix")
  if (!u_ViewModelMatrix4) {
    console.log("获取视图模型矩阵存储地址失败")
    return
  }
  // 设置值
  let viewModelMatrix4 = new Matrix4();
//  设置环境色
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  document.onkeydown = function (ev) { 
    keyDown(ev, gl, n, viewModelMatrix4, u_ViewModelMatrix4)
  }

  draw(gl, n, viewModelMatrix4, u_ViewModelMatrix4)
  
}
// 定义全局的 eyex 值
let g_eyeX = 0.20;

function keyDown(ev, gl, n, viewModelMatrix4, u_ViewModelMatrix4) {
  if (ev.keyCode === 39) {
    g_eyeX += 0.01;
  } else if (ev.keyCode === 37) {
    g_eyeX -= 0.01
  } else {
    return
  }
  draw(gl, n, viewModelMatrix4, u_ViewModelMatrix4)
}

function draw(gl, n, viewModelMatrix4, u_ViewModelMatrix4) {
  viewModelMatrix4.setLookAt(g_eyeX, 0.25, 0.25, 0, 0, 0, 0, 1, 0);
  gl.uniformMatrix4fv(u_ViewModelMatrix4, false, viewModelMatrix4.elements);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, n);
}
function initVertexColorBuffers(gl) {
  var verticesColors = new Float32Array([
    // Vertex coordinates and color
     0.0,  0.5,  -0.4,  0.4,  1.0,  0.4, // 最后面
    -0.5, -0.5,  -0.4,  0.4,  1.0,  0.4,
     0.5, -0.5,  -0.4,  1.0,  0.4,  0.4, 
   
     0.5,  0.4,  -0.2,  1.0,  0.4,  0.4, // 中间的
    -0.5,  0.4,  -0.2,  1.0,  1.0,  0.4,
     0.0, -0.6,  -0.2,  1.0,  1.0,  0.4, 

     0.0,  0.5,   0.0,  0.4,  0.4,  1.0,  //最前面
    -0.5, -0.5,   0.0,  0.4,  0.4,  1.0,
     0.5, -0.5,   0.0,  1.0,  0.4,  0.4, 
  ]);
  var n = 9
  // Create a buffer object
  var vertexColorbuffer = gl.createBuffer()
  if (!vertexColorbuffer) {
    console.log("Failed to create the buffer object")
    return -1
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorbuffer)
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW)

  var FSIZE = verticesColors.BYTES_PER_ELEMENT
  var a_Position = gl.getAttribLocation(gl.program, "a_Position")
  if (a_Position < 0) {
    console.log("Failed to get the storage location of a_Position")
    return -1
  }

  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0)
  gl.enableVertexAttribArray(a_Position) 


  var a_Color = gl.getAttribLocation(gl.program, "a_Color")
  if (a_Color < 0) {
    console.log("Failed to get the storage location of a_Color")
    return -1
  }
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3)
  gl.enableVertexAttribArray(a_Color) 

  return n
}