Flip.util = { Object: obj, Array: array, inherit: inherit };
var CALLBACK_PROPERTY_NAME = '_callbacks';
function objAssign(source) {
  if (!isObj(source)) {
    source = {}
  }
  for (var i = 1, len = arguments.length; i < len; i++) {
    objForEach(arguments[i], function (val, key) {
      source[key] = val;
    })
  }
  return source;
}
function makeOptions(opt, defaults) {
  var ret = {};
  opt = opt || {};
  objForEach(defaults || {}, function (value, key) {
    ret[key] = opt.hasOwnProperty(key) ? opt[key] : value
  });
  return ret;
}
function useOptions(target, opt) {
  objForEach(opt, cloneFunc, target);
  return target;
}
function inherit(constructor, baseproto, expando, propertyObj) {
  if (isFunc(baseproto)) {
    baseproto = new baseproto();
  }
  baseproto = baseproto || {};
  var proto = constructor.prototype = Object.create(baseproto), proDes;
  if (expando) {
    for (var i in expando) {
      proDes = Object.getOwnPropertyDescriptor(expando, i);
      if (proDes) {
        Object.defineProperty(proto, i, proDes);
      } else {
        proto[i] = expando[i];
      }
    }
  }
  if (propertyObj) {
    obj.forEach(propertyObj, function (key, value) {
      Object.defineProperty(proto, key, value);
    });
  }
  return constructor;
}

