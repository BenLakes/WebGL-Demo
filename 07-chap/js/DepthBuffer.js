/**
 * 目标：隐藏面消除
 *   WebGL在默认情况下会按照缓冲区中的顺序绘制图形,而且后绘制的会覆盖先绘制的图形 因为这样很高效
 *   为了解决上述问题 webGL提供隐藏面消除的功能，会帮助我们消除那些被遮挡的表面(隐藏面)，可以随意的
 *   定义各物体缓冲区的顺序 远处的物体会自动被近处物体挡住不会被绘制出来 该功能只需开启即可
 *   gl.enable(gl.DEPTH_TEST);  
 *   //开启 深度缓冲区  enable 可开启webGL的多种功能  gl.DEPTH_TEST(隐藏面消除)、gl.BLEND (混合)、
 *    gl.POLYGON_OFFSETFILL 多边形位移 当物体表面值很接近的时候 需要处理
 *    DEPTH_TEST 所谓深度测试 实际命名是因为该机制通过检测物体(每个像素)的深度来决定是否将其画出来
 *    要将隐藏面消除  需要知道几何图形的深度信息， 而深度缓冲区就是用来存储深度信息的
 *   使用 gl.clear() 方法清除深度缓冲区 在绘制任意一帧之前，都必须清除深度缓冲区，以消除绘制上一帧时在其中留下的痕迹
 *   gl.clear(gl.DEPTH_BUFFER_BIT)  多个清除用 | 号连接 gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)
 *   gl.clear(gl.DEPTH_BUFFER_BIT) //清除深度缓冲区
 *   隐藏面的消除的前提是正确设置可视空间，否则可能会产生错误的结果 不管是正交投影 还是  透视投影 必须选一个
 */
let VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec4 a_Color;
  uniform mat4 u_mvpMatrix;
  varying vec4 v_Color;
  void main() {
    gl_Position = u_mvpMatrix * a_Position;
    v_Color = a_Color;
  }
`;
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
  let canvas = document.getElementById('myCanvas');
  let gl = getWebGLContext(canvas);
  if (!gl) {
    console.log("获取webGL上下文失败");
    return;
  }
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("初始化着色器程序失败");
    return;
  }
  let n = initVertexColorBuffer(gl);
  if (n < 0) {
    console.log("初始化缓冲区对象失败");
    return;
  }
  gl.clearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST);
  let u_mvpMatrix = gl.getUniformLocation(gl.program, 'u_mvpMatrix');
  if (!u_mvpMatrix) {
    console.log("获取uniform属性失败");
    return;
  }
  let projMatrix = new Matrix4();
  let viewMatrix = new Matrix4();
  let modelMatrix = new Matrix4();
  let mvpMatrix = new Matrix4();

  projMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100);
  viewMatrix.setLookAt(0, 0, 5, 0, 0, -100, 0, 1, 0);
  modelMatrix.setTranslate(0.75, 0, 0);
  mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
  gl.uniformMatrix4fv(u_mvpMatrix, false, mvpMatrix.elements);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, n);

  modelMatrix.setTranslate(-0.75, 0, 0);
  mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
  gl.uniformMatrix4fv(u_mvpMatrix, false, mvpMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);

}
function initVertexColorBuffer(gl) { 
  let verticesColors = new Float32Array([
     0.0,  1.0,   0.0,  0.4,  0.4,  1.0,  // 最前面 三角形  blue
    -0.5, -1.0,   0.0,  0.4,  0.4,  1.0,
     0.5, -1.0,   0.0,  1.0,  0.4,  0.4, 

     0.0,  1.0,  -2.0,  1.0,  1.0,  0.4, // 中间三角形 yellow
    -0.5, -1.0,  -2.0,  1.0,  1.0,  0.4,
     0.5, -1.0,  -2.0,  1.0,  0.4,  0.4,

     0.0,  1.0,  -4.0,  0.4,  1.0,  0.4, // 最后面三角形 green
    -0.5, -1.0,  -4.0,  0.4,  1.0,  0.4,
     0.5, -1.0,  -4.0,  1.0,  0.4,  0.4, 
  ]); 
  let n = 9;
  var vertexColorbuffer = gl.createBuffer();  
  if (!vertexColorbuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Write vertex information to buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  var FSIZE = verticesColors.BYTES_PER_ELEMENT;
  // Assign the buffer object to a_Position and enable the assignment
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if(a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(a_Position);
  // Assign the buffer object to a_Color and enable the assignment
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(a_Color);
  return n;
} 



