angular.module('flipEditor').controller('cvsController', ['$element', 'lineFactory', function ($element, lineFactory) {
  var cvs = $element[0], ctx = cvs.getContext('2d'), self = this, PI2 = Math.PI * 2;

  function redraw() {
    if (self._invalid) {
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      ctx.save();
      drawAxis();
      lineFactory.lines.forEach(drawLine);
      lineFactory.points.forEach(drawPoint);
      lineFactory.controlPoints.forEach(drawPoint);
      ctx.restore();
      self._invalid = false;
    }
    window.requestAnimationFrame(redraw);
  }

  function drawAxis() {
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
    ctx.strokeStyle = self.axisColor;
    ctx.stroke();
    ctx.restore();
    ctx.translate(w / 2, h / 2);
    ctx.scale(1, -1);
  }

  function drawLine(line) {
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
  }

  function drawPoint(p) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, PI2);
    ctx.fillStyle = p.color;
    ctx.fill();
  }

  function invalid() {
    self._invalid = true;
  }

  function correlatePosition(e) {
    return {x: e.clientX - cvs.offsetLeft - cvs.width / 2, y: cvs.height / 2 - (e.clientY - cvs.offsetTop)};
  }
  this.axisColor = 'black';
  self.background = 'rgba(0,0,0,0.3)';
  this.lineWidth = 1;
  this.invalid = invalid;
  lineFactory.onchange = function (e) {
    self.invalid();
  };

  cvs.height = (cvs.width = $element.parent()[0].clientWidth / 2) / 4 * 3;

  redraw(self._invalid = true);
  $element.on('click', function (e) {
    var p = correlatePosition(e);
    p.r = 2;
    lineFactory.addPoint(p);
  });
}]);
