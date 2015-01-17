/**
 * Created by 柏子 on 2015/1/17.
 */
angular.module('flipEditor').directive('enable',function(){
 return{
   restrict: 'A',
   link:function(scope,element,attr){
    scope.$watch(attr.enable,function(enabled){
      if(enabled)element.removeAttr('disabled');
      else element.attr('disabled',1);
    });
  }
 }
});