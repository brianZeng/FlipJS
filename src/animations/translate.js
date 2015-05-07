/**
 * Created by 柏然 on 2014/12/13.
 */
Flip.animation({
  name: 'translate',
  immutable:{sx:0,sy:0},
  variable: {
    dx: 100, dy: 0
  },
  transform:function (mat,param) {
    mat.translate(param.dx+param.sx,param.dy+param.sy);
  }
});