function array(arrayLike) {
  if (!(this instanceof array)) {
    return new array(arrayLike);
  }
  if (arrayLike && arrayLike.length) {
    for (var i = 0, len = arrayLike.length; i < len; i++)
      this[i] = arrayLike[i];
  }
}
function arrAdd(array, item) {
  var i = array.indexOf(item);
  if (i == -1) {
    return !!array.push(item);
  }
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
    if (compare(item = array[i])) {
      return item;
    }
  return void 0;
}
function arrRemove(array, item) {
  var i = array.indexOf(item);
  if (i >= 0) {
    return !!array.splice(i, 1);
  }
  return false;
}
function arrMapFun(func_ProName) {
  if (isStr(func_ProName)) {
    return function (item) {
      return item[func_ProName]
    };
  } else if (isFunc(func_ProName)) {
    return func_ProName;
  }
  return function (item) {
    return item
  };
}
array.remove = arrRemove;
array.add = arrAdd;
array.first = arrFirst;
function mapProName(proNameOrFun) {
  if (isFunc(proNameOrFun)) {
    return proNameOrFun;
  } else if (proNameOrFun && isStr(proNameOrFun)) {
    return function (item) {
      return item ? item[proNameOrFun] : undefined;
    };
  } else {
    return function (item) {
      return item;
    }
  }
}
function arrFind(array, proNameOrFun, value, unstrict, index) {
  var fun = mapProName(proNameOrFun), i, item;
  if (value === undefined) {
    value = true;
  }
  if (unstrict) {
    for (i = 0, item = array[0]; item; item = array[++i]) if (fun(item) == value) {
      return index ? i : item;
    }
  }
  else {
    for (i = 0, item = array[0]; item; item = array[++i]) if (fun(item) === value) {
      return index ? i : item;
    }
  }
  return undefined;
}
array.findBy = arrFind;
function arrForEachThenFilter(arr, forEach, filter, thisObj) {
  var copy = arr.slice();
  thisObj === void 0 && (thisObj = arr);
  copy.forEach(forEach, thisObj);
  return arr.filter(filter, thisObj);
}
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
  first: function (func_proName) {
    return arrFirst(this, func_proName);
  }
});
function addMapArray(map, key, cb) {
  if (!map.hasOwnProperty(key)) {
    map[key] = [cb];
  } else {
    arrAdd(map[key], cb);
  }
  return map;
}
function obj(from) {
  if (!(this instanceof obj)) {
    return new obj(from);
  }
  if (typeof from === "object") {
    objForEach(from, function (value, key) {
      var pro;
      if (pro = Object.getOwnPropertyDescriptor(from, key)) {
        Object.defineProperty(this, key, pro);
      } else {
        this[key] = value;
      }
    }, this);
  }
}
obj.assign = objAssign;
function addEventListener(obj, evtName, handler) {
  if (isStr(evtName) && evtName && isFunc(handler)) {
    if (!obj.hasOwnProperty(CALLBACK_PROPERTY_NAME)) {
      obj[CALLBACK_PROPERTY_NAME] = {};
    }
    addMapArray(obj[CALLBACK_PROPERTY_NAME], evtName, handler);
  }
  return obj;
}
obj.on = addEventListener;
function emitEvent(obj, evtName, argArray, thisObj) {
  var callbacks, handlers, toRemove;
  if (!(obj.hasOwnProperty(CALLBACK_PROPERTY_NAME)) || !(handlers = (callbacks = obj[CALLBACK_PROPERTY_NAME])[evtName])) {
    return false;
  }
  if (!argArray) {
    argArray = [];
  } else if (!(argArray instanceof Array)) {
    argArray = [argArray];
  }
  if (thisObj === undefined) {
    thisObj = obj;
  }
  toRemove = [];
  return (callbacks[evtName] = arrForEachThenFilter(handlers, evalHandler, function (handler) {
    return toRemove.indexOf(handler) == -1
  })).length;
  function evalHandler(handler) {
    handler.apply(thisObj, argArray) == -1 && toRemove.push(handler)
  }
}
obj.emit = emitEvent;
function removeEventListener(obj, evtName, handler) {
  var cbs, hs;
  if (evtName === undefined) {
    delete obj[CALLBACK_PROPERTY_NAME];
  } else if ((cbs = obj[CALLBACK_PROPERTY_NAME]) && (hs = cbs[evtName]) && hs) {
    if (handler) {
      array.remove(hs, handler);
    } else {
      delete cbs[evtName];
    }
  }
  return obj;
}
obj.off = removeEventListener;
function addEventListenerOnce(obj, evtName, handler) {
  if (isFunc(handler)) {
    obj.on(evtName, function () {
      handler.apply(obj, arguments);
      return -1;
    });
  }
  return obj;
}
obj.once = addEventListenerOnce;
function objForEach(object, callback, thisObj, arg) {
  if (isObj(object)) {
    if (thisObj == undefined) {
      thisObj = object;
    }
    if (object instanceof Array) {
      object.forEach(callback, thisObj);
    } else {
      for (var key in object) {
        if (object.hasOwnProperty(key)) {
          callback.call(thisObj, object[key], key, arg);
        }
      }
    }
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

function isFunc(value) {
  return typeof value === "function"
}
function isObj(value) {
  return (typeof value === "object") && value
}
function isStr(value) {
  return typeof value === "string"
}
function noop() {
}
function parseStyleText(styleText) {
  var i = 0, ret = {}, ruleStart, ruleEnd;
  while ((ruleStart = styleText.indexOf('{', i)) > -1) {
    ruleEnd = styleText.indexOf('}', ruleStart);
    addMapArray(
      ret,
      styleText.substring(i, ruleStart).trim(),
      parseCssText(styleText.substring(ruleStart + 1, ruleEnd))
    );
    i = ruleEnd + 1;
  }
  return ret;
}
function parseCssText(cssText, target) {
  var ret = isObj(target) ? target : {}, pair;
  cssText.split(';').forEach(function (rule) {
    if (rule = rule.replace(/[\r\n\t\f\s]/g, '')) {
      pair = rule.split(':');
      ret[pair[0]] = pair[1];
    }
  });
  return ret;
}
function decorateFunction(func, decorator) {
  return function decoratedFunc() {
    func.apply(this, arguments);
    return decorator.apply(this, arguments);
  }
}