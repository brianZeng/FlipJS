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
  //todo:param
  this.use(opt);
  this.init();
}
function getPromiseByAni(ani){
  return FlipScope.Promise(function(resolve){
    ani.once('finished',function(state){
      if(state&&state.global)
        state.global.once('frameEnd',go);
      else go();
    });
    function go(){resolve(ani);}
  });
}
inherit(Animation, Flip.util.Object, {
  get percent(){
    return this.clock.value;
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
    return this._promise||(this._promise=getPromiseByAni(this));
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
  use:(function(){
    var pros=['transform','css','on','once'];
    return function use(opt){
      var self=this;
      pros.forEach(function(proName){
        setUpdateOpt(self,opt[proName],proName)
      });
      return this;
    };
    function setUpdateOpt(animation,obj,type){
      if(isFunc(obj))
        animation[type](obj);
      else if(isObj(obj)){
        hasNestedObj(obj)? objForEach(obj,function(rule,slt){animation[type](slt,rule)}):animation[type](obj);
      }
    }
  })(),
  transform:function(selector,matCallback){
    var map=this._matCallback;
    objForEach(normalizeMapArgs(arguments),function(callback,selector){
      addMap(selector,map,callback)
    });
    return this;
  },
  css:function(mapOrFunc){
    var map=this._cssCallback;
    objForEach(normalizeMapArgs(arguments),function(callback,selector){
      addMap(selector,map,callback)
    });
    return this;
  },
  update: function (state) {
    //todo:update param
    updateAnimation(this,state);
  },
  render: function (state) {
    renderAnimation(this,state);
  },
  invalid: function () {
    if (this._task)this._task.invalid();
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
    return getAnimationStyle(this);
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
  var literal=[];
  if(arguments.length==2){
    resolve(rule,selector);
  }
  else if(isObj(selector)){
    objForEach(selector,resolve)
  }
  else throw Error('argument error');
  return FlipScope.global.immediate(literal.join('\n'));
  function resolve(rule,selector){
    var str=getStyleRuleStr(resolveCss(rule),selector,'\n',1);
    if(str)literal.push(str);
  }
};
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
function normalizeMapArgs(args){
  var ret={},arg;
  if(args.length==2){
    ret[args[0]]=args[1];
  }
  else if(isFunc(arg=args[0])||!hasNestedObj(arg)){
    ret['&']=arg;
  }
  else if(!isObj(arg)) throw Error('argument Error');
  //isNestedObj
  else{
    ret=arg;
  }
  return ret;
}
function hasNestedObj(obj){
  return isObj(obj)&&Object.getOwnPropertyNames(obj).some(function(key){
      var t=typeof obj[key];
      return t=="object"||t=="function"
    });
}
Flip.Animation=Animation;

