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
    var t = state.task, updateParam = [state, this], oups;
    (state.timeline = t.timeline).move();
    this.emit(RenderTask.EVENT_NAMES.UPDATE, updateParam);
    oups = this._updateObjs;
    this._updateObjs = [];
    this._updateObjs = this._updateObjs.concat(oups.filter(filterIUpdate, state));
  },
  invalid: function () {
    this._invalid = true;
  },
  render: function (state) {
    if (this._invalid) {
      this._updateObjs.forEach(function (component) {
        if (component.render) component.render(state);
      });
      this._invalid = false;
    }
  },
  add: function (obj, type) {
    if (type == 'update') return arrAdd(this._updateObjs, obj);
    if (obj instanceof Clock || obj instanceof Animation)
      arrAdd(this._updateObjs, obj) && (obj._task = this);
  },
  remove: function (obj) {
    if (arrRemove(this._updateObjs, obj) && obj._task == this)obj._task = null;
  }
});
function filterIUpdate(obj) {
  if (obj == null || !(typeof obj == "object"))return false;
  else if (typeof obj.update == "function")return obj.update(this);
  else if (typeof obj.emit == "function") return obj.emit(RenderTask.EVENT_NAMES.UPDATE, this);
}