/**
 * 目标：物体进行模型矩阵后  修改法向量数据 魔法矩阵 模型矩阵 进行 逆转置矩阵
 */
let VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec4 a_Color;
  attribute vec4 a_Normal;
  uniform mat4 u_MvpMatrix;
  uniform mat4 u_NormalMatrix;
  uniform vec3 u_LightColor;
  uniform vec3 u_LightDirection;
  uniform vec3 u_AmbientLight;
  varying vec4 v_Color;
  void main() {
    gl_Position = u_MvpMatrix * a_Position;
    // 计算后 重新对法向量 进行归一化
    vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));
    // 计算平行光的  光线方向  与 法向量的 点击  运算出cosO
    float nDotL = max(dot(u_LightDirection, normal),0.0);
    // 计算反射光颜色
    vec3 diffuse = u_LightColor * a_Color.xyz * nDotL;
    // 计算环境光
    vec3 ambient = u_AmbientLight * a_Color.xyz;
    v_Color = vec4(diffuse + ambient, a_Color.a);
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
    console.log("初始化着色器程序失败");
    return;
  }
  let n = initVertexBuffers(gl);
  if (n < 0) {
    console.log("初始化缓冲区对象失败");
    return
  }
  gl.clearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST);
  // 处理uniform数据传递 与  矩阵 相关 变换
  let u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  let u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  let u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
  let u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');
  let u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');

  if (!u_MvpMatrix || !u_NormalMatrix || !u_LightColor || !u_AmbientLight) {
    console.log("获取uniform属性失败");
    return
  }
  // 设置平行光颜色
  gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
  // 设置光线方向
  let lightDirection = new Vector3([0.0, 3.0, 4.0]);
  lightDirection.normalize();
  gl.uniform3fv(u_LightDirection, lightDirection.elements);
  // 环境光颜色
  gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);

  // 设置矩阵相关
  let modelMatrix = new Matrix4();
  let mvpMatrix = new Matrix4();
  let normalMatrix = new Matrix4();
  // 立方体 向 Y轴移动
  /**
   * 模型的变换会导致 每个面的法向量会变化
   * 平移 变换不会改变 法向量 方向 
   * 旋转变换会改变法向量 旋转改变了物体的方向
   * 缩放变换对法向量的影响较为复杂 跟 缩放比例 与 不同轴都有关系
   * 所以 需要 逆转置矩阵  对顶点进行变换的矩阵称为模型矩阵， 只要将变换后的模型矩阵
   * 的逆转置矩阵 乘以变换之前的法向量 即可得到 当前的法向量
   * 逆矩阵的含义 是 矩阵M 的 逆矩阵是M 那么R * M 或 M * R的结果都是单位矩阵
   * 转置的意思是 将矩阵的行列进行调换
   */
  modelMatrix.setTranslate(0, 0.9, 0);
  // 立方体沿 Z 轴旋转
  modelMatrix.rotate(90, 0, 0, 1);
  // 设置视图投影矩阵
  mvpMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100);
  mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
  mvpMatrix.multiply(modelMatrix);
  // 设置mvp矩阵
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
  //设置模型矩阵 逆矩阵 后 转置 
  /**
   * setInverseOf() 求原矩阵的逆矩阵
   * transpose() 对自身进行转置
   */
  normalMatrix.setInverseOf(modelMatrix).transpose();
  //设置值
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // 绘制
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}
function initVertexBuffers(gl) { 
  //创建立方体
//    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3
  var vertices = new Float32Array([
    1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0, // v0-v1-v2-v3 front
    1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0, // v0-v3-v4-v5 right
    1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
   -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0, // v1-v6-v7-v2 left
   -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0, // v7-v4-v3-v2 down
    1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0  // v4-v7-v6-v5 back
 ]);

 // Colors
 var colors = new Float32Array([
   1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v1-v2-v3 front
   1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v3-v4-v5 right
   1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v5-v6-v1 up
   1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v1-v6-v7-v2 left
   1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v7-v4-v3-v2 down
   1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0　    // v4-v7-v6-v5 back
]);

 // Normal
 var normals = new Float32Array([
   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
 ]);

 // Indices of the vertices
 var indices = new Uint8Array([
    0, 1, 2,   0, 2, 3,    // front
    4, 5, 6,   4, 6, 7,    // right
    8, 9,10,   8,10,11,    // up
   12,13,14,  12,14,15,    // left
   16,17,18,  16,18,19,    // down
   20,21,22,  20,22,23     // back
 ]);


  if (!initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'a_Color', colors, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'a_Normal', normals, 3, gl.FLOAT)) return -1;

  // 取消绑定 缓冲区
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  let indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log("创建索引缓冲区对象失败");
    return -1;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  // 表示顶点数量
  return indices.length
}
function initArrayBuffer(gl, attribute, data, num, type) { 
  let buffer = gl.createBuffer();
  if (!buffer) {
    console.log("创建缓冲区对象失败");
    return false;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  // 获取属性 存储地址
  let a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log("获取属性值失败");
    return false;
  }
  // 给属性分配数据
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // 开启链接
  gl.enableVertexAttribArray(a_attribute);
  return true;
}