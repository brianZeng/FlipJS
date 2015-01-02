/**
 * Created by 柏然 on 2015/1/2.
 */
Flip.interpolation({
  name: 'beizerCubic,beizer-3,cubicBeizer',
  degree: 3,
  weightMat: [[1, 3, -3, 1], [3, -6, 3, 0], [-3, 3, 0, 0], [1, 0, 0, 0]],
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
    setCP: (function () {
      var vec = Flip.Vec.get;
      return function (i, cp0, cp1, x1, y1) {
        var xs, ys;
        if (arguments.length == 3) {
          xs = [vec(cp0, 'x'), vec(cp1, 'x')];
          ys = [vec(cp0, 'y'), vec(cp1, 'y')];
        }
        else {
          xs = [cp0, x1];
          ys = [cp1, y1];
        }
        this.coefficeint[i] = {x: new Float32Array(xs), y: new Float32Array(ys)}
      }
    })(),
    _initControlPoints: function (opt) {
      var xs = this.axis.x, segCount = xs.length - 1, i, j, gps, cy, cx, len = segCount * 2;
      this.coefficeint = new Array(segCount);
      if (gps = opt.cps)
        for (j = i = 0; i < len; i += 2, j++)
          this.setCP(j, gps[i], gps[i + 1]);
      else if ((cx = opt.cx) && (cy = opt.cy))
        for (j = i = 0; i < len; i += 2, j++)
          this.setCP(j, cx[i], cy[i], cx[i + 1], cy[i + 1]);
      else
        throw Error('');
    },
    _ensureControlPoints: function () {
    },
    useSeg: function (seg) {
      var i0 = seg.i0, cs = this.coefficeint, co = cs[i0], cx = co.x, cy = co.y;
      return this.interpolateSeg(seg.t, [seg.x0, seg.x1, cx[0], cx[1]], [seg.y0, seg.y1, cy[0], cy[1]]);
    }
  }
});