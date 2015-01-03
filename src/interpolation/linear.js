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
    interpolate: function (x, skip) {
      var seg = this._findSegByX0(x, skip);
      return this.interpolateSeg(seg.t, [seg.x0, seg.x1], [seg.y0, seg.y1]);
    },
    when: function (t) {
      var seg = this._findSegByT(t);
      return this.interpolateSeg(seg.t, [seg.x0, seg.x1], [seg.y0, seg.y1]);
    }
  }
});