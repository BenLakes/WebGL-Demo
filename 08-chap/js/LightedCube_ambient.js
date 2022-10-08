/**
 * 目标：漫反射与环境光的使用
 */
let VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec4 a_Color;
  // 法向量
  attribute vec4 a_Normal;
  // 视图投影矩阵
  uniform mat4 u_MvpMatrix;
  // 漫反射 入射光线颜色
  uniform vec3 u_DiffuseLight;
  // 漫反射入射光线方向  世界坐标
  uniform vec3 u_LightDirection;
  // 环境光反射 颜色
  /**
   * u_AmbientLight 用于接收环境光的颜色值  该变量和表面的基基底色a_Color计算出
   * 反射光的颜色 ambient 而后在与漫反射产生的颜色 diffuse 相加 计算物体最终颜色
   * 
  */
  uniform vec3 u_AmbientLight;
  varying vec4 v_Color;
  void main() {
    gl_Position = u_MvpMatrix * a_Position;
    // 法向量 归一化
    vec3 normal = normalize(a_Normal.xyz);
    // 计算光线方向 与 平面 法向量 点积 
    float nDotL = max(dot(u_LightDirection, normal), 0.0);
    // 计算漫反射 实际颜色
    vec3 diffuse = u_DiffuseLight * a_Color.rgb * nDotL;
    // 计算环境光
    vec3 ambient = u_AmbientLight * a_Color.rgb;
    // 漫反射光与环境光 相加   
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
    console.log("获取gl上下文失败");
    return;
  }
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("初始化着色器失败");
    return
  }
  let n = initVertexBuffers(gl);
  if (n<0) {
    console.log("初始化缓冲区对象失败");
    return;
  }

  gl.clearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST);

  let u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  let u_DiffuseLight = gl.getUniformLocation(gl.program, 'u_DiffuseLight');
  let u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection')
  let u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight')
  if (!u_MvpMatrix || !u_DiffuseLight || !u_LightDirection || !u_AmbientLight) { 
    console.log('获取uniform值失败');
    return;
  }
  // 设置光源颜色
  gl.uniform3f(u_DiffuseLight, 1.0, 1.0, 1.0);
  let lightDirection = new Vector3([0.5, 3.0, 4.0]);
  lightDirection.normalize();
  gl.uniform3fv(u_LightDirection, lightDirection.elements);

  // 设置环境光颜色
  gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);

  // 设置视图投影矩阵
  let mvpMatrix = new Matrix4();
  mvpMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100);
  mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // 绘制
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);


}
function initVertexBuffers(gl) { 
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3

  let vertices = new Float32Array([
    // 前面 V0-V1-V2-V3
    1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0,
    // 右面 V0-V3-V4-V5
    1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0,
    // 上面V0-V5-V6-V1
    1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0,
    // 左面 V1-V6-V7-V2
    -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0,
    // 下面 V7-V4-V3-V2
    -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
    // 后面 V4-V7-V6-V5
    1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0
  ]);

  // 每个面使用顶点的颜色
  let colors = new Float32Array([
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v1-v2-v3 front
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v3-v4-v5 right
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v5-v6-v1 up
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v1-v6-v7-v2 left
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v7-v4-v3-v2 down
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0　    // v4-v7-v6-v5 back
  ])

  // 法向量数据
  /**
   * 类似上面颜色 是逐顶点数据 存储在缓冲区中，并传给着色器。对法向量数据也可以这样做
   * 每个顶点有3个法向量 因为一个点被3个面所使用
   */
  let normals = new Float32Array([
    0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
    1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
    -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
    0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 
    0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,
  ])

  // 索引坐标值
  let indices = new Uint8Array([
    0, 1, 2, 0, 2, 3,
    4, 5, 6, 4, 6, 7,
    8, 9, 10, 8, 10, 11,
    12, 13, 14, 12, 14, 15,
    16, 17, 18, 16, 18, 19,
    20, 21, 22, 20, 22, 23
  ]);

  // 顶点缓冲区
  if (!initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)) {
    return -1;
  }
  // 颜色缓冲区
  if (!initArrayBuffer(gl, 'a_Color', colors, 3, gl.FLOAT)) {
    return -1;
  }
  // 法向量缓冲区
  if (!initArrayBuffer(gl, 'a_Normal', normals, 3, gl.FLOAT)) {
    return -1;
  }
  // 创建索引缓冲区对象
  let indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log("初始化索引缓冲区对象");
    return -1
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length;
}
function initArrayBuffer(gl, attribute, data, num, type) { 
  // 创建缓冲区对象
  let buffer = gl.createBuffer();
  if (!buffer) {
    console.log("初始化缓冲区对象失败");
    return false;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  // 获取对应的 attribute属性赋值
  let a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log("获取属性值失败");
    return false;
  }
  
  // 链接数据
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // 开启链接
  gl.enableVertexAttribArray(a_attribute);
  // 清空缓冲区对象
  return true;
}