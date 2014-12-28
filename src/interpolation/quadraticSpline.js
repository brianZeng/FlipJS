/**
 * Created by 柏然 on 2014/12/28.
 */
Flip.interpolation({
  name: 'quadratic-spline',
  /*
   |-1,1,-1|
   (t2,t,1)|0, 0, 1|(P1,P2,Pt1)
   |1, 0, 0|

   Pt1+Pt2=2*(P2-P1)
   */
  prototype: {
    init: function (opt) {
      this._ensureAxisAlign();
      this._initSegments(opt);
    },
    _initSegments: function (opt) {
      var xs = this.axis.x, ys = this.axis.y, n = xs.length, mat = new Matrix(n - 1), lu, px = [], py = [];
      for (var i = 1, j, para = [1, 1]; i < n; i++) {
        j = i - 1;
        mat.setRow(j, para, j - 1);
        px[j] = (xs[i] - xs[j]) * 2;
        py[j] = (ys[i] - ys[j]) * 2;
      }
      var sVec = opt.startVec || {x: 1, y: 1};
      lu = Matrix.luDecompose(mat);
      px[0] -= sVec.x;
      py[0] -= sVec.y;
      px = Matrix.luSolve(lu.L, lu.U, px);
      py = Matrix.luSolve(lu.L, lu.U, py);
      px.unshift(sVec.x);
      py.unshift(sVec.y);
      this.coefficeint = {x: px, y: py}
    },
    interpolateSeg: (function () {
      var weight = Matrix.fromRows([-1, 1, -1], [0, 0, 1], [1, 0, 0]);
      return function (t, vx, vy) {
        var pVec = Vec.multiMat([t * t, t, 1], weight);
        return {x: pVec.dot(vx), y: pVec.dot(vy)}
      }
    })(),
    interpolate: function (x) {
      var xs = this.axis.x, ys = this.axis.y, x1, x0, i1, i0, t, co;
      x1 = this._fistLargerX(x);
      i0 = (i1 = xs.indexOf(x1) || 1) - 1;
      x0 = xs[i0];
      t = (x - x0) / (x1 - x0) || 0;
      co = this.coefficeint;
      return this.interpolateSeg(t, [x0, x1, co.x[i0]], [ys[i0], ys[i1], co.y[i0]]);
    }
  }
});