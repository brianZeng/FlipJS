/**
 * Created by Administrator on 2015/4/2.
 */
Flip.GL={
  Scene:GLScene,
  Task:GLRenderTask,
  Vector: GLVec,
  Render:GLRender,
  Geometry: GLGeometry,
  Uniform: GLUniform,
  DynamicUniform: GLDynamicUniform,
  Attribute: GLAttribute,
  Binder: GLBinder,
  Sampler2D: GLSampler2D,
  SamplerCube: GLSamplerCube,
  Buffer: GLBuffer,
  Matrix4: Matrix4,
  Camera: GLCamera,
  FrameBuffer: GLFrameBuffer,
  Texture: GLTexture,
  RenderBuffer: GLRenderBuffer
};
(function (WebGLRenderingContext) {
  //Fix safari bug
  var proto = WebGLRenderingContext.prototype;
  for (var key in proto) {
    if (/^[A-Z0-9_]+$/.test(key) && !WebGLRenderingContext.hasOwnProperty(key)) {
      WebGLRenderingContext[key] = proto[key];
    }
  }
})(window.WebGLRenderingContext);

