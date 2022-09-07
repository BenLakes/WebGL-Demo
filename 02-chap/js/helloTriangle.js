/**
 * 目标 使用缓冲区对象 
 * 绘制 点 gl.POINTS、线段 gl.LINES  线条 gl.LINES_STRIP、
 *  回路 gl.LINE_LOOP、 三角形 gl.TRIANGLES、三角带gl.TRIANGLE_STRIP、三角扇 gl.TRIANGLE_FAN
 */
//顶点着色器代码
let VSHARDER_SOURCE = `
   attribute vec4 a_Position;
   void main() {
     gl_Position = a_Position;
   }
`;
// 片元着色器
let FSHARDER_SOURCE = `
   void main() {
     gl_FragColor = vec4(1.0,1.0,0.0,1.0);
   }
`;
// 入口函数
function main() {
  // 获取canvas 代码
  let canvas = document.getElementById("myCanvas")
  let gl = getWebGLContext(canvas)
  if (!gl) {
    // 当webGL 绘图环境不存在的时候
    console.log("获取绘图环境失败")
    return
  }
  // 初始化着色器
  if (!initShaders(gl, VSHARDER_SOURCE, FSHARDER_SOURCE)) {
    console.log("初始化着色器失败")
    return
  }
  // 设置缓冲区 与 顶点位置绑定
  // 返回值 为 需要创建的 顶点个数  待绘制顶点的数量
  let n = initVertexBuffers(gl)
  // 如果错误 n 返回的是 -1
  if (n < 0) {
    console.log("初始化位置与缓冲区失败")
    reutrn
  }
  // 背景清除的颜色
  gl.clearColor(0.0, 0.0, 0.0, 1.0)

  gl.clear(gl.COLOR_BUFFER_BIT)

  /**
   * 绘制点  1. 表示绘制类型  2.从第几个点开始绘制 3. 绘制多少个点
   * 第三个参数 表示 绘制 3个点
   * webGL并不知道缓冲区有多少个顶点，所以应该显示告诉它绘制的多少个顶点
   * WebGL只能绘制三种图形 点 线 三角形  任何图形都可以由小三角形组成  
   */
  // 画点
  // gl.drawArrays(gl.POINTS, 0, n)
  // 画线段
  // gl.drawArrays(gl.LINES, 0, n)
  // 画线条
  // gl.drawArrays(gl.LINE_STRIP, 0, n)
  // 回路
  // gl.drawArrays(gl.LINE_LOOP, 0, n)
  // 三角形
  gl.drawArrays(gl.TRIANGLES, 0, n)
  // 三角带
  // gl.drawArrays(gl.TRIANGLE_STRIP, 0, n)
  // gl.drawArrays(gl.TRIANGLE_FAN, 0, n)
}
function initVertexBuffers(gl) {
  // 以类型数组创建 多个顶点数据
  // 类型化 数组不支持 push  或 pop 方法
  /**
   * 有的方法
   * get set  length  类型化数组只能通过 new 创建  传入值是 长度 或者 数据内容[1.0,2.0]
   * 不能直接传 []
   */
  let vertices = new Float32Array([
    0, 0.5,
    -0.5, -0.5,
    0.5, -0.5,
  ])
  // 指定点位 个数
  let n = 3
  /**
   * 使用缓冲区对象向顶点着色器传入多个顶点数据 遵循 5步骤
   * 1. 创建缓冲区对象
   * 2.缓冲区对象  绑定目标类型
   * 3.像缓冲区对象写入数据
   * 4.将缓冲区对象 分配给一个 attribute 变量
   * 5.开启 或 激活 缓冲区对象 和  变量之间的 关系
   */

  // 创建缓冲区对象 用于存放顶点数据
  // 有 deleteBuffer(vertexBuffer) 与之对应
  let vertexBuffer = gl.createBuffer()
  if (!vertexBuffer) {
    console.log("创建缓存对象失败")
    reutrn - 1
  }
  /**
   * 缓冲区对象绑定 目标(标识 该缓冲区的类型) 1. 标识的目标,  2. 缓冲区对象
   * 将缓冲区对象 绑定到 WebGL系统中已经存在的 目标上
   * 包括 gl.ARRAY_BUFFER, gl.ELEMENT_ARRAY_BUFFER 用于表示缓冲区的用途
   * WebGL才能正确处理其中的内容
   * 前者表示 缓冲区对象中包含 顶点数据
   * 后者表示 缓冲区对象中包含顶点的索引值
   */
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
  /**
   * 开辟空间  往缓冲区 写入数据 1. 标识的目标  2. 顶点数据  3.写入方式
   * 将第二个参数vertices 中的数据 写入绑定到 第一个参数 gl.ARRAY_BUFFER 上的缓冲对象
   * 我们不能直接操作缓冲区数据 只能像 目标 写入数据
   * 所以要上面的步骤 先绑定 缓冲区 这样才能顺利写入
   *
   * 3.表示程序 将如何 使用存储在缓冲区中的数据 该参数 将帮助 WebGL优化操作
   *
   *  */
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
  // 获取attribute 变量 用于处理数据
  let a_Position = gl.getAttribLocation(gl.program, "a_Position")
  // 当获取的 a_Position 小于0 表示没有获取到
  if (a_Position < 0) {
    console.log("未获取到正确的attribute")
    return -1
  }
  /**
   * 将缓冲区对象 分配给 a_Position attribute 变量
   * 可以将整个缓冲区对象 实际是 引用 或 指针 分配给 attribute变量
   * 1. 待分配attribute变量的存储位置
   * 2. 指定缓冲区每个顶点分量个数 不够的位置会默认用0.0补齐
   * 3. 缓冲区的数据格式
   * 4.是否将非浮点数的数据归一化处理
   * 5. 指定相邻两个顶点间字节数
   * 6. 指定缓冲区对象中的偏移量
   * 将整个缓冲区分配给了 a_Position 变量
   */
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0)
  // 链接 或说 开启 a_Position 变量与分配给它的 缓冲区对象
  // 开启 使分配给a_Position 变量缓冲区数据生效
  /**
   * 为了使顶点 着色器 能够访问缓冲区内的数据 通过 enableVertexAttribArray() 方法开启变量
   * 传入已经分配好的  attribute 变量  缓冲区 对象和 attribute 变量之间的连接真正建立起来了
   * 可以使用 disableVertexAttribArray 来关闭分配
   * 
   */
  gl.enableVertexAttribArray(a_Position)
  return n
}

