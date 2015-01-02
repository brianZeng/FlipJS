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
    _ensureControlPoints: function (coefficient, xs, ys) {
      //C(i+1)+Ci=2P(i+1);
      for (var i = 0, len = coefficient.length - 1, cp = coefficient[0], ni; i < len; cp = coefficient[++i])
        if (coefficient[(ni = i + 1)] === undefined)
          coefficient[ni] = [2 * xs[ni] - cp[0], 2 * ys[ni] - cp[1]];
    },
    _initControlPoints: function (opt) {
      var xs = this.axis.x, segLen = xs.length - 1, ys = this.axis.y, co = new Array(segLen), cx, cy, vec;
      if (opt.cps)
        opt.cps.forEach(function (cp, i) {
          if (i <= segLen)co[i] = [Vec.get(cp, 'x'), Vec.get(cp, 'y')];
        });
      else if ((cx = opt.cx) && (cy = opt.cy) && cx.length == cy.length)cx.forEach(function (x, i) {
        co[i] = [x, cy[i]]
      });
      else if (typeof(vec = opt.startVec) === "object") {
        cx = Vec.get(vec, 'x');
        cy = Vec.get(vec, 'y');
        //2(Pc-P0)=Pt0
        co[0] = [cx / 2 + xs[0], cy / 2 + ys[0]];
      }
      else throw Error('cannot generate control points');
      this._ensureControlPoints(this.coefficeint = co, xs, ys);
    },
    useSeg: function (seg) {
      var i0 = seg.i0, cs = this.coefficeint, co = cs[i0];
      return this.interpolateSeg(seg.t, [seg.x0, co[0], seg.x1], [seg.y0, co[1], seg.y1]);
    }
  }
});