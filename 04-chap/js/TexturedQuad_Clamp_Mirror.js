/**
 * 目标：设置纹理坐标数据 大于 0 1 重复 纹理图像
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
`
// 片元着色器
let FSHARDER_SOURCE = `
  #ifdef GL_ES
  precision mediump float;
  #endif
  // 取色器 类型 
  uniform sampler2D u_Sampler;
  varying vec2 v_TexCoord;
  void main() {
    gl_FragColor = texture2D(u_Sampler, v_TexCoord);
  }
`

function main() {
  let canvas = document.getElementById("myCanvas")
  let gl = getWebGLContext(canvas)
  if (!gl) {
    console.log("获取webGL 上下文失败")
    return
  }
  // 初始化shader
  if (!initShaders(gl, VSHARDER_SOURCE, FSHARDER_SOURCE)) {
    console.log("初始化着色器失败")
    return
  }
  let n = initVertexBuffers(gl)
  if (n < 0) {
    console.log("初始化缓冲区对象失败")
    return
  }
  // 设置环境色
  gl.clearColor(0.0, 0.0, 0.0, 1.0)

  // 初始化 纹理对象
  if (!initTextures(gl, n)) {
    console.log("初始化纹理失败")
    return
  }
}
// 初始化 缓冲区对象
function initVertexBuffers(gl) {
  // 定义顶点坐标 和 顶点对应的纹理坐标
  let verticesTexCoords = new Float32Array([
    -0.5, 0.5, -0.3, 1.7, -0.5, -0.5, -0.3, -0.2, 0.5, 0.5, 1.7, 1.7, 0.5, -0.5,
    1.7, -0.2,
  ])

  let n = 4

  // 创建缓冲区对象
  let vertexTexCoordBuffer = gl.createBuffer()
  // 缓冲区绑定目标
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer)
  // 缓冲区分配数据
  gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW)
  // 获取顶点着色器 坐标属性存储位置
  let a_Position = gl.getAttribLocation(gl.program, "a_Position")
  let a_TexCoord = gl.getAttribLocation(gl.program, "a_TexCoord")
  if (a_Position < 0 || a_TexCoord < 0) {
    console.log("获取attribute属性缓存位置失败")
    return -1
  }
  // 获取 类型数组 每个元素 占用的 大小
  let FSIZE = verticesTexCoords.BYTES_PER_ELEMENT
  // 坐标顶点属性 分配缓冲区
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0)
  gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2)
  // 开启链接
  gl.enableVertexAttribArray(a_Position)
  gl.enableVertexAttribArray(a_TexCoord)

  return n
}
// 初始化 纹理
function initTextures(gl, n) {
  // 初始化 纹理 对象
  let texture = new gl.createTexture()
  if (!texture) {
    console.log("初始化纹理对象失败")
    return false
  }
  // 获取u_Sampler 取样器的 存储地址
  let u_Sampler = gl.getUniformLocation(gl.program, "u_Sampler")
  if (!u_Sampler) {
    console.log("获取取样器存储地址失败")
    return false
  }

  // 创建图片
  let image = new Image()
  image.onload = function () {
    // 当图片加载完成时候的回调 执行 加载纹理图像的操作
    loadTexture(gl, n, texture, u_Sampler, image)
  }
  image.src = "../../resources/sky.jpg"
  return true
}
// 加载纹理
function loadTexture(gl, n, texture, u_Sampler, image) {
  // 反正纹理图像的 y轴
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
  // 激活纹理
  gl.activeTexture(gl.TEXTURE0)
  // 绑定纹理
  gl.bindTexture(gl.TEXTURE_2D, texture)
  // 设置纹理对象 对 纹理图像的 映射方式 st坐标 uv坐标  放大 缩小  横向 纵向 等设置  有默认值
  // 缩小设置
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  // 横向   gl.CLAMP_TO_EDGE 使用纹理图像 边缘值填充
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  // 纵向  gl.MIRRORED_REPEAT  对称式的重复纹理
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT)
  // 设置纹理图像  给 纹理对象
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image)
  // 纹理图像信息 传递 值给 片元着色器  u_Sampler
  gl.uniform1i(u_Sampler, 0)
  // 清除颜色缓冲区
  gl.clear(gl.COLOR_BUFFER_BIT)
  // 绘制图形
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, n)
}
