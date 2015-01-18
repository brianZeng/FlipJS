/**
 * Created by 柏子 on 2015/1/7.
 */
angular.module('flipEditor').factory('dataFac', ['actMng', 'itpls', '$rootScope',
  function (actMng, itpls, rootScope) {
    var arr = Flip.util.Array, ex, lines = [], points = [], itplModel, activePoint, fp, usedCps = [];
    var pointTypes=['data','control','remove'],pointType=pointTypes[0];
    actMng.react('choose', function (e, action) {
      if(e.button==0){
        ex.activePoint = activePoint = e.point = e.target;
        e.position = {x: activePoint.x, y: activePoint.y};
        action.save(pointType!=='remove');
      }
    }).
      react('move', function (e) {
        if (activePoint)
          movePoint(e.position);
        else {
          var r = e.hitTest();
          if (r) {
            ex.changeCursor(true);
             focusPoint(r.target);
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
        if(pointType=='remove')
          return ex.removePoint(activePoint)&&action.save(false);
        else if (activePoint) {
          var lineId = activePoint.lineId, cp = activePoint;
          movePoint(e.position);
          releaseActivePoint(e.position);
          if (lineId) {
            e.lineId = lineId;
            e.point = cp;
            e.recomputed = true;
            recomputeLine(arr.findBy(lines,'id',lineId));
          }
          action.save(true);
        }
        else
          ex.addPoint(e.position,getClickPointType(e.button) );
      },
      function (e, ee) {
        var pre = ee.previous;
        if (pre) {
          movePoint(pre.arg.position, pre.arg.point);
          if (e.recomputed) {
            recomputeLine(arr.findBy(lines, e.lineId));
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
      pair('remove point',function(e){
        removePoint(e.point);
      },function(e){
        addPoint(e.point);
      }).
      fallback('add line', function (e) {
        decomposeLine(e.line, true);
      }).
      fallback('remove line', function (e) {
        reuseLine(e.line);
      }).
      fallback('decompose line', function (e) {
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
      get usedCps() {
        return usedCps
      },
      get lines() {
        return lines;
      },
      get pointType() {
        return pointType
      },
      set pointType(v) {
        if (pointTypes.indexOf(v)==-1)
          v = nextPointType(pointType);
        if (v !== pointType)
          invalid(pointType = v);
      },
      addPoint: function (pos,type) {
        var point = createPoint(pos, type||pointType);
        actMng.act('add point', {point: point}, true);
        return point;
      },
      removePoint:function(pointOrId){
        var point=typeof pointOrId==="string"? arr.findBy(points,'id',pointOrId):pointOrId;
        if(!point)return null;
        if(point==activePoint)
          releaseActivePoint();
        actMng.act('remove point',{point:point},true);
        return pointOrId;
      },
      get interpolation() {
        return itplModel || (itplModel = itpls['cubic']);
      },
      set interpolation(name) {
        if (itpls.indexOf(name) > -1)
          itplModel = name;
        else
          itplModel = itpls[name] || itpls['cubic'];
        invalid();
      },
      addLine: concatLine,
      get canAddLine(){
        return canInterpolate(itplModel.dp,itplModel.cp);
      },
      removeLine: function (lineOrId) {
        return removeLine(lineOrId === undefined ? lines[lines.length - 1] : lineOrId);
      },
      decomposeLine: function (lineOrId) {
        return decomposeLine(lineOrId === undefined ? lines[lines.length - 1] : lineOrId);
      },
      reset: function () {
        console.warn('this is for debug only');
      }
    };
    ex.interpolation = 'cubic';
    return ex;

    function nextPointType(cur){
     var curIndex= pointTypes.indexOf(pointType);
      if(curIndex==pointTypes.length-1)curIndex=-1;
      return pointTypes[curIndex+1];
    }
    function getClickPointType(button){
      return button==0? pointType:(pointType=='data'?'control':'data')
    }
    function removeLine(lineOrId, notRecord) {
      var line;
      line = (typeof lineOrId == "string") ? arr.findBy(lines, 'id', lineOrId) : lineOrId;
      if (arr.remove(lines, line)) {
        if (!notRecord)
          actMng.act('remove line', {line: line}, true);
        filterUsedCps(lineOrId.id);
        line.cps.forEach(delLineId);
        line.dps.forEach(delLineId);
        lineOrId.points = null;
        invalid();
        return lineOrId;
      }
      return null;
      function filterUsedCps(lineId) {
        var r = [];
        usedCps = usedCps.filter(function (p) {
          if (p.lineId == lineId) r.push(p);
          else return true;
        }).sort(sortId);
        return r;
      }
      function delLineId(p) {
        delete p.lineId;
        return p;
      }
    }
    function decomposeLine(lineOrId, notRecord) {
      var line = removeLine(lineOrId, 1);
      if (line) {
        points.push.apply(points, line.dps);
        points.push.apply(points, line.cps);
        points.sort(sortId);
        if (!notRecord)
          actMng.act('decompose line', {line: line}, true);
      }
      return null;
    }
    function recomputeLine(line) {
      line.points = Flip.interpolate({name: line.itplName, data: line.dps, cps: line.cps}).itor().all();
      invalid();
    }
    function reuseLine(line) {
      var lineId;
      if (arr.findBy(lines, 'id', lineId = line.id))throw Error('line contained' + line.id);
      recomputeLine(line);
      removePoints(line.dps);
      removePoints(line.cps);
      usedCps.push.apply(usedCps, line.cps);
      usedCps.sort(sortId);
      ascInsert(lines, line, 'id');
      return line;
      function removePoints(toRemove) {
        points = points.filter(function (p) {
            if( toRemove.indexOf(p) == -1)return true;
            else p.lineId=lineId;
          }).sort(sortId);
      }
    }
    function concatLine() {
      if(!canInterpolate(itplModel.dp,itplModel.cp))return false;
      var dps = [], cps = [], itpl, line, lid=uid('line');
      points=points.filter(removePoint);
      itpl = Flip.interpolate({name: itplModel.name, data: dps.sort(sortId), cps: cps.sort(sortId)});
      line = {id: lid, dps: dps, cps: cps, points: itpl.itor().all(), itplName: itplModel.name};
      if(line.drawCP=itplModel.cp)
        cps.forEach(transformCps);
      ascInsert(lines, line, 'id');
      invalid(actMng.act('add line', {line: line}, true));
      return line;
      function transformCps(p) {
        p.lineId = lid;
        usedCps.push(p);
      }
      function removePoint(p) {
        p.lineId=lid;
        if (p.type == 'data')
          dps.push(p);
        else
          cps.push(p);
      }
    }
    function canInterpolate(dpCount,cpCount){
      for(var i= 0,p=points[0],type;p;p=points[++i]){
        if((type=p.type)=='control')
          cpCount--;
        else if(type==='data')dpCount--;
        else throw Error('unknow type '+ type);
        if(dpCount<=0&&cpCount<=0)return true;
      }return false;
    }
    function movePoint(pos, point) {
      point = point || activePoint;
      if (point) {
        point.x = pos.x;
        point.y = pos.y;
        invalid();
      }
    }
    function releaseActivePoint() {
      if (activePoint) {
        blurPoint(activePoint);
        activePoint = null;
        ex.changeCursor(0);
        return true;
      }
    }
    function addPoint(point) {
      if (arr.findBy(points, 'id', point.id))throw Error('point has been added:' + point.id);
      arr.add(points, point);
      invalid();
      return point;
    }
    function createPoint(pos, type) {
      type = type || 'data';
      var p = {
        x: pos.x, y: pos.y, id: uid('pt'), type: type
      };
      return p;
    }
    function removePoint(idOrPoint) {
      arr.remove(points,typeof idOrPoint==="string"?arr.findBy(points, 'id', idOrPoint):idOrPoint);
      invalid();
    }
    function blurPoint(p) {
      if (p) {
        delete p.focus;
        if(p==fp)fp=null;
        invalid();
      }
      return p;
    }
    function focusPoint(p) {
      blurPoint(fp);
      if (p)
        invalid(p.focus = true);
      return fp=p;
    }



    function invalid() {
      ex.invalid();
      if (!rootScope.$$phase)rootScope.$digest();
    }
    function noop() {
    }
    function sortId(a, b) {
      return a.id > b.id
    }
    function ascInsert(arr, item, proName) {
      for (var i = 0, ele = arr[i], v = item[proName]; ele; ele = arr[++i])
        if (v < ele[proName]) {
          arr.splice(i, 0, item);
          return i;
        }
      return arr.push(item);
    }
  }]);