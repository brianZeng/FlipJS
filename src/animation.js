/**
 * Created by 柏然 on 2014/12/13.
 */
function Animation(opt) {
  if (!(this instanceof Animation))return new Animation(opt);
  var r = Animation.createOptProxy(opt).result;
  this.selector= r.selector||Error('Elements selector required');
  this.clock = r.clock;
  this.lastStyleRule='';
  this.keepWhenFinished= r.keepWhenFinished;
  this._cssMap={};
  this._matCallback={};
  this._cssCallback={};
  this.init(opt);
}
Animation.createOptProxy = function (setter) {
  setter = createProxy(setter);
  if (!setter.proxy.clock)
    setter('clock', new Clock(setter));
  setter('selector');
  setter('keepWhenFinished');
  return setter;
};
Flip.ANIMATION_TYPE = {};
Animation.EVENT_NAMES = {
  UPDATE: 'update',
  DESTROY: 'destroy',
  RENDER: 'render',
  FINISHED: 'finished'
};
(function () {
  var idCache = {};

  function main() {
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
    return setAniEnv(main.createOptProxy(opt, 0, 0, 1).result, new constructor(opt));
  }

  function setAniEnv(aniOpt, animation) {
    var global = FlipScope.global;
    if (aniOpt.defaultGlobal)
      (global._tasks.findBy('name', aniOpt.taskName) || global.activeTask).add(animation);
    if (aniOpt.autoStart) animation.start();
    return animation;
  }
  main.createOptProxy = function (setter, autoStart, taskName, defaultGlobal) {
    setter = createProxy(setter);
    setter('autoStart', autoStart, 'taskName', taskName, 'defaultGlobal', defaultGlobal);
    return setter;
  };
  Flip.animate = main;
  function getCSS(ele) {
    return ele.currentStyle || window.getComputedStyle(ele)
  }

  function getAniId(type) {
    type = type || 'Animation';
    var i = idCache[type] || 0;
    idCache[type] = i++;
    return '_F_' + type + ':' + i;
  }

  function invalidWhenTick(state) {
    state.animation.invalid();
    state.animation.emit(Animation.EVENT_NAMES.UPDATE, state);
  }

  function removeWhenFinished(state) {
    var ani = state.animation;
    updateAnimationCss(ani,state);
    ani.render(state);
    ani.emit(Animation.EVENT_NAMES.FINISHED, state);
    this._promise=null;
    if(ani.keepWhenFinished){
      state.global.on(RenderGlobal.EVENT_NAMES.FRAME_START,function(styleRule){
        return function(state){
          state.styleStack.push(styleRule);
        }
      }(ani.lastStyleRule))
    }
    else ani.destroy(state);
  }
  function updateAnimation(animation,renderState){
    renderState.animation=animation;
    animation.clock.update(renderState);
    updateAnimationCss(animation,renderState);
    renderState.animatetion=null;
  }
  function updateAnimationCss(animation,renderState){
    var cssMap=animation._cssMap,ts=animation.selector;
    objForEach(animation._cssCallback,function(cbs,selector){
      var cssRule={};
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
        var key=se.replace(/&/g,ts),cssObj=cssMap[key]||(cssMap[key]={});
        cssObj.transform=matRule;
      });
    });
  }
  function addMap(key,Map,cb){
    var cbs=Map[key];
    if(!cbs)Map[key]=[cb];
    else arrAdd(cbs,cb);
  }
  inherit(Animation, Flip.util.Object, {
    set clock(c) {
      var oc = this._clock;
      c = c || null;
      if (oc == c)return;
      if (oc && c)throw Error('remove the animation clock before add a new one');
      this._clock = c;
      //add a clock
      if (c) {
        c.ontick = invalidWhenTick;
        c.on(Clock.EVENT_NAMES.FINISHED, removeWhenFinished);
        c.controller = this;
      }//remove a clock
      else if (oc) {
        oc.off(Clock.EVENT_NAMES.TICK, invalidWhenTick);
        oc.off(Clock.EVENT_NAMES.FINISHED, removeWhenFinished);
        oc.controller = null;
      }
    },
    get clock() {
      return this._clock;
    },
    get promise(){
      var v=this._promise;
      if(!v)v=this._promise=animationPromise(this);
      return v;
    },
    get finished() {
      var clock;
      return (clock = this.clock) ? clock.finished : true;
    },
    get id() {
      if (!this._id)this._id = getAniId(this.type);
      return this._id;
    },
    get elements() {
      return Flip.$(this.selector);
    },
    init:function(){},
    mat:function(selector,matCallback){
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
      if(typeof cssCallBack=="object"){
        var cssTo=cssCallBack;
        cssCallBack=function(cssObj){
          objForEach(cssTo,cloneFunc,cssObj);
        }
      }
      addMap(selector,this._cssCallback,cssCallBack);
      return this;
    },
    update: function (state) {
      updateAnimation(this,state);
      return true;
    },
    render: function (state) {
      state.animation = this;
      this.apply(state);
      this.emit(Animation.EVENT_NAMES.RENDER, state);
      state.animation = null;
    },
    invalid: function () {
      if (this._task) this._task.invalid();
    },
    destroy: function (state) {
      var task, clock;
      if (task = this._task)
        task.remove(this);
      if ((clock = this.clock))clock.emit(Animation.EVENT_NAMES.DESTROY, state);
      this.off();
      this.clock = null;
      Animation.apply(this,[{selector:this.selector}]);
    },
    getStyleRule:function(){
      var styles=[];
      objForEach(this._cssMap,function(ruleObj,selector){
        var rules=[];
        objForEach(ruleObj,function(sty,name){rules.push(name+":"+sty)});
        if(rules.length){
          styles.push(selector+'\n{\n'+rules.join(';\n')+'}');
        }
      });
      return this.lastStyleRule=styles.join('\n');
    },
    apply: function (state) {
      state.styleStack.push(this.getStyleRule());
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
    then:function(onFinished){
      return this.promise.then(onFinished);
    },
    fellow:function(onFinished){
      this.then(onFinished);
      return this;
    }
  });
})();
Flip.animation = (function () {
  function register(option) {
    var beforeCallBase, defParam, name = option.name, Constructor;
    beforeCallBase = option.beforeCallBase || _beforeCallBase;
    defParam = option.defParam || {};
    Constructor = function (opt) {
      if (!(this instanceof Constructor))return new Constructor(opt);
      var proxy = createProxy(opt);
      objForEach(defParam, function (value, key) {
        proxy(key, value)
      });
      objForEach(proxy.result, cloneFunc, this);
      beforeCallBase.apply(this, [proxy, opt]);
      Animation.call(this, opt);
    };
    if (name) {
      register[name] = Constructor;
      Constructor.name = name;
    }
    inherit(Constructor, Animation.prototype,{
      init:function(){
        addHandler(option,this,'mat');
        addHandler(option,this,'css');
      }
    });
    return Constructor;
  }
  return register;
  function _beforeCallBase(proxy, opt, instance) {
    return proxy;
  }
  function addHandler(opt,animation,pro){
    var map=opt[pro];
    if(typeof map==="function"){
      animation[pro](map);
    }else{
      objForEach(map,function(handler,selector){
        animation[pro](selector,handler)
      })
    }
  }

})();
function animationPromise(animation){
  var pending=[],resolved;
  function resolve(animation){
    if(!resolved){
      if(!animation.finished)
        animation.once('finished',function(renderState){
          pending.forEach(function(call){call(renderState);});
        });
    }
  }
  function promise(animation){
    if(!resolved&&animation instanceof Animation){
      resolve(animation);
      resolved=animation;
    }
    return resolved;
  }
  promise.then=function(callbackOrAnimation){
    var promise=animationPromise(),callback;
    if(callbackOrAnimation instanceof Animation)
      callback=function(){return callbackOrAnimation};
    else if(typeof callbackOrAnimation==="function")
      callback=callbackOrAnimation;
    else throw ('argument should be function or animation');
    pending.push(function(renderState){
      var opt={autoStart:true},ani=callback(renderState,opt);
      if(ani instanceof Animation){
        if(opt.autoStart) ani.start();
        promise(ani);
      }
    });
    return promise;
  };
  promise(animation);
  return promise;
}

