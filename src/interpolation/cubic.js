/**
 * Created by brian on 2014/12/23.
 */
Flip.interpolation({
  name: 'cubic',
  prototype: {
    init: function (opt) {
      this._ensureAxisAlign();
      this._initSegments(opt.tension);
    },
    _initSegments: function (tension) {
      var xs = this.axis.x, ys = this.axis.y, x0, x1, x2, y0, y1, y2, segments = [];
      for (var i = 1, len = xs.length, segInfo; i < len; i += 2) {
        x1 = xs[i];
        x0 = xs[i - 1];
        y1 = ys[i];
        y0 = ys[i - 1];
        if (i + 1 == len) {
          x2 = 2 * x1 - x0;
          y2 = 2 * y1 - y0;
        }
        else {
          x2 = xs[i + 1];
          y2 = ys[i + 1];
        }
        segments.push(segInfo = this.calSegmentParam(x0, x1, x2, y0, y1, y2, tension));
      }
      this.coefficeint = segments;
    },
    calSegmentParam: function (x0, x1, x2, y0, y1, y2, tension) {
      tension = tension || 0.5;
      var M = y1 - y0, N = y2 - y1, P = x1 - x0, Q = x2 - x1, F = M / P / tension, G = N / Q / tension, T = P - Q, a, b;
      b = ((M - N) - F * T) / (F - G) * 4;
      a = b + T * 4;
      return {xa: a, xb: b, ya: a * F, yb: b * G, x: [x0, x1, x2, P, Q], y: [y0, y1, y2, M, N]}
    },
    interpolate: function (x) {
      /* var i0, i1, xs = this.axis.x, x0, t, vp, t2, t3;
      i0 = xs.indexOf(arrFirst(xs, function (num) {
        return num >= x
      }));
      if (i0 > 0)i0--;
      i1 = i0 + 3;
      if (i1 >= xs.length - 1) {
        i1 = xs.length - 1;
        i0 = i1 - 3;
      }
      t = (x - (x0 = xs[i0])) / (xs[i1] - x0);
      t2 = t * t;
      t3 = t2 * t;
      vp = [
        -4.5 * t3 + 9 * t2 - 5.5 * t + 1,
        13.5 * t3 - 22.5 * t2 + 9 * t,
        -13.5 * t3 + 18 * t2 - 4.5 * t,
        4.5 * t3 - 4.5 * t2 + t
      ];
      return {
        x: x,//Vec.multi(vp, vx)
        y: Vec.multi(vp, this.axis.y.slice(i0, i0 + 4))
       }*/
      var seg, t, xs, vx, vy, ys, t2, t3, vp;
      seg = arrFirst(this.coefficeint, function (seg) {
        return seg.x[2] >= x
      });
      if (x == 60)debugger;
      xs = seg.x;
      ys = seg.y;
      if (x > (xs[1]))t = (x - xs[1]) / xs[4] / 2 + 0.5;
      else t = (x - xs[0]) / xs[3] / 2;
      t3 = (t2 = t * t) * t;
      vx = [xs[0], xs[2], seg.xa, seg.xb];
      vy = [ys[0], ys[2], seg.ya, seg.yb];
      vp = [2 * t3 - 3 * t2 + 1, -2 * t3 + 3 * t2, t3 - 2 * t2 + t, t3 - t2];
      return {
        x: Vec.multi(vp, vx),
        y: Vec.multi(vp, vy)
      }
    }
  }
});