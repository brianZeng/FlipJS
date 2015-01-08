/**
 * Created by 柏然 on 2015/1/5.
 */
angular.module('flipEditor').factory('cvsUtil', [function () {
  var ex = {}, PI2 = Math.PI * 2;

  function correlatePos(e, cvs) {
    return {
      x: parseInt(e.clientX - cvs.offsetLeft - cvs.width / 2),
      y: parseInt(cvs.height / 2 - (e.clientY - cvs.offsetTop))
    };
  }

  function ptContain(cir, p) {
    var x, y, r;
    return p.x > ((x = cir.x) - (r = cir.r)) && p.x < x + r && p.y > ((y = cir.y) - r) && p.y < y + r;
  }


  ex.correlatePos = correlatePos;
  ex.pointContain = ptContain;
  ex.getDrawer = function (ctx) {
    var cvs = ctx.canvas;
    return {
      axis: function drawAxis(color) {
        var w = cvs.width, h = cvs.height;
        ctx.fillStyle = self.background;
        ctx.lineWidth = self.lineWidth;
        ctx.fillRect(0, 0, w, h);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.moveTo(w / 2, 0);
        ctx.lineTo(w / 2, h);
        ctx.strokeStyle = color || '#000';
        ctx.stroke();
        ctx.restore();
        ctx.translate(w / 2, h / 2);
      },
      point: function drawPoint (p) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, PI2);
        ctx.fillStyle = p.color;
        ctx.fill();
      },
      line: function (line) {
        var i, point, pts = line.points;
        ctx.save();
        ctx.beginPath();
        point = pts[0];
        if (point) ctx.moveTo(point.x, point.y);
        for (point = pts[i = 1]; point; point = pts[++i])
          ctx.lineTo(point.x, point.y);
        ctx.lineWidth = line.lineWidth;
        ctx.strokeStyle = line.color;
        ctx.stroke();
        ctx.restore();
      },
      clear: function () {
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        ctx.fillStyle = window.getComputedStyle(cvs).backgroundColor;
        ctx.fillRect(0, 0, cvs.width, cvs.height);
      }
    }
  };
  return ex;
}]);