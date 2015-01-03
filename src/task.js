/**
 * Created by 柏然 on 2014/12/12.
 */
function RenderTask(name) {
  if (!(this instanceof  RenderTask))return new RenderTask(name);
  this.name = name;
  this.timeline = new TimeLine(this);
  this._updateObjs = [];
  this._onAction = false;
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
  update: function (state) {
    var t = state.task, updateParam = [state, this], nextComs;
    (state.timeline = t.timeline).move();
    this.emit(RenderTask.EVENT_NAMES.UPDATE, updateParam);
    this._updateObjs = arrSafeFilter(this._updateObjs, filterIUpdate, state);
  },
  invalid: function () {
    this._invalid = true;
  },
  render: function (state) {
    var evtParam = [state, this];
    if (this._invalid) {
      this.emit(RenderTask.EVENT_NAMES.RENDER_START, evtParam);
      this._updateObjs.forEach(function (component) {
        if (component.render) component.render(state);
      });
      this._invalid = false;
    }
    this.emit(RenderTask.EVENT_NAMES.RENDER_END, evtParam);
  },
  add: function (obj, type) {
    if (type == 'update') return arrAdd(this._updateObjs, obj);
    if (obj instanceof Clock || obj instanceof Animation)
      arrAdd(this._updateObjs, obj) && (obj._task = this);
  },
  remove: function (obj) {
    if (obj._task == this)
      obj._task = null;
    arrRemove(this._updateObjs, obj);
  }
});
function filterIUpdate(obj) {
  if (obj == null || !(typeof obj == "object"))return false;
  else if (typeof obj.update == "function")return obj.update(this);
  else if (typeof obj.emit == "function") return obj.emit(RenderTask.EVENT_NAMES.UPDATE, this);
}