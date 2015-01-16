/**
 * Created by 柏子 on 2015/1/16.
 */
angular.module('flipEditor').controller('dataCtrl',['dataFac','itpls',function(dataFac,itpls){
  var self=this;
  this.interpolations=itpls;
  this.interpolate=function(){
    dataFac.addLine();
  };
  this.changePointType=function(){
    self.pointType=dataFac.pointType=dataFac.pointType=='data'? 'control':'data';
  };
  this.pointType=dataFac.pointType;
  angular.forEach({
    selectedItpl:Object.getOwnPropertyDescriptor(dataFac,'interpolation')
  },function(pro,name){
    Object.defineProperty(self,name,pro);
  });

}]);