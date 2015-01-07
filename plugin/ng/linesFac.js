angular.module('flipEditor').factory('lineFactory', ['$rootScope', 'libFactory', function ($rootScope, libFactory) {
  var lines = [], pts = [], cps = [], itpls = [], arr = Flip.util.Array, evtEmitter = Flip.util.Object({
    get lines() {
      return lines;
    },
    get points() {
      return pts;
    },
    get controlPoints() {
      return cps;
    },
    get interpolations() {
      return libFactory.interpolations;
    },
    set onchange(f) {
      this.on('change', f);
    },
    pointModel: 0
  }), pointIndex = 0;

  function findLine(name) {
    return arr.findBy(lines, 'name', name);
  }

  function emitChange(e) {
    evtEmitter.emit('change', e);
    if (!$rootScope.$$phase)$rootScope.$digest();
  }

  function addLine(opt) {
    var line = {};
    if (findLine(line.name = opt.name)) {
      line.name += pointIndex;
    }
    line.points = opt.points.slice();
    line.color = opt.color || '#000';
    line.lineWidth = opt.lineWidth || 1;
    lines.push(line);
    emitChange({line: line, type: 'add'});
    return line;
  }

  function addPoint(opt) {
    var p = {}, pt = evtEmitter.pointModel;
    p.r = opt.r || 2;
    p.x = opt.x;
    p.y = opt.y;
    p.id = pointIndex++;
    p.color = opt.color || pt.color;
    p.type = pt.type;
    p.type == 'control' ? cps.push(p) : pts.push(p);
    emitChange({point: p, type: 'add'});
  }


  function removePoint() {
    var pt1 = pts.pop(), pt2 = cps.pop(), p;
    if (!pt1 && !pt2)return;
    if (!pt2)p = pt1;
    else if (!pt1)p = pt2;
    else if (pt1.id > pt2.id) {
      cps.push(pt2);
      p = pt1;
    }
    else {
      p = pt2;
      pts.push(pt1);
    }
    emitChange({point: p, type: 'remove'})
  }
  evtEmitter.addLine = addLine;
  evtEmitter.addPoint = addPoint;
  evtEmitter.clearPoints = function () {
    var s = pts, cs = cps;
    pts = [];
    cps = [];
    emitChange({points: s, controlPoints: cs});
  };
  evtEmitter.removeLine = function () {
    var l = lines.pop();
    if (l) {
      itpls.pop();
      emitChange({line: l, type: 'remove'});
    }
  };

  evtEmitter.decomposeLine = function () {
    var opt = itpls[itpls.length - 1];
    if (opt) {
      opt.points.forEach(function (p) {
        addPoint(p);
      });
    }
  };
  evtEmitter.removePoint = removePoint;
  evtEmitter.addInterpolation = function (name, color) {
    var opt = {
      name: name,
      data: pts.slice(),
      cps: cps.slice()
    }, itpl = Flip.interpolate(opt);
    addLine({
      color: color, points: itpl.itor().all(), name: name
    });
    itpls.push({
      name: name,
      points: pts.concat(cps).map(Flip.util.Object).sort(function (a, b) {
        return a.id - b.id;
      })
    });
    evtEmitter.clearPoints();
  };
  return evtEmitter;
}]);