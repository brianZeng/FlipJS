/**
 * Created by Administrator on 2015/4/1.
 */
function GLTexture(isCube) {
  this._index = -1;
  this._type = isCube ? WebGLRenderingContext.TEXTURE_CUBE_MAP : WebGLRenderingContext.TEXTURE_2D;
}
GLTexture.prototype={
  dispose:function(gl){
    var handle=this._glHandle;
    if(handle)
      gl.deleteTexture(handle);
  },
  getGlHandle(gl){
    return this._glHandle||(this._glHandle=gl.createTexture())
  },
  finalize:function(gl,resMng){
    resMng.releaseTextureIndex(this._index);
    var handle=this._glHandle;
    if(handle)
      gl.deleteTexture(handle);
  },
  bind:function(gl){
    var mng=gl.resMng,index=this._index;
    if(index==-1)this._index=index=mng.increaseTextureIndex();
    gl.activeTexture(WebGLRenderingContext['TEXTURE' + index]);
    gl.bindTexture(this._type,this.getGlHandle(gl))
  }
};