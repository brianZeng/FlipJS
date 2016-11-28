function GLRenderBuffer() {
  this._glObj = null;
}
GLRenderBuffer.prototype = {
  get glObj() {
    return this._glObj
  },
  dispose: function (gl) {
    if (this._glObj) {
      gl.deleteRenderbuffer(this._glObj);
      this._glObj = null;
    }
  },
  bind: function (gl) {
    var handler = this.glObj;
    if (!handler) {
      this._glObj = handler = gl.createRenderbuffer();
    }
    gl.bindRenderbuffer(gl.RENDERBUFFER, handler);
  }
};