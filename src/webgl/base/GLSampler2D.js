/**
 * Created by Administrator on 2015/3/31.
 */
function GLSampler2D(opt){
  if(!(this instanceof GLSampler2D))return new GLSampler2D(opt);
  this.name=opt.name;
  this.flipY=opt.flipY!==false;
  this.source=opt.source;
  this._texture=new GLTexture();
  this.param={
    TEXTURE_MAG_FILTER: 'LINEAR',
    TEXTURE_MIN_FILTER: 'LINEAR',
    TEXTURE_WRAP_S: opt.warpRepeat ? 'REPEAT' : 'CLAMP_TO_EDGE',
    TEXTURE_WRAP_T: opt.warpRepeat ? 'REPEAT' : 'CLAMP_TO_EDGE'
  }
}
function checkSamplerSource(sampler,source){
  var format;
  if(source instanceof HTMLImageElement || source instanceof Image)
  {
    if(!source.complete) throw Error('image should be loaded before use');
    format=WebGLRenderingContext.RGB;
  }
  else if(source instanceof HTMLCanvasElement ||source instanceof ImageData)
    format=WebGLRenderingContext.RGBA;
  else if(!source)
    format=0;
  else throw Error('invalid source');
  sampler._source=source;
  sampler.format=format;
}
GLSampler2D.prototype={
  get textureIndex(){
    return this._texture._index
  },
  set source(value){
    checkSamplerSource(this,value);
    this._buffered=false;
  },get source(){return this._source},
  bind:function(gl,state){
    var entry=state.glParam[this.name];
    this.bufferData(gl);
    entry.set(gl,this.textureIndex);
  },
  finalize:function(state,gl,resMng){
    this.source=null;
    this._texture.finalize(gl,resMng);
  },
  bufferData:function(gl){
    if(!this._buffered){
      var source = this.source, params = this.param, tex = this._texture;
      tex.bind(gl);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, null);
      if (source) {
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, this.flipY);
        gl.texImage2D(gl.TEXTURE_2D, 0, this.format,this.format, gl.UNSIGNED_BYTE,source);
        objForEach(params,function(value,key){
          gl.texParameteri(gl.TEXTURE_2D, gl[key], gl[value]);
        });
      }
      this._buffered=true;
  }
}
};