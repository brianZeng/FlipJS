/**
 * Created by brian on 2014/12/23.
 */
Flip.interpolation({
  name: 'quadratic',
  prototype: {
    init: function () {
      this._ensureAxisAlign();
      this._initDx();
    },
    interpolate: function (x) {
      var x1, x0, x2, xs = this.axis.x, t, i1, vy, t2, vt;
      i1 = xs.indexOf(x1 = arrFirst(xs, function (num) {
        return num >= x
      }));
      if (i1 == 0)
        x1 = xs[i1 = 1];
      if (i1 == xs.length - 1) {
        x2 = x1;
        x1 = xs[--i1];
        x0 = xs[i1 - 1];
        t = (1 + (x - x1) / (x2 - x1)) * 0.5;
      }
      else {
        x0 = xs[i1 - 1];
        x2 = xs[i1 + 1];
        t = (1 - (x1 - x) / (x1 - x0)) * 0.5;
      }
      t2 = t * t;
      vy = this.axis.y.slice(i1 - 1, i1 + 2);
      vt = [2 * t2 - 3 * t + 1, 4 * (t - t2), 2 * t2 - t];
      return {
        x: Vec.dot(vt, [x0, x1, x2]),
        y: Vec.dot(vt, vy)
      }
    }
  }
});