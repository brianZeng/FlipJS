/**
 * Created by 柏然 on 2014/12/12.
 */
var Flip = function () {
  var first = arguments[0], readyFuncs = FlipScope.readyFuncs;
  if (typeof first === "function") readyFuncs ? arrAdd(FlipScope.readyFuncs, first) : first(Flip);
}, FlipScope = {readyFuncs: []};
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
function arrFind(array, proNameOrFun, value, unstrict) {
  var fun = mapProName(proNameOrFun), i, item;
  if(value===undefined)value=true;
  if (unstrict) {
    for (i = 0, item = array[0]; item; item = array[++i]) if (fun(item) == value)return item;
  }
  else {
    for (i = 0, item = array[0]; item; item = array[++i]) if (fun(item) === value)return item;
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
  }, first: function (func_proName) {
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
  if (object) {
    if (thisObj == undefined)thisObj = object;
    for (var i = 0, names = Object.getOwnPropertyNames(object), name = names[0]; name; name = names[++i])
      callback.apply(thisObj, [object[name], name, arg]);
  }
  return object;
}
obj.forEach = objForEach;
function objMap(object, callback, thisObj, arg) {
  var r = obj();
  if (object) {
    if (thisObj == undefined)thisObj = object;
    for (var keys = Object.getOwnPropertyNames(object), i = 0, key = keys[0]; key; key = keys[++i])
      r[key] = callback.apply(thisObj, [key, object[key], arg]);
  }
  return r;
}
obj.map = objMap;
function objReduce(object, callback, initialValue, thisObj, arg) {
  if (object) {
    if (thisObj == undefined)thisObj = object;
    for (var keys = Object.getOwnPropertyNames(object), i = 0, key = keys[0]; key; key = keys[++i])
      initialValue = callback.apply(thisObj, [initialValue, key, object[key], arg]);
  }
  return initialValue;
}

obj.reduce = objReduce;
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
