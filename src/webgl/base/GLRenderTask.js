/**
 * Created by Administrator on 2015/3/31.
 */
function GLRenderTask(opt){
  if(!(this instanceof GLRenderTask))return new GLRenderTask(opt);
  RenderTask.call(this,opt.name,opt);
  this.init(opt);
}
inherit(GLRenderTask,RenderTask,{
  init:function(opt){
    var gl=opt.gl||(opt.canvas.getContext('webgl'));
    this.gl=gl;
    this.resMng=gl.resMng||(gl.resMng=new GLManager(gl));
  },
  update:function(state){
    state.gl=this.gl;
    state.glResMng=this.resMng;
  }
});

