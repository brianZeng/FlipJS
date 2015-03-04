/**
 * Created by 柏然 on 2014/12/12.
 */
Flip.RenderGlobal = RenderGlobal;
function RenderGlobal(opt) {
  if(!(this instanceof RenderGlobal))return new RenderGlobal(opt);
  opt=opt||{};
  this._tasks = {};
  this._defaultTaskName=opt.defaultTaskName||'default';
  this._invalid=true;
  this._persistStyles={};
  this._persistElement=document.createElement('style');
  this._styleElement=document.createElement('style');
}
RenderGlobal.EVENT_NAMES = {
  FRAME_START: 'frameStart',
  FRAME_END: 'frameEnd',
  UPDATE: 'update'
};
inherit(RenderGlobal, Flip.util.Object, {
  get defaultTask(){
    var taskName=this._defaultTaskName,t=this._tasks[taskName];
    if(!t)this.add(new RenderTask(taskName));
    return t;
  },
  add: function (obj) {
    var task, taskName, tasks;
    if (obj instanceof RenderTask) {
      if (!(taskName = obj.name))
        throw Error('task must has a name');
      else if ((tasks=this._tasks).hasOwnProperty(taskName))
        throw Error('contains same name task');
      else if (tasks[taskName]=obj) {
        obj._global=this;
        obj.timeline.start();
        return this.invalid();
      }
    }
    else if (obj instanceof Animation || obj instanceof Clock)
      return this.defaultTask.add(obj);
    return false;
  },
  immediate:function(style){
    var styles=this._persistStyles,uid=nextUid('immediateStyle'),self=this,cancel;
    styles[uid]=style;
    cancel=function cancelImmediate(){
      var style=styles[uid];
      delete styles[uid];
      self._persistStyle=false;
      return style;
    };
    cancel.id=uid;
    this._persistStyle=false;
    return cancel;
  },
  init: function () {
    if(typeof window==="object"){
      var head=document.head;
      if(!this._styleElement.parentNode){
        head.appendChild(this._styleElement);
        head.appendChild(this._persistElement);
      }
      Flip.fallback(window);
      this.loop();
    }
    this.init = function () {
      console.warn('The settings have been initiated,do not init twice');
    };
  },
  invalid:function(){
    return this._invalid=true;
  },
  loop: function () {
    loopGlobal(this);
    window.requestAnimationFrame(this.loop.bind(this), window.document.body);
  },
  apply:function(){
    if(!this._persistStyle){
      var styles=[];
      objForEach(this._persistStyles,function(style){styles.push(style);});
      this._persistElement.innerHTML=styles.join('\n');
      this._persistStyle=true;
    }
  },
  createRenderState: function () {
    return {global: this, task: this.activeTask,styleStack:[]}
  }
});
function loopGlobal(global){
  var state = global.createRenderState();
  global.emit(RenderGlobal.EVENT_NAMES.FRAME_START, [state]);
  updateGlobal(global,state);
  renderGlobal(global,state);
  global.emit(RenderGlobal.EVENT_NAMES.FRAME_END, [state]);
}
function updateGlobal(global,state){
  state.global.emit(RenderGlobal.EVENT_NAMES.UPDATE, [state,global]);
  objForEach(global._tasks,function(task){updateTask(task,state)});
  global.apply();
}
function renderGlobal(global,state){
  if(global._invalid){
    objForEach(this._tasks,function(task){renderTask(task,state);});
    global._styleElement.innerHTML=state.styleStack.join('\n');
    global._invalid=false;
  }
  objForEach(global._tasks,function(task){disposeTask(task,state)});
}
FlipScope.global = new RenderGlobal();

