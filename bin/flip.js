(function(){var Flip = function () {
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
  if (object) {
    if (thisObj == undefined)thisObj = object;
    for (var i = 0, names = Object.getOwnPropertyNames(object), name = names[0]; name; name = names[++i])
      callback.apply(thisObj, [object[name], name, arg]);
  }
  return object;
}
obj.forEach = objForEach;
/*function objMap(object, callback, thisObj, arg) {
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

obj.reduce = objReduce;*/
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

function Interpolation(opt) {
  if (!(this instanceof Interpolation))return new Interpolation(opt);
  if (opt.data instanceof Array) {
    var pts = opt.data, len = pts.length, xs = new Float32Array(len), ys = new Float32Array(len);
    for (var i = 0, p = pts[0]; i < len; p = pts[++i]) {
      xs[i] = p.x;
      ys[i] = p.y;
    }
    this.axis = {x: xs, y: ys}
  }
  else {
    if (pts = opt.x)this.axis = {x: new Float32Array(pts)};
    else throw Error('the data of X axis not provided');
    if (pts = opt.y)this.axis.y = new Float32Array(pts);
    else throw Error('the data of Y axis not provided');
  }
  this.init(opt);
}
inherit(Interpolation, {
  init: function (points) {
  },
  useSeg: function (seg) {
    this.interpolateSeg(seg.t, [seg.x0, seg.x1], [seg.y0, seg.y1]);
  },
  interpolate: function (x, skip) {
    return this.useSeg(this._findSegByX0(x, skip));
  },
  when: function (t) {
    return this.useSeg(this._findSegByT(t));
  },
  itor: function (opt) {
    var interval, count, self = this;
    opt = createProxy(opt);
    count = opt.source('count') || 100;
    opt('interval', 1 / count, 'when', function (t) {
      return self.when(t);
    });
    return new InterItor(opt.result);
  },
  interpolateSeg: function (t, vx, vy) {
    return this.calcPoint(this.calcVt(t), vx, vy)
  },
  _indexOfSegment: function (x, skip, xs) {
    xs = xs || this.axis.x;
    skip = skip || 0;
    for (var i = 0, len = xs.length; i < len; i++)
      if (xs[i] <= x && xs[i + 1] >= x && skip-- <= 0)return i;
  },
  _getSeg: function (i0, i1, xs, ys) {
    ys = ys || this.axis.y;
    xs = xs || this.axis.x;
    return {i0: i0, i1: i1, x0: xs[i0], x1: xs[i1], y1: ys[i1], y0: ys[i0]};
  },
  _findSegByX0: function (x, skip) {
    var xs = this.axis.x, i0 = this._indexOfSegment(x, skip, xs);
    var r = this._getSeg(i0, i0 + 1, xs);
    r.t = (x - r.x0) / (r.x1 - r.x0);
    return r;
  },
  _findSegByT: function (t) {
    var xs = this.axis.x, segCount = xs.length - 1, i0, i1, r, ts;
    i0 = Math.floor(ts = segCount * t);
    if (i0 < 0)i0 = 0;
    else if (i0 >= segCount - 1)i0 = segCount - 1;
    i1 = i0 + 1;
    r = this._getSeg(i0, i1, xs);
    r.t = ts - i0;
    return r;
  },
  _initDx: function () {
    var xs = this.axis.x;
    this.dx = xs[xs.length - 1] - xs[0];
  },
  _ensureAxisAlign: function () {
    var axis = this.axis;
    if (axis.x.length !== axis.y.length)throw Error('x and y must have same amount of data');
  },
  _ensureAxisOrder: function (axisName, asc) {
    var arr = this.axis[axisName], order;
    if (arr.length < 2)return;
    if (asc == undefined) {
      asc = arr[0] < arr[1];
      order = 'asc or des';
    } else order = asc ? 'asc' : 'des';
    if (!arrSameSeq(this.axis[axisName], null, !asc))
      throw Error('data of axis ' + axisName + ' should in ' + order + ' order')
  }
});
function InterItor(opt) {
  if (!(this instanceof InterItor))return new InterItor(opt);
  var interval = opt.interval, t, curPoint, end;
  this.reset = function () {
    return end = t = 0;
  };
  this.hasNext = function () {
    return !end;
  };
  this.next = function () {
    if (end)return false;
    curPoint = opt.when(t);
    if (t == 1)end = 1;
    t += interval;
    if (t > 1)t = 1;
    return curPoint;
  };
  Object.defineProperty(this, 'current', {
    get: function () {
      return curPoint;
    }
  });
  this.reset();
}
InterItor.prototype = {
  all: function () {
    var cache = [], p;
    this.reset();
    while (p = this.next())
      cache.push(p);
    this.reset();
    return cache;
  }
};
(function (Flip) {
  var handler = {
    degree: (function () {
      var cache = [
          function () {
            return [1]
          },
          function (t) {
            return [t, 1]
          },
          function (t) {
            return [t * t, t, 1]
          },
          function (t) {
            var t2 = t * t;
            return [t2 * t, t2, t, 1]
          },
          function (t) {
            var t2 = t * t, t3 = t2 * t;
            return [t3 * t, t3, t2, t, 1]
          }
        ], pow = Math.pow,
        genVtFunc = function (degree) {
          return function (t) {
            for (var i = 1, r = [1]; i < degree; i++)
              r.unshift(pow(t, 1));
            return r;
          }
        };
      return function (degree, proto) {
        var fun;
        if (typeof degree == "function") fun = degree;
        else if (!isNaN(degree = parseInt(degree)))
          fun = cache[degree] || genVtFunc(degree);
        proto.calcVt = fun;
      }
    })(),
    weightMat: function (matLike, proto) {
      var mat;
      if (matLike instanceof Matrix)mat = matLike;
      else if (matLike instanceof Array)mat = Matrix.fromRows.apply(matLike, matLike);
      proto.calcPoint = function (vt, vx, vy) {
        var pv = Vec.multiMat(vt, mat);
        return {x: pv.dot(vx), y: pv.dot(vy)}
      }
    }
  }, cache = {};
  function main(opt) {
    var Constructor, name = opt.name;
    Constructor = function (opt) {
      if (!(this instanceof Constructor))return new Constructor(opt);
      if (opt instanceof Array)opt = {data: opt};
      Interpolation.call(this, opt);
    };
    inherit(Constructor, Interpolation.prototype, addPrototype(opt.prototype, opt));
    if (name) (name + '').split(',').forEach(function (alias) {
      cache[alias] = Constructor;
    });
    Object.seal(Constructor.prototype);
    return Constructor;
  }

  main.cache = cache;
  function addPrototype(proto, opt) {
    objForEach(handler, function (fun, name) {
      var v = opt[name];
      if (v !== undefined) fun(v, proto, opt)
    });
    return proto;
  }

  Flip.interpolate = function (nameOrOpt, data) {
    var opt, constructor;
    if (typeof nameOrOpt == "string")
      opt = {name: nameOrOpt, data: data};
    else if (typeof (opt = nameOrOpt) !== "object")
      throw Error('interpolation name and data needed');
    constructor = cache[opt.name];
    if (constructor)return new constructor(opt);
    throw Error('interpolation ' + opt.name + ' not found');
  };
  return Flip.interpolation = main;
})(Flip);

function Matrix(opt) {
  if (!(this instanceof Matrix))return new Matrix(opt);
  this.init(opt);
}
Matrix.luDecompose = function (mat) {
  var n = mat.row, L, U, abs = Math.abs;
  if (n !== mat.col)throw  Error('Decomposition require row equals col');
  L = Matrix.identify(n);
  U = mat.clone();
  for (var iRow = 0, pivot = new Array(n), maxValue, factor; iRow < n; ++iRow) {
    pivot[iRow] = iRow;
    maxValue = abs(U[iRow][iRow]);
    for (var iNextRow = iRow + 1, temp; iNextRow < n; ++iNextRow) {
      if (maxValue < abs(temp = U[iNextRow][iRow])) {
        pivot[iRow] = iNextRow;
        maxValue = temp;
      }
    }
    if (!maxValue) return false;
    if (pivot[iRow] != iRow)
      U.swapRow(iRow, pivot[iRow]);
    for (iNextRow = iRow + 1; iNextRow < n; iNextRow++) {
      L[iNextRow][iRow] = factor = U[iNextRow][iRow] / U[iRow][iRow];
      U[iNextRow][iRow] = 0;
      for (var iCol = iRow + 1; iCol < n; iCol++)
        U[iNextRow][iCol] -= U[iRow][iCol] * factor;
    }
  }
  return {L: L, U: U}
};
Matrix.luSolve = function (L, U, B) {
  var n = L.row, Y, X;
  if (n !== L.col || n !== U.row || n !== U.col) throw Error('invalid dimensions in L U Matrix');
  Y = new Float32Array(n);
  X = new Vec(n);
  for (var i = 0, j; i < n; i++) {
    Y[i] = B[i];
    for (j = 0; j < i; j++)
      Y[i] -= Y[j] * L[i][j];
  }
  for (i = n - 1; i >= 0; i--) {
    X[i] = Y[i];
    for (j = i + 1; j < n; j++)
      X[i] -= X[j] * U[i][j];
    X[i] /= U[i][i];
  }
  return X;
};
Matrix.identify = function (n) {
  var mat = new Matrix(n);
  for (var i = 0; i < n; i++) mat[i][i] = 1;
  return mat;
};
Matrix.fromRows = function () {
  var row = arguments.length, col = arguments[0].length, mat = new Matrix({row: row, col: col});
  for (var i = 0; i < row; i++)
    mat[i] = Matrix.constructRow(arguments[i]);
  return mat;
};
Matrix.fromCols = function () {
  var cols = arguments, colNum = cols[0].length, rowNum = arguments.length, mat = new Matrix({
    row: rowNum,
    col: colNum
  });
  for (var i = 0; i < rowNum; i++)
    for (var j = 0; j < colNum; j++)
      mat[i][j] = cols[j][i];
  return mat;
};

Matrix.constructRow = (function () {
  function toString() {
    var len, r = new Array(len = this.length);
    for (var i = 0; i < len; i++)
      r[i] = this[i].toFixed(2).replace('.00', '  ');
    return r.join(' ').trim();
  }

  return function (arryOrNum) {
    var row = new Float32Array(arryOrNum);
    row.toString = toString;
    return row;
  }
})();
Flip.Matrix = Matrix;
inherit(Matrix, [], {
  get length() {
    return this.row * this.col;
  },
  init: function (opt) {
    var row, col;
    if (typeof opt == "number") {
      this.row = this.col = row = col = opt;
    }
    else if (opt == undefined)throw Error('row and col must be declared');
    else {
      row = this.row = opt.row;
      col = this.col = opt.col;
    }
    for (var i = 0; i < row; i++)
      this[i] = Matrix.constructRow(col);
    return this;
  },
  solve: function (B) {
    var lu = Matrix.luDecompose(this);
    return lu ? Matrix.luSolve(lu.L, lu.U, B) : null;
  },
  transpose: function () {
    return Matrix.fromCols.apply(null, this);
  },
  inverse: function () {
    var n = this.row, cols = new Array(n), B;
    if (n == this.col) {
      for (var i = 0; i < n; i++) {
        B = new Vec(n);
        B[i] = 1;
        cols[i] = this.solve(B);
      }
      return Matrix.fromCols.apply(null, cols);
    }

  },
  clone: function () {
    var mat = new Matrix(this);
    for (var i = 0, row = this.row; i < row; i++)
      mat[i] = Matrix.constructRow(this[i]);
    return mat;
  },
  multiVec: function (vec) {
    var len, r = new Vec(len = this.row);
    for (var i = 0; i < len; i++)
      r[i] = Vec.dot(this[i], vec);
    return r;
  },
  multiMat: function (mat) {
    var row = this.row, col = mat.col, r = new Matrix({col: col, row: row}), sum;
    for (var ir = 0; ir < row; ir++)
      for (var ic = 0; ic < col; ic++) {
        sum = 0;
        for (var i = 0; i < row; i++)
          sum += this[ir][i] * mat[i][ic];
        r[ir][ic] = sum;
      }
    return r;
  },
  multi: function (a) {
    if (typeof  a === "number")return this.dot(a);
    if (a instanceof Matrix)return this.multiMat(a);
    if (a instanceof Vec || a.length !== undefined)return this.multiVec(a);
  },
  dot: function (a) {
    var mat = new Matrix(this);
    for (var row = this.row, col = this.col, i = 0; i < row; i++)
      for (var j = 0; j < col; j++) mat[i][j] = this[i][j] * a;
    return mat;
  },
  get: function (row, col) {
    var colLen = this.col;
    return this[(row % this.row) * colLen][col % colLen];
  },
  set: function (row, col, value) {
    var colLen = this.col;
    return this[(row % this.row) * colLen][col % colLen] = value;
  },
  setRow: function (rowIndex, elements, startIndex) {
    var row = this[rowIndex];
    startIndex = startIndex || 0;
    for (var i = 0, len = elements.length; i < len; i++)
      row[i + startIndex] = elements[i];
    return this;
  },
  swapRow: function (i, j) {
    var tem = this[j];
    this[j] = this[i];
    this[i] = tem;
    return this;
  },
  toString: function () {
    for (var i = 0, row = this.row, r = new Array(row); i < row; i++)
      r[i] = this[i].toString().trim();
    return r.join('\n');
  }
});
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
  Flip.css=function(selector,rule){
    var result={},body;
    if(typeof rule==="function")result=rule(result)||result;
    else if(typeof rule==="object") objForEach(rule,cloneFunc,result);
    else throw 'css rule should be object or function';
    if(body=getRuleBody(result)){
      return FlipScope.global.immediate(selector+'{'+body+'}');
    }
  };
  function getRuleBody(ruleObj,separator){
    var rules=[];
    objForEach(ruleObj,function(value,key){
       rules.push(key.replace(/[A-Z]/g,function(c){return '-'+ c.toLowerCase()})+':'+value+';');
    });
    return rules.join(separator||'\n');
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
    ani._finished=true;
    ani.emit(Animation.EVENT_NAMES.FINISHED, state);
    if(ani.keepWhenFinished){
      state.global.immediate(ani.lastStyleRule);
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
        cssObj.transform=cssObj['-webkit-transform']=matRule;
      });
    });
  }
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
      var v=this._promise,self=this;
      if(!v)
        v=this._promise=FlipScope.Promise(function(resolve){
          self.once('finished',function(state){
            if(state&&state.global)
              state.global.once('frameEnd',go);
            else go();
            function go(){
              resolve(self);
            }
          })
        });
      return v;
    },
    get finished() {
      return this._finished;
    },
    get id() {
      if (!this._id)this._id = getAniId(this.type);
      return this._id;
    },
    get elements() {
      return Flip.$(this.selector);
    },
    init:function(opt){
      this.use(opt);
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
        var body=getRuleBody(ruleObj);
        if(body){
          styles.push(selector+'\n{\n'+body+'\n}');
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
})();
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
      Animation.call(this, opt);
    };
    if (name) {
      register[name] = Constructor;
      Constructor.name = name;
    }
    inherit(Constructor, Animation.prototype,{
      init:function(opt){
        this.use(definition).use(opt);
      },
      type:definition.name
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


function Clock(opt) {
  if (!(this instanceof Clock))return new Clock(opt);
  objForEach(Clock.createOptProxy(opt, 1, Clock.EASE.linear, 0, 0, 0).result, cloneFunc, this);
  this.reset(1);
  this._paused = false;
}
Flip.Clock = Clock;

Clock.createOptProxy = function (opt, duration, timingFunction, infinite, iteration, autoReverse) {
  var setter = createProxy(opt);
  setter('duration', duration, 'timingFunction', timingFunction, 'infinite', infinite, 'iteration', iteration, 'autoReverse', autoReverse);
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
    get finished() {
      return this._stopped && this.i <= 0;
    },
    get paused() {
      return this._paused;
    },
    get timingFunction() {
      return this._tf;
    },
    set timingFunction(src) {
      var t;
      if ((typeof src === "function" && (t = src)) || (t = Clock.EASE[src]))this._tf = src;
    },
    start: function () {
      if (this.t == 0) {
        this.reset(0, 1).emit(EVTS.START, this);
        return true;
      }
      return false;
    },
    reverse: function () {
      if (this.t == 1) {
        this.reset(0, 1, 1, 1).emit(EVTS.REVERSE, this);
        return true;
      }
      return false;
    },
    restart: function () {
      this.t = 0;
      return this.start();
    },
    reset: function (stop, keepIteration, atEnd, reverseDir, pause) {
      this._startTime = -1;
      if (!keepIteration)this.i = this.iteration;
      this.d = !reverseDir;
      this.t = this.value = atEnd ? 1 : 0;
      this._stopped = !!stop;
      this._paused = !!pause;
      return this;
    },
    finish: function (evtArg) {
      this.emit(EVTS.FINISHED, evtArg);
      this.reset(1);
    },
    end: function (evtArg) {
      this.autoReverse ? this.reverse(evtArg) : this.iterate(evtArg, 0);
    },
    iterate: function (evtArg) {
      if (this.infinite)this.toggle();
      else if (0 < this.i--) {
        this.emit(EVTS.ITERATE, evtArg);
        this.reset(0, 1);
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
    update: updateClock
  });
  objForEach(EVTS, function (evtName, key) {
    Object.defineProperty(this, 'on' + evtName, {
      set: function (func) {
        this.on(EVTS[key], func);
      }
    })
  }, Clock.prototype);
  function updateClock(state) {
    if (!this._stopped) {
      var timeline = state.timeline;
      if (this._startTime == -1) {
        this.emit(EVTS.START, state);
        return (this._startTime = timeline.now) >= 0;
      }
      if (this._paused) {
        var pt = this._pausedTime;
        pt == -1 ? this._pausedTime = timeline.now : this._pausedDur = timeline.now - pt;
        return true;
      }
      var dur = (timeline.now - this._startTime) / timeline.ticksPerSecond, curValue, evtArg;
      if (dur > 0) {
        var ov = this.value, t;
        t = this.t = this.d ? dur / this.duration : 1 - dur / this.duration;
        if (t > 1)t = this.t = 1;
        else if (t < 0)t = this.t = 0;
        curValue = this.value = this.timingFunction(t);
        evtArg = Object.create(state);
        evtArg.clock = this;
        evtArg.currentValue = curValue;
        evtArg.lastValue = ov;
        if (ov != curValue) this.emit(EVTS.TICK, evtArg);
        if (t == 1)this.end(evtArg);
        else if (t == 0)this.iterate(evtArg);
        if (state.clock === this)state.clock = null;
      }
      return true;
    }
    else
      state.task.remove(this);
  }
})(Clock.EVENT_NAMES = {
  UPDATE: 'update',
  ITERATE: 'iterate',
  START: 'start',
  REVERSE: 'reverse',
  TICK: 'tick',
  FINISHED: 'finished',
  CONTROLLER_CHANGED: 'controllerChanged'
});


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
function RenderGlobal() {
  this._tasks = new Flip.util.Array();
  this._persistStyles=new Flip.util.Array();
  this._persistElement=document.createElement('style');
  this._styleElement=document.createElement('style');
}
RenderGlobal.EVENT_NAMES = {
  FRAME_START: 'frameStart',
  FRAME_END: 'frameEnd',
  UPDATE: 'update'
};
inherit(RenderGlobal, Flip.util.Object, {
  set activeTask(t) {
    var tasks = this._tasks, target = this._activeTask;
    if (target) target.timeline.stop();
    if (t instanceof RenderTask)
      if (tasks.indexOf(t) > -1 || this.add(t)) target = t;
      else if (typeof t == "string") target = tasks.findBy('name', t);
      else target = null;
    this._activeTask = target;
    if (target) target.timeline.start();
  },
  get activeTask() {
    var t = this._activeTask;
    if (!t) {
      this._tasks.length ? (t = this._tasks[0]) : this.add(t = new RenderTask('default'));
      this._activeTask = t;
    }
    return t;
  },
  add: function (obj) {
    var task, taskName, tasks;
    if (obj instanceof RenderTask) {
      if (!(taskName = obj.name)) throw Error('task must has a name');
      else if ((task = (tasks = this._tasks).findBy('name', taskName)) && task !== obj) throw Error('contains same name task');
      else if (tasks.add(obj)) return !!(obj._global = this);
    }
    else if (obj instanceof Animation || obj instanceof Clock)
      return this.activeTask.add(obj);
    return false;
  },
  immediate:function(style){
    var styles=this._persistStyles;
    if(styles.add(style))
    {
      this._persistStyle=false;
      return (function(uid,styles){
        return function cancelImmediate(){
          var index=arrFind(styles,'uid',uid,1,1);
          return styles.splice(index,1)[0];
        }
      })(style.uid=nextUid('immediateStyle'),styles);
    }
  },
  init: function (taskName) {
    var head=document.head;
    this.activeTask = taskName;
    this.loop();
    this.activeTask.timeline.start();
    if(!this._styleElement.parentNode){
      head.appendChild(this._styleElement);
      head.appendChild(this._persistElement);
    }
    typeof window === "object" && Flip.fallback(window);
    this.init = function () {
      console.warn('The settings have been initiated,do not init twice');
    };
  },
  loop: function () {
    var state = this.createRenderState();
    this.emit(RenderGlobal.EVENT_NAMES.FRAME_START, [state]);
    this.update(state);
    this.render(state);
    this.emit(RenderGlobal.EVENT_NAMES.FRAME_END, [state]);
    window.requestAnimationFrame(this.loop.bind(this), window.document.body);
  },
  render: function (state) {
    state.task.render(state);
    if(!this._persistStyle){
      this._persistStyle=1;
      this._persistElement.innerHTML=this._persistStyles.join('\n');
    }
    this._styleElement.innerHTML=state.styleStack.join('\n');
  },
  update: function (state) {
    state.global.emit(RenderGlobal.EVENT_NAMES.UPDATE, [state, this]);
    state.task.update(state);
  },
  createRenderState: function () {
    return {global: this, task: this.activeTask,styleStack:[]}
  }
});
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
  this._onAction = false;
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
  update: function (state) {
    var t = state.task, updateParam = [state, this], nextComs;
    (state.timeline = t.timeline).move();
    this.emit(RenderTask.EVENT_NAMES.UPDATE, updateParam);
    this._updateObjs = arrSafeFilter(this._updateObjs, filterIUpdate, state);
  },
  invalid: function () {
    this._invalid = true;
  },
  render: function (state) {
    var evtParam = [state, this];
    if (this._invalid) {
      this.emit(RenderTask.EVENT_NAMES.RENDER_START, evtParam);
      this._updateObjs.forEach(function (component) {
        if (component.render) component.render(state);
      });
      this._invalid = false;
    }
    this.emit(RenderTask.EVENT_NAMES.RENDER_END, evtParam);
  },
  add: function (obj, type) {
    if (type == 'update') return arrAdd(this._updateObjs, obj);
    if (obj instanceof Clock || obj instanceof Animation)
      arrAdd(this._updateObjs, obj) && (obj._task = this);
  },
  remove: function (obj) {
    if (obj._task == this)
      obj._task = null;
    arrRemove(this._updateObjs, obj);
  }
});
function filterIUpdate(obj) {
  if (obj == null || !(typeof obj == "object"))return false;
  else if (typeof obj.update == "function")return obj.update(this);
  else if (typeof obj.emit == "function") return obj.emit(RenderTask.EVENT_NAMES.UPDATE, this);
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
      var angle = this.angle * this.clock.value, sin = Math.sin(angle), cos = Math.cos(angle);
      return new Mat3(this.vertical ? [cos, 0, 0, sin, 1, 0] : [1, -sin, 0, 0, cos, 0])
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
});
Flip.interpolation({
  name: 'lagrange',
  prototype: {
    calCoefficient: function () {
      var xs = this.axis.x, n, ws = new Array(n = xs.length);
      for (var i = 0, xi, wi = 1, j; i < n; i++, wi = 1) {
        xi = xs[i];
        for (j = 0; j < n; j++)if (j !== i)wi *= (xi - xs[j]);
        ws[i] = wi;
      }
      return this.coefficeint = ws;
    },
    init: function () {
      this._ensureAxisAlign();
      this._initDx();
      this.calCoefficient();
      this._ensureAxisOrder('x');
    },
    when: function (t) {
      var seg = this._findSegByT(t);
      return this.interpolate(seg.x0 + seg.t * (seg.x1 - seg.x0));
    },
    interpolate: function (x) {
      var ws = this.coefficeint, xs = this.axis.x, ys = this.axis.y, n = xs.length, y = 0;
      for (var i = 0, sum = 1, wi = 1, j; i < n; i++, sum = 1, wi = 1) {
        for (j = 0; j < i; j++)sum *= (x - xs[j]);
        for (j = i + 1; j < n; j++)sum *= (x - xs[j]);
        y += ys[i] * sum / ws[i];
      }
      return {x: x, y: y}
    }
  }
});
Flip.interpolation({
  name: 'beizerCubic,beizer-3,cubicBeizer',
  degree: 3,
  weightMat: [[-1, 3, -3, 1], [3, -6, 3, 0], [-3, 3, 0, 0], [1, 0, 0, 0]],
  options: {
    cps: [
      [{x: 1, y: 1}, [1, 0]]
    ],
    cx: [[10, 2]],
    cy: [[0, 1]]
  },
  prototype: {
    init: function (opt) {
      this._ensureAxisAlign();
      this._initControlPoints(opt);
    },
    setCP: function (i, cp0, cp1, x1, y1) {
      var xs = [], ys = [];
        if (arguments.length == 3) {
          if (cp0) {
            xs[0] = Vec.get(cp0, 'x');
            ys[0] = Vec.get(cp0, 'y');
            if (cp1) {
              xs[1] = Vec.get(cp1, 'x');
              ys[1] = Vec.get(cp1, 'y')
            }
          }
        }
        else if (arguments.length == 5) {
          xs = [cp0, x1];
          ys = [cp1, y1];
        }
        else throw  Error('invalid arguments');
      for (var j = 0, co = this.coefficeint, cox = co.x, coy = co.y, len = xs.length, index; j < len; j++) {
        cox[index = i * 2 + j] = xs[j];
        coy[index] = ys[j];
      }
    },
    _initControlPoints: function (opt) {
      var xs = this.axis.x, segCount = xs.length - 1, i, j, gps, cy, cx, len = segCount * 2;
      this.coefficeint = {
        x: new Float32Array(new Array(len)),
        y: new Float32Array(new Array(len))
      };
      if (gps = opt.cps)
        for (j = i = 0; i < len; i += 2, j++)
          this.setCP(j, gps[i], gps[i + 1]);
      else if ((cx = opt.cx) && (cy = opt.cy))
        for (j = i = 0; i < len; i += 2, j++)
          this.setCP(j, cx[i], cy[i], cx[i + 1], cy[i + 1]);
      this._ensureControlPoints(opt);
    },
    _ensureControlPoints: function (opt) {
      var co = this.coefficeint, cox = co.x, coy = co.y, vec,
        xs = this.axis.x, ys = this.axis.y, segCount = xs.length - 1;
      if (isNaN(cox[0]) || isNaN(cox[1])) {
        vec = opt.startVec || [0, 0];
        r = this.calCP(xs[0], ys[0], xs[1], ys[1], xs[0] + Vec.get(vec, 'x'), ys[0] + Vec.get(vec, 'y'));
        setCPWhenNaN(0, r);
      }
      for (var i = 1, ci = 2, r; i < segCount; ci = 2 * (++i)) {
        r = this.calCP(xs[i], ys[i], xs[i + 1], ys[i + 1], xs[i - 1], ys[i - 1]);
        setCPWhenNaN(ci, r);
      }
      function setCPWhenNaN(index, cps) {
        if (isNaN(cox[index]))
          cox[index] = cps[0];
        if (isNaN(coy[index]))
          coy[index] = cps[1];
        if (isNaN(cox[index + 1]))
          cox[index + 1] = cps[2];
        if (isNaN(coy[index + 1]))
          coy[index + 1] = cps[3];
      }
    },
    useSeg: function (seg) {
      var i0 = seg.i0, co = this.coefficeint, cx = co.x, cy = co.y, ci = i0 * 2;
      return this.interpolateSeg(seg.t, [seg.x0, cx[ci], cx[ci + 1], seg.x1], [seg.y0, cy[ci], cy[ci + 1], seg.y1]);
    },
    calCP: function (P0x, P0y, P1x, P1y, P_1x, P_1y) {
      //CP0=P0+(P1-P_1)/2;CP1=P0-(P1-P_1)/2;
      var dx = (P1x - P_1x) / 6, dy = (P1y - P_1y) / 6;
      return [P0x + dx, P0y + dy, P0x - dx, P0y - dy];
    }
  }
});
Flip.interpolation({
  name: 'beizerQuadratic,beizer-2,quadraticBeizer',
  degree: 2,
  weightMat: [[1, -2, 1], [-2, 2, 0], [1, 0, 0]],
  options: {
    startVec: null,
    cps: [],
    cx: [],
    cy: []
  },
  prototype: {
    init: function (opt) {
      this._ensureAxisAlign();
      this._initControlPoints(opt);
    },
    //TODO:this has some bugs
    _ensureControlPoints: function (opt) {
      var co = this.coefficeint, xs = this.axis.x, ys = this.axis.y, cox = co.x, coy = co.y, vec;
      //C(i+1)+Ci=2P(i+1);
      if (isNaN(cox[0]) || isNaN(coy[0])) {  //2(Pc-P0)=Pt0
        vec = opt.startVec || [1, 1];
        cox[0] = Vec.get(vec, 'x') + xs[0];
        coy[0] = Vec.get(vec, 'y') + ys[0];
      }
      for (var i = 0, len = cox.length, ni; i < len; i++) {
        if (isNaN(cox[ni = i + 1]))cox[ni] = 2 * xs[ni] - cox[i];
        if (isNaN(coy[ni]))coy[ni] = 2 * ys[ni] - coy[i];
      }
    },
    _initControlPoints: function (opt) {
      var xs = this.axis.x, segLen = xs.length - 1, co, cx, cy;
      this.coefficeint = co = {
        x: new Float32Array(new Array(segLen)), y: new Float32Array(new Array(segLen))
      };
      if (opt.cps)
        opt.cps.forEach(function (cp, i) {
          co.x[i] = Vec.get(cp, 'x');
          co.y[i] = Vec.get(cp, 'y');
        });
      else if ((cx = opt.cx) && (cy = opt.cy) && cx.length == cy.length)
        cx.forEach(function (x, i) {
          co.x[i] = x;
          co.y[i] = cy[i];
        });
      this._ensureControlPoints(opt);
    },
    useSeg: function (seg) {
      var i0 = seg.i0, co = this.coefficeint;
      return this.interpolateSeg(seg.t, [seg.x0, co.x[i0], seg.x1], [seg.y0, co.y[i0], seg.y1]);
    },
    setCP: function (i, cpOrx1, y) {
      var co = this.coefficeint, x;
      if (typeof cpOrx1 == "object") {
        co.x[i] = Vec.get(cpOrx1, 'x');
        co.y[i] = Vec.get(cpOrx1, 'y');
      } else {
        co.x[i] = cpOrx1;
        co.y[i] = y;
      }
    }
  }
});
Flip.interpolation({
  name: 'cubic',
  degree: 3,
  weightMat: [[2, -2, 1, 1], [-3, 3, -2, -1], [0, 0, 1, 0], [1, 0, 0, 0]],
  options: {
    startVec: null,
    endVec: null
  },
  prototype: {
    init: function (opt) {
      this._ensureAxisAlign();
      this._initSegments(opt);
    },
    _initSegments: function (opt) {
      var sVec = opt.startVec, eVec = opt.endVec, xs = this.axis.x, ys = this.axis.y,
        n = xs.length, px = [], py = [], mat = new Matrix(n - 2);
      var fParam, fx, fy;
      if (sVec) {
        fParam = [4, 1];
        fx = sVec[0];
        fy = sVec[1];
      }
      else {
        fParam = [3.5, 1];
        fx = 1.5 * (xs[1] - xs[0]);
        fy = 1.5 * (ys[1] - ys[0]);
      }
      //set first row
      mat.setRow(0, fParam);
      px[0] = 3 * (xs[2] - xs[0]) - fx;
      py[0] = 3 * (ys[2] - ys[0]) - fy;
      for (var i = 1; i < n - 3; i++) {
        mat.setRow(i, [1, 4, 1], i - 1);
        px[i] = 3 * (xs[i + 2] - xs[i]);
        py[i] = 3 * (ys[i + 2] - ys[i]);
      }
      //set last row
      if (i == n - 3) {
        if (eVec) {
          fParam = [1, 4];
          fx = eVec[0];
          fy = eVec[1];
        }
        else {
          fParam = [1, 3.5];
          fx = 1.5 * (xs[i + 2] - xs[i + 1]);
          fy = 1.5 * (ys[i + 2] - ys[i + 1]);
        }
        mat.setRow(i, fParam, i - 1);
        px[i] = 3 * (xs[i + 2] - xs[i]) - fx;
        py[i] = 3 * (ys[i + 2] - ys[i]) - fy;
      }
      var lu = Matrix.luDecompose(mat), rx, ry;
      rx = Matrix.luSolve(lu.L, lu.U, px);
      ry = Matrix.luSolve(lu.L, lu.U, py);
      if (eVec) {
        rx.push(eVec[0]);
        ry.push(eVec[1]);
      }
      else {
        rx.push(1.5 * (xs[n - 1] - xs[n - 2]) - 0.5 * rx[n - 3]);
        ry.push(1.5 * (ys[n - 1] - ys[n - 2]) - 0.5 * ry[n - 3]);
      }
      if (sVec) {
        rx.unshift(sVec[0]);
        ry.unshift(sVec[1]);
      } else {
        rx.unshift(1.5 * (xs[1] - xs[0]) - 0.5 * rx[0]);
        ry.unshift(1.5 * (ys[1] - ys[0]) - 0.5 * ry[0]);
      }
      this.coefficeint = {x: rx, y: ry}
    },
    useSeg: function (seg) {
      var co = this.coefficeint, i0 = seg.i0, i1 = seg.i1;
      return this.interpolateSeg(seg.t,
        [seg.x0, seg.x1, co.x[i0], co.x[i1]],
        [seg.y0, seg.y1, co.y[i0], co.y[i1]])
    }
  }
});
Flip.interpolation({
  name: 'linear',
  degree: 1,
  weightMat: [[-1, 1], [1, 0]],
  prototype: {
    init: function () {
      this._ensureAxisAlign();
    },
    interpolate: function (x, skip) {
      var seg = this._findSegByX0(x, skip);
      return this.interpolateSeg(seg.t, [seg.x0, seg.x1], [seg.y0, seg.y1]);
    },
    when: function (t) {
      var seg = this._findSegByT(t);
      return this.interpolateSeg(seg.t, [seg.x0, seg.x1], [seg.y0, seg.y1]);
    }
  }
});
/*
 |-1,1,-1|
 (t2,t,1) |0, 0, 1|(P1,P2,Pt1)
 |1, 0, 0|

 Pt1+Pt2=2*(P2-P1)
 */
