/**
 * Created by Administrator on 2015/3/31.
 */
function GLBuffer(data, isElementBuffer, usage){
  this._type = typeof isElementBuffer == 'number' ? isElementBuffer :
    (isElementBuffer ? WebGLRenderingContext.ELEMENT_ARRAY_BUFFER : WebGLRenderingContext.ARRAY_BUFFER);
  if (data) {
    this.data = data;
  }
  this._refs = [];
  this._glHandle = null;
  this.usage = usage || WebGLRenderingContext.STATIC_DRAW;
  this._buffered = false;
}
GLBuffer.prototype = {
  getGlHandle: function (gl){
    return this._glHandle || (this._glHandle = gl.createBuffer())
  },
  ref: function (obj){
    arrAdd(this._refs, obj);
  },
  release: function (obj){
    arrRemove(this._refs, obj)
  },
  invalid: function (){
    this._buffered = false;
  },
  finalize: function (gl){
    if (this._refs.length == 0) {
      var handle = this._glHandle;
      if (handle) {
        gl.deleteBuffer(handle);
      }
      this._data = null;
    }
  },
  get data(){
    return this._data;
  },
  set data(val){
    if (!val || val === this._data) {
      return;
    }
    if (WebGLRenderingContext.ARRAY_BUFFER === this._type) {
      this._data = val instanceof Float32Array ? val : new Float32Array(val);
    } else {
      this._data = val instanceof Int16Array ? val : new Int16Array(val);
    }
    this._buffered = false;
    this.length = val.length;
  },
  bufferData: function (gl){
    if (!this._buffered) {
      gl.bufferData(this._type, this._data, this.usage);
      this._buffered = true;
      return true;
    }
    return false;
  },
  bind: function (gl){
    var handle = this.getGlHandle(gl);
    gl.bindBuffer(this._type, handle);
    if (!this._buffered) {
      gl.bufferData(this._type, this._data, this.usage);
      this._buffered = true;
    }
  }
};