/**
 * Created by Administrator on 2015/4/1.
 */
function GLManager(gl) {
  if (!(this instanceof GLManager)) {
    return new GLManager(gl);
  }
  this._maxActiveTexureNum = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS) - 1;
  this._maxCubeTextureNum = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);
  this._max2DTextureNum = gl.getParameter(gl.MAX_TEXTURE_SIZE);
  this._maxFrameBufferNum = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
  this._maxRenderBufferNum = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
  this._maxBufferNum = 2048;
  this._texture2DS = [];
  this._textureCubes = [];
  this._buffers = [];
  this._renderBuffers = [];
  this._frameBuffers = [];
  this._textureIndexDic = {};
  this._indexUsage = new Uint8Array(this._maxActiveTexureNum);
  this._bindingTexture = this._bindingBuffer = this._bindingFrameBuffer = null;
  this._activeIndex = undefined;
}
GLManager.prototype = {
  getTextureIndexByName: function (name) {
    var dic = this._textureIndexDic;
    if (dic.hasOwnProperty(name)) {
      return dic[name];
    } else {
      var index = this.increaseTextureIndex(Object.getOwnPropertyNames(dic).length);
      if (name) {
        dic[name] = index;
      }
      return index;
    }
  },
  increaseTextureIndex: function (start) {
    var usages = this._indexUsage;
    for (var i = start || 0, min = usages[0], index = i, len = usages.length; i < len; i++) {
      if (usages[i] < min) {
        index = i;
        min = usages[i];
      }
    }
    usages[index]++;
    return index;
  },
  releaseTextureIndex: function (index) {
    return --this._indexUsage[index];
  }
};