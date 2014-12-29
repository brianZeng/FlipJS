/**
 * Created by brian on 2014/12/24.
 */
(function (register) {

  function devidedDiff(from, to, points, intervals) {
    var dis = intervals[from] - intervals[to];
    if (from == 0)return points[0];
    return ((from - to == 1) ?
      points[from] - points[to] : devidedDiff(from, to + 1, points, intervals) - devidedDiff(from - 1, to, points, intervals))
      / dis
  }

  register({
    name: 'newton',
    prototype: {
      calCoefficient: function () {
        var xs = this.axis.x, x0 = xs[0], dx = this.dx - x0, ts, ys = this.axis.y, co;
        ts = this.axis.t = xs.map(function (x) {
          return (x - x0) / dx
        });
        co = this.coefficeint = ts.map(function (t, i) {
          return {
            x: devidedDiff(i, 0, xs, ts),
            y: devidedDiff(i, 0, ys, ts)
          }
        });
        co.x0 = x0;
        co.x1 = dx + x0;
        co.y1 = ys[ys.length - 1];
        co.y0 = ys[0];
      },
      init: function (opt) {
        this._ensureAxisAlign();
        this._initDx();
        this.calCoefficient();
        if (opt.compress) {
          this.axis.x = null;
          this.axis.y = null;
        }
      },
      itor: function () {
        var self = this;
        return new InterItor({
          x1: self.coefficeint.x1,
          x0: self.coefficeint.x0,
          interpolate: function (x) {
            return self.interpolate(x);
          }
        })
      },
      getPoint: function (t) {
        var ps = this.coefficeint, ts = this.axis.t, n = ts.length;
        if (t == 0) return {x: ps.x0, y: ps.y0};
        else if (t == 1)return {x: ps.x1, y: ps.y1};
        for (var i = 1, sx = ps[0].x, sy = ps[0].y, nt = 1; i < n; i++) {
          nt *= (t - ts[i - 1]);
          sy += nt * ps[i].y;
          sx += nt * ps[i].x;
        }
        return {x: sx, y: sy}
      },
      interpolate: function (x) {
        var co = this.coefficeint;
        return this.getPoint((x - co.x0) / (co.x1 - co.x0));
      }
    }
  });
})(Flip.interpolation);