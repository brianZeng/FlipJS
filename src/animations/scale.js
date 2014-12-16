/**
 * Created by 柏然 on 2014/12/14.
 */
Flip.animation.register({
  name: 'scale',
  defParam: {
    sx: 0, sy: 0, dy: 1, dx: 1
  },
  beforeCallBase: function (proxy) {
    proxy.source('timingFunction', Flip.EASE.sineInOut);
  },
  prototype: {
    getMatrix: function () {
      var sx = this.sx, sy = this.sy, dx = this.dx, dy = this.dy, v = this.clock.value;
      return Mat3.setScale(sx + (dx - sx) * v, sy + (dy - sy) * v);
    }
  }
});