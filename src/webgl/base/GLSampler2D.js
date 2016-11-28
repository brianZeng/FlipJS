/**
 * Created by Administrator on 2015/3/31.
 */
function GLSampler2D(opt) {
  if (!(this instanceof GLSampler2D)) {
    return new GLSampler2D(opt);
  }
  this.name = opt.name;
  this._textureIndex = -1;
  this.flipY = opt.flipY !== false;
  this.source = opt.source;
  this.texture = opt.texture || new GLTexture(false, opt.textureDataFormat);
  this.param = makeOptions(opt.param, {
    TEXTURE_MAG_FILTER: 'LINEAR',
    TEXTURE_MIN_FILTER: 'LINEAR',
    TEXTURE_WRAP_S: opt.warpRepeat ? 'REPEAT' : 'CLAMP_TO_EDGE',
    TEXTURE_WRAP_T: opt.warpRepeat ? 'REPEAT' : 'CLAMP_TO_EDGE'
  })
}
function isImageLike(source) {
  return source instanceof HTMLImageElement || source instanceof Image
}
function isCanvasLike(source) {
  return source instanceof HTMLCanvasElement || source instanceof ImageData || source instanceof HTMLVideoElement
}
function checkSamplerSource(sampler, source) {
  var format;
  if (isImageLike(source)) {
    if (!source.complete) {
      throw Error('image should be loaded before use');
    }
    format = WebGLRenderingContext.RGB;
  }
  else if (isCanvasLike(source)) {
    format = WebGLRenderingContext.RGBA;
  }
  else if (isObj(source) && isObj(source.data) && +source.width && +source.height && source.data.buffer instanceof ArrayBuffer) {
    format = source.format || WebGLRenderingContext.RGBA;
  }
  else if (!source) {
    format = 0;
  } else {
    throw Error('invalid source');
  }
  sampler._source = source;
  sampler.format = format;
}
Flip.util.inherit(GLSampler2D, GLUniform.prototype, {
  set source(value) {
    checkSamplerSource(this, value);
    this._buffered = false;
  },
  get value() {
    return this.source;
  },
  get source() {
    return this._source
  },
  set value(v) {
    this.source = v;
  },
  get textureIndex() {
    return this._textureIndex;
  },
  set textureIndex(v) {
    if (this._textureIndex == -1) {
      this._textureIndex = v;
    }
    else if (this._textureIndex != v) {
      throw Error('sampler texture index should not change');
    }
  },
  set texture(v) {
    if (v instanceof GLTexture && v != this._texture) {
      this._texture = v;
      this._buffered = false;
    }
    else {
      throw Error('invalid texture');
    }
  },
  get texture() {
    return this._texture;
  },
  bind: function (gl, state) {
    var entry = state.glParam[this.name];
    this.textureIndex = gl.resMng.getTextureIndexByName(this.name);
    this.bufferData(gl);
    entry.use(gl, this.textureIndex);
  },
  dispose: function (gl) {
    var texture = this._texture;
    if (texture) {
      texture.dispose(gl);
      this._buffered = false;
    }
  },
  bufferData: function (gl) {
    var source = this.source, tex = this._texture;
    tex.activeIndex(gl, this.textureIndex);
    tex.bind(gl);
    if (!this._buffered) {
      if (source) {
        var format = this.format;
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, this.flipY);
        if (isCanvasLike(source) || isImageLike(source)) {
          gl.texImage2D(gl.TEXTURE_2D, 0, format, format, tex.dataFormat, source);
        }
        else {
          gl.texImage2D(gl.TEXTURE_2D, 0, format, source.width, source.height, 0, format, tex.dataFormat, source.data)
        }
        tex.useTexParam(gl, this.param);
      }
      else {
        //gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, null);
      }
      this._buffered = true;
    }
  }
});