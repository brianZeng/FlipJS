/**
 * @private
 * @ignore
 * @type {{readyFuncs: Array}}
 */
var FlipScope = {
  readyFuncs: [],
  global:null
};
/**
 * construct an animation with {@link AnimationOptions} or invoke function until dom ready
 * @namespace Flip
 * @global
 * @type {function}
 * @param {function|AnimationOptions} readyFuncOrAniOpt
 * @example
 * Flip(function(Flip){
 *  //this will executed until dom ready
 * });
 * //it will construct until dom ready
 * Flip({
 *  duration:1,
 *  selector:'.ani',
 *  transform:function(mat){
 *    var s=1-this.percent;
  *    mat.scale(s,s)
  *   }
 * });
 */
function Flip (readyFuncOrAniOpt) {
  var func, readyFuncs = FlipScope.readyFuncs;
  if(isObj(readyFuncOrAniOpt)) func=function(){animate(readyFuncOrAniOpt)};
  else if(isFunc(readyFuncOrAniOpt)) func=readyFuncOrAniOpt;
  else throw Error('argument should be an animation option or a function');
  readyFuncs ? arrAdd(FlipScope.readyFuncs, func) : func(Flip);
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
 * set css style immediately,you can cancel it later
 * @memberof Flip
 * @returns {function} cancel the css style
 * @example
 * var cancel=Flip.css('.content',{
 *  width:document.documentElement.clientWidth+'px',
 *  height:document.documentElement.clientHeight+'px'
 * });
 *  //cancel the style 2s later
 *  setTimeout(cancel,2000);
 *  // you can pass multiple style rules
 *  Flip.css({
 *    body:{
 *      margin:0
 *    },
 *    '.danger':{
 *       color:'red',
 *       borderColor:'orange'
 *    }
 *  })
 */
Flip.css=function(selector,rule){
  return Flip.instance.css(selector,rule)
};
Flip.parseCssText=parseCssText;
Flip.parseStyleText=parseStyleText;
/**
 * set transform style immediately
 * @memberof Flip
 * @returns {function} cancel the css style
 * @example
 * Flip.transform('.scale',Flip.Mat3().scale(0.5))
 */
Flip.transform=function(selector,rule){
  return Flip.instance.transform(selector,rule);
};
var EVENT_FRAME_START='frameStart',EVENT_UPDATE='update',EVENT_FRAME_END='frameEnd',EVENT_RENDER_START='renderStart',EVENT_RENDER_END='renderEnd';
/**
 * @typedef  AnimationOptions
 * @type {Object}
 * @property {?string} [animationName] a registered animation name
 * @property {?string} [selector='']  css selector to apply animation
 * @property {?boolean}[fillMode] if set true the css and transform will keep after animation finished
 * @property {?number} [duration=.7] animation duration (in second)
 * @property {?number} [iteration=1] how many times the animation will iterate
 * @property {?number} [delay=0] how many seconds it will begin after it starts
 * @property {?boolean}[infinite=false] if set true the animation will loop forever
 * @property {?boolean}[autoReverse=false] if set true,the animation will replay in reverse order(one iteration including the reversing time if has)
 * @property {?boolean}[autoStart] if set false the animation will starts until Animation#start() is called
 * @property {?Flip.EASE|function}[ease=Flip.EASE.LINEAR] the easing function of the animation
 * @property {?Object} [css] the css rules for the animation
 * @property {?Object} [transform] the transform rules for the animation
 * @property {?Object} [on] register event handler for the animation
 * @property {?Object} [once] register event handler once for the animation
 * @property {?Object} [variable] variable parameter of the animation(every frame the value update with animation#percent)
 * @property {?Object} [immutable] immutable parameter of the animation
 */

/**
 * @typedef  AnimationCssOptions
 * @type {Object}
 * @example
 * // css can pass a function
 * Flip.animate({
 *  selector:'.expand',
 *  css:function(css){
 *    //increase css property width from 0 - 500 px, border-width from 0-2 px;
 *    css.width=this.percent*500+'px';
 *    css.borderWidth=this.percent*2+'px';
 *  }
 * });
 * //or can be an object with multiple css rule
 * Flip.animate({
 *  selector:'.dropText'
 *  css:{
 *    '&':{//& replace the animation selector
 *      overflow:'hidden',
 *      height:'300px'
 *     },
 *     '& p':{// .dropText p
 *      height:function(css){
 *        css.height=300*this.percent+'px';
 *      }
 *     }
 *  }
 * });
 */
/**
 * @see {@tutorial use-matrix}
 * @typedef  AnimationTransformOptions
 * @type {Object}
 * @example
 * //use the css matrix property can do a lot of amazing things,but manually write matrix can be extremely tedious.
 * //just do matrix manipulation don't worry about the calculation
 * Flip.animate({
 *  selector:'div',
 *  transform:function(mat){
 *    var p=this.percent;
 *    mat.translate(p*300,p*120).rotate(Math.PI*2*p);
 *    //it like a rolling cubic
 *  }
 * });
 * //pass multiple transform rules
 * Flip.animate({
 *  selector:'.roll',
 *  duration:2,//2 seconds
 *  infinite:true,// infinite loop
 *  transform{
 *    '&':function(mat){
 *      mat.rotate(Math.PI*2*this.percent).translate(200)
 *    },
 *    '& .rotate':function(mat){
 *      mat.rotate(Math.PI*4*this.percent);
 *    }//two manipulations are irrelevant
 *  }
 * })
 */
/**
 *
 * @callback transformUpdate
 * @param {Flip.Mat3} mat the {@link Flip.Mat3}for manipulation
 * @param {Object} param the calculation param
 */

/**
 * @callback cssUpdate
 * @param {CssProxy} css the {@link CssProxy} for update
 * @param {Object} param the calculation param
*/