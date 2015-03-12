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
RenderTask.EVENT_NAMES = {
  RENDER_START: 'renderStart',
  RENDER_END: 'renderEnd',
  UPDATE: 'update',
  BEFORE_CONSUME_EVENTS: 'beforeConsumeEvents',
  AFTER_CONSUME_EVENTS: 'afterConsumeEvents'
};
inherit(RenderTask, Flip.util.Object, {
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
    if (obj instanceof Clock || obj instanceof Animation)
      arrAdd(this._updateObjs, obj) && (obj._task = this);
  },
  remove: function (obj) {
    if (obj._task == this && arrRemove(this._updateObjs, obj)){
      obj._task = null;
      this.invalid();
    }
  }
});
function filterIUpdate(item) {
  if (!isObj(item))return false;
  else if (isFunc(item.update))
    item.update(this);
  else if (isFunc(item.emit))
    item.emit(RenderTask.EVENT_NAMES.UPDATE, this);
  return true;
}