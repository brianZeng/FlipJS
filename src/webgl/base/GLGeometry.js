/**
 * Created by Administrator on 2015/4/3.
 */
function GLGeometry(opt){
  if (!(this instanceof GLGeometry)) {
    return new GLGeometry(opt);
  }
  GLRender.call(this, opt);
  this.drawMode = opt.drawMode || WebGLRenderingContext.TRIANGLES;
  opt.indexBuffer ? this.indexBuffer = opt.indexBuffer : this.setDrawRange(opt.drawCount, opt.startIndex);
  this.invalid();
}
inherit(GLGeometry, GLRender.prototype, {
  set indexBuffer(arrayOrBuffer){
    this.releaseBuffer();
    if (!(arrayOrBuffer instanceof GLBuffer)) {
      arrayOrBuffer = new GLBuffer(arrayOrBuffer, WebGLRenderingContext.ELEMENT_ARRAY_BUFFER);
    }
    this._indexBuffer = arrayOrBuffer;
    arrayOrBuffer.ref(this);
    this.draw = drawIndexBufferArray;
  },
  finalize: function (state){
    finalizeBinder(this, state);
    var buffer = this.releaseBuffer();
    buffer && buffer.finalize(state.gl);
  },
  setDrawRange: function (count, start){
    this.releaseBuffer();
    this.startIndex = start || 0;
    this.drawCount = count;
    this.draw = drawVertexArray;
  },
  render: function (state){
    useBinder(this.binder, state);
    this.draw(state.gl);
  },
  releaseBuffer: function (gl){
    var buffer = this._indexBuffer;
    if (buffer instanceof GLBuffer) {
      buffer.release(this);
      if (gl) {
        buffer.finalize(gl);
      }
    }
    return buffer;
  },
  draw: noop
});
function drawIndexBufferArray(gl){
  this.indexBuffer.bind(gl);
  gl.drawElements(this.drawMode, this._indexBuffer.length, gl.UNSIGNED_SHORT, 0);
}
function drawVertexArray(gl){
  gl.drawArrays(this.drawMode, this.startIndex, this.drawCount);
}