/**
 * Created by 柏子 on 2015/1/7.
 */
angular.module('flipEditor').factory('dataFac', ['actMng', 'itpls', '$rootScope', function (actMng, itpls, rootScope) {
  var arr = Flip.util.Array, ex, lines= [], points = [], itplModel, activePoint, fp, fl,usedCps=[];
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
          var lineId=activePoint.lineId,cp=activePoint;
          movePoint(e.position);
          releaseActivePoint(e.position);
          if(lineId){
            e.lineId=lineId;
            e.point=cp;
            e.recomputed=true;
            recomputeLine(arr.findBy(lines,lineId));
          }
          action.save(true);
      }
      else
        ex.addPoint(e.position);
    },
    function (e, ee) {
      var pre = ee.previous;
      if (pre) {
        movePoint(pre.arg.position, pre.arg.point);
        if(e.recomputed){
          recomputeLine(arr.findBy(lines,e.lineId));
        }
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
      decomposeLine(e.line,true);
    }).
    fallback('remove line', function (e) {
      reuseLine(e.line);
    }).
    fallback('decompose line',function(e){
      reuseLine(e.line);
    });


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
    get usedCps(){return usedCps},
    get lines() {
      return lines;
    },
    pointType:'data',
    addPoint:function (pos) {
      var point = createPoint(pos,ex.pointType);
      actMng.act('add point', {point: point}, true);
      return point;
    },
    get interpolation(){
      return itplModel||(itplModel=itpls['cubic']);
    },
    set interpolation(name){
      if(itpls.indexOf(name)>-1)
        itplModel=name;
      else
        itplModel=itpls[name]||itpls['cubic'];
    },
    addLine:concatLine,
    removeLine:function(lineOrId){
      return removeLine(lineOrId===undefined? lines[lines.length-1]:lineOrId);
    },
    decomposeLine:function(lineOrId){
      return decomposeLine(lineOrId===undefined? lines[lines.length-1]:lineOrId);
    },
    reset:function(){
      console.warn('this is for debug only');
    }
  };
  ex.interpolation='cubic';
  return ex;
  function releaseActivePoint() {
    if (activePoint) {
      blurPoint(activePoint);
      activePoint = null;
      ex.changeCursor(0);
      return true;
    }
  }
  function removeLine(lineOrId,notRecord){
    if(typeof lineOrId=="string") lineOrId=arr.findBy(lines,'id',lineOrId);
    if(arr.remove(lines,lineOrId)){
      if(!notRecord)
        actMng.act('remove line',{line:lineOrId},true);
      filterUsedCps(lineOrId.id);
      lineOrId.points=null;
      invalid();
      return lineOrId;
    }
    return null;
  }
  function filterUsedCps(lineId){
    usedCps=usedCps.filter(function(p){return p.lineId!==lineId;});
  }
  function decomposeLine(lineOrId,notRecord) {
    var line=removeLine(lineOrId,1);
    if(line){
      points.push.apply(points,line.dps);
      points.push.apply(points,line.cps);
      filterUsedCps(line.id);
      points.sort(sortId);
      if(!notRecord)
        actMng.act('decompose line',{line:line},true)
    }
    return null;
  }
  function recomputeLine(line){
    line.points=Flip.interpolate({name:line.itplName,data:dps=line.dps,cps:cps=line.cps}).itor().all();
    invalid();
  }
  function reuseLine(line){
    if(arr.findBy(lines,'id',line.id))throw Error('line contained'+line.id);
    if(!line.points) {
      recomputeLine(line);
      line.dps.forEach(transformFromPool);
      line.cps.forEach(transformFromPool);
      usedCps.push.apply(usedCps,line.cps);
    }
    ascInsert(lines,line,'id');
    return line;
    function transformFromPool(p){
      arr.remove(points,p);
    }
  }
  function concatLine() {
    var dps = [], cps = [], itpl, line,lid;
    points= points.filter(removePoint);
    if (dps.length < itplModel.dp || cps.length < itplModel.cp) return false;
    itpl = Flip.interpolate({name: itplModel.name, data: dps.sort(sortId), cps: cps.sort(sortId)});
    line = {id: lid=uid('line'), dps: dps, cps: cps, points: itpl.itor().all(),itplName:itplModel.name};
    cps.forEach(transformCps);
    ascInsert(lines,line,'id');
    invalid();
    actMng.act('add line', {line: line}, true);
    return line;
    function transformCps(p){
      p.lineId=lid;
      usedCps.push(p);
    }
    function removePoint(p){
      if(p.type=='data')
        dps.push(p);
      else
        cps.push(p);
    }
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
    arr.remove(points,arr.findBy(points,'id', id));
    invalid();
  }

  function createPoint(pos,type) {
    type=type||'data';
    var p = {
      x: pos.x, y: pos.y, id: uid('pt'), type:type
    };
    return p;
  }

  function blurPoint(p) {
    if (p) {
      delete p.focus;
      invalid();
    }
    return p;
  }

  function focusPoint(p) {
    blurPoint(fp);
    if (p)
      invalid(p.focus=true);
    return p;
  }

  function noop() {
  }
  function sortId(a,b){return a.id> b.id}
  function ascInsert(arr,item,proName){
    for(var i= 0,ele=arr[i],v=item[proName];ele;ele=arr[++i])
      if(v < ele[proName]){
        arr.splice(i,0,item);
        return i;
      }
    return arr.push(item);
  }
}]);