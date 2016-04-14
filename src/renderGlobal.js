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
  immediate: function (){
    var styleSheet = this._persistElement.sheet,
      reusableIndies = this._persistIndies,
      insertedIndices = [],
      styles = arguments[0] instanceof Array ? arguments[0] : Array.prototype.slice.apply(arguments);
    styles.forEach(function (style){
      var currentIndex;
      if (reusableIndies.length) {
        currentIndex = reusableIndies.pop();
        styleSheet.deleteRule(currentIndex);
      }
      else {
        currentIndex = styleSheet.cssRules.length;
      }
      styleSheet.insertRule(style, currentIndex);
      insertedIndices.push(currentIndex);
    });
    return cancel;
    function cancel(){
      if(styleSheet){
        insertedIndices.forEach(function (currentIndex){
          styleSheet.deleteRule(currentIndex);
          styleSheet.insertRule('*{}', currentIndex);
          reusableIndies.push(currentIndex);
        });
        return !(styleSheet = null);
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
  var _cancel, ani = { _cssHandlerMap: {}, _matHandlerMap: {}, selector: isStr(selector) ? selector : '' };
  Animation.prototype[property].apply(ani,[selector,rule]);
  Flip(function () {
    var styles;
    if (property == 'css') {
      styles = renderAnimationCssProxies(ani).map(combineStyleText);
    }
    else if (property == 'transform') {
      var cache = {};
      styles = [];
      renderAnimationTransform(ani, cache);
      objForEach(cache, function (mat, selector){
        var cssProxy = new CssProxy();
        cssProxy.$withPrefix('transform', mat + '');
        styles.push(cssProxy.$styleText(selector))
      })
    }
    else {
      throw Error('invalid property:' + property);
    }
    _cancel = renderGlobal.immediate.apply(renderGlobal, styles);
  });
  return cancel;
  function cancel(){
    if(_cancel){
      ani=null;
      return _cancel();
    }
  }
}
