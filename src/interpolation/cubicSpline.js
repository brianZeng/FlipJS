/**
 * Created by 柏然 on 2014/12/28.
 */
Flip.interpolation({
  name: 'cubic-spline',
  prototype: {
    init: function (opt) {
      this._ensureAxisAlign();
      this._initSegments(opt);
    },
    interpolateSeg: (function () {
      var weight = Matrix.fromRows([2, -2, 1, 1], [-3, 3, -2, -1], [0, 0, 1, 0], [1, 0, 0, 0]);
      return function (t, vx, vy) {
        var t2 = t * t, pv = Vec.multiMat([t2 * t, t2, t, 1], weight);
        return {x: pv.dot(vx), y: pv.dot(vy)}
      }
    })(),
    _initSegments: function (opt) {
      var sVec = opt.startVec, eVec = opt.endVec, xs = this.axis.x, ys = this.axis.y,
        n = xs.length, px = [], py = [], mat = new Matrix(n - 2);
      var fParam, fx, fy;
      if (sVec) {
        fParam = [4, 1];
        fx = sVec[0];
        fy = sVec[1];
      }
      else {
        fParam = [3.5, 1];
        fx = 1.5 * (xs[1] - xs[0]);
        fy = 1.5 * (ys[1] - ys[0]);
      }
      //set first row
      mat.setRow(0, fParam);
      px[0] = 3 * (xs[2] - xs[0]) - fx;
      py[0] = 3 * (ys[2] - ys[0]) - fy;
      for (var i = 1; i < n - 3; i++) {
        mat.setRow(i, [1, 4, 1], i - 1);
        px[i] = 3 * (xs[i + 2] - xs[i]);
        py[i] = 3 * (ys[i + 2] - ys[i]);
      }
      //set last row
      if (i == n - 3) {
        if (eVec) {
          fParam = [1, 4];
          fx = eVec[0];
          fy = eVec[1];
        }
        else {
          fParam = [1, 3.5];
          fx = 1.5 * (xs[i + 2] - xs[i + 1]);
          fy = 1.5 * (ys[i + 2] - ys[i + 1]);
        }
        mat.setRow(i, fParam, i - 1);
        px[i] = 3 * (xs[i + 2] - xs[i]) - fx;
        py[i] = 3 * (ys[i + 2] - ys[i]) - fy;
      }
      var lu = Matrix.luDecompose(mat), rx, ry;
      rx = Matrix.luSolve(lu.L, lu.U, px);
      ry = Matrix.luSolve(lu.L, lu.U, py);
      if (eVec) {
        rx.push(eVec[0]);
        ry.push(eVec[1]);
      }
      else {
        rx.push(1.5 * (xs[n - 1] - xs[n - 2]) - 0.5 * rx[n - 3]);
        ry.push(1.5 * (ys[n - 1] - ys[n - 2]) - 0.5 * ry[n - 3]);
      }
      if (sVec) {
        rx.unshift(sVec[0]);
        ry.unshift(sVec[1]);
      } else {
        rx.unshift(1.5 * (xs[1] - xs[0]) - 0.5 * rx[0]);
        ry.unshift(1.5 * (ys[1] - ys[0]) - 0.5 * ry[0]);
      }
      this.coefficeint = {x: rx, y: ry}
    },
    interpolate: function (x) {
      var xs = this.axis.x, ys = this.axis.y, x1, x0, i1, i0, t, co;
      x1 = this._fistLargerX(x);
      i0 = (i1 = xs.indexOf(x1) || 1) - 1;
      x0 = xs[i0];
      t = (x - x0) / (x1 - x0) || 0;
      co = this.coefficeint;
      return this.interpolateSeg(t, [x0, x1, co.x[i0], co.x[i1]], [ys[i0], ys[i1], co.y[i0], co.y[i1]]);
    }
  }
});