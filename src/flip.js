/**
 * Created by Administrator on 2015/3/11.
 */
var FlipScope = {readyFuncs: []};
/**
 *
 * @namespace Flip
 * @global
 * @function
 * @example
 * Flip(function(Flip){
 *  //this will executed when dom ready
 * })
 */
function Flip () {
  var first = arguments[0], readyFuncs = FlipScope.readyFuncs;
  if (typeof first === "function") readyFuncs ? arrAdd(FlipScope.readyFuncs, first) : first(Flip);
}
Object.defineProperty(Flip, 'instance', {get: function () {
  return FlipScope.global;
}});
Flip.fallback = function (window) {
  if (!window.requestAnimationFrame)
  {
    //IE9
    window.requestAnimationFrame = function (callback) {
      setTimeout(callback, 30);
    };
    Flip.Mat3.prototype.applyContext2D=function(ctx){
      //there is a bug in IE9 ctx.apply
      var eles=this.elements;
      ctx.transform(eles[0],eles[1],eles[2],eles[3],eles[4],eles[5]);
    }
  }
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
/**
 * @typedef {Object} Flip.AnimationOptions
 * @property {string} [animationType] a registed animation name
 * @property {number} [duration=.7] animation duration (in second)
 * @property {number} [iteration=1] how many times the animation will iterate
 * @property {number} [delay=0] how many seconds it will begin after it starts
 * @property {boolean}[infinite=false] if set true the animation will loop forever
 * @property {boolean}[autoReverse=false] if set true,the animation will replay in reverse order
 * @property {Flip.EASE}[ease=Flip.EASE.LINEAR] the easing function of the animation
 */
