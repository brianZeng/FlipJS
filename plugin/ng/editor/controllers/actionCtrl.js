/**
 * Created by 柏子 on 2015/1/9.
 */
angular.module('flipEditor').controller('actionCtrl',['actMng','$document','dataFac','itpls',
  function(actMng,$doc,dataFac,itpls){
  var self=this,shortCuts=[],arr=Flip.util.Array;
  self.actions=[];
  angular.forEach({
      interpolate:{
        get enable(){
          return dataFac.canAddLine;
        },
        handler:dataFac.addLine
      },
      'remove Curve':function(){
        dataFac.removeLine();
      },
      decompose:function(){
        dataFac.decomposeLine();
      },
      undo:{
        get enable(){
          return actMng.records.length>0;
        },
        handler:function(){
          actMng.undo();
        }
      }
    },
    function(func,name){
      var def;
      if(typeof  func==="function"){
       def={ name:name,handler:func,enable:true }
      }else{
        def=func;
        def.name=name;
      }
     self.actions.push(def);
  });
    itpls.forEach(function(def){
      if(def.s)
        shortCuts.push({name:def.name,char:def.s.toUpperCase(),ctrlKey:!!def.cp});
    });
    $doc.on('keydown',function(e){
      var char=String.fromCharCode(e.keyCode),hasCtrl= !!e.ctrlKey,itpl;
      itpl=arr.findBy(shortCuts,function(def){
        return def.char===char&& hasCtrl==def.ctrlKey;
      });
      if(itpl)
        dataFac.interpolation=itpl.name;
    });

}]);