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
/*function arrSameSeq(arr, func_ProName, des) {
  if (arr.length == 1)return true;
  var compare = arrMapFun(func_ProName);
  des = !!des;
  for (var i = 1, len = arr.length; i < len; i++)
    if (des != (compare(arr[i]) < compare(arr[i - 1])))return false;
  return true;
}*/
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

if (typeof module !== "undefined" && module.exports)
  module.exports = Flip;
else if(typeof define!=="undefined")define(function(){return Flip});
else if (window) {
  window.Flip = Flip;
}
function Mat3(arrayOrX1,y1,dx,x2,y2,dy){
  if(!(this instanceof Mat3))return new Mat3(arrayOrX1,y1,dx,x2,y2,dy);
  var eles;
  if(arrayOrX1==undefined)eles=[1,0,0,1,0,0];
  else if(y1==undefined)eles=arrayOrX1;
  else eles=[arrayOrX1,x2,y1,y2,dx,dy];
  this.elements=new Float32Array(eles);
}
function getFloat(d) {
  return parseFloat(d).toFixed(5);
}
var sin=Math.sin,cos=Math.cos,tan=Math.tan;
Flip.Mat3=Mat3;
Mat3.prototype={
  concat:function(mat){
    var eles=mat.elements;
    return concatMat(this,eles[0],eles[2],eles[4],eles[1],eles[3],eles[5]);
  },
  /*
  * z=f(x,y)=> z= m*x+n*y+dz
  * @param rX rotation angle of x
  * @param rY rotation angle of y
  * @param [mx]
  * @param [ny]
  * @param [dz]
  * @returns {Flip.Mat3}
  */
  axonProject:function(rX,rY,mx,ny,dz){
    rX=rX||0;rY=rY||0;mx=mx||0;ny=ny||0;dz=dz||0;
    var cosX=cos(rX),sinX=sin(rX),cosY=cos(rY),sinY=sin(rY),yd=-cosY*sinX;

    return concatMat(this,mx*sinY+cosY,ny*sinY,sinY*dz,sinY*sinX+yd*mx,cosX+ny*yd,yd*dz);
  },
  obliqueProject:function(rV,rH,mx,ny,dz){
    rH=rH||0;rV=rV||0;
    var s=1/tan(rV),sSin=sin(rH)*s,sCos=cos(rH)*s;
    mx=mx||0;ny=ny||0;dz=dz||0;
    return concatMat(this,1+mx*sCos,sCos*ny,sCos*dz,sSin*mx,1+ny*sSin,sSin*dz);
  },
  toString:function(){
    return 'matrix('+Array.prototype.map.call(this.elements,getFloat).join(',')+')';
  },
  applyContext2D:function(ctx){
    ctx.transform.apply(ctx,this.elements);
  },
  clone:function(){
    return new Mat3(this.elements);
  },
  scale:function(x,y){
    return concatMat(this,x||1,0,0,0,y||1,0);
  },
  skew:function(angleX,angleY){
    return concatMat(this,1,tan(angleX),0,tan(angleY),1,0)
  },
  translate:function(x,y){
    return concatMat(this,1,0,x||0,0,1,y||0);
  },
  flip:function(angle,horizontal){
    var sinA = sin(angle), cosA = cos(angle);
    return horizontal? concatMat(this,cosA,0,0,sinA,1,0):concatMat(this,1,-sinA, 0, 0, cosA, 0);
  },
  rotate:function(angle){
    var sina=sin(angle),cosa=cos(angle);
    return concatMat(this,cosa,-sina,0,sina,cosa,0)
  }
};
/*
          |t1 t2 0| |x1 x2 0|  |(t1*x1+t2*y1)   (t1*x2+t2*y2)     0|
  [x,y,1] |p1 p2 0| |y1 y2 0|=>|(p1*x1+p2*y1)   (p1*x2+p2*y2)     0|
          |dt dp 1| |dx dy 1|  |(dt*x1+dp*y1+dx)(dt*x2+dp*y2+dy)  1|

 */
