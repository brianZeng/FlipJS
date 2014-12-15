/**
 * Created by 柏然 on 2014/12/15.
 */
Flip.animation.register({
  name: 'rotate',
  defParam: {
    angle: Math.PI * 2
  },
  beforeCallBase: function (proxy) {
    proxy.source('timingFunction', Flip.EASE.circInOut);
  },
  prototype: {
    getMatrix: function () {
      return Flip.Mat3.setRotate(this.angle * this.clock.value);
    }
  }
});