/**
 * Created by Administrator on 2015/4/3.
 */
function GLGeometry(opt){
  if(!(this instanceof GLGeometry))return new GLGeometry(opt);
  GLRender.call(this,opt);
  this.drawMode=opt.drawMode||WebGLRenderingContext.TRIANGLES;
  opt.indexBuffer? this.indexBuffer=opt.indexBuffer:this.setDrawRange(opt.drawCount,opt.startIndex);
  this.invalid();
}
inherit(GLGeometry,GLRender.prototype,{
  set indexBuffer(arrayOrBuffer){
    if(!(arrayOrBuffer instanceof GLBuffer)) arrayOrBuffer=new GLBuffer(arrayOrBuffer,WebGLRenderingContext.ELEMENT_ARRAY_BUFFER);
    this._indexBuffer=arrayOrBuffer;
    this.draw=drawIndexBufferArray;
  },
  setDrawRange:function(count,start){
    this.startIndex=start||0;
    this.drawCount=count;
    this.draw=drawVertexArray;
  },
  render:function(state){
    useBinder(this.binder,state);
    debugger;
    this.draw(state.gl);
  },
  draw:noop
});
function drawIndexBufferArray(gl){
  this.indexBuffer.bind(gl);
  gl.drawElements(this.drawMode,this._indexBuffer.length,gl.UNSIGNED_SHORT,0);
}
function drawVertexArray(gl){
  gl.drawArrays(this.drawMode,this.startIndex,this.drawCount);
}