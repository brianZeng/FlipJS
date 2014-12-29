/**
 * Created by brian on 2014/12/23.
 */
function Interpolation(opt) {
  if (!(this instanceof Interpolation))return new Interpolation(opt);
  var pts;
  if (opt.data instanceof Array) {
    pts = arrSort(opt.data, 'x');
    this.axis = {
      x: pts.map(function (p) {
        return p.x
      }), y: pts.map(function (p) {
        return p.y
      })
    };
  }
  else {
    if (pts = opt.x)this.axis = {x: pts};
    else throw Error('the data of X axis not provided');
    if (pts = opt.y)this.axis.y = pts;
    else throw Error('the data of Y axis not provided');
  }
  this.init(opt);
}
inherit(Interpolation, {
  init: function (points) {
  },
  getPoint: function (t) {
    var xs = this.axis.x;
    return this.interpolate(xs[0] + this.dx * this._clampT(t));
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
    else if (i0 > segCount)i0 = segCount;
    i1 = i0 + 1;
    r = this._getSeg(i0, i1, xs);
    r.t = ts - i0;
    return r;
  },
  interpolate: function (x) {
  },
  itor: function (opt) {
    var xs = this.axis.x, interval, count, self = this;
    opt = createProxy(opt);
    count = opt.source('count') || (Math.max.apply(null, xs) - Math.min.apply(null, xs));
    opt('interval', 1 / count, 'when', function (t) {
      return self.when(t);
    });
    return new InterItor(opt.result);
  },
  _getT: function (x) {
    var xs = this.axis.x, x0 = xs[0];
    return (x - x0) / (xs[xs.length - 1] - x0)
  },
  _clampT: function (t) {
    t = parseFloat(t) || 0;
    return t < 0 ? 0 : (t > 1 ? 1 : t);
  },
  _initDx: function () {
    var xs = this.axis.x;
    this.dx = xs[xs.length - 1] - xs[0];
  },
  _fistLargerX: function (x) {
    return arrFirst(this.axis.x, function (num) {
      return num >= x
    });
  },
  _ensureAxisAlign: function () {
    var axis = this.axis;
    if (axis.x.length !== axis.y.length)throw Error('x and y must have same amount of data');
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
    if (end)return undefined;
    curPoint = opt.when(t);
    t += interval;
    if (t >= 1)end = 1;
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
    var cache = [];
    this.reset();
    while (this.hasNext())
      cache.push(this.next());
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
  };
  function main(opt) {
    var Constructor, name = opt.name;
    Constructor = function (opt) {
      if (!(this instanceof Constructor))return new Constructor(opt);
      if (opt instanceof Array)opt = {data: opt};
      Interpolation.call(this, opt);
    };
    inherit(Constructor, Interpolation.prototype, addPrototype(opt.prototype, opt));
    if (name) main[name] = Constructor;
    Object.seal(Constructor.prototype);
    return Constructor;
  }

  function addPrototype(proto, opt) {
    objForEach(handler, function (fun, name) {
      var v = opt[name];
      if (v !== undefined) fun(v, proto, opt)
    });
    return proto;
  }
  Flip.interpolate = function (nameOrOpt, dataOrXData, YData) {
    var opt;
    if (typeof nameOrOpt == "string") {
      opt = {name: nameOrOpt};
      if (dataOrXData instanceof Array) {
        opt.x = dataOrXData;
        opt.y = YData;
      }
      else opt.data = dataOrXData;
    }
    else opt = nameOrOpt;
    return new main[opt.name](opt);
  };
  return Flip.interpolation = main;
})(Flip);
