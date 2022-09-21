/**
 * 目标：画正方形
 */
// 定义顶点着色器代码
let VSHARDER_SOURCE = `
  //定义顶点变量
  attribute vec4 a_Position;
  void main() {
    gl_Position = a_Position;
    // gl_PointSize = 10.0;
  }
`
// 片元着色器代码
let FSHARDER_SOURCE = `
  void main() {
    gl_FragColor = vec4(1.0,0.0,0.0,1);
  }
`
// js 程序入口
function main() {
  // 获取canvas 元素
  let canvas = document.getElementById("myCanvas")
  //获取WebGL绘图环境
  let gl = getWebGLContext(canvas)

  if (!gl) {
    console.log("获取webGL绘图环境异常")
    return
  }
  // 初始化着色器
  if (!initShaders(gl, VSHARDER_SOURCE, FSHARDER_SOURCE)) {
    console.log("初始化着色器失败")
    return
  }
  // 初始化点位 与 缓冲区对象绑定
  // 返回值为 需要创建的 顶点个数 待绘制顶点的数量
  let n = initVertexBuffers(gl)
  if (n < 0) {
    console.log("初始化顶点数据失败")
    return
  }
  // 设置背景色
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  // 清除 canvas
  gl.clear(gl.COLOR_BUFFER_BIT)
  // gl.drawArrays(gl.LINE_LOOP, 0, n)
  // gl.drawArrays(gl.TRIANGLES, 0, n)
  // gl.drawArrays(gl.TRIANGLE_STRIP, 0, n)
  gl.drawArrays(gl.TRIANGLE_FAN, 0, n)
}

function initVertexBuffers(gl) {
  // 定义顶点数据 使用类型数据 而后放置到 缓冲区对象中
  // gl.TRIANGLES 需要 6 个顶点  两个三角形
  // let vertices = new Float32Array([
  //   -0.5,0.5,
  //   -0.5,-0.5,
  //   0.5,-0.5,
  //   0.5, - 0.5,
  //   0.5,0.5,
  //   -0.5,0.5,
  // ])
  // // 指定 顶点个数
  // let n = 6

  // gl.TRIANGLE_STRIP 只需要4个顶点
  let vertices = new Float32Array([
    -0.5, 0.5, -0.5, -0.5,

    0.5, 0.5, 0.5, -0.5,
    // 0.8, -0.5,
    // 0.8, 0.5, 0.5,0.5
  ])
  let n = 4

  // 创建缓冲区对象
  let vertexBuffer = gl.createBuffer()
  if (!vertexBuffer) {
    console.log("初始化缓冲区对象失败")
    return -1
  }
  //缓冲区对象 绑定 目标 类型
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
  //开辟空间 像缓冲区写入数据
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
  // 获取 a_Position attribute 存储地址
  let a_Position = gl.getAttribLocation(gl.program, "a_Position")
  if (a_Position < 0) {
    console.log("获取attribute 变量失败")
    return -1
  }
  // 将缓冲区对象 分配给 a_Position attribute
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0)
  // 开启 缓冲区 与 attribute 变量 的链接
  gl.enableVertexAttribArray(a_Position)

  return n
}
