/**
 * Created by 柏然 on 2014/12/14.
 */
(function (animation) {
  animation.flip = _Flip;
  Flip.ANIMATION_TYPE.flip = 'flip';
  function _Flip(opt) {
    if (!(this instanceof _Flip))return new _Flip(opt);
    var proxy = createOptProxy(opt, 1, Math.PI);
    objForEach(proxy.result, cloneFunc, this);
    proxy.source('timingFunction', Clock.TIMEFUNCS.expoEaseOut);
    Animation.call(this, proxy);
  }

  function createOptProxy(setter, vertical, angle) {
    setter = createProxy(setter);
    setter('vertical', vertical, 'angle', angle);
    return setter;
  }

  inherit(_Flip, Animation.prototype, {
    getMatrix: function () {
      var angle = this.angle * this.clock.value, sin = Math.sin(angle), cos = Math.cos(angle);
      //debugger;
      return new Mat3(this.vertical ? [cos, 0, 0, sin, 1, 0] : [1, -sin, 0, 0, cos, 0])
    }
  });
  _Flip.createOptProxy = createOptProxy;
})(Flip.animation);