(function(){var FlipScope = {readyFuncs: []};
function Flip () {
  var first = arguments[0], readyFuncs = FlipScope.readyFuncs;
  if (typeof first === "function") readyFuncs ? arrAdd(FlipScope.readyFuncs, first) : first(Flip);
}
Object.defineProperty(Flip, 'instance', {get: function () {
  return FlipScope.global;
}});
Flip.fallback = function (window) {
  if (!window.requestAnimationFrame)
    window.requestAnimationFrame = function (callback) {
      setTimeout(callback, 30);
    };
  if (!window.Float32Array) {
    window.Float32Array = inherit(function (lengthOrArray) {
      if (!(this instanceof arguments.callee))return new arguments.callee(lengthOrArray);
      var i = 0, from, len;
      if (typeof lengthOrArray === "number") {
        from = [0];
        len = lengthOrArray;
      } else
        len = (from = lengthOrArray).length;
      for (i; i < len; i++)
        this[i] = from[i] || 0;
    }, Array.prototype)
  }
};
if (typeof module !== "undefined" && module.exports)
  module.exports = Flip;
else if (window) window.Flip = Flip;

Flip.util = {Object: obj, Array: array, inherit: inherit};
function createProxy(obj) {
  var from, result = {}, func, objType = typeof obj;
  if (objType == "function")from = obj.proxy;
  else if (objType == "object") from = obj;
  else from = {};
  func = function () {
    for (var i = 0, v, prop, value, len = arguments.length; i < len; i += 2) {
      prop = arguments[i];
      value = arguments[i + 1];
      if (!from.hasOwnProperty(prop)) {
        v = value;
        delete from[prop];
      }
      else v = from[prop];
      result[prop] = v;
    }
    if(len==1)
      return v;
  };
  func.source = function () {
    if (arguments.length == 1)return from[arguments[0]];
    for (var i = 0, prop, len = arguments.length; i < len; i += 2) {
      prop = arguments[i];
      if (!from.hasOwnProperty(prop))from[prop] = arguments[i + 1];
    }
    return from[arguments[0]];
  };
  func.result = result;
  func.proxy = from;
  return func;
}
function inherit(constructor, baseproto, expando, propertyObj) {
  if (typeof  baseproto == "function")baseproto = new baseproto();
  baseproto = baseproto || {};
  var proto = constructor.prototype = Object.create(baseproto), proDes;
  if (expando)
    for (var i in expando) {
      proDes = Object.getOwnPropertyDescriptor(expando, i);
      if (proDes) Object.defineProperty(proto, i, proDes);
      else
        proto[i] = expando[i];
    }
  if (propertyObj)
    obj.forEach(propertyObj, function (key, value) {
      Object.defineProperty(proto, key, value);
    });
  return constructor;
}

function array(arrayLike) {
  if (!(this instanceof array))return new array(arrayLike);
  if (arrayLike && arrayLike.length)
    for (var i = 0, len = arrayLike.length; i < len; i++)
      this[i] = arrayLike[i];
}
function arrAdd(array, item) {
  var i = array.indexOf(item);
  if (i == -1)
    return !!array.push(item);
  return false;
}
function arrSort(array, func_ProName, des) {
  var compare = arrMapFun(func_ProName);
  return array.sort(des ? function (a, b) {
    return compare(a) < compare(b)
  } : function (a, b) {
    return compare(a) > compare(b)
  });
}

function arrUnique(array, func_ProName) {
  var compare = arrMapFun(func_ProName);
  return array.reduce(function (r, item) {
    var res = compare(item);
    if (r.indexOf(res) == -1)r.push(item);
    return r;
  }, []);
}
function arrFirst(array, func_ProName) {
  for (var i = 0, item, len = array.length, compare = arrMapFun(func_ProName); i < len; i++)
    if (compare(item = array[i]))return item;
}
function arrRemove(array, item) {
  var i = array.indexOf(item);
  if (i >= 0)
    return !!array.splice(i, 1);
  return false;
}
function arrMapFun(func_ProName) {
  var ct = typeof func_ProName;
  if (ct === "string")return function (item) {
    return item[func_ProName]
  };
  else if (ct === "function")return func_ProName;
  return function (item) {
    return item
  };
}
function arrSameSeq(arr, func_ProName, des) {
  if (arr.length == 1)return true;
  var compare = arrMapFun(func_ProName);
  des = !!des;
  for (var i = 1, len = arr.length; i < len; i++)
    if (des != (compare(arr[i]) < compare(arr[i - 1])))return false;
  return true;
}
array.remove = arrRemove;
array.add = arrAdd;
array.first = arrFirst;
function mapProName(proNameOrFun) {
  if (typeof proNameOrFun == "function")return proNameOrFun;
  else if (proNameOrFun && typeof proNameOrFun == "string")
    return function (item) {
      return item ? item[proNameOrFun] : undefined;
    };
  else return function (item) {
      return item;
    }
}
function arrFind(array, proNameOrFun, value, unstrict,index) {
  var fun = mapProName(proNameOrFun), i, item;
  if(value===undefined)value=true;
  if (unstrict) {
    for (i = 0, item = array[0]; item; item = array[++i]) if (fun(item) == value)return index? i:item;
  }
  else {
    for (i = 0, item = array[0]; item; item = array[++i]) if (fun(item) === value)return index? i:item;
  }
  return undefined;
}
array.findBy = arrFind;
function arrSafeFilter(array, filter, thisObj) {
  var copy = array.slice();
  if (thisObj == undefined)thisObj = array;
  return copy.filter(filter, thisObj).filter(function (item) {
    return array.indexOf(item) > -1;
  }).concat(array.filter(function (item) {
    return copy.indexOf(item) == -1;
  }));
}
array.safeFilter = arrSafeFilter;
array.sort = arrSort;
inherit(array, Array, {
  add: function (item) {
    return arrAdd(this, item);
  },
  findBy: function (proNameOrFun, value, unstrict) {
    return arrFind(this, proNameOrFun, value, unstrict);
  },
  remove: function (item) {
    return arrRemove(this, item);
  },
  safeFilter: function (callback, thisObj) {
    return arrSafeFilter(this, callback, thisObj);
  },
  first: function (func_proName) {
    return arrFirst(this, func_proName);
  }
});

function obj(from) {
  if (!(this instanceof obj))return new obj(from);
  if (typeof from === "object")
    objForEach(from, function (value, key) {
      var pro;
      if (pro = Object.getOwnPropertyDescriptor(from, key))
        Object.defineProperty(this, key, pro);
      else this[key] = value;
    }, this);
}
function addEventListener(obj, evtName, handler) {
  if (typeof evtName == "string" && evtName && typeof handler == "function") {
    var cbs, hs;
    if (!obj.hasOwnProperty('_callbacks'))obj._callbacks = {};
    cbs = obj._callbacks;
    if (!(hs = cbs[evtName]))hs = cbs[evtName] = [];
    arrAdd(hs, handler);
  }
  return obj;
}
obj.on = addEventListener;
function emitEvent(obj, evtName, argArray, thisObj) {
  var callbacks , handlers;
  if (!(obj.hasOwnProperty('_callbacks')) || !(handlers = (callbacks = obj._callbacks)[evtName]))return false;
  if (!argArray)argArray = [];
  else if (!(argArray instanceof Array)) argArray = [argArray];
  if (thisObj === undefined) thisObj = obj;
  return (callbacks[evtName] = arrSafeFilter(handlers, function (call) {
    return call.apply(thisObj, argArray) != -1;
  })).length;
}
obj.emit = emitEvent;
function removeEventListener(obj, evtName, handler) {
  var cbs, hs;
  if (evtName === undefined)delete obj._callbacks;
  else if ((cbs = obj._callbacks) && (hs = cbs[evtName]) && hs) {
    if (handler) array.remove(hs, handler);
    else delete cbs[evtName];
  }
  return obj;
}
obj.off = removeEventListener;
function addEventListenerOnce(obj, evtName, handler) {
  if (typeof handler == "function")
    obj.on(evtName, function () {
      handler.apply(obj, arguments);
      return -1;
    });
  return obj;
}
obj.once = addEventListenerOnce;
function objForEach(object, callback, thisObj, arg) {
  if (isObj(object)) {
    if (thisObj == undefined)thisObj = object;
    if(object instanceof Array) object.forEach(callback,thisObj);
    else
      for (var i = 0, names = Object.getOwnPropertyNames(object), name = names[0]; name; name = names[++i])
        callback.apply(thisObj, [object[name], name, arg]);
  }
  return object;

}
obj.forEach = objForEach;
inherit(obj, null, {
  on: function (evtName, handler) {
    return addEventListener(this, evtName, handler);
  },
  emit: function (evtName, argArray, thisObj) {
    return emitEvent(this, evtName, argArray, thisObj);
  },
  off: function (evtName, handler) {
    return removeEventListener(this, evtName, handler);
  },
  once: function (evtName, handler) {
    return addEventListenerOnce(this, evtName, handler);
  },
  forEach: function (callback, thisObj, arg) {
    return objForEach(this, callback, thisObj, arg);
  }
});
function cloneFunc(value, key) {
  this[key] = value;
}
function isFunc(value){return typeof value==="function"}
function isObj(value){return (typeof value==="object") && value}

function Vec(arrayOrNum) {
  if (!(this instanceof Vec))return new Vec(arrayOrNum);
  if (arrayOrNum instanceof Array)
    this.push.apply(this, arrayOrNum);
  else if (!isNaN(arrayOrNum)) {
    this.length = arrayOrNum;
    for (var i = 0; i < arrayOrNum; i++)
      this[i] = 0;
  }
}
Vec.add = function (v1, v2) {
  for (var i = 0, len = v1.length, r = new Vec(len); i < len; i++)
    r[i] = v1[1] + v2[i] || 0;
  return r;
};
Vec.dot = function (v1, v2OrNum) {
  if (typeof v2OrNum === "number")
    for (var i = 0, len = v1.length, r = new Vec(len); i < len; i++)
      r[i] = v1[i] * v2OrNum;
  else
    for (i = 0, len = v1.length, r = 0; i < len; i++)
      r += v1[i] * v2OrNum[i];
  return r;
};
Vec.multi = Vec.concat = function (v1, v2) {
  if (v2 instanceof Matrix)return Vec.multiMat(v1, v2);
  for (var i = 0, len = v1.length, r = new Vec(len); i < len; i++)
    r [i] = v1[i] * v2[i];
  return r;
};
Vec.get = function (vec, index) {
  if (isNaN(index))
    if ('x' === index)return vec.hasOwnProperty('x') ? vec.x : vec[0];
    else if ('y' === index) return vec.hasOwnProperty('y') ? vec.y : vec[1];
    else return undefined;
  return vec[index];
};
Vec.multiMat = function (vec, mat) {
  var row = vec.length, col, sum, r;
  if (row !== mat.row)return NaN;
  col = mat.col;
  r = new Vec(row);
  for (var iCol = 0; iCol < col; iCol++) {
    sum = 0;
    for (var iRow = 0; iRow < row; iRow++)
      sum += vec[iRow] * mat[iRow][iCol];
    r[iCol] = sum;
  }
  return r;
};
inherit(Vec, [], {
  clone: function () {
    return new Vec(this);
  },
  toString: function () {
    return this.map(function (a) {
      return a.toFixed(2).replace('.00', '  ')
    }).join(' ');
  },
  add: function (vec) {
    return Vec.add(this.clone(), vec);
  },
  dot: function (vecOrNum) {
    return Vec.dot(this, vecOrNum);
  },
  multi: function (a) {
    if (typeof a === "number")return Vec.dot(this, a);
    return Vec.multi(this, a);
  }
});
Flip.Vec = Vec;
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


function Clock(opt) {
  if (!(this instanceof Clock))return new Clock(opt);
  objForEach(Clock.createOptProxy(opt, 1, Clock.EASE.linear, 0, 0, 0,0).result, cloneFunc, this);
  this.reset();
}
Flip.Clock = Clock;
Clock.createOptProxy = function (opt, duration, timingFunction, infinite, iteration, autoReverse,delay) {
  var setter = createProxy(opt);
  setter('duration', duration, 'timingFunction', timingFunction, 'infinite', infinite, 'iteration', iteration, 'autoReverse', autoReverse,'delay',delay);
  return setter;
};

(function (EVTS) {
  Object.seal(EVTS);
  inherit(Clock, obj, {
    get controller() {
      return this._controller || null;
    },
    set controller(c) {
      var oc = this.controller;
      c = c || null;
      if (oc === c)return;
      this._controller = c;
      this.emit(EVTS.CONTROLLER_CHANGED, {before: oc, after: c, clock: this});
    },
    get started(){
      return this._startTime!==-1;
    },
    get finished() {
      return this._finished;
    },
    get paused() {
      return this._paused;
    },
    get timingFunction() {
      return this._tf;
    },
    set timingFunction(src) {
      var tf;
      if ((isFunc(tf=src))||(tf = Clock.EASE[src]))
        this._tf = tf;
    },
    start: function () {
      if (this.t == 0) {
        this.reset(0, 1).emit(EVTS.START, this);
        return !(this._finished=false);
      }
      return false;
    },
    reverse: function () {
      if (this.t == 1) {
        this.reset(0, 1, 1, 1,1).emit(EVTS.REVERSE, this);
        return true;
      }
      return false;
    },
    restart: function () {
      this.t = 0;
      return this.start();
    },
    reset: function (finished, keepIteration,delayed, atEnd, reverseDir, pause) {
      this._startTime = -1;
      if (!keepIteration)
        this.i = this.iteration;
      this._delayed=!!delayed;
      this.d = !reverseDir;
      this.t = this.value = atEnd ? 1 : 0;
      this._paused = !!pause;
      this._finished=!!finished;
      return this;
    },
    finish: function (evtArg) {
      this.emit(EVTS.FINISHED, evtArg);
      this.reset(1,1,1,1);
      this._finished=true;
    },
    end: function (evtArg) {
      this.autoReverse ? this.reverse(evtArg) : this.iterate(evtArg);
    },
    iterate: function (evtArg) {
      if (this.infinite)this.toggle();
      else if (0 < this.i--) {
        this.emit(EVTS.ITERATE, evtArg);
        this.reset(0, 1,1);
      }
      else this.finish(evtArg);
    },
    pause: function () {
      if (!this._paused) {
        this._pausedTime = -1;
        this._pausedDur = 0;
        this._paused = true;
      }
    },
    restore: function () {
      if (this._paused && this._startTime > 0) {
        this._startTime += this._pausedDur;
        this._paused = false;
      }
    },
    toggle: function () {
      if (this.t == 0)
        this.start();
      else if (this.t == 1)
        this.reverse();
    },
    finalize:function(){
      var task;
      if(task=this._task)
        task.toFinalize(this);
      else{
        this.reset(1);
        this.emit(EVTS.FINALIZED);
      }
    },
    update:function(state){
      var task;
      if(this.finished&&(task=this._task)){
        task.toFinalize(this);
      }else{
        updateClock(state.clock=this,state);
        state.clock=null;
      }
    }
  });
  objForEach(EVTS, function (evtName, key) {
    Object.defineProperty(this, 'on' + evtName, {
      set: function (func) {
        this.on(EVTS[key], func);
      }
    })
  }, Clock.prototype);
})(Clock.EVENT_NAMES = {
  UPDATE: 'update',
  ITERATE: 'iterate',
  START: 'start',
  REVERSE: 'reverse',
  TICK: 'tick',
  FINISHED: 'finished',
  FINALIZED:'finalized',
  CONTROLLER_CHANGED: 'controllerChanged'
});
function updateClock(c,state) {
  if (c&&!c.finished) {
    var timeline = state.timeline;
    if (c._startTime == -1) {
      c._startTime = timeline.now;
      c.emit(Clock.EVENT_NAMES.START, state);
      if(c.controller)c.controller.emit(Clock.EVENT_NAMES.START,state);
    }
    else if (c._paused) {
      var pt = c._pausedTime;
      pt == -1 ? c._pausedTime = timeline.now : c._pausedDur = timeline.now - pt;
      return false;
    }
    var dur = (timeline.now - c._startTime) / timeline.ticksPerSecond - (c._delayed? 0:c.delay),
      curValue, evtArg;
    if (dur > 0) {
      var ov = c.value, t;
      //only delay once
      if(!c._delayed){
        c._delayed=1;
        c._startTime+=c.delay*timeline.ticksPerSecond;
      }
      t = c.t = c.d ? dur / c.duration : 1 - dur / c.duration;
      if (t > 1)t = c.t = 1;
      else if (t < 0)t = c.t = 0;
      curValue = c.value = c.timingFunction(t);
      evtArg = Object.create(state);
      evtArg.clock = c;
      evtArg.currentValue = curValue;
      evtArg.lastValue = ov;
      if (ov != curValue) c.emit(Clock.EVENT_NAMES.TICK, evtArg);
      if (t == 1)c.end(evtArg);
      else if (t == 0)c.iterate(evtArg);
      state.task.invalid();
      return true;
    }
    return true;
  }
}

Flip.EASE = Clock.EASE = (function () {
  /**
   * from jQuery.easing
   * @lends Clock.EASE
   * @lends Flip.EASE
   * @enum {function}
   * @property {function} linear
   * @property {function} zeroStep
   * @property {function} halfStep
   * @property {function} oneStep
   * @property {function} random
   * @property {function} randomLimit
   * @property {function} backOut
   * @property {function} backIn
   * @property {function} backInOut
   * @property {function} cubicOut
   * @property {function} cubicIn
   * @property {function} cubicInOut
   * @property {function} expoOut
   * @property {function} expoIn
   * @property {function} expoInOut
   * @property {function} circOut
   * @property {function} circIn
   * @property {function} circInOut
   * @property {function} sineOut
   * @property {function} sineIn
   * @property {function} sineInOut
   * @property {function} bounceOut
   * @property {function} bounceIn
   * @property {function} bounceInOut
   * @property {function} elasticOut
   * @property {function} elasticIn
   * @property {function} elasticInOut
   * @property {function} quintOut
   * @property {function} quintIn
   * @property {function} quintInOut
   * @property {function} quartOut
   * @property {function} quartIn
   * @property {function} quartInOut
   * @property {function} quadOut
   * @property {function} quadIn
   * @property {function} quadInOut
   */
  var F = {
    linear: function (t) {
      return t;
    },
    zeroStep: function (t) {
      return t <= 0 ? 0 : 1;
    },
    halfStep: function (t) {
      return t < .5 ? 0 : 1;
    },
    oneStep: function (t) {
      return t >= 1 ? 1 : 0;
    },
    random: function () {
      return Math.random();
    },
    randomLimit: function (t) {
      return Math.random() * t;
    }
  };
  var pow = Math.pow, PI = Math.PI;
  (function (obj) {
    objForEach(obj, function (func, name) {
      var easeIn = func;
      F[name + 'In'] = easeIn;
      F[name + 'Out'] = function (t) {
        return 1 - easeIn(t);
      };
      F[name + 'InOut'] = function (t) {
        return t < 0.5 ? easeIn(t * 2) / 2 : 1 - easeIn(t * -2 + 2) / 2;
      };
    });
  })({
    back: function (t) {
      return t * t * ( 3 * t - 2 );
    },
    elastic: function (t) {
      return t === 0 || t === 1 ? t : -pow(2, 8 * (t - 1)) * Math.sin(( (t - 1) * 80 - 7.5 ) * PI / 15);
    },
    sine: function (t) {
      return 1 - Math.cos(t * PI / 2);
    },
    circ: function (t) {
      return 1 - Math.sqrt(1 - t * t);
    },
    cubic: function (t) {
      return t * t * t;
    },
    expo: function (t) {
      return t == 0 ? 0 : pow(2, 10 * (t - 1));
    },
    quad: function (t) {
      return t * t;
    },
    quart: function (t) {
      return pow(t, 4)
    },
    quint: function (t) {
      return pow(t, 5)
    },
    bounce: function (t) {
      var pow2, bounce = 4;
      while (t < ( ( pow2 = pow(2, --bounce) ) - 1 ) / 11);
      return 1 / pow(4, 3 - bounce) - 7.5625 * pow(( pow2 * 3 - 2 ) / 22 - t, 2);
    }
  });

  return Object.freeze(F);
})();
(function (Flip) {
  function $(slt, ele) {
    var r = [], root = ele || document;
    if (slt)
      slt.split(',').forEach(function (selector) {
        r.push.apply(r, r.slice.apply(root.querySelectorAll(selector)))
      });
    return r;
  }

  Flip.$ = Flip.$ = $;
  document.addEventListener('DOMContentLoaded', function () {
    FlipScope.global.init();
    FlipScope.readyFuncs.forEach(function (callback) {
      callback(Flip);
    });
    FlipScope.readyFuncs = null;
  });
})(Flip);

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
    objForEach(global._tasks,function(task){renderTask(task,state);});
    global._styleElement.innerHTML=state.styleStack.join('\n');
    global._invalid=false;
  }
  objForEach(global._tasks,function(task){finalizeTask(task,state)});
}
FlipScope.global = new RenderGlobal();