function concatMat(mat,x1,y1,dx,x2,y2,dy){
  var eles=mat.elements,t1=eles[0],t2=eles[1],p1=eles[2],p2=eles[3],dt=eles[4],dp=eles[5];
  mat.elements=new Float32Array([t1*x1+t2*x2,t1*x2+t2*y2,p1*x1+p2*y1,p1*x2+p2*y2,dt*x1+dp*y1+dx,dt*x2+dp*y2+dy]);
  return mat;
}
function Render(){
}
inherit(Flip.Render=Render,Flip.util.Object,{
  update:function(){},render:function(){},invalid:function(){
    var t,p;
    if(t=this._task) t.invalid();
    else if(p=this.parent) p.invalid();
    this._invalid=true;
  }
});
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
    if (obj instanceof Clock || obj instanceof Render)
      arrAdd(this._updateObjs, obj) && (obj._task = this);
    this.invalid();
  },
  remove: function (obj) {
    if (obj._task == this && arrRemove(this._updateObjs, obj)){
      obj._task = null;
      this.invalid();
    }
  }
});
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


function Clock(opt) {
  if (!(this instanceof Clock))return new Clock(opt);
  objForEach(Clock.createOptProxy(opt, 1, Clock.EASE.linear, 0, 1, 0,0).result, cloneFunc, this);
  this.reset(1,0,0,0);
}
Flip.Clock = Clock;

