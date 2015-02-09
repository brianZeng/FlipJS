/**
 * Created by brian on 2014/12/24.
 */
Flip.interpolation({
  name: 'lagrange',
  prototype: {
    calCoefficient: function () {
      var xs = this.axis.x, n, ws = new Array(n = xs.length);
      for (var i = 0, xi, wi = 1, j; i < n; i++, wi = 1) {
        xi = xs[i];
        for (j = 0; j < n; j++)if (j !== i)wi *= (xi - xs[j]);
        ws[i] = wi;
      }
      return this.coefficeint = ws;
    },
    init: function () {
      this._ensureAxisAlign();
      this._initDx();
      this.calCoefficient();
      this._ensureAxisOrder('x');
    },
    when: function (t) {
      var seg = this._findSegByT(t);
      return this.interpolate(seg.x0 + seg.t * (seg.x1 - seg.x0));
    },
    deriveWhen:function(t){
      var dt=0.001,p0=this.when(t),p1=this.when(t+dt);
      return (p1.y-p0.y)/(p1.y-p0.y);
    },
    interpolate: function (x) {
      var ws = this.coefficeint, xs = this.axis.x, ys = this.axis.y, n = xs.length, y = 0;
      for (var i = 0, sum = 1, wi = 1, j; i < n; i++, sum = 1, wi = 1) {
        for (j = 0; j < i; j++)sum *= (x - xs[j]);
        for (j = i + 1; j < n; j++)sum *= (x - xs[j]);
        y += ys[i] * sum / ws[i];
      }
      return {x: x, y: y}
    }
  }
});