function Mat3(arrayOrMat3) {
  if (!(this instanceof Mat3))return new Mat3(arrayOrMat3);
  var s, d;
  if (arrayOrMat3) {
    if (arrayOrMat3.elements)
      s = arrayOrMat3.elements;
    else s = arrayOrMat3;
    d = new Float32Array(s);
  }
  this.elements = d || new Float32Array([1, 0, 0, 0, 1, 0]);
}
Flip.Mat3 = Mat3;
Mat3.set = function (x1, x2, y1, y2, dx, dy) {
  return new Mat3([x1, y1, dx, x2, y2, dy]);
};
Mat3.setTranslate = function (dx, dy) {
  return new Mat3([1, 0, dx || 0, 0, 1, dy || 0]);
};
Mat3.setScale = function (x, y) {
  return new Mat3([x || 1, 0, 0, 0, y || 1, 0]);
};
Mat3.setFlip=function(angle,vertical){
  var sin = Math.sin(angle), cos = Math.cos(angle);
  return new Mat3(vertical ? [cos, 0, 0, sin, 1, 0] : [1, -sin, 0, 0, cos, 0])
};
Mat3.setRotate = function (angle) {
  if (typeof angle == "string") {
    var match = angle.match(/^((\d+(\.\d+)?)|(\.\d+))d|deg/i);
    if (match) angle = (parseFloat(match[1]) / 180) * Math.PI;
  }
  angle = parseFloat(angle) || 0;
  var a00 = 1, a01 = 0, a02 = 0, a10 = 0, a11 = 1, a12 = 0, s = Math.sin(angle), c = Math.cos(angle), out = [];
  out[0] = c * a00 + s * a10;
  out[1] = c * a01 + s * a11;
  out[2] = c * a02 + s * a12;

  out[3] = c * a10 - s * a00;
  out[4] = c * a11 - s * a01;
  out[5] = c * a12 - s * a02;
  return new Mat3(out);
};
function getFloat(d) {
  return parseFloat(d).toFixed(5);
}
Mat3.prototype = {
  toString: (function (seq) {
    return function () {
      var e = this.elements, r = seq.map(function (i) {
        return getFloat(e[i])
      });
      return 'matrix(' + r.join(',') + ')';
    }
  })([0, 3, 1, 4, 2, 5]),
  translate: function (dx, dy, overwrite) {
    return this.concat(Mat3.setTranslate(dx, dy), overwrite);
  },
  scale: function (x, y, overwrite) {
    return this.concat(Mat3.setScale(x, y), overwrite);
  },
  rotate: function (angle, overwrite) {
    return this.concat(Mat3.setRotate(angle), overwrite);
  },
  flip:function(angle,vertical,overwrite){
    return this.concat(Mat3.setFlip(angle,vertical),overwrite);
  },
  concat: function (mat3, overwrite) {
    var n = this.elements, e = mat3.elements, r;
    var m11 = e[0], m21 = e[1], mx = e[2], m12 = e[3], m22 = e[4], my = e[5],
      n11 = n[0], n21 = n[1], nx = n[2], n12 = n[3], n22 = n[4], ny = n[5];
    r = new Mat3([m11 * n11 + m12 * n21, m21 * n11 + m22 * n21, mx * n11 + my * n21 + nx, m11 * n12 + m12 * n22, m21 * n12 + m22 * n22, mx * n12 + my * n22 + ny]);
    if (overwrite) this.elements = new Float32Array(r.elements);
    return r;
  },
  set:function(x1, y1, dx, x2, y2, dy,overwrite){
    if(arguments.length<=2){
      var eles=x1;
      overwrite=arguments[1];
    }else{
      eles=[x1, y1, dx, x2, y2, dy];
    }
    if(overwrite) this.elements=new Float32Array(eles);
    return new Mat3(eles);
  }
};
(function(Flip){
  var strictRet=true,syncEnqueue;
  function enqueue(callback){
   syncEnqueue? callback():setTimeout(callback,0);
  }
  function Thenable(opt){
    if(!(this instanceof Thenable))return new Thenable(opt);
    this.then=opt.then;
    this.get=opt.get;
  }
  function castToPromise(value){
    if(value instanceof Animation)return value.promise;
    else if(value instanceof Array)return Promise.all(value.map(castToPromise));
    else if(likePromise(value))return value;
    throw Error('cannot cast to promise');
  }
  function resolvePromise(future){
    if(likePromise(future))return future;
    return new Thenable({
      then:function resolved(callback){
        try{
          return resolvePromise(castToPromise(acceptAnimation(callback(future))));
        }
        catch (ex){
          return rejectPromise(ex);
        }
      },
      get:function (proName){
        return proName? future[proName]:future;
      }
    })
  }
  function rejectPromise(reason){
    if(likePromise(reason))return reason;
    return new Thenable({
      then: function rejected(callback,errorback){
        try{
          return resolvePromise(errorback(reason));
        }
        catch (ex){
          return rejectPromise(ex);
        }
      }
    })
  }
  function Promise(resolver){
    if(!(this instanceof Promise))return new Promise(resolver);
    var resolvedPromise,pending=[],ahead=[],resolved;
    if(typeof resolver==="function")
        resolver(resolve,reject);
    else
      return acceptAnimation(resolver);
    function resolve(future){
      try{
        receive(acceptAnimation(future));
      }
      catch (ex){
        receive(undefined,ex);
      }
    }
    function reject(reason){
      receive(undefined,reason||new Error(''));
    }
    function receive(future,reason){
      if(!resolved){
        resolvedPromise=reason==undefined?resolvePromise(future):rejectPromise(reason);
        resolved=true;
        for(var i= 0,len=pending.length;i<len;i++)
        {
          enqueue(function(args,con){
            return function(){
              var ret=resolvedPromise.then.apply(resolvedPromise,args);
              if(con)ret.then.apply(ret,con);
            }
          }(pending[i],ahead[i]))
        }
        pending=ahead=undefined;
      }
    }
    function next(resolve,reject){
      ahead.push([resolve,reject]);
    }
    return new Thenable({
      then:function(thenable,errorBack){
        var _success=ensureThenable(thenable,function(v){return v}),
          _fail=ensureThenable(errorBack,function(e){throw e});
        if(resolvedPromise){
          enqueue(function(){resolvedPromise.then(_success,_fail); });
          return new Promise(function(resolver){resolvedPromise.then(resolver); })
        }
        else{
          pending.push([_success,_fail]);
          return new Promise(function(resolve,reject){next(resolve,reject);})
        }
      },
      get:function(proname){
        return resolvedPromise? resolvedPromise.get(proname):undefined;
      }
    })
  }
  function ensureThenable(obj,def){
    var t;
    if((t=typeof obj)==="object")
      return function(){return obj;};
    else if(t==="function")return obj;
    return def;
  }
  function acceptAnimation(obj){
    var t,ani;
    if(strictRet){
      if(obj instanceof Animation)return obj;
      if((t=typeof obj)=="object"){
        if(likePromise(obj))return obj;
        else if(obj instanceof Array)
          return obj.map(acceptAnimation);
        else{
          ani=Flip.animate(obj);
          if(obj.autoStart!==false)ani.start();
          return ani.promise;
        }
      }
      else if(typeof t==="function")
        return acceptAnimation(obj());
      throw Error('cannot cast to animation');
    }
    return obj;
  }
  function likePromise(obj){return obj instanceof Thenable}
  function promiseAll(promises){
    return new Promise(function(resolve,reject){
      var fail,num,r=new Array(num=promises.length);
      promises.forEach(function(promise,i){
        promise.then(function(pre){
          check(pre,i);
        },function(err){
          check(err,i,true);
        })
      });
      function check(value,i,error){
        if(!error){
          try{
            r[i]=value instanceof Animation? value:acceptAnimation(value);
          }
          catch (ex){
            error=ex;
         }
        }
        if(error){
          fail=true;
          r[i]=error;
        }
        if(num==1)fail? reject(r):resolve(r);
        else num--;
      }
    })
  }
  Promise.all=promiseAll;
  Promise.defer=function(){
    var defer={};
    defer.promise=Promise(function(resolver,rejector){
       defer.resolve=resolver;
       defer.reject=rejector;
    });
    return defer;
  };
  Promise.option=function(opt){
    if(!opt)return;
    strictRet=!!opt.acceptAnimationOnly;
    syncEnqueue=!!opt.sync;
  };
  FlipScope.Promise=Flip.Promise=Promise;
})(Flip);
function RenderTask(name) {
  if (!(this instanceof  RenderTask))return new RenderTask(name);
  this.name = name;
  this.timeline = new TimeLine(this);
  this._updateObjs = [];
  this._finalizeObjs=[];
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
  invalid: function () {
    var g;
    this._invalid = true;
    if(g=this._global)
      g.invalid();
  },
  toFinalize:function(obj){
   return this._updateObjs.indexOf(obj)>-1 && arrAdd(this._finalizeObjs,obj);
  },
  add: function (obj, type) {
    if (type == 'update') return arrAdd(this._updateObjs, obj);
    if (obj instanceof Clock || obj instanceof Animation)
      arrAdd(this._updateObjs, obj) && (obj._task = this);
  },
  remove: function (obj) {
    if (obj._task == this && arrRemove(this._updateObjs, obj)){
      obj._task = null;
      this.invalid();
    }
  }
});
function renderTask(task,state){
  var evtParam = [state, state.task=task];
  if (task._invalid) {
    task.emit(RenderTask.EVENT_NAMES.RENDER_START, evtParam);
    task._updateObjs.forEach(function (item) {
      if (item.render) item.render(state);
    });
    task._invalid = false;
  }
  task.emit(RenderTask.EVENT_NAMES.RENDER_END, evtParam);
}
function updateTask(task,state){
  var updateParam = [state, state.task=task];
  (state.timeline = task.timeline).move();
  task.emit(RenderTask.EVENT_NAMES.UPDATE, updateParam);
  task._updateObjs = arrSafeFilter(task._updateObjs, filterIUpdate, state);
}
function finalizeTask(task,state){
  var taskItems=(state.task=task)._updateObjs,index,finItems=task._finalizeObjs;
  if(finItems.length){
    task.invalid();
    finItems.forEach(function(item){
      if((index=taskItems.indexOf(item))!=-1)
        taskItems[index]=null;
      if(item._task==task)
        item._task=null;
      isObj(item)&&isFunc(item.finalize)&&item.finalize(state);
    });
    task._finalizeObjs=[];
  }
}
function filterIUpdate(item) {
  if (!isObj(item))return false;
  else if (isFunc(item.update))
    item.update(this);
  else if (isFunc(item.emit))
    item.emit(RenderTask.EVENT_NAMES.UPDATE, this);
  return true;
}
function TimeLine(task) {
  this.last = this.now = this._stopTime = 0;
  this._startTime = this._lastStop = Date.now();
  this.task = task;
  this._isStop = true;
}
inherit(TimeLine, Flip.util.Object, {
  ticksPerSecond: 1000,
  stop: function () {
    if (!this._isStop) {
      this._isStop = true;
      this._lastStop = Date.now();
    }
  },
  start: function () {
    if (this._isStop) {
      this._isStop = false;
      this._stopTime += Date.now() - this._lastStop;
    }
  },
  move: function () {
    if (!this._isStop) {
      this.last = this.now;
      this.now = Date.now() - this._startTime - this._stopTime;
    }
  }
});
var nextUid=(function(map){
  return function (type){
    if(!map[type])map[type]=1;
    return map[type]++;
  }
})({});
Flip.animation({
  name: 'flip',
  defParam: {
    vertical: true,
    angle: Math.PI
  },
  beforeCallBase: function (proxy) {
    proxy.source('timingFunction', Clock.EASE.sineInOut);
  },
  transform:function(){
    return Mat3.setFlip(this.angle*this.clock.value,this.vertical);
      /*var angle = this.angle * this.clock.value, sin = Math.sin(angle), cos = Math.cos(angle);
      return new Mat3(this.vertical ? [cos, 0, 0, sin, 1, 0] : [1, -sin, 0, 0, cos, 0])*/
  },
  css:{
    '&':{'transform-origin':'center'}
  }
});
(function (register) {
  function formatMoney(n, c, d, t) {
    var s = n < 0 ? "-" : "", i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", j;
    j = (j = i.length) > 3 ? j % 3 : 0;
    c = isNaN(c = Math.abs(c)) ? 2 : c;
    d = d == undefined ? "." : d;
    t = t == undefined ? "," : t;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
  }

  function mapValue(ele) {
    var v = ele.innerHTML || ele.value, d = v.replace(/\,|[^\d\.]/g, '');
    ele.unit = v.replace(/.*\d(.*)/, '$1');
    return parseFloat(d);
  }

  function applyValue(ele, value, prec) {
    ele.innerHTML = ele.value = prec == -1 ? value + ele.unit : formatMoney(value, prec).replace(/\.0+$/, '');
  }

  register(
    {
      name: 'increase',
      beforeCallBase: function (proxy) {
        var eles = proxy.source('elements', Flip.$(proxy.source('selector')));
        this.targets = eles.map(mapValue);
        proxy.source('duration', 1.2);
      },
      defParam: {
        fracPrecision: 1
      },
      prototype: {
        apply: function () {
          var v = this.clock.value, targets = this.targets, precition = this.finished ? -1 : this.fracPrecision;
          this.elements.forEach(function (ele, i) {
            applyValue(ele, targets[i] * v, precition);
          });
        }
      }
    }
  )
})(Flip.animation);
Flip.animation({
  name: 'rotate',
  defParam: {
    angle: Math.PI * 2
  },
  beforeCallBase: function (proxy) {
    proxy.source('timingFunction', Flip.EASE.circInOut);
  },
  transform: function () {
    return Flip.Mat3.setRotate(this.angle * this.clock.value);
  }
});
Flip.animation({
  name: 'scale',
  defParam: {
    sx: 0, sy: 0, dy: 1, dx: 1
  },
  beforeCallBase: function (proxy) {
    proxy.source('timingFunction', Flip.EASE.sineInOut);
  },
  transform: function () {
    var sx = this.sx, sy = this.sy, dx = this.dx, dy = this.dy, v = this.clock.value;
    return Mat3.setScale(sx + (dx - sx) * v, sy + (dy - sy) * v);
  }
});
Flip.animation({
  name: 'translate',
  defParam: {
    sx: 0, dx: 100, sy: 0, dy: 0
  },
  transform:function () {
    var v = this.clock.value, sx = this.sx, sy = this.sy;
    return Mat3.setTranslate(sx + (this.dx - sx) * v, sy + (this.dy - sy) * v);
  }
});})();