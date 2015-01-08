/**
 * Created by 柏子 on 2015/1/7.
 */
angular.module('flipEditor').factory('dataFac',['actMng','itpls','$rootScope',function(actMng,itpls,rootScope){
  var arr=Flip.util.Array, ex={invalid:function(){}},
    lines=ex.lines=arr(),points=ex.points=arr(),itplModel,activePoint,fp,fl;
  actMng.react('choose',function(e){
    ex.activePoint=activePoint= e.target;
  }).
    react('move',function(e){
      if(activePoint)
        movePoint(e.position);
      else{
        var r= e.hitTest();
        if(r){
          ex.changeCursor(true);
          fp=focusPoint(r.target);
        }
        else if(fp){
          blurPoint(fp);
          ex.changeCursor(false);
        }
      }
    }).
    react('leave',releaseActivePoint).
    pair('release',function(e){
      if(!releaseActivePoint())
        actMng.act('add point',{ point:createPoint(e.position)}
      );
    },function(e,ee){
      var pre= ee.previous;
      if(pre.name==='choose point'){
        movePoint(pre.position);
      }
    })
    .pair('add point',function(e){
      addPoint(e.point);
    },function(e){
      removePoint(e.point.id);
    });
  function releaseActivePoint(){
    if(activePoint){
      blurPoint(activePoint);
      activePoint=null;
      ex.changeCursor(0);
      return true;
    }
  }
  function movePoint(pos){
     if(activePoint){
       activePoint.x=pos.x;
       activePoint.y=pos.y;
       invalid();
     }
  }
  function invalid(){
    ex.invalid();
    if(!rootScope.$$phase)rootScope.$digest();
  }
  function addPoint(point){
    if(points.findBy('id',point.id))throw Error('point has been added:'+point.id);
    points.add(point);
    invalid();
  }
  function removePoint(id){
    points.remove(points.findBy('id',id));
    invalid();
  }
  function createPoint(pos){
    var p = {
      r:2,x:pos.x,y:pos.y,id:uid('pt'),type:'data',color:'red'
    };
    return p;
  }
  function blurPoint(p){
    if(p){
      p.color='red';
      p.r=2;
      invalid();
    }
    return p;
  }
  function focusPoint(p){
    blurPoint(fp);
    if(p){
      p.color='orange';
      p.r=4;
      invalid();
    }
    return p;
  }
  var uid=(function(cache){
    return function(type){
      type=type||'*';
      if(!cache[type])cache[type]=0;
      return type+(++cache[type])
    }
  })({});
  return ex;
}]);