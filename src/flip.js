/**
 * Created by Administrator on 2015/3/11.
 */
var FlipScope = {readyFuncs: []};
function Flip () {
  var first = arguments[0], readyFuncs = FlipScope.readyFuncs;
  if (typeof first === "function") readyFuncs ? arrAdd(FlipScope.readyFuncs, first) : first(Flip);
}
Object.defineProperty(Flip, 'instance', {get: function () {
  return FlipScope.global;
}});
Flip.fallback = function (window) {
  if (!window.requestAnimationFrame)
    window.requestAnimationFrame = function (callback) {
      setTimeout(callback, 30);
    };
  if (!window.Float32Array) {
    window.Float32Array = inherit(function (lengthOrArray) {
      if (!(this instanceof arguments.callee))return new arguments.callee(lengthOrArray);
      var i = 0, from, len;
      if (typeof lengthOrArray === "number") {
        from = [0];
        len = lengthOrArray;
      } else
        len = (from = lengthOrArray).length;
      for (i; i < len; i++)
        this[i] = from[i] || 0;
    }, Array.prototype)
  }
};
