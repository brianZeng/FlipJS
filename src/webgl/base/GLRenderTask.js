/**
 * Created by Administrator on 2015/3/31.
 */
function GLRenderTask(opt){
  if (!(this instanceof GLRenderTask)) {
    return new GLRenderTask(opt);
  }
  RenderTask.call(this, opt.name, opt);
  this.init(opt);
}
inherit(GLRenderTask, RenderTask, {
  init: function (opt){
    var cvs, gl = opt.gl || (cvs = opt.canvas).getContext('webgl') || cvs.getContext('experimental-webgl');
    this.gl = gl;
    this.resMng = gl.resMng || (gl.resMng = new GLManager(gl));
  },
  update: function (state){
    state.gl = this.gl;
    state.glResMng = this.resMng;
  },
  remove: function (item){
    var upobjs = this._updateObjs, index = upobjs.indexOf(item);
    if (index > -1) {
      upobjs[index] = null;
      arrAdd(this._finalizeObjs, item);
      this.invalid();
    }
  }
});

