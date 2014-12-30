angular.module('flipEditor').factory('lineFactory', ['$rootScope', function ($rootScope) {
  var lines = [], pts = [], arr = Flip.util.Array, evtEmitter = Flip.util.Object({
    get lines() {
      return lines;
    },
    get points() {
      return pts;
    },
    get interpolations() {
      return Object.getOwnPropertyNames(Flip.interpolation.cache);
    },
    set onchange(f) {
      this.on('change', f);
    }
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
    var p = {};
    p.r = opt.r || 1;
    p.x = opt.x;
    p.y = opt.y;
    p.i = pointIndex++;
    p.color = opt.color || '#000';
    pts.push(p);
    emitChange({point: p});
  }

  evtEmitter.addLine = addLine;
  evtEmitter.addPoint = addPoint;
  evtEmitter.clearPoints = function () {
    var s = pts;
    pts = [];
    emitChange({points: s});
  };
  return evtEmitter;
}]);