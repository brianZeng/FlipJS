/**
 * Created by 柏子 on 2015/1/9.
 */
angular.module('flipEditor').controller('actionCtrl',['actMng','$document','dataFac','itpls',
  function(actMng,$doc,dataFac,itpls){
  var self=this,shortCuts=[],arr=Flip.util.Array;
  self.actions=[];
  angular.forEach({
      'add curve':{
        get enable(){ return dataFac.canAddLine},
        handler:dataFac.addLine,
        shortCut:'a+ctrl'
      },
      'remove curve':{
        handler:dataFac.removeLine,
        shortCut:'r+ctrl',
        get enable(){return dataFac.lines.length>0 }
      },
      decompose:{
        handler:dataFac.decomposeLine,
        shortCut:'d+ctrl',
        get enable(){return dataFac.lines.length>0}
      },
      undo:{
        get enable(){return actMng.records.length>0;},
        handler:function(){ actMng.undo();},
        shortCut:'z+ctrl'
      }
    },
    function(func,name){
      var def;
      if(typeof  func==="function")
       def={ name:name,handler:func,enable:true };
      else{
        def=func;
        def.name=name;
        if(!Object.getOwnPropertyDescriptor(def,'enable'))
          def.enable=true;
        if(def.shortCut)addKey(def.shortCut,def.handler);
      }
     self.actions.push(def);
  });
    itpls.forEach(function(def){
      if(def.s)
        shortCuts.push({name:def.name,char:def.s.toUpperCase(),ctrlKey:!!def.cp});
    });
    $doc.on('keydown',function(e){
      var char=String.fromCharCode(e.keyCode),hasCtrl= !!e.ctrlKey,keyDef;
      keyDef=arr.findBy(shortCuts,function(def){
        return def.char===char&& hasCtrl==def.ctrlKey;
      });
      if(!keyDef)return;
      if(keyDef.name)
        dataFac.interpolation=keyDef.name;
      else if(keyDef.handler) keyDef.handler();
      e.preventDefault();
    });
   function addKey(key,handler){
     key=key.toUpperCase();
     shortCuts.push({char:key[0],ctrlKey:key.indexOf('CTRL')>-1,handler:handler});
   }
}]);