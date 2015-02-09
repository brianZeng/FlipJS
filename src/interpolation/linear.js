/**
 * Created by brian on 2014/12/23.
 */
Flip.interpolation({
  name: 'linear',
  degree: 1,
  weightMat: [[-1, 1], [1, 0]],
  prototype: {
    init: function () {
      this._ensureAxisAlign();
    },
    getCalcParam: function (seg) {
      return {
        t:seg.t,
        vx:[seg.x0, seg.x1],
        vy:[seg.y0, seg.y1]
      };
    }
  }
});