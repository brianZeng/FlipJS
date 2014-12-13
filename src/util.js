/**
 * Created by 柏然 on 2014/12/12.
 */
var Flip = function () {

}, FlipScope = {};
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
  var from, result = {}, func;
  switch (typeof obj) {
    case "function":
      from = obj.proxy;
      break;
    case "object":
      from = obj;
      break;
    default :
      from = {};
  }
  func = function (prop, value) {
    var v;
    if (!from.hasOwnProperty(prop) || from[prop] === undefined)
      v = value;
    else v = from[prop];
    return result[prop] = v;
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
array.remove = arrRemove;
function arrRemove(array, item) {
  var i = array.indexOf(item);
  if (i >= 0)
    return !!array.splice(i, 1);
  return false;
}
array.add = arrAdd;
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
function arrFind(array, proNameOrFun, value, unstrict) {
  var fun = mapProName(proNameOrFun), i, item;
  if (unstrict) {
    for (i = 0, item = array[0]; item; item = array[++i]) if (fun(item) == value)return item;
  }
  else {
    for (i = 0, item = array[0]; item; item = array[++i]) if (fun(item) === value)return item;
  }
  return undefined;
}
array.findBy = arrFind;

inherit(array, Array, {
  add: function (item) {
    return arrAdd(this, item);
  },
  findBy: function (proNameOrFun, value, unstrict) {
    return arrFind(this, proNameOrFun, value, unstrict);
  }
});

function obj(from) {
  if (!(this instanceof obj))return new obj(from);
  if (typeof from === "object")
    objForEach(from, function (key, value) {
      this[key] = value;
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
addEventListener.emit = obj.emit = (function () {
  var emitings = array();
  return function (obj, evtName, argArray, thisObj) {
    var cbs = obj._callbacks, hs, r, nhs;
    if (!cbs)return 0;
    hs = cbs[evtName];
    if (!hs || !emitings.add(hs))return false;
    if (!argArray)argArray = [];
    else if (!(argArray instanceof Array)) argArray = [argArray];
    thisObj = thisObj || obj;
    nhs = cbs[evtName] = hs.filter(function (call) {
      r = call.apply(thisObj, argArray);
      return r != -1;
    });
    emitings.remove(hs);
    return nhs.length;
  }
})();
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
  if (thisObj == undefined)thisObj = object;
  for (var i = 0, names = Object.getOwnPropertyNames(object), name = names[0]; name; name = names[++i])
    callback.apply(thisObj, [name, object[name], arg]);
  return object;
}
obj.forEach = objForEach;
function objMap(object, callback, thisObj, arg) {
  var r = obj();
  if (thisObj == undefined)thisObj = object;
  for (var keys = Object.getOwnPropertyNames(object), i = 0, key = keys[0]; key; key = keys[++i])
    r[key] = callback.apply(thisObj, [key, object[key], arg]);
  return r;
}
obj.map = objMap;
function objReduce(object, callback, initialValue, thisObj, arg) {
  if (thisObj == undefined)thisObj = object;
  for (var keys = Object.getOwnPropertyNames(object), i = 0, key = keys[0]; key; key = keys[++i])
    initialValue = callback.apply(thisObj, [initialValue, key, object[key], arg]);
  return initialValue;
}
obj.reduce = objReduce;
inherit(obj, null, {
  on: function (evtName, handler) {
    return addEventListener(this, evtName, handler);
  },
  emit: function (evtName, argArray, thisObj) {
    return addEventListener.emit(this, evtName, argArray, thisObj);
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
function cloneFunc(key, value) {
  this[key] = value;
}