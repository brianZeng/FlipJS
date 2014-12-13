/**
 * Created by 柏然 on 2014/12/13.
 */
(function (animation) {
  animation.translate = Translate;
  function Translate(opt) {
    if (!(this instanceof Translate))return new Translate(opt);
    objForEach(Translate.createOptProxy(opt, 0, 0).result, cloneFunc, this);
    Animation.call(this, opt);
  }

  Translate.createOptProxy = function (setter, dx, dy) {
    setter = createProxy(setter);
    setter('dx', dx);
    setter('dy', dy);
    return setter;
  };
  inherit(Translate, Animation.prototype, {
    getMatrix: function () {
      var v = this.clock.value;
      return Mat3.setTranslate(this.dx * v, this.dy * v);
    }
  })
})(Flip.animation);