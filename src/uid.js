/**
 * Created by 柏子 on 2015/1/28.
 */
var nextUid=(function(map){
  return function (type){
    if(!map[type])map[type]=1;
    return map[type]++;
  }
})({});