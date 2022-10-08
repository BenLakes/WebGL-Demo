/**
 * 目标: 投影矩阵(正交投影) 控制可视区域的效果 由 水平视角 垂直视角 和 可视深度定义
 * 了 可视空间
 */
let VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec4 a_Color;
  // 投影矩阵 uniform 属性
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
    console.log("获取webGL上下文异常");
    return;
  }                                    
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("初始化着色器失败");
    return;
  }
  // 初始化顶点缓冲区对象
  let n = initVertexColorBuffer(gl);

  if (n < 0) {
    console.log("初始化缓冲区对象失败");
    return;
  }
   

  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // 设置正交投影矩阵
  let u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
  if (!u_ProjMatrix) {
    console.log("获取uniform异常");
    return;
  }
  let projMatrix = new Matrix4();
  let pElement = document.createElement('p');
  document.body.appendChild(pElement);
  pElement.innerHTML = '这里显示near 和 far 当前的值';
  document.onkeydown = function (ev) { 
    keyDown(ev, gl, n, projMatrix, u_ProjMatrix, pElement);
  }

  draw(gl, n, u_ProjMatrix, projMatrix, pElement);

}
// 定义 投影 远近 截面的值
let g_near = 0.0, g_far = 0.5;
function keyDown(ev, gl, n, projMatrix, u_ProjMatrix, pElement) { 
   switch (ev.keyCode) {
    case 39:
       g_near += 0.01;
       break;
     case 37:
       g_near -= 0.01;
       break;
     case 38:
       g_far += 0.01;
       break;
     case 40:
       g_far -= 0.01;
       break;
    default:
      return;
   }
  draw(gl, n, u_ProjMatrix, projMatrix, pElement);
}
function draw(gl, n, u_ProjMatrix, projMatrix, pElement) { 
  // 设置可视空间 
  projMatrix.setOrtho(-1.0, 1.0, -1.0, 1.0, g_near, g_far);
  gl.uniformMatrix4fv(u_ProjMatrix,false, projMatrix.elements);
  gl.clear(gl.COLOR_BUFFER_BIT);
  pElement.innerHTML = `near: ${Math.round(g_near * 1000) / 1000}, far: ${Math.round(g_far * 1000) / 1000}`
  gl.drawArrays(gl.TRIANGLES, 0, n);
}
// 初始化 缓冲区对象
function initVertexColorBuffer(gl) { 
  let verticesColors = new Float32Array([
    0.0, 0.6, -0.4, 0.4, 1.0, 0.4,
    -0.5, -0.4, -0.4, 0.4, 1.0, 0.4,
    0.5, -0.4, -0.4, 1.0, 0.4, 0.4,

    0.5, 0.4, -0.2, 1.0, 0.4, 0.4,
    -0.5, 0.4, -0.2, 1.0, 1.0, 0.4,
    0.0, -0.6, -0.2, 1.0, 1.0, 0.4,

    0.0, 0.5, 0.0, 0.4, 0.4, 1.0,
    -0.5, -0.5, 0.0, 0.4, 0.4, 1.0,
    0.5, -0.5, 0.0, 1.0, 0.4, 0.4
    
  ]);
  let n = 9;
  let vertexColorBuffer = gl.createBuffer();
  if (!vertexColorBuffer) {
    console.log("创建缓冲区对象失败");
    return -1;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);
  // 获取 a_Position
  let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  let a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if (a_Position < 0 || a_Color < 0) {
    console.log("获取属性值异常");
    return -1;
  }
  let FSIZE = verticesColors.BYTES_PER_ELEMENT;
  // 分配数据
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0)
  // 获取 a_Color
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3)

  // 开启链接
  gl.enableVertexAttribArray(a_Position);
  gl.enableVertexAttribArray(a_Color);
  
  return n;
}