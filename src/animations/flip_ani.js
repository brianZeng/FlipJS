/**
 * Created by 柏然 on 2014/12/14.
 */
Flip.animation({
  name: 'flip',
  defParam: {
    vertical: true,
    angle: Math.PI
  },
  beforeCallBase: function (proxy) {
    proxy.source('timingFunction', Clock.EASE.sineInOut);
  },
  mat:function(){
      var angle = this.angle * this.clock.value, sin = Math.sin(angle), cos = Math.cos(angle);
      return new Mat3(this.vertical ? [cos, 0, 0, sin, 1, 0] : [1, -sin, 0, 0, cos, 0])
  },
  css:{
    '&':{'transform-origin':'center'}
  }
});