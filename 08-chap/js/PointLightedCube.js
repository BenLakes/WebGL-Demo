/**
 * 目标：使用点光源 + 环境光 渲染立方体
 * 点光源：发出的光，在三维空间不同位置上它的方向也不一样,对点光源下的物体进行着色,需要在每个入射计算点
 * 光源光在该处的方向(点光源光的方向随位置变化),点光源光的方向不再是恒定不变的，而要根据每个顶点的位置逐一
 * 计算 光线方向 =  光位置 减去 顶点位置
 * 这种方式是逐顶点处理点光源光照效果时 会出现立方体表面有不自然的线条，这是因为在光栅化的时候
 * 内插过程中导致的，webGL系统会根据顶点的颜色 内插出表面上每个片元的颜色 实际上 光源照射到一个表面上
 *  所产生的效果就是每个片元获得的颜色 与内插出的效果并不完全相同 所以想要达到更合理的效果需使用
 * 逐片元的方式 处理  效果会更加合理
 */
let VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec4 a_Color;
  attribute vec4 a_Normal;
  uniform mat4 u_MvpMatrix;
  /**
   * 模型矩阵 用于计算顶点经过旋转后的位置 
  */
  uniform mat4 u_ModelMatrix;
  // 用来变换法向量的矩阵
  uniform mat4 u_NormalMatrix;
  // 点光源的颜色
  uniform vec3 u_LightColor;
  /**
   * 点光源的位置
  */
  uniform vec3 u_LightPosition;
  uniform vec3 u_AmbientLight;
  varying vec4 v_Color;
  void main() {
    gl_Position = u_MvpMatrix * a_Position;
    vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));
    // 计算顶点的世界坐标 计算点光源光在顶点处的方向
    vec4 vertexPosition = u_ModelMatrix * a_Position;
    // 计算当前顶点的光线 方向  并归一化
    // 顶点处的光线方向由点光源坐标减去顶点坐标而得到 光线方向
    vec3 lightDirection = normalize(u_LightPosition - vec3(vertexPosition.xyz));
    // 计算光线方向与法向量的点积
    float nDotL = max(dot(lightDirection, normal), 0.0);
    // 计算漫反射光的颜色
    vec3 diffuse = u_LightColor * a_Color.rgb * nDotL;
    // 计算环境光的颜色
    vec3 ambient = u_AmbientLight * a_Color.rgb;
    // 最终的颜色
    v_Color = vec4(diffuse + ambient, a_Color.a);
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
  let n = initVertexBuffers(gl);
  if (n < 0) {
    console.log("创建缓冲区对象失败");
    return;
  }
  gl.clearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST);

  let u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  let u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  let u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  let u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
  let u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
  let u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');

  if (!u_ModelMatrix || !u_MvpMatrix || !u_NormalMatrix || !u_LightColor || !u_LightPosition || !u_AmbientLight) {
    console.log("获取uniform存储数据失败");
    return
  }

  // 设置点光源颜色
  gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
  // 设置点光源位置
  gl.uniform3f(u_LightPosition, 2.3, 3.0, 4.0);
  // 设置环境光
  gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);

  // 设置模型矩阵
  let modelMatrix = new Matrix4();
  let mvpMatrix = new Matrix4();
  let normalMatrix = new Matrix4();
  modelMatrix.setRotate(90, 0, 1, 0);
  // 传递模型矩阵  用于计算顶点经过旋转后的 位置   而后通过这个顶点
  //  计算出 点光源与该旋转后点的差值 表示光线方向
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  mvpMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100);
  mvpMatrix.lookAt(6, 6, 14, 0, 0, 0, 0, 1, 0);
  mvpMatrix.multiply(modelMatrix);
  // 传递
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

  //计算 模型矩阵的 逆转置矩阵 并传递
  normalMatrix.setInverseOf(modelMatrix).transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
  
}
function initVertexBuffers(gl) { 
  var vertices = new Float32Array([
    2.0, 2.0, 2.0,  -2.0, 2.0, 2.0,  -2.0,-2.0, 2.0,   2.0,-2.0, 2.0, // v0-v1-v2-v3 front
    2.0, 2.0, 2.0,   2.0,-2.0, 2.0,   2.0,-2.0,-2.0,   2.0, 2.0,-2.0, // v0-v3-v4-v5 right
    2.0, 2.0, 2.0,   2.0, 2.0,-2.0,  -2.0, 2.0,-2.0,  -2.0, 2.0, 2.0, // v0-v5-v6-v1 up
   -2.0, 2.0, 2.0,  -2.0, 2.0,-2.0,  -2.0,-2.0,-2.0,  -2.0,-2.0, 2.0, // v1-v6-v7-v2 left
   -2.0,-2.0,-2.0,   2.0,-2.0,-2.0,   2.0,-2.0, 2.0,  -2.0,-2.0, 2.0, // v7-v4-v3-v2 down
    2.0,-2.0,-2.0,  -2.0,-2.0,-2.0,  -2.0, 2.0,-2.0,   2.0, 2.0,-2.0  // v4-v7-v6-v5 back
 ]);

 // Colors
 var colors = new Float32Array([
   1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v1-v2-v3 front
   1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v3-v4-v5 right
   1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v5-v6-v1 up
   1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v1-v6-v7-v2 left
   1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v7-v4-v3-v2 down
   1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0　    // v4-v7-v6-v5 back
]);

 // Normal
 var normals = new Float32Array([
   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
 ]);

 // Indices of the vertices
 var indices = new Uint8Array([
    0, 1, 2,   0, 2, 3,    // front
    4, 5, 6,   4, 6, 7,    // right
    8, 9,10,   8,10,11,    // up
   12,13,14,  12,14,15,    // left
   16,17,18,  16,18,19,    // down
   20,21,22,  20,22,23     // back
 ]);
   // Write the vertex property to buffers (coordinates, colors and normals)
   if (!initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)) return -1;
   if (!initArrayBuffer(gl, 'a_Color', colors, 3, gl.FLOAT)) return -1;
   if (!initArrayBuffer(gl, 'a_Normal', normals, 3, gl.FLOAT)) return -1;
 
   // Unbind the buffer object
   gl.bindBuffer(gl.ARRAY_BUFFER, null);
 
   // Write the indices to the buffer object
   var indexBuffer = gl.createBuffer();
   if (!indexBuffer) {
     console.log('Failed to create the buffer object');
     return false;
   }
   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
   gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
 
   return indices.length;
}
function initArrayBuffer(gl,attribute, data, num, type) { 
  let buffer = gl.createBuffer();
  if (!buffer) {
    console.log("创建buffer失败");
    return false;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  let a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log("获取属性存储值失败");
    return false;
  }
  // 分配数据
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  gl.enableVertexAttribArray(a_attribute);
  return true;
}