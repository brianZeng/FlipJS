/**
 * Created by brian on 2014/12/23.
 */
Flip.interpolation({
  name: 'linear',
  prototype: {
    init: function () {
      this._ensureAxisAlign();
      this._initDx();
    },
    interpolate: function (x) {
      var x1, x0, xs = this.axis.x, i0, i1, t, ys = this.axis.y;
      x1 = arrFirst(xs, function (num) {
        return num >= x
      });
      i1 = xs.indexOf(x1);
      x0 = xs[i0 = i1 == 0 ? i1 : i1 - 1];
      t = (x1 - x) / (x1 - x0);
      if (isNaN(t))t = 1;
      return {x: x, y: ys[i0] * t + (1 - t) * ys[i1]}
    }
  }
});