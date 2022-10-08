/**
 * 目标：平行光的使用方式 光照使场景更具有层次感,使得场景更加逼真
 * 光照原理： 现实世界的物体被光线照射时，会反射一部分光。只有当反射光线进入人的眼睛的时候
 * 才能够看到物体并辨认出它的颜色。物体照射的表面 由于角度 和 粗糙层度的不同 会是物体有明暗差异
 * 正式明暗差异给了物体立体感
 * “着色”的含义 根据光照条件重建 物体各表面明暗不一的效果的过程
 * 光源类型： 平行光(类似太阳光)、 点光源(类似电灯)、环境光(用来模拟真实世界中的非直射光
 * 也就是由光源发出后经过墙壁或其他物体折射或说反射的光)、聚光灯(类似电筒、车前灯等)
 * 1. 平行光：光线是相互平行的 平行光具有方向 (用一个方向和一个颜色来定义)
 * 2.点光源： 从一个点向四周的所有方向发出的光 (需要指定点光源的位置和颜色) 光线的方向
 * 将根据点光源的位置和被照射之处的位置计算出来 因为点光源的光线方向在场景内的不同位置是不同的
 * 3. 环境光（只需要指定颜色即可）： 一种间接光 指那些经光源(点光源、平行光、聚光灯等)发出后，在被墙壁等其他物体多次反射
 * 然后照射到物体表面上的光,环境光从各个角度照射物体 其强度都是一致的
 * 反射类型： 漫反射 和 环境反射
 *   1. 漫反射：是针对平行光或点光源而言的。漫反射的反射光在各个方向上是均匀的(前提是
 * 物体表面不是光滑的)，当物体表面想镜子一样光滑 那么光线就会以特定的角度反射出去。但
 * 现实中的大部分材质 如纸张 岩石 塑料等 表面都是粗糙的 所以都可以理解为均匀的
 *   漫反射中  反射光的颜色 取决于入射光的颜色、表面的基底色以及入射光与表面法线形成的入射角
 * (入射角定义为入射光与表面的法线形成的夹角)
 *   公式为: 漫反射光颜色 = 入射光颜色 * 表面基地色 * cosO（入射光与表面法线夹角）
 *  2.环境光反射：针对环境光而言，环境光中 反射光的方向可以认为就是入射光的反方向
 * 由于环境光照射物体的方式是各方均匀、强度相等的 所以反射光也是个方向均匀的
 *  公式：环境反射光颜色 = 入射光颜色 * 表面基地色
 * 当场景中漫反射和环境反射同时存在到 时候 将两者相加即可得到物体最终被观察到的颜色
 * 公式： 表面的反射颜色 = 漫反射光颜色 + 环境反射光颜色
 * 平行光下的漫反射： 平行光的方向是唯一的，对于同一平面上的所有点，入射叫是相同的，
 * 法线是一样的
 *  
 * 根据光线和表面的方向计算入射角
 *  可以通过计算入射光线方向 和 物体表面朝向即法线方向 两个向量的点积 来计算两个向量的夹角
 *  余弦值 cosO  GLSL ES 中点积使用dot() 函数计算两个向量的点积运算函数
 *  数学上 对矢量 n 和 l 做点积运算  公式 n . l = |n| * |l| * cosO 
 *  其中符号||表示获取向量的长度 公式为 x平方 + y平方 + z平方 开根号 则为向量长度
 *  cosO = <光线方向> . <法线方向>
 *  改写漫反射光颜色 = 入射光颜色 * 表面基地色 * (<光线方向>.<法线方向>)
 *  光线方向矢量和表面法线矢量长度必须为1,否则反射光的颜色就会过暗或过亮。将向量
 *  长度调整为1,同时保持方向不变的过程称为归一化(注：对向量n归一化后的结果是 各分量除以 向量长度 nx / m,ny/m, nz/m m为向量长度)
 *  GLSL ES 提供了内置归一化函数
 *   光线方向 实际上是入射方向的反方向 该方向与法线方向的夹角才是入射角
 * 法线 表面的朝向：即垂直于表面的方向 又称为法线 或 法向量
 *   向量(nx,ny,nz)表示从原点(0,0,0)指向点(nx,ny,nz)的方向  向量(0,0,1)表示x轴正方向
 *  一个表面有两个法向量  一个正面 一个反面 各自具有一个法向量 如 x正 (0,0,1) 反(0,0,-1)
 * 平面的法向量唯一： 一个平面只有一个法向量，换句话说 平面任意一点都具有相同的法向量
 * 即使两个不同平面 只要朝向相同 即两个平行的面 法向量也都一样
 */
