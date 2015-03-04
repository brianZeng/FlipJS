/**
 * Created by 柏然 on 2014/12/12.
 */
function RenderTask(name) {
  if (!(this instanceof  RenderTask))return new RenderTask(name);
  this.name = name;
  this.timeline = new TimeLine(this);
  this._updateObjs = [];
  this._disposeObjs=[];
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
  toDispose:function(obj){
   return arrAdd(this._disposeObjs,obj);
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
function renderTask(task,state){
  var evtParam = [state, state.task=task];
  if (this._invalid) {
    task.emit(RenderTask.EVENT_NAMES.RENDER_START, evtParam);
    task._updateObjs.forEach(function (item) {
      if (item.render) item.render(state);
    });
    task._invalid = false;
  }
  task.emit(RenderTask.EVENT_NAMES.RENDER_END, evtParam);
}
function updateTask(task,state){
  var updateParam = [state, state.task=task];
  (state.timeline = task.timeline).move();
  task.emit(RenderTask.EVENT_NAMES.UPDATE, updateParam);
  task._updateObjs = arrSafeFilter(task._updateObjs, filterIUpdate, state);
}
function disposeTask(task,state){
  var taskItems=(state.task=task)._updateObjs,index;
  task._disposeObjs.forEach(function(obj){
    if(typeof obj==="object"&&obj.emit)
      obj.emit('dispose',state);
    index=taskItems.indexOf(obj);
    if(index!=-1)taskItems[index]=null;
  });
  task._disposeObjs=[];
}
function filterIUpdate(item) {
  if (item == null || !(typeof item == "object"))return false;
  else if (typeof item.update == "function")
    return item.update(this);
  else if (typeof item.emit == "function")
    item.emit(RenderTask.EVENT_NAMES.UPDATE, this);
  return true;
}