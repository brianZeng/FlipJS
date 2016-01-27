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
  this._persistIndies=[];
  this._persistElement=createElement({tagName:'style',attributes:{'data-flip':'frame'}});
  this._styleElement=createElement({tagName:'style',attributes:{'data-flip':'persist'}});
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
    var styleSheet=this._persistElement.sheet,indies=this._persistIndies,index;
    if(indies.length){
      index=indies.pop();
      styleSheet.deleteRule(index);
    }
    else
      index=styleSheet.rules.length;
    styleSheet.insertRule(style,index);
    return cancel;
    function cancel(){
      if(styleSheet){
        styleSheet.deleteRule(index);
        styleSheet.insertRule('*{}',index);
        styleSheet=null;
        indies.push(index);
        return !(index=-1)+1;
      }
    }
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
  createRenderState: function () {
    return {
      global: this,
      task: null,
      styleStack: [],
      forceRender: this._foreceRender,
      transformMap: {}
    }
  },
  css:function(selector,rule){
    return setDefaultImmediateStyle(this,'css',selector,rule)
  },
  transform:function(selector,rule){
    return setDefaultImmediateStyle(this,'transform',selector,rule)
  }
});
FlipScope.global = new RenderGlobal();
function setDefaultImmediateStyle(renderGlobal,property,selector,rule){
  var _cancel,ani={_cssHandlerMap:{},selector:isStr(selector)?selector:''};
  Animation.prototype[property].apply(ani,[selector,rule]);
  Flip(function () {
    var style = renderAnimationCssProxies(ani).map(combineStyleText).join('');
    _cancel=renderGlobal.immediate(style);
  });
  return cancel;
  function cancel(){
    if(_cancel){
      ani=null;
      return _cancel();
    }
  }
}
