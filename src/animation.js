/**
 * Created by 柏然 on 2014/12/13.
 */
function Animation(opt) {
  if (!(this instanceof Animation))return new Animation(opt);
  var r = Animation.createOptProxy(opt).result;
  this.selector= r.selector||Error('Elements selector required');
  this.clock = r.clock;
  this.persistAfterFinished= r.persistAfterFinished;
  this._cssMap={};
  this._matCallback={};
  this._cssCallback={};
  this.use(opt);
  this.init();
}
inherit(Animation, Flip.util.Object, {
  get percent(){
    return this.finished? 1:this.clock.value;
  },
  set clock(c) {
    var oc = this._clock;
    c = c || null;
    if (oc == c)return;
    if (oc && c)throw Error('remove the animation clock before add a new one');
    this._clock = c;
    //add a clock
    if (c) {
      c.controller = this;
    }//remove a clock
    else if (oc) {
      oc.controller = null;
    }
  },
  get clock() {
    return this._clock;
  },
  get promise(){
    var v=this._promise,self=this;
    if(!v)
      v=this._promise=FlipScope.Promise(function(resolve){
        self.once('finished',function(state){
          if(state&&state.global)
            state.global.once('frameEnd',go);
          else go();
          function go(){resolve(self);}
        })
      });
    return v;
  },
  get finished() {
    return this._finished;
  },
  get id() {
    if (!this._id)this._id = nextUid('Animation'+this.type);
    return this._id;
  },
  get elements() {
    return Flip.$(this.selector);
  },
  init:function(){
    this._promise=null;
    this._finished=false;
    this.invalid();
  },
  reset:function(skipInit){
    var clock;
    if(clock=this.clock)
      clock.reset(1);
    if(!skipInit)
      this.init();
  },
  use:function(opt){
    setUpdateOpt(this,opt.transform,'transform');
    setUpdateOpt(this,opt.css,'css');
    setUpdateOpt(this,opt.on,'on');
    setUpdateOpt(this,opt.once,'once');
    return this;
  },
  transform:function(selector,matCallback){
    if(typeof selector==="function") {
      matCallback= selector;
      selector ='&';
    }
    addMap(selector,this._matCallback,matCallback);
    return this;
  },
  css:function(selector,cssCallBack){
    if(typeof selector!=="string") {
      cssCallBack = selector;
      selector ='&';
    }
    if(isObj(cssCallBack)){
      var cssTo=cssCallBack;
      cssCallBack=function(cssObj){
        objForEach(cssTo,cloneFunc,cssObj);
      }
    }
    addMap(selector,this._cssCallback,cssCallBack);
    return this;
  },
  update: function (state) {
    return updateAnimation(this,state);
  },
  render: function (state) {
    state.animation = this;
    this.apply(state);
    this._invalid=false;
    this.emit(ANI_EVT.RENDER, state);
    if(this._finished)
      this.emit(ANI_EVT.FINISHED,state);
    state.animation = null;
  },
  invalid: function () {
    if (this._task)
      this._task.invalid();
    this.lastStyleRule=null;
    this._invalid=true;
  },
  finalize:function(){
    var task;
    if(task=this._task)
     task.toFinalize(this);
    else {
      this.reset(1);
      this.emit(ANI_EVT.FINALIZED);
    }
  },
  getStyleRule:function(){
    var styles=[];
    objForEach(this._cssMap,function(ruleObj,selector){
      var body=getRuleBody(ruleObj);
      if(body){
        styles.push(selector+'\n{\n'+body+'\n}');
      }
    });
    return this.lastStyleRule=styles.join('\n');
  },
  apply: function (state) {
    state.styleStack.push(this.lastStyleRule||this.getStyleRule());
  },
  start:function(){
    var clock=this.clock;
    if(clock){
      clock.start();
    }
    return this;
  },
  stop:function(){
    var clock=this.clock;
    if(clock)clock.stop();
    return this;
  },
  then:function(onFinished,onerror){
    return this.promise.then(onFinished,onerror);
  },
  follow:function(thenables){
    //TODO:directly past Array
    if(arguments.length>1)thenables=Array.prototype.slice.apply(arguments);
    else if(!(thenables instanceof Array))thenables=[thenables];
    return this.promise.then(function(){ return Flip.Promise.all(thenables.map(Flip.Promise))});
  }
});
var ANI_EVT=Animation.EVENT_NAMES = {
  UPDATE: 'update',
  FINALIZED: 'finalized',
  RENDER: 'render',
  FINISHED: 'finished'
};
Animation.createOptProxy = function (setter,selector,persist) {
  setter = createProxy(setter);
  if (!setter.proxy.clock)
    setter('clock', new Clock(setter));
  setter('selector',selector);
  setter('persistAfterFinished',persist);
  return setter;
};
function animate() {
    var firstParam = typeof arguments[0], constructor, opt;
    if (firstParam === "string") {
      constructor = Flip.animation[arguments[0]];
      opt = arguments[1];
    }
    else if (firstParam === "object") {
      constructor = Flip.animation[arguments[0].animationType];
      opt = arguments[0];
    }
    if (!constructor) constructor = Animation;
    return setAniEnv(animate.createOptProxy(opt).result, new constructor(opt));
  }
