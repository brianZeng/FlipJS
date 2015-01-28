/**
 * Created by 柏然 on 2014/12/12.
 */
Flip.RenderGlobal = RenderGlobal;
function RenderGlobal() {
  this._tasks = new Flip.util.Array();
  this._persistStyles=new Flip.util.Array();
  this._persistElement=document.createElement('style');
  this._styleElement=document.createElement('style');
}
RenderGlobal.EVENT_NAMES = {
  FRAME_START: 'frameStart',
  FRAME_END: 'frameEnd',
  UPDATE: 'update'
};
inherit(RenderGlobal, Flip.util.Object, {
  set activeTask(t) {
    var tasks = this._tasks, target = this._activeTask;
    if (target) target.timeline.stop();
    if (t instanceof RenderTask)
      if (tasks.indexOf(t) > -1 || this.add(t)) target = t;
      else if (typeof t == "string") target = tasks.findBy('name', t);
      else target = null;
    this._activeTask = target;
    if (target) target.timeline.start();
  },
  get activeTask() {
    var t = this._activeTask;
    if (!t) {
      this._tasks.length ? (t = this._tasks[0]) : this.add(t = new RenderTask('default'));
      this._activeTask = t;
    }
    return t;
  },
  add: function (obj) {
    var task, taskName, tasks;
    if (obj instanceof RenderTask) {
      if (!(taskName = obj.name)) throw Error('task must has a name');
      else if ((task = (tasks = this._tasks).findBy('name', taskName)) && task !== obj) throw Error('contains same name task');
      else if (tasks.add(obj)) return !!(obj._global = this);
    }
    else if (obj instanceof Animation || obj instanceof Clock)
      return this.activeTask.add(obj);
    return false;
  },
  immediate:function(style){
    var styles=this._persistStyles;
    if(styles.add(style))
    {
      this._persistStyle=false;
      return (function(uid,styles){
        return function cancelImmediate(){
          var index=arrFind(styles,'uid',uid,1,1);
          return styles.splice(index,1)[0];
        }
      })(style.uid=nextUid('immediateStyle'),styles);
    }
  },
  init: function (taskName) {
    var head=document.head;
    this.activeTask = taskName;
    this.loop();
    this.activeTask.timeline.start();
    if(!this._styleElement.parentNode){
      head.appendChild(this._styleElement);
      head.appendChild(this._persistElement);
    }
    typeof window === "object" && Flip.fallback(window);
    this.init = function () {
      console.warn('The settings have been initiated,do not init twice');
    };
  },
  loop: function () {
    var state = this.createRenderState();
    this.emit(RenderGlobal.EVENT_NAMES.FRAME_START, [state]);
    this.update(state);
    this.render(state);
    this.emit(RenderGlobal.EVENT_NAMES.FRAME_END, [state]);
    window.requestAnimationFrame(this.loop.bind(this), window.document.body);
  },
  render: function (state) {
    state.task.render(state);
    if(!this._persistStyle){
      this._persistStyle=1;
      this._persistElement.innerHTML=this._persistStyles.join('\n');
    }
    this._styleElement.innerHTML=state.styleStack.join('\n');
  },
  update: function (state) {
    state.global.emit(RenderGlobal.EVENT_NAMES.UPDATE, [state, this]);
    state.task.update(state);
  },
  createRenderState: function () {
    return {global: this, task: this.activeTask,styleStack:[]}
  }
});
FlipScope.global = new RenderGlobal();

