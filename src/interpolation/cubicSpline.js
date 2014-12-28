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
    _initSegments: function (opt) {
      var sVec = opt.startVec, eVec = opt.endVec, xs = this.axis.x, ys = this.axis.y, n = xs.length, px = [], py = [], mat = new Matrix(n - 2);
      var fParam, fx, fy;
      if (sVec) {
        fParam = [4, 1];
        fx = sVec.x;
        fy = sVec.y;
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
          fx = eVec.x;
          fy = eVec.y;
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
        rx.push(eVec.x);
        ry.push(eVec.y);
      }
      else {
        rx.push(1.5 * (xs[n - 1] - xs[n - 2]) - 0.5 * rx[n - 3]);
        ry.push(1.5 * (ys[n - 1] - ys[n - 2]) - 0.5 * ry[n - 3]);
      }
      if (sVec) {
        rx.unshift(sVec.x);
        ry.unshift(sVec.y);
      } else {
        rx.unshift(1.5 * (xs[1] - xs[0]) - 0.5 * rx[0]);
        ry.unshift(1.5 * (ys[1] - ys[0]) - 0.5 * ry[0]);
      }
      this.coefficeint = {x: rx, y: ry}
    }
  }
});