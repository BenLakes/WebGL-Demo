let VSHARDER_SOURCE = `
  attribute vec4 a_Position;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = 10.0;
  }
`;
let FSHARDER_SOURCE = `
  // 这里需要指定 精度 精度限定词 指定下面使用变量的 精度范围
  precision mediump float;
  // 声明 uniform 变量
  //uniform变量
  uniform vec4 u_FragColor;
  void main() {
     gl_FragColor = u_FragColor;
   }
`

function main() {
  let canvas = document.getElementById("myCanvas")
  let gl = getWebGLContext(canvas, true)
  if (!gl) {
    console.log("获取gl 绘图环境失败")
    return
  }
  // 初始化着色器
  if (!initShaders(gl, VSHARDER_SOURCE, FSHARDER_SOURCE)) {
    console.log("初始着色器程序 失败")
    return
  }
  // 获取a_Position 的内存地址
  let a_Position = gl.getAttribLocation(gl.program, "a_Position")
  // 获取 uniform 变量的存储位置
  /**
   * getUniformLocation 返回值 存在是值 不存在是null 与 getAttribLocation 不一样
   */
  let u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor")
  if (!u_FragColor) {
    console.log("获取的值不存在")
    return
  }
  if (a_Position < 0) {
    console.log("a_Position变量不存在")
    return
  }
  // 全局点击存放的 坐标点
  let g_points = []
  // 存储位置对应的颜色
  let g_colors = []
  // 监听鼠标点击位置  且进行坐标转换
  canvas.onmousedown = (e) => {
    console.log("点击了")
    // 获取的是 点击坐标点 对应 屏幕坐标的左上角
    let x = e.clientX
    let y = e.clientY
    // 获取canvas 的信息
    let rect = e.target.getBoundingClientRect()
    // 获取坐标转换后 x  y  的值  归一化
    x1 = (x - rect.left - canvas.width / 2) / (canvas.width / 2)
    // y轴需要考虑 canvas 的y轴坐标系 与 webGL 的y轴坐标系 是不一样的
    // 这里使用
    y1 = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2)

    // 将坐标 存到全局数组中
    // g_points.push(x1);
    // g_points.push(y1);
    g_points.push([x1, y1])

    // 通过判断 x1 和 y1 的值 来判断象限
    if (x1 >= 0.0 && y1 >= 0.0) {
      // 第一象限
      g_colors.push([1.0, 0.0, 0.0, 1.0])
    } else if (x1 < 0.0 && y1 > 0.0) {
      // 第二象限
      g_colors.push([1.0, 1.0, 0.0, 1.0])
    } else if (x1 < 0.0 && y1 < 0.0) {
      // 第三象限
      g_colors.push([1.0, 0.0, 1.0, 1.0])
    } else {
      // 第四象限
      g_colors.push([0.0, 1.0, 1.0, 1.0])
    }

    gl.clear(gl.COLOR_BUFFER_BIT)

    // 循环绘制
    for (let i = 0; i < g_points.length; i++) {
      console.log("循环了")
      let xy = g_points[i]
      let rgba = g_colors[i]
      // 通过vertexAttrib3f 传递坐标点 给 顶点着色器的 a_Position
      gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0)
      // 将点的颜色 传输给 u_FragColor 变量中
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3])
      // drawArrays 绘制
      gl.drawArrays(gl.POINTS, 0, 1)
    }
  }
  gl.clearColor(0.0, 0.0, 0.0, 1.0)

  gl.clear(gl.COLOR_BUFFER_BIT)
}