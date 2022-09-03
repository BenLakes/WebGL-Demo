/** @type {HTMLCanvasElement} */
function main() { 
  // 获取 canvas 元素
  let canvas = document.getElementById("myCanvas")
  if (!canvas) {
    console.log("获取canvas 元素失败, 请检查")
    return false
  }
  // 先改元素 请求二维图形 绘图上下文  或者叫 绘图环境
  // 由于 <canvas> 元素可以灵活的同时支持二维或三维图形，所以不能直接提供绘图方法，而是提供
  // 一种叫上下文 的机制 来进行绘图
  let ctx = canvas.getContext("2d")
  // 先指定填充颜色
  ctx.fillStyle = "red"
  ctx.fillStyle = "rgba(255,0,255,1)"
  // 通过调用上下文 对应的函数 绘制二维图形 
  ctx.fillRect(10, 10, 200, 200)
  
}
