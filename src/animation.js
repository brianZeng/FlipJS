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
  this._immutable={};
  this._variable={};
  this._param={};
  this.current={};
  this.use(opt);
  this.init();
}
inherit(Animation,Render, {
  get percent(){
    return this.clock.value||0;
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
    this._canceled=this._finished=false;
    this.invalid();
  },
  reset:function(skipInit){
    var clock;
    if(clock=this.clock)
      clock.reset(1);
    if(!skipInit)
      this.init();
    return this;
  },
  use:function(opt){
    useAniOption(this,opt);
    return this;
  },
  param:function(key,value,immutable){
    if(isObj(key))
      cloneWithPro(key,this[value?'_immutable':'_variable']);
    else if(typeof key==="string")
      this[immutable?'_immutable':'_variable'][key]=value;
    return this;
  },
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
    {
      this._ltName=task.name;
      task.toFinalize(this);
    }
    else if(!this._canceled) {
      this.reset(1);
      this.emit(ANI_EVT.FINALIZE);
    }
    return this;
  },
  getStyleRule:function(){
    return getAnimationStyle(this);
  },
  start:function(){
    findTaskToAddOrThrow(this);
    return this._canceled? this.restart():invokeClock(this,'start');
  },
  resume:function(evt){
    return invokeClock(this,'resume',ANI_EVT.RESUME,evt);
  },
  pause:function(evt){
    return invokeClock(this,'pause',ANI_EVT.PAUSE,evt);
  },
  cancel:function(evt){
    var t;
    if(!this._canceled &&!this._finished){
      if(t=this._task)this._ltName=t.name;
      this._canceled=true;
      this.emit(ANI_EVT.CANCEL,evt);
      this.finalize();
    }
    return this;
  },
  restart:function(opt){
    findTaskToAddOrThrow(this,opt);
    this.clock.reset();
    this.init();
    return this.start();
  },
  then:function(onFinished,onerror){
    return this.promise.then(onFinished,onerror);
  }
});
var ANI_EVT=Animation.EVENT_NAMES =Object.seal({
  UPDATE: 'update',
  FINALIZE: 'finalize',
  RENDER: 'render',
  FINISH: 'finish',
  CANCEL:'cancel',
  PAUSE:'pause',
  RESUME:'resume'
});
function findTaskToAddOrThrow(ani,opt){
  var t,global;
  if(!(t=ani._task)){
    opt=opt||{};
    t=opt.task||(global=opt.global||FlipScope.global).getTask(opt.taskName||ani._ltName)||global.defaultTask;
    if(t instanceof RenderTask)
      t.add(ani);
    else
      throw Error('please specify the render task for animation to restart');
  }return t;
}
function invokeClock(animation,method,evtName,evtArg){
  var clock=animation.clock;
  if(clock){
    clock[method]();
    if(evtName) animation.emit(evtName,evtArg);
  }
  return animation;
}
function getPromiseByAni(ani){
  return FlipScope.Promise(function(resolve,reject){
    ani.once(ANI_EVT.FINISH,function(state){
      if(state&&state.global)
        state.global.once('frameEnd',go);
      else go();
    }).once(ANI_EVT.CANCEL,function(){reject(ani)});
    function go(){resolve(ani);}
  });
}
function cloneWithPro(from,to){
  var pro,getter;
  to=to||{};
  objForEach(from,function(value,key){
    if((pro=Object.getOwnPropertyDescriptor(from,key))&&(typeof (getter=pro.get)=="function"))
      Object.defineProperty(to,key,{get:getter});
    else to[key]=value
  });
  return to;
}
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
  aniOpt.autoStart!==false && animation.start();
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
    var beforeCallBase, name = definition.name, Constructor;
    beforeCallBase = definition.beforeCallBase || _beforeCallBase;
    Constructor = function (opt) {
      if (!(this instanceof Constructor))return new Constructor(opt);
      var proxy = createProxy(opt);
      beforeCallBase.apply(this, [proxy, opt]);
      Animation.call(this,opt);
    };
    if (name) {
      register[name] = Constructor;
      Constructor.name = name;
    }
    inherit(Constructor, Animation.prototype,{
      type:definition.name,
      use:function(opt){
        return useAniOption(this,definition,opt);
      }
    });
    return Constructor;
  }
  return register;
  function _beforeCallBase(proxy, opt, instance) {
    return proxy;
  }
})();
function useAniOption(animation){
  for(var i= 1,opt=arguments[1],optPro;opt;opt=arguments[++i])
  {
    useAniOption.pros.forEach(function(proName){
      if(isFunc(optPro=opt[proName]))
        animation[proName](optPro);
      else if(isObj(optPro)){
        hasNestedObj(optPro)? objForEach(optPro,function(rule,slt){animation[proName](slt,rule)})
          :animation[proName](obj);
      }});
    animation.param(opt.param).param(opt.variable).param(opt.immutable,true);
  }
  return animation;
}
useAniOption.pros=['transform','css','on','once'];
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

