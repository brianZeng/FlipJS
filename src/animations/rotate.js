/**
 * Created by 柏然 on 2014/12/15.
 */
Flip.register({
  name: 'rotate',
  variable: {
    angle: Math.PI * 2
  },
  beforeCallBase: function (proxy) {
    proxy.ease=proxy.ease||Flip.EASE.circInOut;
  },
  transform: function (mat,param) {
    mat.rotate(param.angle)
  }
});