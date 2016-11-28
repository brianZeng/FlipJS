/**
 * Created by 柏子 on 2015/1/28.
 */
var nextUid = (function () {
  var mapSeed = {};
  return function (type) {
    if (!mapSeed.hasOwnProperty(type)) {
      mapSeed[type] = 1;
    }
    return mapSeed[type]++;
  }
})();