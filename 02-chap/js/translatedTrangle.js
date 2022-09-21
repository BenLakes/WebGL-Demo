/**
 * 目标: 使用基本方式 移动三角形
 */

// 顶点着色器
let VSHARDER_SOURCE = `
  // 定义顶点数据
  attribute vec4 a_Position;
  // 定义移动的 向量
  uniform vec4 u_Translation;
  // 顶点着色器函数
  void main() {
    // GLSL 的赋值只能发生在相同类型变量之间
    gl_Position = a_Position + u_Translation;
  }
`;
// 片元着色器
let FSHARDER_SOURCE = `
  void main() {
    gl_FragColor = vec4(1.0, 0.0,0.0,1.0);
  }
`;
// 定义 x y z 的偏移量
let Tx = 0.5, Ty = 0.5, Tz = 0;
// 主要入口函数
function main() { 
  // 获取canvas 
  let canvas = document.getElementById('myCanvas');
  // 获取webGL画笔
  let gl = getWebGLContext(canvas);
  if (!gl) { 
    console.log("获取webGL 上下文失败");
    return;
  }
  // 初始化 着色器
  if (!initShaders(gl, VSHARDER_SOURCE, FSHARDER_SOURCE)) { 
    console.log("获取着色器程序失败");
    return;
  }
  // 初始化顶点位置 和 缓冲区对象 与 各种操作
  let n = initVertexBuffers(gl);
  if (n < 0) { 
    console.log("初始化缓冲区对象失败")
    return;
  }
  // 实现平移和旋转的基本方式 是一样的 就是在顶点着色器中计算顶点(平移旋转后的)新坐标赋值给 gl_Position
  // 设置 uniform  平移矩阵
  let u_Translation = gl.getUniformLocation(gl.program, 'u_Translation');
  if (!u_Translation) { 
    console.log("获取平移 uniform 失败");
    return;
  }
  // 传递值
  gl.uniform4f(u_Translation, Tx, Ty, Tz, 0.0);

  // 清除的背景颜色
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // 清空颜色
  gl.clear(gl.COLOR_BUFFER_BIT);
  //绘制 三角形
  /**
   * 每次执行都会进行 下面 3步
   * 1. 将顶点坐标 传给 a_Position
   * 2. 像a_Position 加上u_Position
   * 3. 结果赋值给gl_Position  得到最终的 位置
   */
  gl.drawArrays(gl.TRIANGLES, 0, n)

}
function initVertexBuffers(gl) { 
  // 创建顶点数据
  let vertices = new Float32Array([
    0, 0.5, -0.5, -0.5, 0.5, -0.5
  ]);
  let n = 3;
  // 创建缓冲区对象
  let vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log("创建缓冲区对象失败");
    return -1;
  }
  // 缓冲区对象 绑定 目标 
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // 开辟内存空间往 缓冲区对象 写数据
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  // 获取attribute 内存地址  用于把缓冲区对象分配给 attribute
  let a_Position = gl.getAttribLocation(gl.program, "a_Position");
  if (a_Position < 0) {
    console.log("获取attribute 失败");
    return -1;
  }
  // 将缓冲区对象 分配给 attribute 变量
  gl.vertexAttribPointer(a_Position,2, gl.FLOAT, false, 0, 0);

  // 开始 attribute 与 缓冲区连接
  gl.enableVertexAttribArray(a_Position);

  return n;
}