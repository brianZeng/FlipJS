function GLFrameBuffer(opt) {
  opt = opt || {};
  if (!(this instanceof GLFrameBuffer)) {
    return new GLFrameBuffer(opt)
  }
  GLBinder.call(this, { name: opt.name });
  this._w = opt.width || 0;
  this._h = opt.height || 0;
  this._depthBuffer = opt.useDepthBuffer ? new GLRenderBuffer() : null;
  this._texture = new GLTexture(false, opt.textureDataFormat);
  this._index = null;
  this._fbo = null;
  this._textureIndex = -1;
  this._buffered = false;
  this.shouldCheckComplete = true;
  this.shouldClearTexture = true;
  this.textureParam = makeOptions(opt.textureParam, {
    TEXTURE_MAG_FILTER: 'LINEAR',
    TEXTURE_MIN_FILTER: 'LINEAR',
    TEXTURE_WRAP_S: 'CLAMP_TO_EDGE',
    TEXTURE_WRAP_T: 'CLAMP_TO_EDGE'
  });
}
inherit(GLFrameBuffer, GLBinder.prototype, {
  get glObj() {
    return this._fbo;
  },
  get depthBuffer() {
    return this._depthBuffer;
  },
  get texture() {
    return this._texture;
  },
  get textureIndex() {
    return this._textureIndex;
  },
  set texture(tex) {
    if (tex !== this.texture) {
      this._texture = tex;
      this._buffered = false;
    }
  },
  createSampler2DBinder: function (name, keepBindingRenderbuffer) {
    var framebuffer = this;
    return new GLBinder({
      name: name,
      bind: function (gl, state) {
        var entry = state.glParam[name];
        if (!entry) {
          throw Error('no sampler2D with name:' + name + ' in this program')
        }
        if (!keepBindingRenderbuffer) {
          framebuffer.unbind(gl);
        }
        framebuffer.bindUniformEntry(gl, entry);
      }
    })
  },
  dispose: function (gl) {
    var db = this.depthBuffer;
    if (db) {
      db.dispose(gl);
    }
    this.texture.dispose(gl);
    if (this._fbo) {
      gl.deleteFramebuffer(this._fbo);
      this._fbo = null;
    }
  },
  bindUniformEntry: function (gl, entry) {
    var textureIndex = this.textureIndex;
    this.texture.activeIndex(gl, textureIndex);
    entry.use(gl, textureIndex);
  },
  bind: function (gl) {
    if (!this.bufferData(gl)) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, this._fbo);
    }
  },
  unbind: function (gl) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  },
  bindTexture: function (gl, texture) {
    if ((texture instanceof GLTexture)) {
      texture.activeIndex(gl, this.textureIndex);
      gl.bindFramebuffer(gl.FRAMEBUFFER, this._fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture.glObj, 0);
    }
    else {
      throw Error('invalid texture');
    }
  },
  bindDepthBuffer: function (gl, depthBuffer, width, height) {
    if (depthBuffer instanceof GLRenderBuffer) {
      depthBuffer.bind(gl);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer.glObj);
    }
  },
  bufferData: function (gl) {
    if (!this._buffered) {
      var w = this._w || gl.drawingBufferWidth,
        h = this._h || gl.drawingBufferHeight,
        texture = this.texture;
      if (!this._fbo) {
        this._fbo = gl.createFramebuffer();
      }
      if (this._textureIndex == -1) {
        this._textureIndex = gl.resMng.getTextureIndexByName(this.name);
      }
      this.bindTexture(gl, texture);
      if (this.shouldClearTexture) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, texture.dataFormat, null);
      }
      texture.useTexParam(gl, this.textureParam);
      this.bindDepthBuffer(gl, this._depthBuffer, w, h);
      if (this.shouldCheckComplete && gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
        throw Error('framebuffer fail');
      }
      this._buffered = true;
      return true;
    }
    return false;
  },
  set width(v) {
    v = parseInt(v);
    if (!v || this._w == v) {
      return;
    }
    this._w = v;
    this._buffered = false;
  },
  set height(v) {
    v = parseInt(v);
    if (!v || this._h == v) {
      return;
    }
    this._h = v;
    this._buffered = false;
  }
});
