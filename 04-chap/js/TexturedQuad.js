/**
 * 目标：矩形表面使用贴图
 * 纹理映射：就是将一张图像 映射(贴)到一个几何图形的表面上去
 * 图像称为 纹理图像 或 纹理
 * 纹理映射的作用 就是根据纹理图像 为之前光栅化后的每个片元涂上合适的颜色。组成纹理图像的像素又叫纹素
 * 每个纹素的颜色 都可以用rgb 或 rgba 格式编码
 * 纹理映射4 个步骤：
 *   1. 准备好映射到几何图形的 纹理图像
 *   2. 为几何图形 配置好 纹理映射方式
 *   3. 加载纹理图像 对齐进行设置 以能在webGL中使用它
 *   4. 在片元着色器中将相应的纹素从纹理图像中抽取出来，并赋给片元
 *  
 * 利用顶点坐标来确定 屏幕上 哪部分 被纹理图像覆盖， 利用纹理坐标(UV/ST坐标)来确定 纹理图像的
 * 哪部分 将覆盖到几何图形上
 * 纹理坐标(uv/st坐标)：是纹理图像上的坐标 通过纹理坐标可以在纹理图像上获取纹素的颜色，WebGL系统中的纹理坐标系统是二维的
 * 纹理坐标不管图像多大 都是通用的，因为坐标值与 图像自身尺寸无关
 * 通过纹理图像的纹理坐标与几何图形顶点坐标间映射关系 来确定怎样将纹理图像贴上去
 * 
 */
// 顶点着色器
let VSHARDER_SOURCE = `
// 顶点坐标
  attribute vec4 a_Position;
  /** 
   * 接收顶点的纹理坐标  然后在赋值给 v_TexCoord 传递到 片元
   * 在到达 片元的时候 在光栅化时 会 内插出 其他纹理的坐标值
   * 在片元着色器中 使用的是内插后的纹理坐标
   * */ 
  attribute vec2 a_TexCoord;
  varying vec2 v_TexCoord;
  void main() {
    gl_Position = a_Position;
    v_TexCoord = a_TexCoord;
  }
`
// 片元着色器
let FSHARDER_SOURCE = `
  #ifdef GL_ES
  precision mediump float;
  #endif
  uniform sampler2D u_Sampler;
  varying vec2 v_TexCoord;
  void main() {
    /**
     * texture2D 片元着色器根据内插后的纹理坐标从纹理图像上获取纹素的颜色 
     * texture2D 内置函数用来抽取纹素颜色  1. 纹理单元编号 2.纹理坐标 就可以抽取纹理上的像素
     * 返回值： 格式 由texImage2D() 纹理图像分配给 纹理对象 的 internalformat 参数格式决定
     * gl.RGB 、gl.RGBA 等
    */
    gl_FragColor = texture2D(u_Sampler, v_TexCoord);
  }
`

function main() {
  let canvas = document.getElementById("myCanvas")
  let gl = getWebGLContext(canvas)
  if (!gl) {
    console.log("获取webGL上下文失败")
    return
  }
  // 初始化shader                        
  if (!initShaders(gl, VSHARDER_SOURCE, FSHARDER_SOURCE)) {
    console.log("初始化着色器程序失败")
    return
  }
  let n = initVertexBuffers(gl)
  if (n < 0) {
    console.log("初始化缓冲区对象失败")
    return
  }
  gl.clearColor(0.0, 0.0, 0.0, 1.0)

  // 初始化 纹理 后再绘制
  if (!initTextures(gl, n)) {
    console.log("初始化纹理图片  或  纹理对象失败")
    return
  }
}
function initVertexBuffers(gl) { 
  // 定义顶点坐标  和  纹理 坐标  
  let verticesTexCoords = new Float32Array([
    -0.5, 0.5, 0.0, 1.0,
    -0.5, -0.5, 0.0, 0.0,
    0.5, 0.5, 1.0, 1.0,
    0.5, -0.5, 1.0, 0.0
  ]);
  let n = 4;
  // 初始化缓冲区
  let vertexTexCoordBuffer = gl.createBuffer();
  if (!vertexTexCoordBuffer) {
    console.log("初始化缓冲区失败");
    reutrn - 1;
  }
  // 绑定数据
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
  // 缓冲区写入数据
  gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);
  // 因为 类型数组中缓存了 多种类型的数据  所以需要 分隔 先 获取 每个元素占用的 内存
  let FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;
  // 获取顶点坐标 内存地址 a_Position
  let a_Position = gl.getAttribLocation(gl.program, "a_Position");
  if (a_Position < 0) {
    console.log("获取属性数据失败");
    return -1;
  }
  // 分配数据
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
  // 链接数据
  gl.enableVertexAttribArray(a_Position);
  // 传递 纹理坐标 a_TexCoord
  let a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
  if (a_TexCoord < 0) {
    console.log("获取纹理坐标地址失败");
    return -1;
  }
  // 分配数据
  gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
  // 开启链接
  gl.enableVertexAttribArray(a_TexCoord);
  return n;
}
/**
 * initTextures 负责配置 和 加载纹理  
 */
