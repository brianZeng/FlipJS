/**
 * Created by 柏然 on 2014/12/14.
 */
Flip.register({
  name: 'scale',
  immutable:{
    sx:0,sy:0
  },
  variable: {
    dx:1,dy:1
  },
  beforeCallBase: function (proxy) {
    proxy.ease=proxy.ease||Flip.EASE.sineInOut;
  },
  transform: function (mat,param) {
    mat.scale(param.sx+param.dx,param.sy+param.dy)
  }
});