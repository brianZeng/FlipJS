angular.module('flipEditor').factory('lineFactory', ['$rootScope', 'libFactory', function ($rootScope, libFactory) {
  var lines = [], pts = [], cps = [], arr = Flip.util.Array, evtEmitter = Flip.util.Object({
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
    if (findLine(line.name = opt.name))return false;
    line.points = opt.points.slice();
    line.color = opt.color || '#000';
    line.lineWidth = opt.lineWidth || 1;
    lines.push(line);
    emitChange({line: line});
    return line;
  }

  function addPoint(opt) {
    var p = {}, pt = evtEmitter.pointModel;
    p.r = opt.r || 1;
    p.x = opt.x;
    p.y = opt.y;
    p.id = pointIndex++;
    p.color = opt.color || pt.color;
    p.type = pt.type;
    p.type == 'control' ? cps.push(p) : pts.push(p);
    emitChange({point: p});
  }

  function sortByIndex(a, b) {
    return a.id > b.id
  }
  evtEmitter.addLine = addLine;
  evtEmitter.addPoint = addPoint;
  evtEmitter.clearPoints = function () {
    var s = pts, cs = cps;
    pts = [];
    cps = [];
    emitChange({points: s, controlPoints: cs});
  };
  evtEmitter.addInterpolation = function (name, color) {
    var opt = {
      name: name,
      data: pts.sort(sortByIndex),
      cps: cps.sort(sortByIndex)
    };
    addLine({
      color: 'blue', points: Flip.interpolate(opt).itor().all(), name: name
    });
    evtEmitter.clearPoints();
  };
  return evtEmitter;
}]);