/**
 * 目标：通过多个缓冲区对象 传递不同值到 顶点着色器
 */
// 顶点着色器
let VSHARDER_SOURCE = `
  // 接收到的值
  attribute vec4 a_Position;
  attribute float a_PointSize;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = a_PointSize;
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
  let canvas = document.getElementById('myCanvas');
  let gl = getWebGLContext(canvas);
  if (!gl) { 
    console.log("获取WebGL上下文失败");
    return;
  }
  // 初始化着色器
  if (!initShaders(gl, VSHARDER_SOURCE, FSHARDER_SOURCE)) {
    console.log("初始化着色器程序失败");
    return;
  }
  // 初始化缓冲区对象
  let n = initVectexBuffers(gl);
  /**
   * 经过上面的步骤后  指定 drawArrays() 存储在缓冲区对象中的数据会按照存储的顺序 依次传给 对应的 
   * attribute  通过给顶点的每种数据建立 一种缓冲区 然后分配给对应的attribute 变量
   * 就可以像顶点着色器传递多份逐顶点的数据信息
   */
  if (n < 0) {
    console.log("初始化缓冲区对象失败");
    return;
  }
  gl.clearColor(0.0,0.0,0.0,1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  // 画点
  gl.drawArrays(gl.POINTS, 0, n);
}
/**
 * 希望多个顶点相关数据通过缓冲区传入顶点着色器  只需每种重复定义即可 但是
 * 缺点是耗费内存 和 不好维护 比较适合数据量不大的情况
 * 对于大数据的情况下 一般的做法是 将 数据打包到一个 缓冲区对象中 并在 分配数据的时候 使用步进或偏移参数的方式 
 * 获取不同位置的数据  交错组织 的方式 
 * 使用两个缓冲区对象 给顶点着色器传递 数据
 *
 */
function initVectexBuffers(gl) {
  // 创建顶点数据
  let vertices = new Float32Array([0.0, 0.5, -0.5, -0.5, 0.5, -0.5])
  // 顶点大小数据 尺寸大小的数组
  let sizes = new Float32Array([
    20.0, 30.0, 40.0
  ]);
  let n = 3;

  // 创建顶点缓冲区
  let vertexBuffer = gl.createBuffer();
  // 创建顶点大小 缓冲区
  let sizeBuffer = gl.createBuffer();
  // 当两个缓冲区创建失败的时候
  if (!vertexBuffer || !sizeBuffer) {
    console.log("创建缓冲区对象失败");
    return -1;
  }
  // 给缓冲区 指定目标 target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // 给缓冲区 填充数据
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  // 获取顶点 的 attribute a_Position 的 内存地址
  let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) { 
    console.log("获取a_Position 失败");
    return -1;
  }
  // 给a_Position分配数据
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  // 开启链接
  gl.enableVertexAttribArray(a_Position);

  // 绑定 点位大小的数据
  gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
  // 缓冲区写入数据
  gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.STATIC_DRAW);
  // 获取 a_PointSize attribute
  let a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
  if (a_PointSize < 0) { 
    console.log("获取a_PointSize存储地址异常");
    return -1;
  }
  // a_PointSize 分配数据
  gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, 0, 0);
  // 开启数据
  gl.enableVertexAttribArray(a_PointSize);

  // 解除缓冲区对象的绑定
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return n
}
