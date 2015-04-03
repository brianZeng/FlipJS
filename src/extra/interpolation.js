/**
 * Created by brian on 2014/12/23.
 */
function Interpolation(opt) {
  if (!(this instanceof Interpolation))return new Interpolation(opt);
  if (opt.data instanceof Array) {
    var pts = opt.data, len = pts.length, xs = new Float32Array(len), ys = new Float32Array(len);
    for (var i = 0, p = pts[0]; i < len; p = pts[++i]) {
      //both p={x:0,y:0} or p=[0,0] are ok
      xs[i] = GLVec.get(p,'x');
      ys[i] = GLVec.get(p,'y');
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
  interpolateBySeg: function (seg) {
    var param=this.getCalcParam(seg);
    return this.calcPoint(this.calcVt(param.t), param.vx,param.vy);
  },
  interpolate: function (x, skip) {
    return this.interpolateBySeg(this._findSegByX0(x, skip));
  },
  deriveBySeg:function(seg){
    var param=this.getCalcParam(seg);
    return this.calcPoint(this.calcVdt(param.t),param.vx,param.vy);
  },
  deriveWhen:function(t){
    var r=this.deriveBySeg(this._findSegByT(t));
    return r.y/ r.x;
  },
  when: function (t) {
    return this.interpolateBySeg(this._findSegByT(t));
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
  calcPoint:function(){
    throw Error('must be implement by specific interpolation');
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
      var  pow = Math.pow;
      var degreeCache={
        "0":[function(){return [1]},function(){return [0]}],
        "1":[function (t) {return [t, 1]},function(){return [1,0]}],
        "2":[function(t){return [t * t, t, 1]},function(t){return [2*t,1,0]}],
        "3":[function(t){var t2 = t * t;return [t2 * t, t2, t, 1]},function(t){return [3*t*t,2*t,1,0]}]
      };
      function genVtFunc(degree) {
         return degreeCache[degree]||[ function (t) {
            for (var i = 1, r = [1]; i <= degree; i++)
              r.unshift(pow(t, i));
            return r;
          },function(t){
             for (var i = 1, r = [0]; i <= degree; i++)
               r.unshift(pow(t, i-1)*i);
             return r;
           }]
      }
      return function (degree, proto) {
        var funs=genVtFunc(degree);
        // t -> vt
        proto.calcVt = funs[0];
        // t-> Vdt
        proto.calcVdt=funs[1];
      }
    })(),
    weightMat: function (matLike, proto) {
      var mat;
      if (matLike instanceof Matrix)mat = matLike;
      else if (matLike instanceof Array)mat = Matrix.fromRows.apply(matLike, matLike);
      proto.calcPoint = function (vt, vx, vy) {
        var pv = GLVec.multiMat(vt, mat);
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