let VSHADER_SOURCE = `
  attribute vec4 a_Position;
  /**
   * a_Color 表示基底色 
  */
  attribute vec4 a_Color;
  /**
   * 逐顶点对应的法向量 
   * 表示法向量方向
  */
  attribute vec4 a_Normal;
  //模型投影视图矩阵
  uniform mat4 u_MvpMatrix;
  // 入射光线颜色
  uniform vec3 u_LightColor;
  // 光线的方向  用于与 法线 计算 入射光线角度 用于 计算发射的颜色
  uniform vec3 u_LightDirection;
  varying vec4 v_Color;
  void main() {
    gl_Position = u_MvpMatrix * a_Position;
    //对法向量 进行归一化
    vec3 normal = normalize(a_Normal.xyz);
    /**
     * 光的方向与物体表面方向(法向量)的 点积 
     * dot() GLSL ES计算点积的函数 参数为光线方向  和 顶点法向量值
     * max()函数计算的是 当点积 的值 大于90度的时候  cosO值为小于0 没有意义 赋予0.0
     * 点击小于0意味着cosO O角度大于90 入射角与法线的夹角大于90说明照射在物体的背面了
     * 没有可见意义
     * 立方体的同一个面的颜色是一致的因为 因为每个面的法向量是一样的 
     * */ 
    float nDotL = max(dot(u_LightDirection, normal), 0.0);
    /**
     * 计算由漫反射引起的颜色
     * 公式：<入射光颜色> * 顶点颜色 * 入射角
    */
    vec3 diffuse = u_LightColor * a_Color.rgb * nDotL;
    v_Color = vec4(diffuse, a_Color.a);
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
    console.log("获取webGL绘图环境失败");
    return;
  }
  // 初始化着色器
  if (!initShaders(gl,VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("初始化着色器程序失败");
    return;
  }
  // 初始化顶点缓冲区  颜色 法向量
  let n = initVertexBuffer(gl);
  if (n<0) {
    console.log("初始化缓冲区对象失败");
    return
  }

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // 深度测试  隐藏面消除
  gl.enable(gl.DEPTH_TEST);
  // 获取属性
  let u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  let u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
  let u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');

  if (!u_MvpMatrix || !u_LightColor || !u_LightDirection) {
    console.log("获取属性值失败");
    return;
  }
  // 设置照射光线值 照射的颜色 为 白色
  gl.uniform3f(u_LightColor, 1.0,1.0,1.0)
  // 设置灯照射的方向 
  let lightDirection = new Vector3([0.5, 3.0, 4.0]);
  // 归一化  与法向量都需要 归一化
  lightDirection.normalize();
  gl.uniform3fv(u_LightDirection, lightDirection.elements);

  // 视图投影坐标
  let mvpMatrix = new Matrix4();
  mvpMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100);
  mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // drawElements 绘制
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

  let vertices = new Float32Array([
    // 前面 V0-V1-V2-V3
    1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0,
    // 右面 V0-V3-V4-V5
    1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0,
    // 上面V0-V5-V6-V1
    1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0,
    // 左面 V1-V6-V7-V2
    -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0,
    // 下面 V7-V4-V3-V2
    -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
    // 后面 V4-V7-V6-V5
    1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0
  ]);

  // 每个面使用顶点的颜色
  let colors = new Float32Array([
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v1-v2-v3 front
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v3-v4-v5 right
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v5-v6-v1 up
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v1-v6-v7-v2 left
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v7-v4-v3-v2 down
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0　    // v4-v7-v6-v5 back
  ])

  // 法向量数据
  /**
   * 类似上面颜色 是逐顶点数据 存储在缓冲区中，并传给着色器。对法向量数据也可以这样做
   * 每个顶点有3个法向量 因为一个点被3个面所使用
   */
  let normals = new Float32Array([
    0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
    1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
    -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
    0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 
    0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,
  ])

  // 索引坐标值
  let indices = new Uint8Array([
    0, 1, 2, 0, 2, 3,
    4, 5, 6, 4, 6, 7,
    8, 9, 10, 8, 10, 11,
    12, 13, 14, 12, 14, 15,
    16, 17, 18, 16, 18, 19,
    20, 21, 22, 20, 22, 23
  ]);

  // 顶点缓冲区
  if (!initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)) {
    return -1;
  }
  // 颜色缓冲区
  if (!initArrayBuffer(gl, 'a_Color', colors, 3, gl.FLOAT)) {
    return -1;
  }
  // 法向量缓冲区
  if (!initArrayBuffer(gl, 'a_Normal', normals, 3, gl.FLOAT)) {
    return -1;
  }
  // 创建索引缓冲区对象
  let indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log("初始化索引缓冲区对象");
    return -1
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length;

}
function initArrayBuffer(gl, attribute, data, num, type) { 
  // 创建缓冲区对象
  let buffer = gl.createBuffer();
  if (!buffer) {
    console.log("初始化缓冲区对象失败");
    return false;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  // 获取对应的 attribute属性赋值
  let a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log("获取属性值失败");
    return false;
  }
  
  // 链接数据
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // 开启链接
  gl.enableVertexAttribArray(a_attribute);
  // 清空缓冲区对象
  return true;
}