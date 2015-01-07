/**
 * Created by 柏然 on 2015/1/5.
 */
angular.module('flipEditor').controller('detailCVSController', ['cvsUtil', '$element', '$rootScope', function (cvsUtil, $element, $rootScope) {
  var cvs = $element[0].querySelector('canvas'), ctx = cvs.getContext('2d'), self = this, PI2 = Math.PI * 2, arr = Flip.util.Array,
    pts = arr(), focus, redraw, invalid, line, pointIndex = 0;
  redraw = (function (_invalid) {
    invalid = function () {
      _invalid = true;
      if (!$rootScope.$$phase)$rootScope.$digest();
    };
    var drawer = cvsUtil.getDrawer(ctx);
    return function () {
      if (_invalid) {
        drawer.clear();
        ctx.save();
        drawer.axis('black');
        ctx.scale(1, -1);
        drawFocus(ctx);
        pts.forEach(drawer.point);
        line && drawer.line(line);
        ctx.restore();
        _invalid = false;
      }
    }
  })(true);
  Flip.instance.on('frameStart', redraw);
  cvs.height = (cvs.width = $element[0].clientWidth / 2) / 4 * 3;

  function containPoint(p) {
    return function (point) {
      return cvsUtil.pointContain(point, p)
    }
  }

  function drawFocus(ctx) {
    if (focus) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(focus.x, focus.y, focus.r, 0, Math.PI * 2);
      ctx.shadowBlur = 5;
      ctx.shadowColor = 'rgba(110,110,110,0.8)';
      ctx.fill();
      ctx.restore();
    }
  }

  function focusPoint(p) {
    if (focus) {
      focus.focus = false;
      cvs.style.cursor = '';
    }
    if (p) {
      p.focus = true;
      cvs.style.cursor = 'pointer';
      focus = p;
    }
    else focus = null;
    invalid();
  }

  function addPoint(opt) {
    var p = {};
    p.r = opt.r || 2;
    p.x = opt.x;
    p.y = opt.y;
    p.id = pointIndex++;
    p.color = 'red';
    p.type = 'data';
    pts.add(p);
    self.createLine();
    invalid();
  }

  function movePoint(e) {
    var p = cvsUtil.correlatePos(e, cvs);
    if (!focus) {
      if (pts.first(containPoint(p)))
        cvs.style.cursor = 'pointer';
      else cvs.style.cursor = '';
    }
    else {
      focus.x = p.x;
      focus.y = p.y;
      self.createLine();
      invalid();
    }
  }

  Flip.util.Object.forEach({
    mousedown: function (e) {
      var p = cvsUtil.correlatePos(e, cvs), hit;
      hit = pts.first(containPoint(p));
      if (hit)
        focusPoint(hit);
      else e.preventDefault();
    },
    mouseout: function (e) {
      focusPoint(null);
    },
    mousemove: movePoint,
    click: function (e) {
      if (focus)focusPoint(null);
      else addPoint(cvsUtil.correlatePos(e, cvs));
      e.preventDefault();
    }
  }, function (func, evtName) {
    cvs.addEventListener(evtName, func)
  });
  this.points = pts;
  this.interpolations = ['linear', 'cubic', 'quadratic'];
  this.itplModel = 'cubic';
  this.createLine = function () {
    if (pts.length < 3)return;
    var itpl = Flip.interpolate({
      name: self.itplModel,
      data: pts.slice()
    });
    line = {points: itpl.itor().all(), color: 'blue'};
    invalid();
  }

}]);