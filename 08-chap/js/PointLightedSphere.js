/**
 * 目标：逐顶点 处理光照  使用光栅化内插的过渡效果渲染
 */
let VSHADER_SOURCE = `
 attribute vec4 a_Position;
//  attribute vec4 a_Color;
 attribute vec4 a_Normal;
 uniform mat4 u_MvpMatrix;
 uniform mat4 u_ModelMatrix;
 uniform mat4 u_NormalMatrix;
 uniform vec3 u_LightColor;
 uniform vec3 u_LightPosition;
 uniform vec3 u_AmbientLight;
 varying vec4 v_Color;
 void main() {
  // 圆的顶点颜色
   vec4 color = vec4(1.0, 1.0, 1.0,1.0);
   gl_Position = u_MvpMatrix * a_Position;
  // 计算模型变换后的 新的法向量值
   vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));
  //  计算模型变换后的 顶点坐标
   vec4 vertexPosition = u_ModelMatrix * a_Position;
   vec3 lightDirection = normalize(u_LightPosition - vec3(vertexPosition));
   float nDotL = max(dot(lightDirection, normal),0.0);
   vec3 diffuse = u_LightColor * color.rgb * nDotL;
   vec3 ambient = u_AmbientLight * color.rgb;
   v_Color = vec4(diffuse + ambient, color.a);
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
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Set the vertex coordinates, the color and the normal
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Set the clear color and enable the depth test
  gl.clearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST);
  
}
function initVertexBuffers(gl) { 

}
