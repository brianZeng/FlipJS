/**
 * Created by 柏子 on 2015/1/9.
 */
angular.module('flipEditor').controller('actionCtrl',['actMng',function(actMng){
  var self=this;
  self.actions=[];
  angular.forEach({
      undo:function(){
        actMng.undo();
      }
    },
    function(func,name){
     self.actions.push({name:name,handler:function(){func.apply(self,arguments); }});
  });

}]);