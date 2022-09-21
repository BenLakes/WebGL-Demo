// 目标：计算公式 方式计算旋转

//顶点着色器
let VSHARDER_SOURCE = `
  // 顶点坐标
  attribute vec4 a_Position;
  // 通用的 转换后的弧度数
  uniform float u_CosB, u_SinB;
  void main() {
    gl_Position.x = a_Position.x * u_CosB - a_Position.y * u_SinB;
    gl_Position.y = a_Position.x * u_SinB + a_Position.y * u_CosB;
    gl_Position.z = a_Position.z;
    gl_Position.w = 1.0;
  }
`;
// 片元着色器
let FSHARDER_SOURCE = `
  void main(){
    gl_FragColor = vec4(1.0,0.0,0.0,1.0);
  }
`;

function main() {

  let canvas = document.getElementById('myCanvas');
  let gl = getWebGLContext(canvas);
  if (!gl) { 
    console.log("获取webGL 上下文失败");
    return;
  }
  //初始化shader
  if (!initShaders(gl, VSHARDER_SOURCE, FSHARDER_SOURCE)) {
    console.log("初始化着色器失败");
    return;
  }
  // 创建顶点数据 和 缓冲区对象
  let n = initVertexBuffers(gl);
  if (n < 0) {
    console.log("创建顶点数据失败");
    return;
  }
  // 指定旋转角度
  let ANGLE = 90;

  // 计算旋转数据
  // 角度换算成弧度
  let radian = ANGLE * Math.PI / 180.0;
  let cosB = Math.cos(radian);
  let sinB = Math.sin(radian);

  // 获取 uniform u_CosB, u_SinB;
  let u_CosB = gl.getUniformLocation(gl.program, 'u_CosB');
  let u_SinB = gl.getUniformLocation(gl.program, 'u_SinB');

  if (!u_CosB || !u_SinB) {
    console.log("获取 u_CosB 或 u_SinB 失败");
    return;
  }
  //传值
  gl.uniform1f(u_CosB, cosB);
  gl.uniform1f(u_SinB, sinB);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  gl.clear(gl.COLOR_BUFFER_BIT);

  // 绘制三角形
  gl.drawArrays(gl.TRIANGLES, 0, n);


}
function initVertexBuffers(gl) { 
  // 初始化点位数据
  let vertices = new Float32Array([
    0.0, 0.5, -0.5, -0.5, 0.5, -0.5
  ]);
  let n = 3;
  // 创建缓冲区对象
  let vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log("创建缓冲区对象失败");
    return -1;
  }
  // 缓冲区对象 指定 目标
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // 开辟空间  往缓冲区 写入数据
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  // 获取 a_Position attribute  存储地址
  let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) { 
    console.log("获取attribute失败");
    return -1;
  }
  // 给 a_Position 分配数据
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  // 开启 连接
  gl.enableVertexAttribArray(a_Position);
  return n;
}