/**
 * 目标：实现三角形 旋转动画
 */
let VSHARDER_SOURCE = `
  attribute vec4 a_Position;
  // 旋转矩阵
  uniform mat4 u_ModelMatrix;
  void main() {
    gl_Position = u_ModelMatrix * a_Position;
  }
`;

let FSHARDER_SOURCE = `
   void main() {
     gl_FragColor = vec4(1.0, 0, 0, 1.0);
   }
`;

// 定义每次旋转的角度
let ANGLE_STEP = 45;
// 主入口函数
function main() { 
  let canvas = document.getElementById('myCanvas');
  let gl = getWebGLContext(canvas);
  if (!gl) { 
    console.log("webGL上下文获取异常");
    return;
  }
  // 初始化shader
  if (!initShaders(gl, VSHARDER_SOURCE, FSHARDER_SOURCE)) {
    console.log("初始化shader异常");
    return;
  }
  // 初始化顶点坐标 与 缓冲区
  let n = initVertexBuffers(gl);

  if (n < 0) {
    console.log("初始化顶点数据异常");
    return;
  }

  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // 获取 uniform 矩阵 只需要获取一次  变量存储的地址不会改变
  let u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log("获取Uniform 数据失败");
    return;
  }
  // 记录当前旋转的角度
  let currentAngle = 0;
  // 创建 Matrix4 对象 在绘制函数 外部调用  避免多次创建  只需重新set即可
  let modelMatrix = new Matrix4();

  // 启动绘制 功能  清除 和 绘制
  let tick = function () {
    // animate 方法 计算出  更新角度
    currentAngle = animate(currentAngle)
    // 画图 1. 上下文 2. 当前角度 3.矩阵库对象 4.u_ModelMatrix uniform 矩阵对象
    draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix)
    /**
     * setInterval() 函数 不管标签页是否 被激活 都会反复调用回调函数 影响性能
     * requestAnimationFrame 则避免了这以问题 缺点 无法指定 时间间隔
     * 由浏览器自行决定调用 
     * 
     * 
     */
    requestAnimationFrame(tick)
  }
  tick();
}
// 画图 
function draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix) {
  // 设置rotate 矩阵
  modelMatrix.setRotate(currentAngle, 0, 0, 1)
  // 增加平移的控制
  modelMatrix.translate(0.35, 0, 0);
  // 传值 给 uniform 矩阵
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements)

  // 清除 clear
  gl.clear(gl.COLOR_BUFFER_BIT)

  // 绘制 图形
  gl.drawArrays(gl.TRIANGLES, 0, n)
}
// 初始化顶点 和 缓冲区对象
function initVertexBuffers(gl) { 
  let vertices = new Float32Array([
    0.0, 0.5, -0.5, -0.5, 0.5, -0.5
  ]);
  let n = 3;
  let vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log("创建缓冲区对象异常");
    return -1;
  }
  // 绑定缓冲区对象到 目标
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // 缓冲区绑定数据
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  //获取 attribute 对象 地址
  let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log("获取属性地址异常");
    return -1;
  }
  // 分配缓冲区对象 给 attribute
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  // 开启
  gl.enableVertexAttribArray(a_Position);
  return n;
}
// 传入当前的角度   返回最新的角度
// 获取当前的时间
let g_last = Date.now();
// 更新旋转角度  根据时间戳 插值 进行优化每秒递增 ANGLE_STEP 角度
function animate(angle) { 
  // 当前执行的 时间
  let now = Date.now();
  // 执行时间差值
  let elapsed = now - g_last;
  // g_last 等于 now
  g_last = now;
  // 计算出 每次屏幕刷新 角度增加的值
  let newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  // 当角度 超过 360 的时候 取余 0 返回
  return newAngle %= 360;
}

// 旋转角度的 增加  缩小 
function down() { 
  ANGLE_STEP -= 10;
}
function up() { 
  ANGLE_STEP += 10
}