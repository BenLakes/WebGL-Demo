/**
 * 目标：使用给每个顶点指定颜色 画三角形 webGL 会自动三角形表面 产生颜色平滑过渡的效果
 * 
 */
// 顶点着色器
let VSHARDER_SOURCE = `
  attribute vec4 a_Position;
  attribute float a_PointSize;
  attribute vec4 a_Color;
  varying vec4 v_Color;
  void main() {
     gl_Position = a_Position;
     gl_PointSize = a_PointSize;
     v_Color = a_Color; 
  }  
`
// 片元着色器
let FSHARDER_SOURCE = `
/**
 * 切确的说  顶点着色器中的 v_Color变量在传入片元着色器之前 会进过内插过程(
 * 所以片元着色器中的 v_Color与顶点着色器中v_Color变量 已经不是一回事了
 * 顶点着色器中只定义了三个顶点的颜色值, 然而三角形表面的其他片元颜色 会被WebGL系统用 3个顶点颜色值
 * 内插出来
 * 当在光栅化时候  WebGL会自动计算出varying变量 v_Color  所有片元的颜色值都会被恰当计算出来 
 * 这个过程就是  内插过程
 * 一旦点之间每个片元的新颜色都被计算出来后就会被传给片元着色器中的 v_Color变量
 * 光栅化是三维图形学的关键技术,它负责将矢量的几何图形转换为 栅格化的片元(像素),图形被转化为片元后,我们
 * 就可以在片元着色器指定 任何颜色
 *  
 * )
 * */
  #ifdef GL_ES
  precision mediump float;
  #endif
  varying vec4 v_Color;
  void main() {
    gl_FragColor = v_Color;
    // gl_FragColor = vec4(1.0, 0.0, 1.0,1.0);
  }
`

function main() {
  let canvas = document.getElementById("myCanvas")
  let gl = getWebGLContext(canvas)
  if (!gl) {
    console.log("获取WebGL上下文失败")
    return
  }
  if (!initShaders(gl, VSHARDER_SOURCE, FSHARDER_SOURCE)) {
    console.log("初始化着色器异常")
    return
  }
  let n = initVertexBuffers(gl)
  if (n < 0) {
    console.log("初始化缓冲区对象失败")
    return
  }
  // 设置背景色
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  // 清除
  gl.clear(gl.COLOR_BUFFER_BIT)
  // 绘制
  // gl.drawArrays(gl.POINTS, 0, n)
  gl.drawArrays(gl.TRIANGLES, 0, n)
}

function initVertexBuffers(gl) {
  // 定义了 顶点数据  顶点大小数据  顶点颜色数据
  let vertexSizesColors = new Float32Array([
    0.0, 0.5, 10.0, 1.0, 0.0, 0.0, -0.5, -0.5, 20.0, 0.0, 1.0, 0.0, 0.5, -0.5,
    30.0, 0.0, 0.0, 1.0,
  ])
  let n = 3

  // 创建缓冲区对象
  let vertexSizeColorBuffer = gl.createBuffer()
  // 绑定目标
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexSizeColorBuffer)
  // 缓冲区分配数据
  gl.bufferData(gl.ARRAY_BUFFER, vertexSizesColors, gl.STATIC_DRAW)
  // 获取顶点 a_Position 属性值
  let a_Position = gl.getAttribLocation(gl.program, "a_Position")
  let a_PointSize = gl.getAttribLocation(gl.program, "a_PointSize")
  let a_Color = gl.getAttribLocation(gl.program, "a_Color")
  if (a_Position < 0 || a_PointSize < 0 || a_Color < 0) {
    console.log("获取attribute内存地址异常")
    return -1
  }
  // 获取每个 元素 对应的字节数
  let FSIZE = vertexSizesColors.BYTES_PER_ELEMENT
  // 分配数据
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 6, 0)
  gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, FSIZE * 6, FSIZE * 2)
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3)

  // 开启链接
  gl.enableVertexAttribArray(a_Position)
  gl.enableVertexAttribArray(a_PointSize)
  gl.enableVertexAttribArray(a_Color)

  return n
}
