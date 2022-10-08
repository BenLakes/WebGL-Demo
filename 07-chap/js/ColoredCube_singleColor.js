/**
 * 目标：使用gl.drawElements() 绘制立方体  每个顶点 定义为白色  失去了立体感
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
 let canvas = document.getElementById("myCanvas");
 let gl = getWebGLContext(canvas);
 if (!gl) {
   console.log("初始化WebGL绘图上下文失败");
   return
 }
 if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
   console.log("初始化着色器失败");
   return
 }
 let n = initVertexBuffer(gl);
 if (n < 0) {
   console.log("初始化缓冲区对象失败");
   return;
 }
 gl.clearColor(0, 0, 0, 1);
 gl.enable(gl.DEPTH_TEST);
 let u_mvpMatrix = gl.getUniformLocation(gl.program, 'u_mvpMatrix');
 if (!u_mvpMatrix) {
   console.log("获取uniform值失败");
   return;
 }
 // 传递值
 let mvpMatrix = new Matrix4();
 mvpMatrix.setPerspective(30, 1, 1, 100).lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
 gl.uniformMatrix4fv(u_mvpMatrix, false, mvpMatrix.elements);

 gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
 // 绘制
 gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

}
function initVertexBuffer(gl) { 
   // Create a cube
 //    v6----- v5
 //   /|      /|
 //  v1------v0|
 //  | |     | |
 //  | |v7---|-|v4
 //  |/      |/
 //  v2------v3
 // 描述出每个面的所有   点 可以指定每个面的顶点都一样的颜色 致使每个面的颜色一样
 let vertices = new Float32Array([
   1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0, -1.0, 1.0,  1.0, -1.0, 1.0,  // 0 - 1 - 2 - 3 前面
   1.0, 1.0, 1.0,  1.0, -1.0, 1.0,  1.0, -1.0, -1.0,   1.0, 1.0, -1.0, // 0 - 3 - 4 - 5 右侧
   1.0, 1.0, 1.0,  1.0, 1.0, -1.0,  -1.0, 1.0, -1.0,  -1.0,1.0, 1.0,//0-5-6-1 上侧
   -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0,//1-6-7-2 左侧
   -1.0,-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,//7-4-3-2 下侧
   1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0//4-7-6-5 后侧
 ]);

 /**
  * 颜色 数组属性
  * 
  *  */ 
 let colors = new Float32Array([
  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v0-v1-v2-v3 front(white)
  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v0-v3-v4-v5 right(white)
  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v0-v5-v6-v1 up(white)
  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v1-v6-v7-v2 left(white)
  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v7-v4-v3-v2 down(white)
  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0
 ]);

 let indices = new Uint8Array([
   0, 1, 2, 0, 2, 3,
   4, 5, 6, 4, 6, 7,
   8, 9, 10, 8, 10, 11,
   12, 13, 14, 12, 14, 15,
   16, 17, 18, 16, 18, 19,
   20, 21, 22, 20, 22, 23
 ]);
 // 索引缓冲区使用对象
 let indexBuffer = gl.createBuffer();
 if (!indexBuffer) {
   console.log("初始化缓冲区对象失败");
   return -1;
 }
 // 初始化顶点缓冲区
 if (!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position')) {
   return -1;
 }
 // 初始化颜色缓冲区
 if (!initArrayBuffer(gl, colors, 3, gl.FLOAT, 'a_Color')) {
   return -1;
 }
 // 设置索引缓冲区对象
 gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
 gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
 return indices.length;
}
function initArrayBuffer(gl, data, num, type, attribute) { 
 let buffer = gl.createBuffer();
 if (!buffer) {
   console.log("初始化缓冲区对象失败");
   return false;
 }
 gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
 gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
 //获取属性
 let a_attribute = gl.getAttribLocation(gl.program, attribute);
 if (a_attribute < 0) {
   console.log("获取属性值失败");
   return false;
 }
 // 分配数据
 gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
 // 开启链接
 gl.enableVertexAttribArray(a_attribute);
 return true;
}