/**
 * Created by 柏子 on 2015/1/16.
 */
angular.module('flipEditor').controller('dataCtrl',['dataFac','itpls','$scope',function(dataFac,itpls,$scope){
  var self=this;
  this.interpolations=itpls;
  this.changePointType=function(){
    dataFac.pointType=false;
  };
  $scope.$watch(function(){
    return dataFac.pointType;
  },function(pointType){
    self.pointType=pointType;
  });
  angular.forEach({
    selectedItpl:'interpolation'
  },function(pro,name){
    if(typeof pro==="string") pro=Object.getOwnPropertyDescriptor(dataFac,pro);
    Object.defineProperty(self,name,pro);
  });
}]);