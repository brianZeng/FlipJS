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
    //TODO:this has some bugs
    _ensureControlPoints: function (opt) {
      var co = this.coefficeint, xs = this.axis.x, ys = this.axis.y, cox = co.x, coy = co.y, vec;
      //C(i+1)+Ci=2P(i+1);
      if (isNaN(cox[0]) || isNaN(coy[0])) {  //2(Pc-P0)=Pt0
        vec = opt.startVec || [1, 1];
        cox[0] = GLVec.get(vec, 'x') + xs[0];
        coy[0] = GLVec.get(vec, 'y') + ys[0];
      }
      for (var i = 0, len = cox.length, ni; i < len; i++) {
        if (isNaN(cox[ni = i + 1]))cox[ni] = 2 * xs[ni] - cox[i];
        if (isNaN(coy[ni]))coy[ni] = 2 * ys[ni] - coy[i];
      }
    },
    _initControlPoints: function (opt) {
      var xs = this.axis.x, segLen = xs.length - 1, co, cx, cy;
      this.coefficeint = co = {
        x: new Float32Array(new Array(segLen)), y: new Float32Array(new Array(segLen))
      };
      if (opt.cps)
        opt.cps.forEach(function (cp, i) {
          co.x[i] = GLVec.get(cp, 'x');
          co.y[i] = GLVec.get(cp, 'y');
        });
      else if ((cx = opt.cx) && (cy = opt.cy) && cx.length == cy.length)
        cx.forEach(function (x, i) {
          co.x[i] = x;
          co.y[i] = cy[i];
        });
      this._ensureControlPoints(opt);
    },
    getCalcParam: function (seg) {
      var i0 = seg.i0, co = this.coefficeint;
      return {
        t:seg.t,
        vx: [seg.x0, co.x[i0], seg.x1],
        vy: [seg.y0, co.y[i0], seg.y1]
      }
    },
    setCP: function (i, cpOrx1, y) {
      var co = this.coefficeint, x;
      if (typeof cpOrx1 == "object") {
        co.x[i] = GLVec.get(cpOrx1, 'x');
        co.y[i] = GLVec.get(cpOrx1, 'y');
      } else {
        co.x[i] = cpOrx1;
        co.y[i] = y;
      }
    }
  }
});