Flip.interpolation({
  name: 'quadratic',
  degree: 2,
  weightMat: [[-1, 1, -1], [0, 0, 1], [1, 0, 0]],
  options: {
    startVec: {x: 1, y: 1}
  },
  prototype: {
    init: function (opt) {
      this._ensureAxisAlign();
      this._initSegments(opt);
    },
    _initSegments: function (opt) {
      var xs = this.axis.x, ys = this.axis.y, n = xs.length, mat = new Matrix(n - 1), lu, px = [], py = [];
      for (var i = 1, j, para = [1, 1]; i < n; i++) {
        j = i - 1;
        mat.setRow(j, para, j - 1);
        px[j] = (xs[i] - xs[j]) * 2;
        py[j] = (ys[i] - ys[j]) * 2;
      }
      var sVec = opt.startVec || {x: 1, y: 1};
      lu = Matrix.luDecompose(mat);
      px[0] -= sVec.x;
      py[0] -= sVec.y;
      px = Matrix.luSolve(lu.L, lu.U, px);
      py = Matrix.luSolve(lu.L, lu.U, py);
      px.unshift(sVec.x);
      py.unshift(sVec.y);
      this.coefficeint = {x: px, y: py}
    },
    useSeg: function (seg) {
      var co = this.coefficeint, i0 = seg.i0;
      return this.interpolateSeg(seg.t, [seg.x0, seg.x1, co.x[i0]], [seg.y0, seg.y1, co.y[i0]]);
    }
  }
});})();