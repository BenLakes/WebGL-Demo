/**
 * 目标：利用矩阵库的 平移 和 旋转  复合变换
 */
// 顶点着色器
let VSHARDER_SOURCE = `
 attribute vec4 a_Position;
 // 4 * 4 的旋转矩阵 由矩阵库 自动生成
 uniform mat4 u_ModelMatrix;
  void main() {
    gl_Position = u_ModelMatrix * a_Position;
  }
`

// 片元着色器
let FSHARDER_SOURCE = `
  void main() {
    gl_FragColor = vec4(1.0,1.0,0.0,1.0);
  }
`

function main() {
  let canvas = document.getElementById("myCanvas")
  let gl = getWebGLContext(canvas)
  if (!gl) {
    console.log("获取webgl 上下文失败")
    return
  }
  // 初始化shader
  if (!initShaders(gl, VSHARDER_SOURCE, FSHARDER_SOURCE)) {
    console.log("初始化着色器程序失败")
    return
  }
  // 初始化顶点数据
  let n = initVertexBuffers(gl)
  if (n < 0) {
    console.log("创建缓冲区对象失败")
    return
  }
  // 创建 Matrix4 对象 用于 创建相关操作的矩阵模型
  let xmodelMatrix = new Matrix4()
  let ANGLE = 60
  // setRotate 表示使用矩阵库创建旋转矩阵 1、旋转角度  后面的表示旋转的轴
  // 把 xmodelMatrix 设置为旋转矩阵    把自身设置为 旋转矩阵的内容  4 * 4 矩阵
  /**
   * 接收的参数是 角度制  内部会换算 成 弧度
   * 后面三个参数表示 绕轴旋转
   * 1. x轴
   * 2. y轴
   * 3 表示 绕 Z轴旋转
   */
  // xmodelMatrix.setTranslate(0.5, 0, 0)
  // xmodelMatrix.rotate(ANGLE, 0, 0, 1)
  xmodelMatrix.setRotate(ANGLE, 0, 0, 1)
  xmodelMatrix.translate(0.5, 0, 0)

  // 获取顶点着色器的旋转矩阵 变量  进行赋值
  let u_xmodelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix")
  if (!u_xmodelMatrix) {
    console.log("获取Uniform 失败")
    return
  }
  // 赋值
  gl.uniformMatrix4fv(u_xmodelMatrix, false, xmodelMatrix.elements)
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)
  // 绘制三角形
  gl.drawArrays(gl.TRIANGLES, 0, n)
}
function initVertexBuffers(gl) {
  let vertices = new Float32Array([0.0, 0.3, -0.3, -0.3, 0.3, -0.3])
  let n = 3
  // 创建缓冲区对象
  let vertexBuffer = gl.createBuffer()
  if (!vertexBuffer) {
    console.log("创建缓冲区对象失败")
    return -1
  }
  //缓冲区对象绑定 目标类型
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
  //缓冲区写入顶点数据
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
  // 获取a_Position attribute
  let a_Position = gl.getAttribLocation(gl.program, "a_Position")
  if (a_Position < 0) {
    console.log("获取a_Position 地址异常")
    reutrn - 1
  }
  // 分配 缓冲区数据 给 attribute
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0)
  // 启用
  gl.enableVertexAttribArray(a_Position)
  return n
}
