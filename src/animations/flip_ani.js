/**
 * Created by 柏然 on 2014/12/14.
 */
Flip.animation({
  name: 'flip',
  immutable:{
    vertical:true
  },
  variable: {
    angle: Math.PI
  },
  beforeCallBase: function (proxy) {
    proxy.ease=proxy.ease|| Clock.EASE.sineInOut;
  },
  transform:function(mat,param){
    mat.flip(param.angle,!param.vertical);
  },
  css:{
    '&':{'transform-origin':'center'}
  }
});