/**
 * 目标：使用多幅纹理
 */
// 顶点着色器
let VSHARDER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec2 a_TexCoord;
  varying vec2 v_TexCoord;
  void main() {
    gl_Position = a_Position;
    v_TexCoord = a_TexCoord;
  }
`;

// 片元着色器
let FSHARDER_SOURCE = `
#ifdef GL_ES
 precision mediump float;
#endif
  varying vec2 v_TexCoord;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  void main() {
    // 获取第一个纹理单元 对应颜色
    vec4 color1 = texture2D(u_Sampler0, v_TexCoord);
    // 获取第二个纹理单元 对应颜色
    vec4 color2 = texture2D(u_Sampler1, v_TexCoord);
    gl_FragColor = color1 * color2;
  }
`;

function main() { 
  let canvas = document.getElementById('myCanvas');
  let gl = getWebGLContext(canvas);
  if (!gl) {
    console.log("获取webGL绘图环境失败");
    return;
  }
  // 初始化着色器
  if (!initShaders(gl, VSHARDER_SOURCE, FSHARDER_SOURCE)) {
    console.log("初始化着色器失败");
    return;
  }
  // 初始化缓冲区数据
  let n = initVertexBuffers(gl);
  if (n < 0) {
    console.log("初始化缓冲区对象失败");
    return;
  }
  // 定义环境颜色
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // 初始化 纹理对象 和 加载纹理 图像
  if (!initTexture(gl, n)) {
    console.log("初始化纹理对象失败");
    return;
  }
}
// 初始化缓冲区对象
function initVertexBuffers(gl) { 
  let vertiecesTextureCoords = new Float32Array([
    -0.5, 0.5, 0.0, 1.0,
    -0.5, -0.5, 0.0, 0.0,
    0.5, 0.5, 1.0, 1.0,
    0.5,-0.5, 1.0, 0.0
  ]);
  let n = 4;
  //  初始化缓冲区
  let vertexTextureBuffer = gl.createBuffer();
  // 绑定目标
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexTextureBuffer);
  // 缓冲区分配数据
  gl.bufferData(gl.ARRAY_BUFFER, vertiecesTextureCoords, gl.STATIC_DRAW);
  // 获取顶点坐标属性
  let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  // 获取纹理坐标属性
  let a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');

  if (a_Position < 0 || a_TexCoord < 0) {
    console.log("获取属性存储值 异常");
    return -1;
  }
  // 获取 类型数组 每个元素占用的 内存大小
  let FSIZE = vertiecesTextureCoords.BYTES_PER_ELEMENT
  // 属性分配数据
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
  gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);

  // 开启链接
  gl.enableVertexAttribArray(a_Position);
  gl.enableVertexAttribArray(a_TexCoord);

  return n;
}
// 初始化纹理对象
function initTexture(gl, n) { 
  // 创建 多个纹理缓冲区
  let texture0 = gl.createTexture();
  let texture1 = gl.createTexture();
  if (!texture0 || !texture1) {
    console.log("获取纹理对象失败");
    return false;
  }
  // 获取 片元着色器的 取样器 属性
  let u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  let u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler0 || !u_Sampler1) {
    console.log("获取取样器失败");
    return false;
  }
  // 创建两个图片对象
  let image0 = new Image();
  let image1 = new Image();
  image0.onload = function () {
     loadTexture(gl, n, texture0, u_Sampler0, image0, 0)
   }
  image1.onload = function () {
    loadTexture(gl, n, texture1, u_Sampler1, image1, 1)
  }
  image0.src = '../../resources/sky.jpg';
  image1.src = '../../resources/circle.gif'
  
  return true;
}
// 用于判断 纹理图像是否激活完成
let g_texUnit0 = false, g_texUnit1 = false;
// 加载纹理
function loadTexture(gl, n, texture, u_Sampler, image, texUnit) { 
  // 反正 纹理图像的 y轴
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  // 分开激活 纹理单元
  if (texUnit === 0) {
    gl.activeTexture(gl.TEXTURE0);
    g_texUnit0 = true;
  } else { 
    gl.activeTexture(gl.TEXTURE1)
    g_texUnit1 = true;
  }
  // 绑定 纹理对象到 目标
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // 设置 映射的方式
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // 设置纹理图像到  纹理对象
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  // 纹理图像 单元 分配给  u_Sampler
  gl.uniform1i(u_Sampler, texUnit);
  // 清除颜色缓冲区
  gl.clear(gl.COLOR_BUFFER_BIT);
  // 绘制
  if (g_texUnit0 && g_texUnit1) {
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
  }
}