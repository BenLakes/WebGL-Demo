/**
 * 目标：利用矩阵库的 旋转函数 简化旋转几何体方法
 */
// 顶点着色器
let VSHARDER_SOURCE = `
 attribute vec4 a_Position;
 // 4 * 4 的旋转矩阵 由矩阵库 自动生成
 uniform mat4 u_xformMatrix;
  void main() {
    gl_Position = u_xformMatrix * a_Position;
  }
`

// 片元着色器
let FSHARDER_SOURCE = `
  void main() {
    gl_FragColor = vec4(1.0,1.0,0.0,1.0);
  }
`;

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
  /**
   *  Matrix4 对象所支持的 方法和属性
   *  setIdentity() 创建 4 * 4 的单位矩阵  对角线上元素 为 1  其余都是 0 将一个矩阵乘以单位矩阵 都是原矩阵
   *  setTranslate(x,y,z) 将Matrix4实例对象设置为平移变换矩阵, x 轴平移距离x  y / z 类似
   *  setRotate(angle, x, y, z) 将Matrix4实例对象设置为旋转矩阵, 旋转角度  绕旋转的轴 无须归一化(矩阵内部已处理)
   *  setScale(x, y, z) 将Matrix4实例设置为缩放变换矩阵 参数分别是 三个轴上的缩放分子
   *  translate(x,y,z) 将Matrix4 实例 乘以一个平移变换的矩阵 得到的结果还是存放在实例中
   *  rotate(angle, x, y, z) 将Matrix4 实例乘以 一个旋转变换矩阵 得到的结果还是存放在实例中
   *  scale(x, y, z) 将Matrix4 实例 乘以一个缩放变换矩阵 得到的结果还是存放在实例中
   *  set(m) 将Matrix4 设置为m, m必须也是一个Matrix4实例
   *  elements 类型化数组(Float32Array) 包含矩阵 的 按列主序的格式 排列
   */
  let xformMatrix = new Matrix4()
  let ANGLE = 90
  // setRotate 表示使用矩阵库创建旋转矩阵 1、旋转角度  后面的表示旋转的轴
  // 把 xformMatrix 设置为旋转矩阵    把自身设置为 旋转矩阵的内容  4 * 4 矩阵
  /**
   * 接收的参数是 角度制  内部会换算 成 弧度
   * 后面三个参数表示 绕轴旋转
   * 1. x轴
   * 2. y轴
   * 3 表示 绕 Z轴旋转
   */
    xformMatrix.setRotate(ANGLE, 0, 0, 1)
  // xformMatrix.translate(-0.5, 0.5, 0)

  // 获取顶点着色器的旋转矩阵 变量  进行赋值
  let u_xformMatrix = gl.getUniformLocation(gl.program, "u_xformMatrix")
  if (!u_xformMatrix) {
    console.log("获取Uniform 失败")
    return
  }
  // 赋值
  gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix.elements)
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)
  // 绘制三角形
  gl.drawArrays(gl.TRIANGLES, 0, n)
}
function initVertexBuffers(gl) { 
  let vertices = new Float32Array([
    0.0, 0.5,
    -0.5, -0.5,
    0.5, -0.5
  ])
  let n = 3;
  // 创建缓冲区对象
  let vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log("创建缓冲区对象失败");
    return -1;
  }
  //缓冲区对象绑定 目标类型
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  //缓冲区写入顶点数据
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  // 获取a_Position attribute
  let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log("获取a_Position 地址异常");
    reutrn - 1;
  }
  // 分配 缓冲区数据 给 attribute
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  // 启用
  gl.enableVertexAttribArray(a_Position);
  return n;
}