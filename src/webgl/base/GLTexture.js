/**
 * Created by Administrator on 2015/4/1.
 */
function GLTexture(isCube, dataFormat) {
  this._type = isCube ? WebGLRenderingContext.TEXTURE_CUBE_MAP : WebGLRenderingContext.TEXTURE_2D;
  this.dataFormat = dataFormat == WebGLRenderingContext.FLOAT ? WebGLRenderingContext.FLOAT : WebGLRenderingContext.UNSIGNED_BYTE;
}
GLTexture.prototype = {
  get glObj() {
    return this._glHandle;
  },
  dispose: function (gl) {
    var handle = this._glHandle;
    if (handle) {
      gl.deleteTexture(handle);
      this._glHandle = null;
    }
  },
  getGlHandle: function (gl) {
    if (!this._glHandle) {
      this._glHandle = gl.createTexture();
      if (this.dataFormat == WebGLRenderingContext.FLOAT) {
        var ext = gl.getExtension('OES_texture_float');
        if (!ext) {
          console.warn('float texture is not support');
        }
      }
    }
    return this._glHandle;
  },
  bind: function (gl) {
    gl.bindTexture(this._type, this.getGlHandle(gl));
  },
  activeIndex: function (gl, index) {
    gl.activeTexture(gl['TEXTURE' + index]);
    this.bind(gl);
  },
  useTexParam: function (gl, param, target) {
    var method = 'texParameteri';
    var params = {};
    target = target == void 0 ? gl.TEXTURE_2D : target;
    ['TEXTURE_MAG_FILTER', 'TEXTURE_MIN_FILTER', 'TEXTURE_WRAP_S', 'TEXTURE_WRAP_T'].forEach(function (key) {
      var val = param[key];
      if (isStr(val)) {
        val = gl[val];
      }
      if (!isNaN(val)) {
        params[key] = val;
      }
    });
    if (this.dataFormat == gl.FLOAT) {
      method = 'texParameterf';
      if (params['TEXTURE_MAG_FILTER'] == gl.LINEAR || params['TEXTURE_MIN_FILTER'] == gl.LINEAR) {
        var ext = gl.getExtension("OES_texture_float_linear");
        if (!ext) {
          console.warn('float linear filter is not support');
        }
      }
    }
    objForEach(params, function (val, key) {
      gl[method](target, gl[key], val);
    });
  }
};