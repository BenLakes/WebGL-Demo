/**
 * @type {HTMLCanvasElement}
 */
// 顶点着色器  以字符串的形式 嵌入到 js
/**
 * 顶点着色器 用来描述顶点特性 (位置、颜色等)
 * 顶点指二维或三维空间中的一个点,  端点 或 交点
 * 
 * 片元着色器  进行逐片元处理 片元 是WebGL的术语， 可以将其理解为像素 === 片元
 * 
 * 着色器可以高度 灵活的完成这些工作  提供各种渲染效果
 * 逐顶点 的操作 顶点着色器  逐片元操作  片元着色器
 */
// 使用 attribute 传值
var VSHARDER_SOURCE = `
  // attribute 存储限定符  vec4 4维向量  a_Position 变量名
  attribute vec4 a_Position;
  attribute float a_PositionSize;
   void main() {
    //设置 顶点坐标点 内置在顶点着色器中 必须赋值 
    // 将attribute变量赋值给gl_Position变量
    gl_Position = a_Position;
    // 设置顶点的大小  内置变量 表示像素数  默认 1.0
    gl_PointSize = a_PositionSize;
  }`
// 片元着色器
var FSHARDER_SOURCE = `void main() {
    // 设置颜色
    gl_FragColor = vec4(1.0,0.0,0.0,1.0);
  }
`;
function main() {
  let canvas = document.getElementById("myCanvas")
  // 获取 webGL 绘图环境
  let gl = getWebGLContext(canvas)
  /**
   * WebGL 依赖一种新的 着色器的绘图机制, 着色器可以绘制 二维 或三维的环境 所有 WebGL程序
   * 必须是用 着色器  而不是直接类似canvas.fillRect() 简单的绘图命令操作
   * 着色器不仅强大 而且更复杂
   */
  // 初始化着色器  使用第三方的 库 被定义在 cuon.util.js
  if (!initShaders(gl, VSHARDER_SOURCE, FSHARDER_SOURCE)) {
    console.log("初始化着色器失败")
    return
  }
  // 获取attribute 变量存储的变量位置 1. WebGL程序 包含 顶点着色器  片元着色器 程序对象
  // 返回值 attribute变量地址  大于 等于 0 表示存在  小于 0 表示不存在
  var a_Position = gl.getAttribLocation(gl.program, "a_Position")
  var a_PositionSize = gl.getAttribLocation(gl.program, "a_PositionSize")

  console.log("a_Position地址", a_Position)
  //
  if (a_Position < 0) {
    console.log("获取变量地址失败")
    return
  }
   if (a_PositionSize < 0) {
     console.log("获取变量地址失败")
     return
   }
  // 给attribute 变量 设置值 将顶点数据传输给 attribute
  // 1. 指定将要修改的 attribute 变量的存储位置
  // 2. 指定填充的 分量 省略了 最后一个分量 齐次坐标分量   该方法会 默认地将第4分量设置为 1.0
  /**
   * gl.vertexAttrib3f 的同族函数
   *   该系列的函数的任务就是从 js 向顶点着色器中的 attribute 变量传值
   *   gl.vertexAttrib1f 单个分量
   *   gl.vertexAttrib2f 两个分量
   *   gl.vertexAttrib3f 三个分量
   *   gl.vertexAttrib4f 四个分量
   *   也可使用 gl.vertexAttrib4fv() 矢量的版本 v 表示向量 可以理解为数组
   *   let position = new Float32Array([1.0,2.0,3.0,1.0])
   *   gl.vertexAttrib4fv(a_Position, position)
   *   带 v 表示 可以接收对应数组的长度 大小
   */
  // gl.vertexAttrib1f(a_Position, 0.8)
  // gl.vertexAttrib2f(a_Position, 0.8, 0.5)
  gl.vertexAttrib3f(a_Position, 0.8, 0.5, 0)
  // gl.vertexAttrib4f(a_Position, 0.8, 0.5, 0)


  gl.vertexAttrib1f(a_PositionSize, 8.0);

  // 给webGL 提供背景色
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  // 清空canvas
  gl.clear(gl.COLOR_BUFFER_BIT)
  // 绘制一个点  1.mode 绘制方式  点 线 面 2.指定从那个顶点开始绘制 3.绘制一次 需要多少顶点
  gl.drawArrays(gl.POINTS, 0, 1)
}