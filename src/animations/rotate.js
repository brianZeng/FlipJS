/**
 * Created by 柏然 on 2014/12/15.
 */
Flip.animation({
  name: 'rotate',
  param: {
    angle: Math.PI * 2
  },
  beforeCallBase: function (proxy) {
    proxy.source('ease', Flip.EASE.circInOut);
  },
  transform: function () {
    return Flip.Mat3.setRotate(this.angle * this.clock.value);
  }
});