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
  interpolate: function (x) {
  },
  getItor: function () {
    var xs = this.axis.x, self = this;
    return new InterItor({
      x1: xs[xs.length - 1],
      x0: xs[0],
      interpolate: function (x) {
        return self.interpolate(x);
      }
    })
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
  var x0 = opt.x0, x1 = opt.x1, cur, curPoint;
  this.reset = opt.reset || function () {
    return cur = x0;
  };
  this.hasNext = opt.hasNext || function () {
    return cur <= x1;
  };
  this.next = opt.next || function () {
    if (cur > x1)return undefined;
    return curPoint = opt.interpolate(cur++);
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
  function main(opt) {
    var Constructor, name = opt.name;
    Constructor = function (opt) {
      if (!(this instanceof Constructor))return new Constructor(opt);
      if (opt instanceof Array)opt = {data: opt};
      Interpolation.call(this, opt);
    };
    inherit(Constructor, Interpolation.prototype, opt.prototype);
    if (name) main[name] = Constructor;
    return Constructor;
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
