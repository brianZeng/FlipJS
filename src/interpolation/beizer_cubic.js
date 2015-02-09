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
    getCalcParam:function(seg){
      var i0 = seg.i0, co = this.coefficeint, cx = co.x, cy = co.y, ci = i0 * 2;
      return {
        t:seg.t,
        vx: [seg.x0, cx[ci], cx[ci + 1], seg.x1],
        vy:[seg.y0, cy[ci], cy[ci + 1], seg.y1]
      }
    },
    calCP: function (P0x, P0y, P1x, P1y, P_1x, P_1y) {
      //CP0=P0+(P1-P_1)/2;CP1=P0-(P1-P_1)/2;
      var dx = (P1x - P_1x) / 6, dy = (P1y - P_1y) / 6;
      return [P0x + dx, P0y + dy, P0x - dx, P0y - dy];
    }
  }
});