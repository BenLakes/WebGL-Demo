/**@type{HTMLCanvasElement} */
function main() {
  // 获取 canvas 标签元素
  let canvas = document.getElementById('myCanvas');
  // 使用 额外的库 获取 WebGl 绘图上下文  这个库 加载 上下文提供了兼容不通浏览器的方式
  // 隐藏不通浏览器的差异 函数 存在 cuon-utils.js 文件中
  // 该函数有两个参数  1 canvas 元素
  //  第二个是 是否开启 debug属性 遇到错误时将在控制台显示错误
  // gl 为 WebGL 绘图的上下文
  let gl = getWebGLContext(canvas, true);
  // 当 gl 为空 的时候给提示
  if (!gl) {
    console.log("加载WebGL 上下文绘图环境失败");
    return;
  }
  // 指定清空绘图环境的颜色
  // 由于WebGL继承自OpenGL,所以它遵循传统的OpenGL颜色分量的取值范围
  // gl的特点 使用 颜色的表示方式 0.0 - 1.0 之前 凡是小于 0.0  或 大于 1.0 都会当最大值处理
  // 一旦指定了该颜色 背景色常驻 WebGL系统 在下次调用该方法前不会改变 
  gl.clearColor(0.6, 1.0, 0.0, 1.0);
  //清空 canvas  clear 用之前的指定的背景色 清空 即用背景色填充 擦除已绘制的内容 绘图区域
  // gl.COLOR_BUFFER_BIT 清空的实际是告诉WebGL系统清空 颜色缓冲区  还可清空 深度缓冲区  模板缓冲区
  // gl.DEPTH_BUFFER_BIT 深度缓冲区   gl.STENCIL_BUFFER_BIT 模板缓冲区
  // 清空后 如果有设置 clearColor 就是用设置的颜色  没有就默认的黑色
  gl.clear(gl.COLOR_BUFFER_BIT);
}
