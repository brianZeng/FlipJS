/**
 * Created by 柏然 on 2015/1/2.
 */
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
    setCP: (function () {
      var vec = Flip.Vec.get;
      return function (i, cp0, cp1, x1, y1) {
        var xs, ys;
        if (arguments.length == 3) {
          if (cp0) {
            xs = [vec(cp0, 'x'), cp1 ? vec(cp1, 'x') : NaN];
            ys = [vec(cp0, 'y'), cp1 ? vec(cp1, 'y') : NaN];
          } else xs = ys = [NaN, NaN];
        }
        else if (arguments.length == 5) {
          xs = [cp0, x1];
          ys = [cp1, y1];
        }
        else throw  Error('invalid arguments');
        this.coefficeint[i] = {x: new Float32Array(xs), y: new Float32Array(ys)}
      }
    })(),
    _initControlPoints: function (opt) {
      var xs = this.axis.x, segCount = xs.length - 1, i, j, gps, cy, cx, len = segCount * 2, vec;
      this.coefficeint = new Array(segCount);
      if (!opt.cps && !opt.cx && !opt.cy && (vec = opt.startVec))
        opt = {cps: [[xs[0] + Vec.get(vec, 'x'), this.axis.y[0] + Vec.get(vec, 'y')]]};
      if (gps = opt.cps)
        for (j = i = 0; i < len; i += 2, j++)
          this.setCP(j, gps[i], gps[i + 1]);
      else if ((cx = opt.cx) && (cy = opt.cy))
        for (j = i = 0; i < len; i += 2, j++)
          this.setCP(j, cx[i], cy[i], cx[i + 1], cy[i + 1]);
      else throw Error('can not generate controlPoints');
      this._ensureControlPoints();
    },
    _ensureControlPoints: function () {
      var co = this.coefficeint, xs = this.axis.x, ys = this.axis.y, segCount = xs.length - 1, cp;
      if (!(cp = co[0]))
        throw Error('the first control point needed');
      for (var i = 0, r; i < segCount; i++) {
        r = this.calCP(xs[i], ys[i], xs[i + 1], ys[i + 1], cp.x[0], cp.y[0]);
        setCPWhenNaN(1, r[0], r[1]);
        cp = co[i + 1];
        setCPWhenNaN(0, r[2], r[3]);
      }
      function setCPWhenNaN(index, x, y) {
        if (cp) {
          if (isNaN(cp.x[index]))
            cp.x[index] = x;
          if (isNaN(cp.y[index]))
            cp.y[index] = y;
        }
      }
    },
    useSeg: function (seg) {
      var i0 = seg.i0, cs = this.coefficeint, co = cs[i0], cx = co.x, cy = co.y;
      return this.interpolateSeg(seg.t, [seg.x0, cx[0], cx[1], seg.x1], [seg.y0, cy[0], cy[1], seg.y1]);
    },
    calCP: function (P0x, P0y, P1x, P1y, CP0x, CP0y) {
      //Pt1_i=Pt0_i+1 => 2P1_i=CP1_i+CP0_i+1
      //Ptt0_i=0 => 2CP0_i=CP1_i+P0_i
      var CP1x = 2 * CP0x - P0x, CP1y = 2 * CP0y - P0y;
      return [CP1x, CP1y, 2 * P1x - CP1x, 2 * P1y - CP1y];
    }
  }
});