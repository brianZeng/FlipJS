/**
 * Created by Administrator on 2015/4/3.
 */
function GLGeometry(opt) {
  if (!(this instanceof GLGeometry)) {
    return new GLGeometry(opt);
  }
  GLRender.call(this, opt);
  this.drawMode = isNaN(opt.drawMode) ? WebGLRenderingContext.TRIANGLES : opt.drawMode;
  if (isFunc(opt.beforeDraw)) {
    this.beforeDraw = opt.beforeDraw;
  }
  else if (isFunc(opt.afterDraw)) {
    this.afterDraw = opt.afterDraw;
  }
  opt.indexBuffer ? this.indexBuffer = opt.indexBuffer : this.setDrawRange(opt.drawCount, opt.startIndex);
  this.invalid();
}
inherit(GLGeometry, GLRender.prototype, {
  set indexBuffer(arrayOrBuffer) {
    this.releaseBuffer();
    if (!(arrayOrBuffer instanceof GLBuffer)) {
      arrayOrBuffer = new GLBuffer(arrayOrBuffer, WebGLRenderingContext.ELEMENT_ARRAY_BUFFER);
    }
    this._indexBuffer = arrayOrBuffer;
    arrayOrBuffer.ref(this);
    this.draw = drawIndexBufferArray;
  },
  dispose: function (gl) {
    GLRender.prototype.dispose.apply(this, arguments);
    var buf = this.releaseBuffer(gl);
    if (buf) {
      buf.dispose(gl)
    }
  },
  update: function (state) {
    GLRender.prototype.update.call(this, state);
    //force rebind param
    objForEach(this.binder, function (binder) {
      if (binder instanceof GLBinder) {
        binder._invalid = true;
      }
    })
  },
  setDrawRange: function (count, start) {
    this.releaseBuffer();
    this.startIndex = start || 0;
    this.drawCount = count;
    this.draw = drawVertexArray;
  },
  beforeDraw: void 0,
  afterDraw: void 0,
  render: function (state) {
    useBinder(this.binder, state);
    if (isFunc(this.beforeDraw)) {
      this.beforeDraw(state.gl, state);
    }
    this.draw(state.gl, state);
    if (isFunc(this.afterDraw)) {
      this.afterDraw(state.gl, state);
    }
  },
  releaseBuffer: function () {
    var buffer = this._indexBuffer;
    if (buffer instanceof GLBuffer) {
      buffer.release();
    }
    return buffer;
  },
  draw: noop
});
function drawIndexBufferArray(gl) {
  var indexBuffer = this._indexBuffer;
  if (indexBuffer && indexBuffer.length) {
    indexBuffer.bind(gl);
    gl.drawElements(this.drawMode, indexBuffer.length, gl.UNSIGNED_SHORT, 0);
  }
}
function drawVertexArray(gl) {
  if (this.drawCount) {
    gl.drawArrays(this.drawMode, this.startIndex, this.drawCount);
  }
}