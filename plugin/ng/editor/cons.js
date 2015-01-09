/**
 * Created by 柏子 on 2015/1/7.
 */
angular.module('flipEditor').constant('actDefs',{
  'add point':{
    des:'click to add a point'
  },
  'remove point':{
    des:'click to remove a point'
  },
  'select line':{
    des:'click to select a line'
  },
  'select point':{
    des:'click to select a point'
  },
  'blur point':{
    hide:true
  },
  'focus point':{
    hide:true
  },
  'move point':{
    des:'drag to move the point',
    hide:true
  },
  'move line':{
    des:'drag to move the line',
    hide:true
  },
  'chg itpl':{
    hide:true
  }
}).
  constant('itpls',function(itpls){
    var r=[];
  Flip.util.Object.forEach(itpls,function(def,name){
    def.dp=def.dp||3;
    def.cp=def.cp||0;
    def.name=name;
    r.push(def);
  });
  return r;
}(
  {
    cubic:{},
    quadratic:{},
    lagrange:{},
    linear:{dp:2},
    beizer_cubic:{ dp:2,cp:2 },
    beizer_quadratic:{cp:1,dp:2}
  }
));