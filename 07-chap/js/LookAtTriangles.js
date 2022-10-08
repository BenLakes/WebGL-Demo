/**
 * 目标：绘制有深度信息的 三维物体
 * 
 */
// 顶点着色器
let VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec4 a_Color;
  /**
   * 视图矩阵 attribute
   * 视图矩阵包含 视点(从哪里看 默认 0,0,0)  目标点(看多远 默认Z轴负半轴)  上方向 (视点朝向 默认 Y轴正方向)
   * 视图矩阵可以表示观察者的状态(位置、方向)，他最终影响了显示在屏幕上的视图，也就是观察者观察到的场景
   * 通过矩阵库 Matrix4.setLookAt()传入视点,目标点,上方向 来创建矩阵
   */
  uniform mat4 u_ViewMatrix;
  varying vec4 v_Color;
  void main() {
    // 视图矩阵乘以 顶点坐标  得到观察者的观察状态 对应的 屏幕视图
    /**
     * 根据自定义观察者状态，绘制观察者看到的景象,与使用默认的观察状态
     * 但是对三维对象进行平移 旋转等变换 是等价的
     */
    gl_Position = u_ViewMatrix * a_Position;
    gl_PointSize = 10.0;
    // 传递 顶点颜色 光栅化后 还会 经过内插 出其他顶点的 渐变颜色
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
  // 获取canvas 元素实例
  let canvas = document.getElementById('myCanvas');
  // 获取webgl绘图上下文
  let gl = getWebGLContext(canvas);
  if (!gl) {
    console.log("获取webgl上下文失败");
    return;
  }
  // 初始化 着色器
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("初始化着色器失败");
    return;
  }
  // 初始化顶点缓冲区对象
  let n = initVertexColorsBuffers(gl);
  if (n < 0) {
    console.log("初始化缓冲区对象失败");
    return
  }
  //环境颜色
  gl.clearColor(0.0,0.0,0.0,1.0);
  // 清除颜色缓冲区
  gl.clear(gl.COLOR_BUFFER_BIT);

  // 获取视图矩阵 Uniform
  let u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log("获取Uniform 实例异常");
    return;
  }
  // 创建视图矩阵
  let viewMatrix = new Matrix4();
  console.log("viewMatrix", viewMatrix.elements)
  // 创建视图矩阵
  viewMatrix.setLookAt(0.10, 0.15, 0.25, 0, 0, 0, 0, 1, 0);
  // 传递给 uniform
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

  // gl.enable(gl.DEPTH_TEST);
  // gl.clear(gl.DEPTH_BUFFER_BIT);
  // 绘制
  gl.drawArrays(gl.TRIANGLES, 0, n);
}
function initVertexColorsBuffers(gl) { 
  /**
   * 创建顶点 类型数组 包括3个三角形 9个顶点 和对应颜色
   * 利用深度 来前后错乱摆放 三角形
   */
  let vertexColors = new Float32Array([
    // 最后面的三角形
    0, 0.6, -0.4, 1.8, 0.8, 1.0, -0.6, -0.4, -0.4, 0.7, 1.0, 1.0, 0.6, -0.4,
    -0.4, 1.0, 0.9, 1.0,
    // 中间的三角形
    0.4, 0.4, -0.2, 1.0, 0.0, 0.0, -0.7, -0.5, -0.2, 0.0, 0.0, 1.0, 0.7, -0.2,
    -0.2, 1.0, 1.0, 0.6,

    //  最前面的三角形
    -0.4, 0.4, 0, 1.0, 0.0, 0.4, -0.8, -0.8, 0, 0.0, 0.0, 1.0, 0.4, -0.4, 0,
    1.0, 0.4, 1.0,
  ])
  let n = 9;
  let vertexColorBuffer = gl.createBuffer();
  if (!vertexColorBuffer) {
    console.log("创建缓冲区对象失败");
    return -1;
  }
  // 绑定目标对象
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  // 缓冲区分配数据
  gl.bufferData(gl.ARRAY_BUFFER, vertexColors, gl.STATIC_DRAW);
  // 获取顶点坐标属性  和  顶点颜色属性
  let a_Position = gl.getAttribLocation(gl.program, "a_Position");
  let a_Color = gl.getAttribLocation(gl.program, "a_Color");
  if (a_Position < 0 || a_Color < 0) {
    console.log("获取属性存储值失败");
    return -1    
  }
  // 获取每个元素占用的内存值
  let FSIZE = vertexColors.BYTES_PER_ELEMENT;
  // 分配数据
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  // 开启链接
  gl.enableVertexAttribArray(a_Position);
  gl.enableVertexAttribArray(a_Color);
  
  return n;
}