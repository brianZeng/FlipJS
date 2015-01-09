/**
 * Created by 柏子 on 2015/1/7.
 */
angular.module('flipEditor').factory('dataFac', ['actMng', 'itpls', '$rootScope', function (actMng, itpls, rootScope) {
  var arr = Flip.util.Array, ex, lines= [], points = [], itplModel, activePoint, fp, fl;
    actMng.react('choose', function (e, action) {
    ex.activePoint = activePoint = e.point = e.target;
    e.position = {x: activePoint.x, y: activePoint.y};
    action.save(true);
  }).
    react('move', function (e) {
      if (activePoint)
        movePoint(e.position);
      else {
        var r = e.hitTest();
        if (r) {
          ex.changeCursor(true);
          fp = focusPoint(r.target);
        }
        else if (fp) {
          blurPoint(fp);
          ex.changeCursor(false);
        }
      }
    }).
    react('leave', releaseActivePoint).
    pair('release',
    function (e, action) {
      if (activePoint) {
        movePoint(e.position);
        releaseActivePoint(e.position);
        action.save(true);
      }
      else
        ex.addPoint(e.position);
    },
    function (e, ee) {
      var pre = ee.previous;
      if (pre) {
        movePoint(pre.arg.position, pre.arg.point);
        //undo choose record
        if (pre.name === 'choose')
          actMng.undo();
      }
    }).
    pair('add point',
    function (e) {
      var point = addPoint(e.point);
      e.position = {x: point.x, y: point.y};
    },
    function (e) {
      removePoint(e.point.id);
    }).
    fallback('add line', function (e) {
      decomposeLine(e.line);
    }).
    fallback('remove line', function (e) {
      reuseLine(e.line);
    }).
    fallback('decompose line',function(e){
      reuseLine(e.line);
    });

  function releaseActivePoint() {
    if (activePoint) {
      blurPoint(activePoint);
      activePoint = null;
      ex.changeCursor(0);
      return true;
    }
  }
  function removeLine(lineOrId,notReport){
    if(typeof lineOrId=="string") lineOrId=arr.findBy(lines,'id',lineOrId);
    if(lines.remove(lineOrId)){
      if(!notReport)
        actMng.act('remove line',{line:lineOrId},true);
      lineOrId.points=null;
      invalid();
      return lineOrId;
    }
    return null;
  }
  function decomposeLine(lineOrId) {
    var line=removeLine(lineOrId,1);
    if(line){
      points.push.apply(points,line.dps.slice());
      points.push.apply(points,line.cps.slice());
      points.sort(sortId);
      actMng.act('decompose line',{line:line},true)
    }
    return null;
  }
  function reuseLine(line){
    var dps,cps;
    if(arr.findBy(lines,'id',line.id))throw Error('line contained'+line.id);
    if(!line.points) {
      line.points=Flip.interpolate({name:line.itplName,data:dps=line.dps,cps:cps=line.cps}).itor().all();
      dps.forEach(remove);
      cps.forEach(remove);
      invalid();
    }
    return line;
    function remove(p){ points.remove(p)}
  }
  function concatLine() {
    var dps = [], cps = [], itpl, line;
    points.filter(function (p) {
      var arr = p.type == 'data' ? dps : cps;
      arr.push(p);
    });
    if (dps.length < itplModel.dp || cps.length < itplModel.cp)return;
    itpl = Flip.interpolate({name: itplModel.name, data: dps, cps: cps});
    line = {id: uid('line'), dps: dps, cps: cps, points: itpl.itor().all(),itplName:itplModel.name};
    lines.push(line);
    points = [];
    invalid();
    actMng.act('add line', {line: line}, true);
    return line;
  }

  function movePoint(pos, point) {
    point = point || activePoint;
    if (point) {
      point.x = pos.x;
      point.y = pos.y;
      invalid();
    }
  }

  function invalid() {
    ex.invalid();
    if (!rootScope.$$phase)rootScope.$digest();
  }

  function addPoint(point) {
    if (arr.findBy(points,'id', point.id))throw Error('point has been added:' + point.id);
    arr.add(points,point);
    invalid();
    return point;
  }

  function removePoint(id) {
    points.remove(arr.findBy(points,'id', id));
    invalid();
  }

  function createPoint(pos) {
    var p = {
      r: 2, x: pos.x, y: pos.y, id: uid('pt'), type: 'data', color: 'red'
    };
    return p;
  }

  function blurPoint(p) {
    if (p) {
      p.color = 'red';
      p.r = 2;
      invalid();
    }
    return p;
  }

  function focusPoint(p) {
    blurPoint(fp);
    if (p) {
      p.color = 'orange';
      p.r = 4;
      invalid();
    }
    return p;
  }

  var uid = (function (cache) {
    return function (type) {
      type = type || '*';
      if (!cache[type])cache[type] = 0;
      return type + (++cache[type])
    }
  })({});
  ex = {
    invalid: noop,
    changeCursor: noop,
    get points() {
      return points;
    },
    get lines() {
      return lines;
    },
    addPoint:function (pos, type) {
      var point = createPoint(pos);
      actMng.act('add point', {point: point}, true);
      return point;
    },
    get interpolation(){
      return itplModel||(itplModel=itpls['cubic']);
    },
    set interpolation(name){
      itplModel=itpls[name]||itpls['cubic'];
    },
    addLine:concatLine,
    removeLine:removeLine,
    decomposeLine:decomposeLine,
    reset:function(){
      console.warn('this is for debug only');

    }
  };
  return ex;
  function noop() {
  }
  function sortId(a,b){return a.id> b.id}
}]);