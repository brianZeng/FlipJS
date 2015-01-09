/**
 * Created by 柏子 on 2015/1/9.
 */
angular.module('flipEditor').controller('actionCtrl',['actMng',function(actMng){
  this.undo=function(){
    actMng.undo();
  }
}]);