var CLOCK_EVT=Clock.EVENT_NAMES =Object.seal({
  UPDATE: 'update',
  ITERATE: 'iterate',
  START: 'start',
  REVERSE: 'reverse',
  TICK: 'tick',
  FINISH: 'finish',
  FINALIZE: 'finalize',
  CONTROLLER_CHANGE: 'controllerChange'
});
inherit(Clock, obj, {
    get controller() {
      return this._controller || null;
    },
    set controller(c) {
      var oc = this.controller;
      c = c || null;
      if (oc === c)return;
      this._controller = c;
      this.emit(CLOCK_EVT.CONTROLLER_CHANGE, {before: oc, after: c, clock: this});
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
    get ease() {
      return this._tf;
    },
    set ease(src) {
      var tf;
      if ((isFunc(tf=src))||(tf = Clock.EASE[src]))
        this._tf = tf;
    },
    start: function () {
      if (this.t == 0) {
        this.reset(0, 1).emit(CLOCK_EVT.START, this);
        return !(this._finished=false);
      }
      return false;
    },
    reverse: function () {
      if (this.t == 1) {
        this.reset(0, 1, 1, 1,1);
        return true;
      }
      return false;
    },
    restart: function () {
      this.t = 0;
      return this.start();
    },
    reset: function (finished, keepIteration,delayed, atEnd, reverseDir, pause) {
      if(arguments.length==0)
      //reset to a new clock
        return this.reset(0,0,0,0);
      this._startTime = -1;
      if (!keepIteration)
        this.i = this.iteration||1;
      this._delayed=!!delayed;
      this.d = !reverseDir;
      if(atEnd!==undefined)
        this.t = this.value = atEnd ? 1 : 0;
      this._paused = !!pause;
      this._finished=!!finished;
      return this;
    },
    finish: function (evtArg) {
      this.emit(CLOCK_EVT.FINISH, evtArg);
      this.reset(1,1,1);
      this._finished=true;
    },
    end: function (evtArg) {
      this.autoReverse ? this.reverse(evtArg) : this.iterate(evtArg);
    },
    iterate: function (evtArg) {
      if (--this.i > 0 ||this.infinite)
        this.reset(0, 1,1,0);
      else
        this.finish(evtArg);
    },
    pause: function () {
      if (!this._paused) {
        this._pausedTime = -1;
        this._pausedDur = 0;
        this._paused = true;
      }
    },
    resume: function () {
      if (this._paused && this._startTime > 0) {
        this._startTime += this._pausedDur;
        this._paused = false;
      }
    },
    finalize:function(){
      var task;
      if(task=this._task)
        task.toFinalize(this);
      else{
        this.reset(1);
        this.emit(CLOCK_EVT.FINALIZE);
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
objForEach(CLOCK_EVT, function (evtName, key) {
    Object.defineProperty(this, 'on' + evtName, {
      set: function (func) {
        this.on(CLOCK_EVT[key], func);
      }
    })
  }, Clock.prototype);
function updateClock(c,state) {
  if (c&&!c.finished) {
    var timeline = state.timeline,evtName,controller= c.controller;
    if (c._startTime == -1) {
      c._startTime = timeline.now;
      evtName= Clock.EVENT_NAMES[c.d?(c.i== c.iteration? 'START':'ITERATE'):'REVERSE'];
      c.emit(evtName,state);
      controller&&controller.emit(evtName,state);
      return true;
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
      curValue = c.value = c.ease(t);
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
  }
}
Clock.createOptProxy = function (opt, duration, ease, infinite, iteration, autoReverse,delay) {
  var setter = createProxy(opt);
  setter('duration', duration, 'ease', ease, 'infinite', infinite, 'iteration', iteration, 'autoReverse', autoReverse,'delay',delay);
  return setter;
};
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
        return 1-easeIn(1-t);
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
function CssContainer(obj){
  if(!(this instanceof CssContainer))return new CssContainer(obj);
  this.merge(obj);
}
(function(){
  var p=CssContainer.prototype={
    toString:function(){
     var rules=[];
     objForEach(this,function(value,key){
       rules.push(key.replace(/[A-Z]/g,function(c){return '-'+ c.toLowerCase()})+':'+value);
     });
     return rules.join(';')
   },
   withPrefix:function(key,value,prefixes){
     var self=this;
     (prefixes||['-moz-','-ms-','-webkit-','-o-','']).forEach(function(prefix){
       self[prefix+key]=value;
     });
     return self;
   },
   merge:function(obj){
     if(isObj(obj)&&obj!==this)
       objForEach(obj,cloneFunc,this);
     return this;
   },
   template:function(string){
     var arg=arguments,r;
     return string.replace(/\{(\d+)\}/g,function($i,i){
       return ((r=arg[i])==undefined)?$i:formatValue(r);
     })
   }
 };
  Flip.template=p.t=p.template;
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

/**
 * Created by 柏然 on 2014/12/12.
 */
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
Flip.RenderGlobal = RenderGlobal;
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
    else if (obj instanceof Render || obj instanceof Clock)
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
  refresh:function(){
    this._foreceRender=true;
  },
  init: function () {
    if(typeof window==="object"){
      var head=document.head,self=this;
      if(!this._styleElement.parentNode){
        head.appendChild(this._styleElement);
        head.appendChild(this._persistElement);
      }
      Flip.fallback(window);
      window.addEventListener('resize',function(){self.refresh()});
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
      var styles=[];
      objForEach(this._persistStyles,function(style){styles.push(style);});
      this._persistElement.innerHTML=styles.join('\n');
      this._persistStyle=true;
    }
  },
  createRenderState: function () {
    return {global: this, task:null,styleStack:[],forceRender:this._foreceRender}
  }
});
FlipScope.global = new RenderGlobal();


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
      if(obj instanceof Animation)return obj._finished? obj:obj.promise;
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
function updateTask(task,state){
  var updateParam = [state, state.task=task];
  (state.timeline = task.timeline).move();
  task.emit(RenderTask.EVENT_NAMES.UPDATE, updateParam);
  task._updateObjs = arrSafeFilter(task._updateObjs, filterIUpdate, state);
}
function renderGlobal(global,state){
  if(global._invalid||state.forceRender){
    objForEach(global._tasks,function(task){renderTask(task,state);});
    global._styleElement.innerHTML=state.styleStack.join('\n');
    FlipScope.forceRender=global._invalid=false;
  }
  objForEach(global._tasks,function(task){finalizeTask(task,state)});
}
function renderTask(task,state){
  var evtParam = [state, state.task=task];
  if (task._invalid||state.forceRender) {
    task.emit(RenderTask.EVENT_NAMES.RENDER_START, evtParam);
    task._updateObjs.forEach(function (item) {if(isFunc(item.render))item.render(state);});
    task._invalid = false;
  }
  task.emit(RenderTask.EVENT_NAMES.RENDER_END, evtParam);
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
function finalizeAnimation(animation){
  if(!animation.persistAfterFinished){
    animation.finalize();
  }
}

function updateAnimation(animation,renderState){
  var clock=animation.clock;
  renderState.animation=animation;
  if(updateClock(clock,renderState)){
    animation.invalid();
    updateAnimationParam(animation);
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

function renderAnimation(ani,state){
  state.animation = ani;
  updateAnimationCss(ani);
  state.styleStack.push(getAnimationStyle(ani));
  ani.emit(ANI_EVT.RENDER, state);
  if(ani._finished)ani.emit(ANI_EVT.FINISH,state);
  state.animation = null;
}
function updateAnimationParam(animation){
  var p=animation.percent,cur=animation.current=Object.create(animation._immutable);
  objForEach(animation._variable,function(value,key){
    cur[key]=isFunc(value)? value(p,cur):(isNaN(value)?value:p*value);
  });
}
function updateAnimationCss(animation){
  var cssMap=animation._cssMap={},cssRule,cur=animation.current;
  objForEach(animation._cssCallback,function(cbs,selector){
    cssRule=new CssContainer();
    cbs.forEach(function(cb){resolveCss(cb,animation,cssRule,cur)});
    mergeRule(cssMap,selector,cssRule);
  });
  objForEach(animation._matCallback,function(cbs,selector){
    var mat=new Mat3(),arg=[mat,cur];
    cssRule=new CssContainer();
    cbs.forEach(function(cb){mat=cb.apply(animation,arg)||mat});
    cssRule.withPrefix('transform',mat.toString());
    mergeRule(cssMap,selector,cssRule);
  });
}
function resolveCss(rule,thisObj,cssContainer,e){
  var ret=cssContainer||new CssContainer(),arg=[ret,e];
  if(isObj(rule))
    objForEach(rule,cloneFunc,ret);
  else if(isFunc(rule))
     ret=rule.apply(thisObj,arg)||ret;
  return ret;
}
function formatValue(value){
  return isNaN(value)? value:Number(value).toFixed(5).replace(/\.0+$/,'')
}
function formatKey(key){
  return key.replace(/[A-Z]/g,function(c){return '-'+ c.toLowerCase()})
}
function getStyleRuleStr(ruleObj,selector,separator,ignoreEmpty){
  var rules=[];
  objForEach(ruleObj,function(value,key){
    rules.push(formatKey(key)+':'+formatValue(value)+';');
  });
  if(!rules.length&&ignoreEmpty)return '';
  separator=separator||'\n';
  return selector +'{'+separator+rules.join(separator)+separator+'}';
}
function addMap(key,Map,cb){
  var cbs=Map[key];
  if(!cbs)Map[key]=[cb];
  else arrAdd(cbs,cb);
}
function getAnimationStyle(ani){
  var styles=[],slt=ani.selector||'';
  objForEach(ani._cssMap,function(ruleObj,selector){
    styles.push(getStyleRuleStr(ruleObj,selector.replace(/&/g,slt)));
  });
  return ani.lastStyleRule=styles.join('\n');
}
function mergeRule(map,selector,cssContainer){
  var oriRule=map[selector];
  if(oriRule)oriRule.merge(cssContainer);
  else map[selector]=cssContainer;
}
var nextUid=(function(map){
  return function (type){
    if(!map[type])map[type]=1;
    return map[type]++;
  }
})({});
Flip.animation({
  name: 'flip',
  immutable:{
    vertical:true
  },
  variable: {
    angle: Math.PI
  },
  beforeCallBase: function (proxy) {
    proxy.source('ease', Clock.EASE.sineInOut);
  },
  transform:function(mat,param){
    mat.flip(param.angle,param.vertical);
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
      param: {
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
  variable: {
    angle: Math.PI * 2
  },
  beforeCallBase: function (proxy) {
    proxy.source('ease', Flip.EASE.circInOut);
  },
  transform: function (mat,param) {
    mat.rotate(param.angle)
  }
});
Flip.animation({
  name: 'scale',
  immutable:{
    sx:0,sy:0
  },
  variable: {
    dx:1,dy:1
  },
  beforeCallBase: function (proxy) {
    proxy.source('ease', Flip.EASE.sineInOut);
  },
  transform: function (mat,param) {
    mat.scale(param.sx+param.dx,param.sy+param.dy)
  }
});
Flip.animation({
  name: 'translate',
  immutable:{sx:0,sy:0},
  variable: {
    dx: 100, dy: 0
  },
  transform:function (mat,param) {
    mat.translate(param.dx+param.sx,param.dy+param.sy);
  }
});})();