/**
 * Created by 柏子 on 2015/1/7.
 */
angular.module('flipEditor').
  constant('itpls',function(itpls){
    var r=[];
  Flip.util.Object.forEach(itpls,function(def,name){
    def.dp=def.dp||3;
    def.name=name;
    def.pre=getPre(def.pre,def.cp=def.cp||0);
    r.push(def);
    r[name]=def;
  });
    function getPre(pre,cp){
      if(typeof  pre==="string")return pre;
      return cp? 'Each segment':'The curve';
    }
  return r;
}(
  {
    cubic:{s:'c',pre:1},
    quadratic:{s:'q',pre:1},
    lagrange:{dp:2,pre:1,s:'l'},
    linear:{dp:2,pre:1},
    beizerCubic:{ dp:2,cp:2 ,s:'c'},
    beizerQuadratic:{cp:1,dp:2,s:'q'}
  }
));