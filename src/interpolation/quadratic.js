/**
 * Created by brian on 2014/12/23.
 */
Flip.interpolation({
  name: 'quadratic',
  prototype: {
    init: function () {
      this._ensureAxisAlign();
      this._initDx();
    },
    /*getPoint:function(t){
     var xs=this.axis.x,tUnit=1/(xs.length-1),i0,phrase,tx,vx,vy,tx2,vp;
     phrase=t/tUnit;
     i0=Math.floor(phrase);
     tx=(phrase-i0)*tUnit;
     tx2=tx*tx;
     if(i0> xs.length-3) i0=xs.length-3;
     vx=xs.slice(i0,i0+3);
     vy=this.axis.y.slice(i0,i0+3);
     vp=[2*tx2-3*tx+1,4*tx-4*tx2,2*tx2-tx];
     return {
     x: Vec.multi(vp, vx),
     y: Vec.multi(vp, vy)
     }
     },
     _getT:function(x){
     var xs=this.axis.x,units=xs.length- 1,x1,i1,t;
     x1=arrFirst(xs,function(num){return num>= x});
     i1=xs.indexOf(x1);
     t=(i1-(x1-x)/(x1-xs[i1-1]))/units;
     if(!t)t=(x - xs[0]) / (xs[xs.length-1] - xs[0]);
     return t;
     },*/
    interpolate: function (x) {
      var i0, i1, x1, xs = this.axis.x, ys = this.axis.y, x0, t, vp, rx;
      x1 = arrFirst(xs, function (num) {
        return num >= x
      });
      i1 = xs.indexOf(x1);
      if (i1 < 2) {
        i1 = 2;
        t = (x - (x0 = xs[0])) / (xs[1] - x0) / 2;
      }
      else t = (x - (x0 = xs[i1 - 2])) / (x1 - x0);
      //t=(x-(x0=xs[i1-2]))/(xs[i1-1]-x0)/2;
      vp = [2 * t * t - 3 * t + 1, 4 * t - 4 * t * t, 2 * t * t - t];
      rx = Vec.multi(vp, xs.slice(i1 - 2, i1 + 1));
      return {
        x: rx > x ? rx : x,
        y: Vec.multi(vp, ys.slice(i1 - 2, i1 + 1)) //Vec.multi(vp, ys.slice(i0, i0 + 3))
      }
      /**/
    }

  }
});