function setAniEnv(aniOpt, animation) {
  (aniOpt.renderGlobal||FlipScope.global).getTask(aniOpt.taskName,true).add(animation);
  aniOpt.autoStart&& animation.start();
  return animation;
}
animate.createOptProxy = function (setter, autoStart, taskName, defaultGlobal) {
    setter = createProxy(setter);
    setter('autoStart', autoStart, 'taskName', taskName, 'renderGlobal', defaultGlobal);
    return setter;
};
Flip.animate = animate;
Flip.css=function(selector,rule){
  var literal=[],t1=typeof selector;
  if(t1==="string")
    resolveRule(rule,selector);
  else if(t1==="object")
    objForEach(selector,resolveRule);
  return FlipScope.global.immediate(literal.join('\n'));
  function resolveRule(rule,selector){
    var result=new CssContainer();
    if(typeof rule==="function")result=rule(result)||result;
    else if(typeof rule==="object") objForEach(rule,cloneFunc,result);
    else throw Error('css rule should be object or function');
    literal.push(selector+'{'+getRuleBody(result)+'}');
  }
};
function getRuleBody(ruleObj,separator){
    var rules=[];
    objForEach(ruleObj,function(value,key){
       rules.push(key.replace(/[A-Z]/g,function(c){return '-'+ c.toLowerCase()})+':'+value+';');
    });
    return rules.join(separator||'\n');
}
function finalizeAnimation(animation){
  var task;
  if(!animation.persistAfterFinished&&(task=animation._task)){
    task.toFinalize(animation);
  }
}
function updateAnimation(animation,renderState){
  var clock=animation.clock;
  renderState.animation=animation;
  if(updateClock(clock,renderState)){
    animation.invalid();
    updateAnimationCss(animation,renderState);
    animation.emit(ANI_EVT.UPDATE, renderState);
  }
  if(clock.finished){
    //trigger finished event after render
    animation._finished=true;
    finalizeAnimation(animation);
  }
  renderState.animatetion=null;
  return true;
}
function updateAnimationCss(animation,renderState){
    var cssMap=animation._cssMap,ts=animation.selector;
    objForEach(animation._cssCallback,function(cbs,selector){
      var cssRule=new CssContainer();
      cbs.forEach(function(cb){
        cb.apply(animation,[cssRule,renderState])
      });
      selector.split(',').forEach(function(se){cssMap[se.replace(/&/g,ts)]=cssRule;});
    });
    objForEach(animation._matCallback,function(cbs,selector){
      var mat=new Mat3(),matRule;
      cbs.forEach(function(cb){mat=cb.apply(animation,[mat,renderState])||mat});
      matRule=mat.toString();
      selector.split(',').forEach(function(se){
        var key=se.replace(/&/g,ts),cssRule=cssMap[key]||(cssMap[key]=new CssContainer());
        cssRule.withPrefix('transform',matRule);
      });
    });
  }
function CssContainer(){
  if(!(this instanceof CssContainer))return new CssContainer();
}
CssContainer.prototype={
  withPrefix:function(key,value,prefixes){
    var self=this;
    (prefixes||['-moz-','-ms-','-webkit-','-o-','']).forEach(function(prefix){
      self[prefix+key]=value;
    });
    return self;
  }
};
function setUpdateOpt(animation,obj,type){
     var t=typeof obj;
    if(t==="function")animation[type](obj);
    else if(t==="object"){
      hasNestedObj(obj)? objForEach(obj,function(rule,slt){animation[type](slt,rule)}):animation[type](obj);
    }
  }
function hasNestedObj(obj){
    return obj&&Object.getOwnPropertyNames(obj).some(function(key){
        var t=typeof obj[key];
        return t=="object"||t=="function"
        });
}
function addMap(key,Map,cb){
    var cbs=Map[key];
    if(!cbs)Map[key]=[cb];
    else arrAdd(cbs,cb);
}
Flip.animation = (function () {
  function register(definition) {
    var beforeCallBase, defParam, name = definition.name, Constructor;
    beforeCallBase = definition.beforeCallBase || _beforeCallBase;
    defParam = definition.defParam || {};
    Constructor = function (opt) {
      if (!(this instanceof Constructor))return new Constructor(opt);
      var proxy = createProxy(opt);
      objForEach(defParam, function (value, key) {
        proxy(key, value)
      });
      objForEach(proxy.result, cloneFunc, this);
      beforeCallBase.apply(this, [proxy, opt]);
      Animation.call(this, proxy);
      this.use(definition);
    };
    if (name) {
      register[name] = Constructor;
      Constructor.name = name;
    }
    inherit(Constructor, Animation.prototype,{
      type:definition.name
    });
    return Constructor;
  }
  return register;
  function _beforeCallBase(proxy, opt, instance) {
    return proxy;
  }
})();
Flip.Animation=Animation;

