/**
 * Created by 柏然 on 2014/12/28.
 */
/*
 |-1,1,-1|
 (t2,t,1) |0, 0, 1|(P1,P2,Pt1)
 |1, 0, 0|

 Pt1+Pt2=2*(P2-P1)
 */
Flip.interpolation({
  name: 'quadratic',
  degree: 2,
  weightMat: [[-1, 1, -1], [0, 0, 1], [1, 0, 0]],
  options: {
    startVec: {x: 1, y: 1}
  },
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
    getCalcParam: function (seg) {
      var co = this.coefficeint, i0 = seg.i0;
      return {
        t:seg.t,
        vx:[seg.x0, seg.x1, co.x[i0]],
        vy:[seg.y0, seg.y1, co.y[i0]]
      };
    }
  }
});