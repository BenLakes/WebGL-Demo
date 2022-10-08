/**
 * 目标：使用 <投影矩阵> * <视图矩阵> * <模型矩阵> * <顶点坐标> 规范立方体中的坐标
 */
let VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec4 a_Color;
  uniform mat4 u_ProjMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ModelMatrix;
  varying vec4 v_Color;
  void main() {
    gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
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

  // 获取Uniform属性值
  let u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
  let u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  let u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');

  if (!u_ProjMatrix || !u_ViewMatrix || !u_ModelMatrix) {
    console.log("获取uniform 属性失败");
    return;
  }

  gl.clearColor(0, 0, 0, 1);

  gl.clear(gl.COLOR_BUFFER_BIT);

  // 创建对应矩阵
  let projMatrix = new Matrix4();
  let viewMatrix = new Matrix4();
  let modelMatrix = new Matrix4();
  

  projMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100);
  viewMatrix.setLookAt(0, 0, 5, 0, 0, -100, 0, 1, 0);
  modelMatrix.setTranslate(0.75, 0, 0);

  // 传递值
  gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
  gl.uniformMatrix4fv(u_ViewMatrix,false, viewMatrix.elements);
  gl.uniformMatrix4fv(u_ModelMatrix,false, modelMatrix.elements);

  // 绘制
  gl.drawArrays(gl.TRIANGLES, 0, n);

  // 重新传递 新的 平移值 
  modelMatrix.setTranslate(-0.75, 0, 0);

  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  gl.drawArrays(gl.TRIANGLES, 0, n);
 
  
}
function initVertexBuffer(gl) { 
  // 只定义中间的 三角形 通过偏移 生成左右两侧 三角形
  /**
   * 程序只使用了一套数据 3个顶点信息 和颜色信息 画出两套图形 减少顶点数 增加调用drawArrays 的方式
   * 一种是 增加顶点方式  一种是多使用 drawArrays 的方式 哪种方式高效依赖 于程序本身 和 webGL的实现
   */
  let verticesColors = new Float32Array([
    0.0, 1.0, -4.0, 0.4, 1.0, 0.4,
    -0.5, -1.0, -4.0, 0.4, 1.0, 0.4,
    0.5, -1.0, -4.0, 1.0, 0.4, 0.4,

    0.0, 1.0, -2.0, 1.0, 1.0, 0.4,
    -0.5, -1.0, -2.0, 1.0, 1.0, 0.4,
    0.5, -1.0, -2.0, 1.0, 0.4, 0.4,

    0.0, 1.0, 0, 0.4, 0.4, 1.0,
    -0.5, -1.0, 0, 0.4, 0.4, 1.0,
    0.5, -1.0, 0, 1.0, 0.4, 0.4,
  ]);
  let n = 9;
  let vertexColorsBuffer = gl.createBuffer();
  if (!vertexColorsBuffer) {
    console.log("初始化缓冲区对象失败");
    return -1;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);
  let FSIZE = verticesColors.BYTES_PER_ELEMENT;
  let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  let a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if (a_Position < 0 || a_Color < 0) {
    console.log("获取attribute属性值 失败");
    return -1;
  }
  // 分配数据
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);

  // 开启链接
  gl.enableVertexAttribArray(a_Position)
  gl.enableVertexAttribArray(a_Color);

  return n;
}