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
      var i0, i1, x1, xs = this.axis.x, ys = this.axis.y, vx, t, vp;
      x1 = arrFirst(xs, function (num) {
        return num >= x
      });
      i1 = xs.indexOf(x1);
      if (i1 == 0)i1 = 1;
      else if (i1 == xs.length - 1)
        i1 = i1 - 1;
      i0 = i1 - 1;
      vx = xs.slice(i0, i0 + 3);
      t = (x - vx[0]) / (vx[2] - vx[0]);
      vp = [2 * t * t - 3 * t + 1, 4 * t - 4 * t * t, 2 * t * t - t];
      return {
        x: Vec.multi(vp, vx), y: Vec.multi(vp, ys.slice(i0, i0 + 3))
      }
    }

  }
});