function initTextures(gl, n) { 
  // 创建纹理对象 纹理对象 用来管理 webGL系统中的纹理
  let texture = gl.createTexture();
  if (!texture) {
    console.log("创建纹理对象失败");
    return false;
  }
  // 获取取样器 uniform 地址 获取取样器的 存储位置 用于接收纹理图像单元
  let u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
  if (!u_Sampler) {
    console.log("获取取样器内存位置异常");
    return false;
  }

  // 创建图片对象
  let image = new Image();
  if (!image) {
    console.log("创建图片对象失败");
    return false;
  }
  image.onload = function () { 
    loadTexture(gl, n, texture, u_Sampler, image);
  }
  // 指定图片的位置
  image.src = '../../resources/sky.jpg'
  return true;
}
// 当图片加载完成时候 加载纹理  处理纹理
function loadTexture(gl, n, texture, u_Sampler, image) {
  // 表示 纹理图片 Y轴反转 应为 图片的坐标 与 纹理坐标体系 y轴 相反所以y轴反转后
  // 可以对应上坐标才可以正确对应上(不执行下面代码  就要手动 反转y轴纹理坐标了)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 2)
  // 激活纹理单元
  /**
   * gl.TEXTURE0 - gl.TEXTURE7 管理纹理图像的8个纹理单元 每个都与 gl.TEXTURE_2D相关联
   * 而 gl.TEXTURE_2D 为绑定 纹理时的 纹理目标
   * webGL 通过一种称作 纹理单元 的机制 可同时使用多个纹理，每个纹理单元都有一个编号来管理纹理图像,
   * 在给片元着色器取样器赋值的时候 就是使用这个纹理单元编号
   * 即使程序只需使用一张纹理图像，也得为其指定一个纹理单元  并激活
   * webGL至少支持8个纹理单元
   *
   */
  gl.activeTexture(gl.TEXTURE0)
  /**
   * 绑定纹理目标 gl.TEXTURE_2D / gl.TEXTURE_CUBE_MAP 立方体纹理
   * 将纹理对象绑定到 目标上
   * 改方法 开启纹理对象 以及将纹理对象绑定到纹理单元上
   * 在webGL中 没法直接操作纹理对象 必须通过将纹理对象绑定到纹理单元上，并通过纹理单元操作纹理对象
   *  */
  gl.bindTexture(gl.TEXTURE_2D, texture)
  /**
   * 设置纹理对象 对 纹理图像的显示 方式 设置 方式  和  参数值
   * texParameteri 配置纹理对象参数 如何显示纹理图像  包括 纹理参数  和 纹理参数值
   * 如： 如何根据纹理坐标获取纹素颜色  按哪种方式重复填充纹理等的配置
   * 参数： 1. 放大 gl.TEXTURE_MAG_FILTER 当纹理的绘制范围 比 纹理本身更大时，如何获取纹素颜色
   *  wenGL需要填充由于放大 而造成的像素间的间隙, 该参数表示填充这些间隙的具体方法
   * 2. 缩小 gl.TEXTURE_MIN_FILTER
   * 3. 水平填充方法 gl.TEXTURE_WRAP_S
   * 4.垂直填充方法  gl.TEXTURE_WRAP_T
   *
   * 每个纹理参数都有一个默认值 在满足的情况下 不需要调用texParameteri 方法设置 而使用默认值
   *
   * 纹理放大 缩小 方法的参数值 将决定 WebGL 系统将以何种方式内插出片元 
   * 
   *
   *  */
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  /**
   * 设置 纹理图像  将纹理图像分配给纹理对象 并允许设置一些图像的一些特性 如 纹理数据类型等
   * 1. 目标 2. 为金字塔纹理准备  3. 图像的内部格式(gl.RGB / gl.RGBA等) 4. 纹理数据格式 与 3 参数相同
   * 5. 纹理数据类型  6. 图片对象(此时Image对象的图像就从JS传入WebGL系统中),并存储在纹理对象中 将图像分配给纹理
   *  */

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image)
  /**
   * 给u_Sampler 设置纹理单元信息
   * 必须通过指定纹理单元编号 将纹理对象传递给u_Sampler 
   * 执行完后 片元着色器就终于可以访问纹理图像
   * */
  gl.uniform1i(u_Sampler, 0)
  // 清除 颜色缓冲区
  gl.clear(gl.COLOR_BUFFER_BIT)
  // 绘制
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, n)
}