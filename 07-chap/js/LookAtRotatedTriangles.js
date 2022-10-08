/**
 * 目标：使用 视图矩阵 *  模型矩阵 * 顶点坐标 达到 控制观察者状态 * 模型变换  * 顶点坐标 达到 最终呈现的坐标点
 */
// 顶点着色器
let VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec4 a_Color;
  // 视图矩阵
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ModelMatrix;
  // 模型矩阵
  varying vec4 v_Color;
  void main() {
    gl_Position = u_ViewMatrix * u_ModelMatrix * a_Position;
    v_Color = a_Color;
  }
`;

// 片元着色器
let FSHADER_SOURCE = `
  #ifdef GL_ES
   precision mediump float;
  #endif
  varying vec4 v_Color;
  void main() {
    gl_FragColor = v_Color;
  }
`;

function main() {
  let canvas = document.getElementById("myCanvas")
  let gl = getWebGLContext(canvas)
  if (!gl) {
    console.log("获取webGL上下文失败")
    return
  }
  // 初始化着色器
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("初始化着色器失败")
    return
  }
  let n = initVertexBuffers(gl)
  if (n < 0) {
    console.log("初始化缓冲区对象失败")
    return
  }
  // 指定环境颜色
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  
  // 视图矩阵
  // 模型旋转矩阵
  let u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix")
  let u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix")
  if (!u_ViewMatrix || !u_ModelMatrix) {
    console.log("获取Uniform 变量存储地址失败")
    return
  }

  let rotete = 360
  let viewMatrix = new Matrix4()
  let modelMatrix = new Matrix4()

  setInterval(() => {
    rotete -= 0.6;

    rotete = (rotete % 360) < 1 ? 360 :rotete;

    gl.clear(gl.COLOR_BUFFER_BIT)
 
    modelMatrix.setRotate(rotete, 0, 0)
    //  传递值
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements)
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements)
    // 绘制
    gl.drawArrays(gl.TRIANGLES, 0, n)
  }, 16);

  // 设置矩阵值
  
  viewMatrix.setLookAt(0.09,0.18,0.3,0.0,0.0,0.0,0.0,1.0,0.0);

}
function initVertexBuffers(gl) {
  let verticesColors = new Float32Array([
    //最后面  绿色
    0.0, 0.5, -0.4, 0.4, 1.0, 0.4, -0.5, -0.5, -0.4, 0.4, 1.0, 0.4, 0.5, -0.5,
    -0.4, 1.0, 0.4, 0.4,
    // 中间  黄色
    0.5, 0.4, -0.2, 1.0, 0.4, 0.4, -0.5, 0.4, -0.2, 1.0, 1.0, 0.4, 0.0, -0.6,
    -0.2, 1.0, 1.0, 0.4,
    // 最前面 蓝色
    0.0, 0.5, 0, 0.4, 0.4, 1.0, -0.5, -0.5, 0, 0.4, 0.4, 1.0, 0.5, -0.5, 0, 1.0,
    0.4, 0.4,
  ])
  let n = 9
  //  创建顶点缓冲区
  let vertexColorBuffer = gl.createBuffer()
  if (!vertexColorBuffer) {
    console.log("创建缓冲区对象失败")
    return -1
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW)
  let FSIZE = verticesColors.BYTES_PER_ELEMENT
  let a_Position = gl.getAttribLocation(gl.program, "a_Position")
  let a_Color = gl.getAttribLocation(gl.program, "a_Color")
  if (a_Position < 0 || a_Color < 0) {
    console.log("获取对应的attribute 属性失败")
    return -1
  }
  // 注入数据
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0)
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3)
  // 开启链接
  gl.enableVertexAttribArray(a_Position)
  gl.enableVertexAttribArray(a_Color)
  return n
}