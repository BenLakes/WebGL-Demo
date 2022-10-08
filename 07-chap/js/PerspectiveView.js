/**
 * 目标：使用透视投影矩阵 和 视图矩阵 设置场景
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
  let canvas = document.getElementById('myCanvas');
  let gl = getWebGLContext(canvas);
  if (!gl) {
    console.log("获取webgl上下文失败");
    return;
  }
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("初始化着色器失败");
    return;
  }
  let n = initVertexBuffers(gl);
  if (n < 0) {
    console.log("初始化缓冲区对象失败");
    return
  }
  // 定义环境颜色
  gl.clearColor(0, 0, 0, 1);

  // 处理 投影矩阵  和 视图矩阵
  let u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  let u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
  if (!u_ViewMatrix || !u_ProjMatrix) {
    console.log("获取uniform属性存储位置失败");
    return;
  }
  let viewMatrix = new Matrix4();
  let projMatrix = new Matrix4();
  viewMatrix.setLookAt(0, 0, 5, 0, 0, -100, 0, 1, 0);
  /**
   * 使用透视投影矩阵后,webGL就能够自动将距离远的物体缩小显示 从而产生深度感
   * 可视空间内的物体才会被显示,可是空间外的物体不会显示,那些跨越可视空间边界的物体则只会显示其在可视空间内的部分
   * 1. fov 指定垂直视角，既可视空间顶点和底面间的夹角
   * 2. aspet 指定近裁剪面 的宽高比 
   * 3. near far 指定近裁剪面 和 远裁剪面   近边界  远边界
   * 使用透视投影后场景中的三角形有两个变化：
   *   距离较远的三角形看上去变小了， 三角形被平移以贴近中线 使得看上去在视线左右两边排列 
   * 透视投影矩阵对三角形进行了两次变换  根据三角形的与视点的距离 按比例对三角形进行缩小变换, 2. 对三角形 进行平移变换
   * 使得其贴近视线
   * setPerspective 可自动根据上述 可视空间的参数计算出对应的变换矩阵
   */
  projMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100);

  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

  // 清空颜色缓冲区
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.drawArrays(gl.TRIANGLES, 0, n);

}
function initVertexBuffers(gl) { 
  // 创建 左右 6个 三角形
  let vertexColors = new Float32Array([
    0.75, 1.0, -4.0, 0.4, 1.0, 0.4,  //右侧 最后 的三角形
    0.25, -1.0, -4.0, 0.4, 1.0, 0.4,
    1.25, -1.0, -4.0, 1.0, 0.4, 0.4,

    0.75, 1.0, -2.0, 1.0, 1.0, 0.4, //右侧 中间 的三角形
    0.25, -1.0, -2.0, 1.0, 1.0, 0.4,
    1.25, -1.0, -2.0, 1.0, 0.4, 0.4,

    0.75, 1.0, 0.0, 0.4, 0.4, 1.0, //右侧 最前面 的三角形
    0.25, -1.0, 0.0, 0.4, 0.4, 1.0,
    1.25, -1.0, 0.0, 1.0, 0.4, 0.4,

    -0.75, 1.0, -4.0, 0.4, 1.0, 0.4,  //左侧 最后 的三角形
    -1.25, -1.0, -4.0, 0.4, 1.0, 0.4,
    -0.25, -1.0, -4.0, 1.0, 0.4, 0.4,

    -0.75, 1.0, -2.0, 1.0, 1.0, 0.4, //左侧 中间 的三角形
    -1.25, -1.0, -2.0, 1.0, 1.0, 0.4,
    -0.25, -1.0, -2.0, 1.0, 0.4, 0.4,

    -0.75, 1.0, 0.0, 0.4, 0.4, 1.0, //左侧 最前面 的三角形
    -1.25, -1.0, 0.0, 0.4, 0.4, 1.0,
    -0.25, -1.0, 0.0, 1.0, 0.4, 0.4,
  ]);
  let n = 18;
  // 创建缓冲区对象
  let vertexColorBuffer = gl.createBuffer();
  if (!vertexColorBuffer) {
    console.log("缓冲区对象创建失败");
    return -1;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexColors, gl.STATIC_DRAW);
  let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  let a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if (a_Position < 0 || a_Color < 0) {
    console.log("获取属性值失败");
    return -1;
  }

  let FSIZE = vertexColors.BYTES_PER_ELEMENT;
  // 分配数据
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  // 开启链接
  gl.enableVertexAttribArray(a_Position);
  gl.enableVertexAttribArray(a_Color);


  return n;
}