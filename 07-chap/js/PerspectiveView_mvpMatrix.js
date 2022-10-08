/**
 * 目标：使用 js中使用矩阵库来设置 投影矩阵 * 视图矩阵 * 模型矩阵  传递给顶点着色器
 */
let VSHADER_SOURCE = `
   attribute vec4 a_Position;
   attribute vec4 a_Color;
   varying vec4 v_Color;
   uniform mat4 u_MvpMatrix;
   void main() {
    gl_Position = u_MvpMatrix * a_Position;
    v_Color  = a_Color;
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
    console.log("获取wenGL上下文失败");
    return
  }
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("初始化着色器失败");
    return;
  }
  let n = initVertexBuffer(gl);
  if (n < 0) {
    console.log("缓冲区对象失败");
    return
  }
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // 处理矩阵
  let u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  if (!u_MvpMatrix) {
    console.log("获取矩阵uniform值失败");
    return;
  }
  let projMatrix = new Matrix4();
  let viewMatrix = new Matrix4();
  let modelMatrix = new Matrix4();
  let mvpMatrix = new Matrix4();

  projMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100);

  viewMatrix.setLookAt(0, 0, 5, 0, 0, -100, 0, 1, 0);

  modelMatrix.setTranslate(0.75, 0, 0);

  // 设置矩阵对应的值
  mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

  // 绘制
  gl.drawArrays(gl.TRIANGLES, 0, n);

  // 重新设置 模型矩阵值
  modelMatrix.setTranslate(-0.75, 0, 0);
  mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

  gl.drawArrays(gl.TRIANGLES, 0, n);
}
function initVertexBuffer(gl) { 
  let verticesColor = new Float32Array([
    // 最后的一个三角形
    0.0, 1.0, -4.0, 0.4, 1.0, 0.4,
    -0.5, -1.0, -4.0, 0.4, 1.0, 0.4,
    0.5, -1.0, -4.0, 1.0, 0.4, 0.4,

    // 中间的三角形
    0.0, 1.0, -2.0, 1.0, 1.0, 0.4,
    -0.5, -1.0, -2.0, 1.0, 1.0, 0.4,
    0.5, -1.0, -2.0, 1.0, 0.4, 0.4,

    // 最前面的三角形
    0.0, 1.0, -0.0, 0.4, 0.4, 1.0,
    -0.5, -1.0, 0.0, 0.4, 0.4, 1.0,
    0.5, -1.0, 0.0, 1.0, 0.4, 0.4
  ]);

  let vertexColorBuffer = gl.createBuffer();
  if (!vertexColorBuffer) {
    console.log("初始化缓冲区对象失败");
    return -1
  }
  let n = 9;

  //缓冲区绑定目标对象
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColor, gl.STATIC_DRAW);
  let FSIZE = verticesColor.BYTES_PER_ELEMENT;
  let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  let a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if (a_Position < 0 || a_Color < 0) {
    console.log("获取顶点着色器属性值失败");
    return -1;
  }

  // 属性值分配数据
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);

  // 开启链接
  gl.enableVertexAttribArray(a_Position);
  gl.enableVertexAttribArray(a_Color);

  return n;
}