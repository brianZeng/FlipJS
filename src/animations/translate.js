/**
 * Created by 柏然 on 2014/12/13.
 */
Flip.animation({
  name: 'translate',
  defParam: {
    sx: 0, dx: 100, sy: 0, dy: 0
  },
  mat:function () {
    var v = this.clock.value, sx = this.sx, sy = this.sy;
    return Mat3.setTranslate(sx + (this.dx - sx) * v, sy + (this.dy - sy) * v);
  }
});