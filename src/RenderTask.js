/**
 * Created by 柏然 on 2014/12/12.
 */
function RenderTask(name) {
  if (!(this instanceof  RenderTask))return new RenderTask(name);
  this.name = name;
  this.timeline = new TimeLine(this);
  this._updateObjs = [];
  this._finalizeObjs=[];
  this._global = null;
}
Flip.RenderTask = RenderTask;
inherit(RenderTask, Flip.util.Object, {
  update:noop,
  invalid: function () {
    var g;
    this._invalid = true;
    if(g=this._global)
      g.invalid();
  },
  toFinalize:function(obj){
   return this._updateObjs.indexOf(obj)>-1 && arrAdd(this._finalizeObjs,obj);
  },
  add: function (obj, type) {
    if (type == 'update') return arrAdd(this._updateObjs, obj);
    if (obj instanceof Clock || obj instanceof Render)
      if(arrAdd(this._updateObjs, obj))
        obj._task = this;
    this.invalid();
  },
  remove: function (obj) {
    if (obj._task == this||this._updateObjs.indexOf(obj)>-1){
      obj._task = null;
      this.toFinalize(obj);
      this.invalid();
    }
  }
});
