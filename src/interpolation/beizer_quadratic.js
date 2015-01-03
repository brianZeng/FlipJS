/**
 * Created by 柏然 on 2014/12/31.
 */
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
    _ensureControlPoints: function () {
      var co = this.coefficeint, xs = this.axis.x, ys = this.axis.y, cox = co.x, coy = co.y;
      //C(i+1)+Ci=2P(i+1);
      for (var i = 0, len = co.length, ni; i < len; i++) {
        if (isNaN(cox[ni = i + 1]))cox[ni] = 2 * xs[ni] - cox[i];
        if (isNaN(coy[ni]))coy[ni] = 2 * ys[ni] - coy[i];
      }
    },
    _initControlPoints: function (opt) {
      var xs = this.axis.x, segLen = xs.length - 1, ys = this.axis.y, co, cx, cy, vec;
      this.coefficeint = co = {
        x: new Float32Array(new Array(segLen)), y: new Float32Array(new Array(segLen))
      };
      if (opt.cps)
        opt.cps.forEach(function (cp, i) {
          if (i <= segLen)
            co.x[i] = Vec.get(cp, 'x');
          co.y[i] = Vec.get(cp, 'y');
        });
      else if ((cx = opt.cx) && (cy = opt.cy) && cx.length == cy.length)
        cx.forEach(function (x, i) {
          co.x[i] = x;
          co.y[i] = cy[i];
        });
      else if (typeof(vec = opt.startVec) === "object") {
        //2(Pc-P0)=Pt0
        co.x[0] = Vec.get(vec, 'x');
        co.y[0] = Vec.get(vec, 'y');
      }
      else throw Error('cannot generate control points');
      this._ensureControlPoints(co, xs, ys);
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