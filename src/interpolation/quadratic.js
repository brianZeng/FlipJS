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
      var x1, x0, x2, xs = this.axis.x, t, i1, vy, t2, vt;
      i1 = xs.indexOf(x1 = arrFirst(xs, function (num) {
        return num >= x
      }));
      if (i1 == 0)
        x1 = xs[i1 = 1];
      if (i1 == xs.length - 1) {
        x2 = x1;
        x1 = xs[--i1];
        x0 = xs[i1 - 1];
        t = (1 + (x - x1) / (x2 - x1)) * 0.5;
      }
      else {
        x0 = xs[i1 - 1];
        x2 = xs[i1 + 1];
        t = (1 - (x1 - x) / (x1 - x0)) * 0.5;
      }
      t2 = t * t;
      vy = this.axis.y.slice(i1 - 1, i1 + 2);
      vt = [2 * t2 - 3 * t + 1, 4 * (t - t2), 2 * t2 - t];
      return {
        x: Vec.dot(vt, [x0, x1, x2]),
        y: Vec.dot(vt, vy)
      }
    }
  }
});