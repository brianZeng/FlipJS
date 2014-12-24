/**
 * Created by brian on 2014/12/23.
 */
Flip.interpolation({
  name: 'cubic',
  prototype: {
    init: function () {
      this._ensureAxisAlign();
      this._initDx();
    },
    interpolate: function (x) {
      var i0, i1, xs = this.axis.x, x0, t, vp, t2, t3;
      i0 = xs.indexOf(arrFirst(xs, function (num) {
        return num >= x
      }));
      if (i0 > 0)i0--;
      i1 = i0 + 3;
      if (i1 >= xs.length - 1) {
        i1 = xs.length - 1;
        i0 = i1 - 3;
      }
      t = (x - (x0 = xs[i0])) / (xs[i1] - x0);
      t2 = t * t;
      t3 = t2 * t;
      vp = [
        -4.5 * t3 + 9 * t2 - 5.5 * t + 1,
        13.5 * t3 - 22.5 * t2 + 9 * t,
        -13.5 * t3 + 18 * t2 - 4.5 * t,
        4.5 * t3 - 4.5 * t2 + t
      ];
      return {
        x: x,//Vec.multi(vp, vx)
        y: Vec.multi(vp, this.axis.y.slice(i0, i0 + 4))
      }
    }
  }
});