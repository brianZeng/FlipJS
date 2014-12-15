/**
 * Created by 柏然 on 2014/12/14.
 */
(function (animation) {
  animation.scale = Scale;
  Flip.ANIMATION_TYPE.scale = 'scale';
  function Scale(opt) {
    if (!(this instanceof Scale))return new Scale(opt);
    var proxy = createOptProxy(opt, 1, 1, 0, 0);
    objForEach(proxy.result, cloneFunc, this);
    proxy.source('timingFunction', Clock.EASE.sineInOut);
    Animation.call(this, proxy);
  }

  function createOptProxy(setter, dx, dy, sx, sy) {
    setter = createProxy(setter);
    setter('dx', dx, 'dy', dy, 'sx', sx, 'sy', sy);
    return setter;
  }

  inherit(Scale, Animation.prototype, {
    getMatrix: function () {
      var sx = this.sx, sy = this.sy, dx = this.dx, dy = this.dy, v = this.clock.value;
      return Mat3.setScale(sx + (dx - sx) * v, sy + (dy - sy) * v);
    }
  });
  Scale.createOptProxy = createOptProxy;
})(Flip.animation);