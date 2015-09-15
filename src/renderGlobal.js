/**
 * Created by 柏然 on 2014/12/12.
 */
Flip.RenderGlobal = RenderGlobal;
function RenderGlobal(opt) {
  if(!(this instanceof RenderGlobal))return new RenderGlobal(opt);
  opt=makeOptions(opt,{defaultTaskName:'default'});
  this._tasks = {};
  this._defaultTaskName=opt.defaultTaskName;
  this._invalid=true;
  this._persistStyles={};
  this._persistElement=Flip.ele({tagName:'style',attributes:{'data-flip':'frame'}});
  this._styleElement=Flip.ele({tagName:'style',attributes:{'data-flip':'persist'}});
}
inherit(RenderGlobal, Flip.util.Object, {
  get defaultTask(){
    var taskName=this._defaultTaskName,t=this._tasks[taskName];
    if(!t)this.add(t=new RenderTask(taskName));
    return t;
  },
  getTask:function(name,createIfNot){
    if(!name)return this.defaultTask;
    var r=this._tasks[name];
    if(!r&&createIfNot) {
      r=new RenderTask(name);
      this.add(r)
    }
    return r;
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
    else if (isObj(obj))
      return this.defaultTask.add(obj);
    return false;
  },
  immediate:function(style){
    if(!style)return noop;
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
  refresh:function(){
    this._foreceRender=true;
  },
  init: function () {
    if(typeof window==="object"){
      var head=document.head;
      if(!this._styleElement.parentNode){
        head.appendChild(this._styleElement);
        head.appendChild(this._persistElement);
      }
      Flip.fallback(window);
      //window.addEventListener('resize',function(){self.refresh()});
      this.loop();
    }
    this.init = function () {
      console.warn('The settings have been initiated,do not init twice');
    };
  },
  invalid:function(){
    return this._invalid=true;
  },
  loop: function (element) {
    loopGlobal(this);
    window.requestAnimationFrame(this.loop.bind(this), element||window.document.body);
  },
  apply:function(){
    if(!this._persistStyle){
      var styles=this._persistStyles;
      styleEleUseRules(this._persistElement,Object.getOwnPropertyNames(styles).map(function(key){return styles[key]}));
      this._persistStyle=true;
    }
  },
  createRenderState: function () {
    return {global: this, task:null,styleStack:[],forceRender:this._foreceRender}
  }
});
FlipScope.global = new RenderGlobal();

