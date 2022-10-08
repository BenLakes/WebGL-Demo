/**
 * 目标：立方体旋转 加上平行光 和 环境光
 */
let VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec4 a_Color;
  attribute vec4 a_Normal;
  // 视图模型矩阵
  uniform mat4 u_MvpMatrix;
  // 模型矩阵的逆转置矩阵
  uniform mat4 u_NormalMatrix;
  // 光线方向  js 处指定
  uniform vec3 u_LightDirection;
  // 环境光
  uniform vec3 u_AmbientLight;
  varying vec4 v_Color;
  void main() {
    gl_Position = u_MvpMatrix * a_Position;
    // 计算颜色
    vec4 normal = u_NormalMatrix * a_Normal;
    // 计算cosO 
    float nDotL = max(dot(u_LightDirection, normalize(normal.xyz)), 0.0);
    v_Color = vec4((a_Color.xyz * nDotL) + (u_AmbientLight * a_Color.xyz), a_Color.a);
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
  // 初始化 顶点缓冲区 颜色 法线缓冲区
  let n = initVertexBuffers(gl);
  if (n < 0) {
    console.log("初始化缓冲区对象失败");
    return 
  }
  gl.clearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST);

  // 获取uniform属性
  let u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  let u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  let u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');
  var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
  if (!u_MvpMatrix || !u_NormalMatrix || !u_LightDirection || !u_AmbientLight) {
    console.log("获取uniform值失败");
    return;
  }
  // 视图 投影矩阵
  let vpMatrix = new Matrix4();
  vpMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100);
  vpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
  // 3纬向量
  let lightDirection = new Vector3([0.5, 3.0, 4.0]);
  // 归一化
  lightDirection.normalize();
  gl.uniform3fv(u_LightDirection, lightDirection.elements);

  gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);
  let currentAngle = 0.0;
  let modelMatrix = new Matrix4();
  let mvpMatrix = new Matrix4();
  let normalMatrix = new Matrix4();

  let tick = function () { 
    // 计算最新的角度
    currentAngle = animate(currentAngle);
    // 设置模型矩阵
    modelMatrix.setRotate(currentAngle, 0, 1, 0);
    mvpMatrix.set(vpMatrix).multiply(modelMatrix);

    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

    normalMatrix.setInverseOf(modelMatrix).transpose();
    // 设置模型矩阵 逆矩阵 转置
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // 绘制
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
    requestAnimationFrame(tick, canvas);
  }
  tick();
}
// 每秒旋转的角度增加的度数
let ANGLE_STEP = 30.0;
// 初次执行时间  当前毫秒级别时间戳
let g_last = Date.now();
function animate(angle) { 
  let now = Date.now();
  // 两次更新的时间戳
  let elspsed = now - g_last;
  g_last = now;
  // ANGLE_STEP / 1000.0  计算每度每毫秒 移动多少角度 在 * 当前毫秒数
  let newAngle = angle + (ANGLE_STEP * elspsed) / 1000.0
  return newAngle %= 360;
}
function initVertexBuffers(gl) { 
  // 创建 cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3
  // 顶点坐标 数据
  var vertices = new Float32Array([
    1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0, // v0-v1-v2-v3 front
    1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0, // v0-v3-v4-v5 right
    1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
   -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0, // v1-v6-v7-v2 left
   -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0, // v7-v4-v3-v2 down
    1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0  // v4-v7-v6-v5 back
 ]);
  // 颜色数据
  let colors = new Float32Array([
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v1-v2-v3 front
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v3-v4-v5 right
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v5-v6-v1 up
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v1-v6-v7-v2 left
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v7-v4-v3-v2 down
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0　    // v4-v7-v6-v5 back
  ]);
// 法向量 数据
  let normals = new Float32Array([
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
   -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
    
  ]) 
  // 索引坐标值
  let indices = new Uint8Array([
    0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
  ]);
  
  if (!initArrayBuffer(gl,'a_Position', vertices, 3, gl.FLOAT)) {
    return -1;
  }
  if (!initArrayBuffer(gl,'a_Color', colors, 3, gl.FLOAT)) {
    return -1;
  }
  if (!initArrayBuffer(gl,'a_Normal', normals, 3, gl.FLOAT)) {
    return -1;
  }
  //解除缓冲区对象的绑定
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // 处理索引值
  let indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('创建索引缓冲区对象失败');
    return false;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  // 表示绘制的顶点数量
  return indices.length;
}
function initArrayBuffer(gl, attribute, data, num, type) { 
  // 创建缓冲区对象
  let buffer = gl.createBuffer();
  if (!buffer) {
    console.log("创建缓冲区对象失败");
    return false;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  let a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log("获取属性值失败");
    return false;
  }
  // 分配数据
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  gl.enableVertexAttribArray(a_attribute);
  return true;
}