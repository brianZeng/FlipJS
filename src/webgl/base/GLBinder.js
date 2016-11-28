/**
 * Created by Administrator on 2015/3/31.
 */
function GLBinder(opt){
  if (!(this instanceof GLBinder)) {
    return new GLBinder(opt);
  }
  this.name = opt.name || nextUid(this.constructor.name || 'GLBinder');
  if (isFunc(opt.bind)) {
    this.bind = opt.bind;
  }
  this.invalid();
}
GLBinder.prototype = {
  bind: noop,
  invalid: function (){
    var render = this._controller;
    if (render) {
      render.invalid();
    }
    this._invalid = true;
  },
  dispose: function (){
    this._controller = null;
  }
};
