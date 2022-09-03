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
var VSHARDER_SOURCE = `void main() {
    //设置 顶点坐标点 内置在顶点着色器中 必须赋值
    gl_Position = vec4(0.0,0.0,0.0,1.0);
    // 设置顶点的大小  内置变量 表示像素数  默认 1.0
    gl_PointSize = 10.0;
  }`;
// 片元着色器
var FSHARDER_SOURCE = `void main() {
    // 设置颜色
    gl_FragColor = vec4(1.0,0.0,0.0,1.0);
  }
`;
function main() { 
  let canvas = document.getElementById('myCanvas');
  // 获取 webGL 绘图环境
  let gl = getWebGLContext(canvas);
  /**
   * WebGL 依赖一种新的 着色器的绘图机制, 着色器可以绘制 二维 或三维的环境 所有 WebGL程序
   * 必须是用 着色器  而不是直接类似canvas.fillRect() 简单的绘图命令操作  
   * 着色器不仅强大 而且更复杂
   */
  // 初始化着色器  使用第三方的 库 被定义在 cuon.util.js 
  if (!initShaders(gl, VSHARDER_SOURCE, FSHARDER_SOURCE)) { 
    console.log("初始化着色器失败");
    return;
  }
  // 给webGL 提供背景色
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // 清空canvas
  gl.clear(gl.COLOR_BUFFER_BIT);
  // 绘制一个点  1.mode 绘制方式  点 线 面 2.指定从那个顶点开始绘制 3.绘制一次 需要多少顶点
  gl.drawArrays(gl.POINTS, 0, 1)

  
}