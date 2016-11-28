(function () {
  var FlipScope = {
    readyFuncs: [],
    global: null
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
  function Flip(readyFuncOrAniOpt) {
    var func, readyFuncs = FlipScope.readyFuncs;
    if (isObj(readyFuncOrAniOpt)) {
      func = function () {
        animate(readyFuncOrAniOpt)
      };
    } else if (isFunc(readyFuncOrAniOpt)) {
      func = readyFuncOrAniOpt;
    } else {
      throw Error('argument should be an animation option or a function');
  }
    readyFuncs ? arrAdd(FlipScope.readyFuncs, func) : func(Flip);
  }

  Object.defineProperty(Flip, 'instance', {
    get: function () {
      return FlipScope.global;
    }
  });
  Flip.fallback = function (window) {
    if (!window.requestAnimationFrame) {
      //IE9
      window.requestAnimationFrame = function (callback) {
        setTimeout(callback, 30);
      };
      Flip.Mat3.prototype.applyContext2D = function (ctx) {
        //there is a bug in IE9 ctx.apply
        var eles = this.elements;
        ctx.transform(eles[0], eles[1], eles[2], eles[3], eles[4], eles[5]);
    }
    }
    if (!window.Float32Array) {
      window.Float32Array = inherit(function F(lengthOrArray) {
        if (!(this instanceof F)) {
          return new F(lengthOrArray);
      }
        var i = 0, from, len;
        if (typeof lengthOrArray === "number") {
          from = [0];
          len = lengthOrArray;
        } else {
          len = (from = lengthOrArray).length;
        }
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
  Flip.css = function (selector, rule) {
    return Flip.instance.css(selector, rule)
  };
  Flip.parseCssText = parseCssText;
  Flip.parseStyleText = parseStyleText;
  /**
   * set transform style immediately
   * @memberof Flip
   * @returns {function} cancel the css style
   * @example
   * Flip.transform('.scale',Flip.Mat3().scale(0.5))
   */
  Flip.transform = function (selector, rule) {
    return Flip.instance.transform(selector, rule);
  };
  var EVENT_FRAME_START = 'frameStart', EVENT_UPDATE = 'update', EVENT_FRAME_END = 'frameEnd', EVENT_RENDER_START = 'renderStart', EVENT_RENDER_END = 'renderEnd';
  if (typeof module !== "undefined" && module.exports) {
    module.exports = Flip;
  } else if (window) {
    window.Flip = Flip;
  }
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
  Flip.util = { Object: obj, Array: array, inherit: inherit };
  var CALLBACK_PROPERTY_NAME = '_callbacks';

  function objAssign(source) {
    if (!isObj(source)) {
      source = {}
  }
    for (var i = 1, len = arguments.length; i < len; i++) {
      objForEach(arguments[i], function (val, key) {
        source[key] = val;
      })
  }
    return source;
  }

  function makeOptions(opt, defaults) {
    var ret = {};
    opt = opt || {};
    objForEach(defaults || {}, function (value, key) {
      ret[key] = opt.hasOwnProperty(key) ? opt[key] : value
    });
    return ret;
  }

  function useOptions(target, opt) {
    objForEach(opt, cloneFunc, target);
    return target;
  }

  function inherit(constructor, baseproto, expando, propertyObj) {
    if (isFunc(baseproto)) {
      baseproto = new baseproto();
    }
    baseproto = baseproto || {};
    var proto = constructor.prototype = Object.create(baseproto), proDes;
    if (expando) {
      for (var i in expando) {
        proDes = Object.getOwnPropertyDescriptor(expando, i);
        if (proDes) {
          Object.defineProperty(proto, i, proDes);
        } else {
          proto[i] = expando[i];
      }
    }
  }
    if (propertyObj) {
      obj.forEach(propertyObj, function (key, value) {
        Object.defineProperty(proto, key, value);
      });
  }
    return constructor;
  }

  function array(arrayLike) {
    if (!(this instanceof array)) {
      return new array(arrayLike);
  }
    if (arrayLike && arrayLike.length) {
      for (var i = 0, len = arrayLike.length; i < len; i++)
        this[i] = arrayLike[i];
  }
  }

  function arrAdd(array, item) {
    var i = array.indexOf(item);
    if (i == -1) {
      return !!array.push(item);
  }
    return false;
  }

  function arrSort(array, func_ProName, des) {
    var compare = arrMapFun(func_ProName);
    return array.sort(des ? function (a, b) {
      return compare(a) < compare(b)
    } : function (a, b) {
      return compare(a) > compare(b)
    });
  }

  function arrFirst(array, func_ProName) {
    for (var i = 0, item, len = array.length, compare = arrMapFun(func_ProName); i < len; i++)
      if (compare(item = array[i])) {
        return item;
    }
    return void 0;
  }

  function arrRemove(array, item) {
    var i = array.indexOf(item);
    if (i >= 0) {
      return !!array.splice(i, 1);
  }
    return false;
  }

  function arrMapFun(func_ProName) {
    if (isStr(func_ProName)) {
    return function (item) {
      return item[func_ProName]
    };
    } else if (isFunc(func_ProName)) {
      return func_ProName;
  }
    return function (item) {
      return item
    };
  }

  array.remove = arrRemove;
  array.add = arrAdd;
  array.first = arrFirst;
  function mapProName(proNameOrFun) {
    if (isFunc(proNameOrFun)) {
      return proNameOrFun;
    } else if (proNameOrFun && isStr(proNameOrFun)) {
      return function (item) {
        return item ? item[proNameOrFun] : undefined;
      };
    } else {
      return function (item) {
        return item;
    }
  }
  }

  function arrFind(array, proNameOrFun, value, unstrict, index) {
    var fun = mapProName(proNameOrFun), i, item;
    if (value === undefined) {
      value = true;
  }
    if (unstrict) {
      for (i = 0, item = array[0]; item; item = array[++i]) if (fun(item) == value) {
        return index ? i : item;
    }
  }
    else {
      for (i = 0, item = array[0]; item; item = array[++i]) if (fun(item) === value) {
        return index ? i : item;
    }
  }
    return undefined;
  }

  array.findBy = arrFind;
  function arrForEachThenFilter(arr, forEach, filter, thisObj) {
    var copy = arr.slice();
    thisObj === void 0 && (thisObj = arr);
    copy.forEach(forEach, thisObj);
    return arr.filter(filter, thisObj);
  }

  array.sort = arrSort;
  inherit(array, Array, {
    add: function (item) {
      return arrAdd(this, item);
    },
    findBy: function (proNameOrFun, value, unstrict) {
      return arrFind(this, proNameOrFun, value, unstrict);
    },
    remove: function (item) {
      return arrRemove(this, item);
    },
    first: function (func_proName) {
      return arrFirst(this, func_proName);
  }
  });
  function addMapArray(map, key, cb) {
    if (!map.hasOwnProperty(key)) {
      map[key] = [cb];
    } else {
      arrAdd(map[key], cb);
  }
    return map;
  }

  function obj(from) {
    if (!(this instanceof obj)) {
      return new obj(from);
    }
    if (typeof from === "object") {
      objForEach(from, function (value, key) {
        var pro;
        if (pro = Object.getOwnPropertyDescriptor(from, key)) {
          Object.defineProperty(this, key, pro);
      } else {
          this[key] = value;
      }
      }, this);
  }
  }

  obj.assign = objAssign;
  function addEventListener(obj, evtName, handler) {
    if (isStr(evtName) && evtName && isFunc(handler)) {
      if (!obj.hasOwnProperty(CALLBACK_PROPERTY_NAME)) {
        obj[CALLBACK_PROPERTY_NAME] = {};
    }
      addMapArray(obj[CALLBACK_PROPERTY_NAME], evtName, handler);
  }
    return obj;
  }

  obj.on = addEventListener;
  function emitEvent(obj, evtName, argArray, thisObj) {
    var callbacks, handlers, toRemove;
    if (!(obj.hasOwnProperty(CALLBACK_PROPERTY_NAME)) || !(handlers = (callbacks = obj[CALLBACK_PROPERTY_NAME])[evtName])) {
      return false;
  }
    if (!argArray) {
      argArray = [];
    } else if (!(argArray instanceof Array)) {
      argArray = [argArray];
  }
    if (thisObj === undefined) {
      thisObj = obj;
    }
    toRemove = [];
    return (callbacks[evtName] = arrForEachThenFilter(handlers, evalHandler, function (handler) {
      return toRemove.indexOf(handler) == -1
    })).length;
    function evalHandler(handler) {
      handler.apply(thisObj, argArray) == -1 && toRemove.push(handler)
    }
  }

  obj.emit = emitEvent;
  function removeEventListener(obj, evtName, handler) {
    var cbs, hs;
    if (evtName === undefined) {
      delete obj[CALLBACK_PROPERTY_NAME];
    } else if ((cbs = obj[CALLBACK_PROPERTY_NAME]) && (hs = cbs[evtName]) && hs) {
      if (handler) {
        array.remove(hs, handler);
      } else {
        delete cbs[evtName];
    }
  }
    return obj;
  }

  obj.off = removeEventListener;
  function addEventListenerOnce(obj, evtName, handler) {
    if (isFunc(handler)) {
      obj.on(evtName, function () {
        handler.apply(obj, arguments);
        return -1;
      });
  }
    return obj;
  }

  obj.once = addEventListenerOnce;
  function objForEach(object, callback, thisObj, arg) {
    if (isObj(object)) {
      if (thisObj == undefined) {
        thisObj = object;
      }
      if (object instanceof Array) {
        object.forEach(callback, thisObj);
      } else {
        for (var key in object) {
          if (object.hasOwnProperty(key)) {
            callback.call(thisObj, object[key], key, arg);
          }
        }
      }
  }
    return object;
  }

  obj.forEach = objForEach;

  inherit(obj, null, {
    on: function (evtName, handler) {
      return addEventListener(this, evtName, handler);
    },
    emit: function (evtName, argArray, thisObj) {
      return emitEvent(this, evtName, argArray, thisObj);
    },
    off: function (evtName, handler) {
      return removeEventListener(this, evtName, handler);
    },
    once: function (evtName, handler) {
      return addEventListenerOnce(this, evtName, handler);
    },
    forEach: function (callback, thisObj, arg) {
      return objForEach(this, callback, thisObj, arg);
  }
  });
  function cloneFunc(value, key) {
    this[key] = value;
  }

  function isFunc(value) {
    return typeof value === "function"
  }

  function isObj(value) {
    return (typeof value === "object") && value
  }

  function isStr(value) {
    return typeof value === "string"
  }

  function noop() {
  }

  function parseStyleText(styleText) {
    var i = 0, ret = {}, ruleStart, ruleEnd;
    while ((ruleStart = styleText.indexOf('{', i)) > -1) {
      ruleEnd = styleText.indexOf('}', ruleStart);
      addMapArray(
        ret,
        styleText.substring(i, ruleStart).trim(),
        parseCssText(styleText.substring(ruleStart + 1, ruleEnd))
      );
      i = ruleEnd + 1;
  }
    return ret;
  }

  function parseCssText(cssText, target) {
    var ret = isObj(target) ? target : {}, pair;
    cssText.split(';').forEach(function (rule) {
      if (rule = rule.replace(/[\r\n\t\f\s]/g, '')) {
        pair = rule.split(':');
        ret[pair[0]] = pair[1];
    }
    });
    return ret;
  }

  function decorateFunction(func, decorator) {
    return function decoratedFunc() {
      func.apply(this, arguments);
      return decorator.apply(this, arguments);
  }
  }

  function CssProxy(obj) {
    if (!(this instanceof CssProxy))return new CssProxy(obj);
    this.$merge(obj);
    this.$invalid = true;
  }

  Flip.CssProxy = CssProxy;

  (function () {
    var defaultPrefixes, cssPrivateKeyPrefix = '$$';

    var cssPropertyKeys, cssPrivateKeys = [];
    if (isFunc(window.CSS2Properties)) {
      cssPropertyKeys = Object.getOwnPropertyNames(CSS2Properties.prototype).filter(function (key) {
        return key.indexOf('-') == -1;
    });
  }
    else {
      cssPropertyKeys = Object.getOwnPropertyNames(document.documentElement.style)
  }
    function formatNum(value) {
      return isNaN(value) ? value : Number(value).toFixed(5).replace(/\.0+$/, '')
    }

    var p = CssProxy.prototype = {
      $styleText: function (selector, separator) {
        return combineStyleText(selector, this.$toSafeCssString(separator));
      },
      $toCachedCssString: function (reset) {
        if (this.$invalid) {
          this.$cachedCssString = this.$toSafeCssString();
          this.$invalid = !!reset;
        }
        return this.$cachedCssString;
      },
      $toSafeCssString: function (separator) {
        var rules = [];
        objForEach(this, function (val, key) {
          var i = cssPrivateKeys.indexOf(key);
          if (i > -1 && val !== void 0)
            rules.push(cssPropertyKeys[i] + ':' + formatNum(val))
      });
        return rules.join(';' + (separator || ''));
      },
      toString: function () {
        return this.$toSafeCssString();
      },
      /**
       * combine key with prefixes
       * @param {string} key   css rule name
       * @param {string} value css value
       * @param {Array<String>}[prefixes=['-moz-','-ms-','-webkit-','-o-','']] prefixes to combine
       * @returns {CssProxy} return itself
       * @example
       * css.$withPrefix('border-radius','50%')
       * //add css rules: -moz-border-radius,-webkit-border-radius,-ms-border-radius
       */
      $withPrefix: function (key, value, prefixes) {
        var self = this;
        (prefixes || defaultPrefixes).forEach(function (prefix) {
          self[normalizeCSSKey(prefix + key)] = value;
        });
        return self;
      },
      /**
       * combine another css rules
       * @param {CssProxy|Object}obj
       * @returns {CssProxy} return itself
       */
      $merge: function (obj) {
        if (isObj(obj) && obj !== this)
          objForEach(obj, cloneFunc, this);
        return this;
      },
      /**
       * format string
       * @param {string} stringTemplate
       * @returns {string}
       * @example
       * function(css,param){
     *  css.boxShadow=css.template('0 0 ${1} ${2} ${3} inset',param.blurBase+param.blurRange,param.spread,param.blurColor);
     *  //instead of
     *  //css.boxShadow='0 0'+param.blurBase+param.blurRange+' '+ param.spread +' '+param.blurColor+' inset';
     * }
       */
      $template: stringTemplate
    };
    cssPropertyKeys = cssPropertyKeys.map(function (key) {
      var privateKey = cssPrivateKeyPrefix + key,
        capitalizedKey = capitalizeString(key),
        camelKey = key[0].toLowerCase() + key.substring(1),
        lowerCaseKey = toLowerCssKey(key);
      cssPrivateKeys.push(privateKey);
      registerProperty(p, [key, lowerCaseKey, capitalizedKey, camelKey], {
        get: getter,
        set: setter
    });
      function getter() {
        return this[privateKey]
    }

      function setter(val) {
        var v = castInvalidValue(val);
        if (v != this[privateKey]) {
          this.$invalid = true;
          this[privateKey] = v;
        }
    }

      return lowerCaseKey;
    });
    defaultPrefixes = ['-moz-', '-ms-', '-webkit-', '-o-', ''].filter(function (prefix) {
      var key = prefix.replace(/^\-/, '');
      return cssPropertyKeys.some(function (proKey) {
        return proKey.indexOf(key) == 0 || proKey.indexOf(prefix) == 0
      })
    });
    Flip.stringTemplate = p.$t = stringTemplate;
    function stringTemplate(stringTemplate) {
      var arg = arguments, r;
      return stringTemplate.replace(/\$\{(\d+)}/g, function ($i, i) {
        return ((r = arg[i]) == undefined) ? $i : formatNum(r);
      })
    }

    function normalizeCSSKey(cssKey) {
      return cssKey.replace(/^\-/, '').replace(/\-([a-z])/g, function (str, char) {
        return char.toUpperCase();
      })
    }

    function castInvalidValue(val) {
      var type = typeof val;
      return type == 'string' || type == 'number' ? val : void  0;
    }

    function toLowerCssKey(key) {
      var prefix = /^(webkit|moz|o|ms)[A-Z]/.test(key) ? '-' : '';
      return prefix + key.replace(/[A-Z]/g, function (str) {
          return '-' + str.toLowerCase()
        })
  }

    function registerProperty(target, keys, define) {
      keys.forEach(function (key) {
        Object.defineProperty(target, key, define);
      })
    }
  })();
  function capitalizeString(str) {
    if (!str) {
      return '';
    }
    return str[0].toUpperCase() + str.substring(1)
  }

  function combineStyleText(selector, body) {
    if (isObj(selector)) {
      body = selector.rules.join(';');
      selector = selector.selector;
    }
    return selector + '{' + body + '}';
  }

  function Render() {
  }

  inherit(Flip.Render = Render, Flip.util.Object, {
    update: function () {
    },
    render: function () {
    },
    finalize: function () {
    },
    invalid: function () {
      var t, p;
      if (t = this._task) t.invalid();
      else if (p = this.parent) p.invalid();
      this._invalid = true;
    }
  });
  function RenderTask(name) {
    if (!(this instanceof RenderTask))return new RenderTask(name);
    this.name = name;
    this.timeline = new TimeLine(this);
    this._updateObjs = [];
    this._finalizeObjs = [];
    this._global = null;
  }

  Flip.RenderTask = RenderTask;
  inherit(RenderTask, Flip.util.Object, {
    update: noop,
    invalid: function () {
      var g;
      this._invalid = true;
      if (g = this._global)
        g.invalid();
    },
    toFinalize: function (obj) {
      return this._updateObjs.indexOf(obj) > -1 && arrAdd(this._finalizeObjs, obj);
    },
    add: function (obj, type) {
      if (obj._task) throw Error('_task has been taken');
      if (type == 'update')
        return arrAdd(this._updateObjs, obj);
      if (obj instanceof Clock || obj instanceof Render)
        if (arrAdd(this._updateObjs, obj))
          obj._task = this;
      this.invalid();
    },
    remove: function (obj) {
      if (obj._task == this || this._updateObjs.indexOf(obj) > -1) {
        obj._task = null;
        this.toFinalize(obj);
        this.invalid();
    }
  }
  });

  /**
   * @namespace Flip.Animation
   * @param {AnimationOptions} opt
   * @returns {Flip.Animation}
   * @property {number} percent the percentage of the animation [0-1]
   * @property {boolean} finished if the animation is finished
   * @property {Flip.Promise} promise the animation promise for continuation
   * @property {Flip.Clock} clock animation clock for timing
   * @constructor
   */
  function Animation(opt) {
    if (!(this instanceof Animation)) {
      return new Animation(opt);
  }
    useOptions(this, makeOptions(opt, {
      selector: '',
      fillMode: FILL_MODE.REMOVE,
      clock: opt.clock || new Clock(opt)
    }));
    this._cssHandlerMap = {};
    this._matHandlerMap = {};
    this._cachedMat = {};
    this._immutable = {};
    this._variable = {};
    this._param = {};
    this.current = {};
    this.use(opt);
    this.init();
  }

  var FILL_MODE = Animation.FILL_MODE = {
    REMOVE: 'remove', SNAPSHOT: 'snapshot', KEEP: 'keep'
  };
  inherit(Animation, Render,
    /**
     * @lends Flip.Animation.prototype
     */
    {
      get percent() {
        return this.clock.value || 0;
    },
      set clock(c) {
        var oc = this._clock;
        c = c || null;
        if (oc == c) {
          return;
        }
        if (oc && c) {
          throw Error('remove the animation clock before add a new one');
        }
        this._clock = c;
        //add a clock
        if (c) {
          c.controller = this;
        }//remove a clock
        else if (oc) {
          oc.controller = null;
        }
    },
      get clock() {
        return this._clock;
    },
      get promise() {
        return this._promise || (this._promise = getPromiseByAni(this));
      },
      get finished() {
        return this._finished;
      },
      get id() {
        if (!this._id) {
          this._id = nextUid('Animation' + this.type);
      }
        return this._id;
    },
      get elements() {
        return Flip.$(this.selector);
    },
      /**
       * mostly you don't need to call this manually
       * @alias Flip.Animation#init
       * @function
       */
      init: function () {
        this._promise = null;
        this._canceled = this._finished = false;
        this.invalid();
      },
      /**
       * reset the animation
       * @alias Flip.Animation#reset
       * @function
       * @return {Flip.Animation} the animation itself
       */
      reset: function (skipInit) {
        var clock;
        if (clock = this.clock) {
          clock.reset(1);
      }
        if (!skipInit) {
          this.init();
      }
        return this;
    },
      use: function (opt) {
        useAniOption(this, opt);
        var renderFunc = opt.render;
        if (isFunc(renderFunc)) {
          this.render = decorateFunction(this.render, renderFunc);
      }
        return this;
      },
    /**
     * set the animation calculate parameter
     * @alias Flip.Animation#param
     * @param {string|Object}key
     * @param {?any}value
     * @param {?boolean}immutable is it an immutable param
     * @returns {Flip.Animation}
     * @example
     * ani.param('rotation',Math.PI*2);
     * ani.param({
     *  translateX:100,
     *  translateY:200
     * });
     * // you can use {@link AnimationOptions} to set param when construct
     * Flip({
     *  immutable:{
     *    width:200
     *  },
     *  variable:{
     *    scaleX:2
     *  }
     * })
     */
    param: function (key, value, immutable) {
      if (isObj(key)) {
        cloneWithPro(key, this[value ? '_immutable' : '_variable']);
      } else if (isStr(key)) {
        this[immutable ? '_immutable' : '_variable'][key] = value;
      }
      return this;
    },
      /**
       * set the animation transform update function
       * @see {@link Flip.Mat3} for matrix manipulation
       * @alias Flip.Animation#transform
       * @param {string|transformUpdate|AnimationTransformOptions}selector
       * @param {transformUpdate}matCallback
       * @returns {Flip.Animation}
       * @example
       * ani.transform(function(mat,param){
     *  mat.translate(param.translateX,param.translateY)
     * });
       * ani.transform('.rotate',function(mat,param){
     *  mat.rotate(param.rotation)
     * });
       * //or set with {@link AnimationOptions}
       * ani.transform({
     *  '&':function(mat){};
     *  '& div':function(mat){};
     * })
       */
      transform: function (selector, matCallback) {
        var callbackMap = this._matHandlerMap;
        objForEach(normalizeMapArgs(arguments), function (callback, selector) {
          var cb;
          if (callback instanceof Mat3) {
            cb = function (mat) {
              return mat.concat(callback);
          }
          }
          else if (isFunc(callback)) {
            cb = function (mat, param) {
              return callback.apply(this, [mat, param]) || mat;
          }
          }
          else {
            throw Error('callback expect function or mat');
          }
          addMapArray(callbackMap, selector, cb);
        });
        return this;
      },
      /**
       * set the css update function
       * @alias Flip.Animation#css
       * @param {string|cssUpdate|AnimationCssOptions}selector
       * @param {Object} [mapOrFunc]
       * @returns {Flip.Animation}
       * @see {@link CssProxy}
       * @example
       * ani.css('&:hover',{fontSize:'larger'});
       * ani.css(function(css,param){
     *  css.$withPrefix('border-radius',param.borderRadius);
     * });
       * //set multiple rules
       * ani.css({
     *  '&.invalid':{
     *    backgroundColor:'#333'
     *  },
     *  '&.invalid >*':function(css){
     *    css.opacity=1-this.percent
     *  }
     * })
       */
      css: function (selector, mapOrFunc) {
        var callbackMap = this._cssHandlerMap;
        objForEach(normalizeMapArgs(arguments), function (callback, selector) {
          addMapArray(callbackMap, selector, { cb: callback, proxy: new CssProxy() });
        });
        return this;
      },
      update: function (state) {
        updateAnimation(this, state);
      },
      render: function (state) {
        renderAnimation(this, state);
      },
      invalid: function () {
        if (this._task) {
          this._task.invalid();
      }
      },
      finalize: function () {
        var task;
        if (task = this._task) {
          this._ltName = task.name;
          task.toFinalize(this);
      }
        else if (!this._canceled) {
          this.reset(1);
          this.emit(EVENT_FINALIZE);
      }
        return this;
      },
      /**
       * start the animation, it won't take effect on started animation
       * @returns {Flip.Animation} return itself
       */
      start: function () {
        findTaskToAddOrThrow(this);
        return this._canceled ? this.restart() : invokeClock(this, 'start');
      },
      /**
       * @alias Flip.Animation#resume
       * @param {Object} [evt] trigger event param
       * @returns {Flip.Animation} returns itself
       */
      resume: function (evt) {
        return invokeClock(this, 'resume', EVENT_RESUME, evt);
      },
      /**
       * @alias Flip.Animation#pause
       * @param {Object} [evt] trigger event param
       * @returns {Flip.Animation} returns itself
       */
      pause: function (evt) {
        return invokeClock(this, 'pause', EVENT_PAUSE, evt);
      },
      /**
       * @alias Flip.Animation#cancel
       * @param {Object} [evt] trigger event param
       * @returns {Flip.Animation} returns itself
       */
      cancel: function (evt) {
        var t;
        if (!this._canceled && !this._finished) {
          if (t = this._task) {
            this._ltName = t.name;
        }
          this._canceled = true;
          this.emit(EVENT_CANCEL, evt);
          this.finalize();
      }
        return this;
      },
      /**
       * @alias Flip.Animation#restart
       * @returns {Flip.Animation} returns itself
       */
      restart: function (opt) {
        findTaskToAddOrThrow(this, opt);
        this.clock.reset();
        this.init();
        return this.start();
      },
      /**
       * @alias Flip.Animation#then
       * @param {function} [onFinished] callback when animation finished
       * @param {function} [onerror] callback when animation interrupted
       * @returns {Flip.Promise}
       */
      then: function (onFinished, onerror) {
        return this.promise.then(onFinished, onerror);
      },
      lastStyleText: function (separator) {
        return renderAnimationCssProxies(this, true).map(combineStyleText).join(separator)
      }
    });
  /** triggered when in every frame after animation starts
   * @event Flip.Animation#update  */
  /** triggered when animation render new frame
   * @event Flip.Animation#render  */
  /** triggered when animation ends
   * @event Flip.Animation#finish  */
  /** triggered when animation is finalized
   * @event Flip.Animation#finilize  */
  /** triggered when animation is canceled
   * @event Flip.Animation#cancel  */
  /** triggered when animation is paused
   * @event Flip.Animation#pause   */
  /** triggered when animation is resumed from pause
   * @event Flip.Animation#resume  */
  var EVENT_FINALIZE = 'finalize', EVENT_RENDER = 'render', EVENT_FINISH = 'finish', EVENT_CANCEL = 'cancel', EVENT_PAUSE = 'pause', EVENT_RESUME = 'resume';

  function findTaskToAddOrThrow(ani, opt) {
    var t, global;
    if (!(t = ani._task)) {
      opt = opt || {};
      t = opt.task || (global = opt.global || FlipScope.global).getTask(opt.taskName || ani._ltName) || global.defaultTask;
      if (t instanceof RenderTask) {
        t.add(ani);
      } else {
        throw Error('please specify the render task for animation to restart');
      }
  }
    return t;
  }

  function invokeClock(animation, method, evtName, evtArg) {
    var clock = animation.clock;
    if (clock) {
      clock[method]();
      if (evtName) {
        animation.emit(evtName, evtArg);
      }
    }
    return animation;
  }

  function getPromiseByAni(ani) {
    return FlipScope.Promise(function (resolve, reject) {
      ani.once(EVENT_FINISH, function (state) {
        if (state && state.global) {
          state.global.once(EVENT_FRAME_END, go);
      } else {
          go();
      }
      }).once(EVENT_CANCEL, function () {
        reject(ani)
    });
      function go() {
        resolve(ani);
      }
    });
  }

  function cloneWithPro(from, to) {
    var pro, getter;
    to = to || {};
    objForEach(from, function (value, key) {
      if ((pro = Object.getOwnPropertyDescriptor(from, key)) && (typeof (getter = pro.get) == "function")) {
        Object.defineProperty(to, key, { get: getter });
      } else {
        to[key] = value
      }
    });
    return to;
  }

  /**
   * construct an animation instance see {@link AnimationOptions}
   * you can also construct an animation by {@link Flip.Animation}
   * @function
   * @param {AnimationOptions} opt
   * @memberof Flip
   * @return {Flip.Animation}
   * @example
   * //start animation when dom ready
   * Flip(function(){
 *  //imitate 3D rotateZ
 *  Flip.animate({
 *     selector:'.double-face',
 *    duration:.8,
 *    autoReverse:true,
 *    iteration:2,
 *    immutable:{
 *      width:150
 *    },
 *    variable:{
 *      rotation:Math.PI,// every frame,it will refresh the param.rotation from 0 to Math.PI
 *      showFront:function(percent){
 *        //if it rotate to back end the front end will not display
 *        return percent <= 0.5
 *      }
 *    },
 *    css:{
 *      '&,& div':function(css,param){
 *        css.width=css.height=param.width+'px';
 *      },
 *      '& .front':function(css,param){
 *        css.display=param.showFront? 'block':'none';
 *        css.backgroundColor='orange';
 *      },
 *      '& .back':function(css,param){
 *        css.display=!param.showFront? 'block':'none';
 *        css.backgroundColor='yellow';
 *      }
 *    },
 *    transform:{
 *     '&':function(mat,param){
 *        mat.flip(param.rotation);
 *      }
 *    }
 *  })
 * });
   */
  function animate(opt) {
    if (isObj(opt)) {
      var constructor = Flip.register[opt.animationName];
    } else {
      throw Error('cannot construct an animation');
  }
    if (!constructor) {
      constructor = Animation;
  }
    return setAniEnv(opt, new constructor(opt));
  }

  function setAniEnv(aniOpt, animation) {
    (aniOpt.renderGlobal || FlipScope.global).getTask(aniOpt.taskName, true).add(animation);
    if (aniOpt.autoStart !== false) {
      animation.start();
    }
    return animation;
  }

  /*animate.createOptProxy = function (setter, autoStart, taskName, defaultGlobal) {
   setter = createProxy(setter);
   setter('autoStart', autoStart, 'taskName', taskName, 'renderGlobal', defaultGlobal);
   return setter;
   };*/

  Flip.animate = animate;

  Flip.register = (function () {
    function register(definition) {
      var beforeCallBase, name = definition.name, Constructor;
      beforeCallBase = definition.beforeCallBase || _beforeCallBase;
      Constructor = function (opt) {
        if (!(this instanceof Constructor)) {
          return new Constructor(opt);
      }
        var proxy = cloneWithPro(opt, cloneWithPro(definition, {}));
        beforeCallBase.call(this, proxy, opt);
        Animation.call(this, proxy);
        (definition.afterInit || noop).call(this, proxy, opt);
      };
      if (name) {
        register[name] = Constructor;
    }
      inherit(Constructor, Animation.prototype, {
        type: name,
        use: function (opt) {
          return useAniOption(this, definition, opt)
        }
      });
      return Constructor;
    }

    return register;

    function _beforeCallBase(proxy, opt) {
      return proxy;
  }
  })();
  var _optProperties = ['transform', 'css', 'on', 'once'];

  function useAniOption(animation) {
    for (var i = 1, opt = arguments[1], optPro; opt; opt = arguments[++i]) {
      _optProperties.forEach(function (proName) {
        if (isFunc(optPro = opt[proName])) {
          animation[proName](optPro);
        } else if (isObj(optPro)) {
          hasNestedObj(optPro) ? objForEach(optPro, function (rule, slt) {
            animation[proName](slt, rule)
          })
            : animation[proName](optPro);
        }
      });
      animation.param(opt.param).param(opt.variable).param(opt.immutable, true);
  }
    return animation;
  }

  function normalizeMapArgs(args) {
    var ret = {}, arg, key = args[0];
    if (key != void 0 && (arg = args[1]) != void 0) {
      ret[key] = arg;
  }
    else if (isFunc(arg = args[0]) || !hasNestedObj(arg)) {
      ret['&'] = arg;
  }
    else if (!isObj(arg)) {
      throw Error('argument Error');
    }//isNestedObj
    else {
      ret = arg;
    }
    return ret;
  }

  function hasNestedObj(obj) {
    return isObj(obj) && Object.getOwnPropertyNames(obj).some(function (key) {
        var t = typeof obj[key];
        return t == "object" || t == "function"
      });
  }

  Flip.Animation = Animation;

  function Clock(opt) {
    if (!(this instanceof Clock))return new Clock(opt);
    useOptions(this, makeOptions(opt, {
      duration: 1,
      ease: Clock.EASE.linear,
      infinite: false,
      iteration: 1,
      silent: false,
      autoReverse: false,
      delay: 0,
      hold: 0
    })).reset();
  }

  Flip.Clock = Clock;
  /**
   * triggered when animation iterate
   * @event Flip.Animation#iterate
   */
  /**
   * triggered when animation reverse play
   * @event Flip.Animation#reverse
   */
  /**
   * triggered when animation first update(not constructed)
   * @event Flip.Animation#init
   */
  var EVENT_INIT = 'init', EVENT_ITERATE = 'iterate', EVENT_REVERSE = 'reverse', EVENT_START = 'start', EVENT_CONTROLLER_CHANGE = 'controllerChange', EVENT_HOLD = 'hold';
  var CLOCK_STATUS_IDLE = 0, CLOCK_STATUS_PAUSED = 1, CLOCK_STATUS_ACTIVE = 2, CLOCK_STATUS_DELAYING = 3, CLOCK_STATUS_HOLDING = 4, CLOCK_STATUS_ENDED = 5, CLOCK_STATUS_UNKNOWN = 6, CLOCK_STATUS_STARTED = 7, CLOCK_STATUS_CANCELED = 8;
  inherit(Clock, obj, {
    get controller() {
      return this._controller || null;
    },
    set controller(c) {
      var oc = this.controller;
      c = c || null;
      if (oc === c) {
        return;
      }
      this._controller = c;
      this.emit(EVENT_CONTROLLER_CHANGE, { before: oc, after: c, clock: this });
    },
    get started() {
      return this._startTime !== -1;
    },
    get finished() {
      return this._status == CLOCK_STATUS_ENDED;
    },
    get paused() {
      return this._status == CLOCK_STATUS_PAUSED;
    },
    get ease() {
      return this._tf;
    },
    set ease(src) {
      var tf;
      if ((isFunc(tf = src)) || (tf = Clock.EASE[src]))
        this._tf = tf;
    },
    start: function () {
      if (this._status == CLOCK_STATUS_IDLE) {
        this._status = CLOCK_STATUS_STARTED;
      }
      return false;
    },
    restart: function () {
      return this.reset().start();
    },
    reset: function () {
      this._status = CLOCK_STATUS_IDLE;
      this.d = 1;
      this.i = this.iteration;
      this._endTime = this._initTime = this._activeTime = this._startTime = this._holdTime = this._pausedTime = 0;
      return this;
    },
    pause: function () {
      if (this._status !== CLOCK_STATUS_PAUSED) {
        this._lastStatus = this._status;
        this._status = CLOCK_STATUS_PAUSED;
        emitWithCtrl(this, EVENT_PAUSE);
      }
    },
    resume: function () {
      if (this._status == CLOCK_STATUS_PAUSED) {
        this._status = this._lastStatus;
        emitWithCtrl(this, EVENT_RESUME);
      }
    },
    cancel: function () {
      if (this._status !== CLOCK_STATUS_CANCELED) {
        this._status = CLOCK_STATUS_CANCELED;
        this.finalize();
        if (this.controller)
          this.controller.cancel();
        this.emit(EVENT_CANCEL);
      }
    },
    finalize: function () {
      var task = this._task;
      if (task instanceof RenderTask)
        task.toFinalize(this);
      else
        this.emit(EVENT_FINALIZE);
    },
    update: function (state) {
      if (this.finished)
        this.finalize();
      else
        updateClock(this, state);
    }
  });
  function emitWithCtrl(clock, evtName, arg) {
    var ctrl = clock.controller;
    clock.emit(evtName, arg);
    if (ctrl && isFunc(ctrl.emit))ctrl.emit(evtName, arg);
  }

  function _updateClock(clock, state) {
    var timeline = state.timeline, now = timeline.now, ot;
    switch (clock._status) {
      case CLOCK_STATUS_STARTED:
        clock._initTime = now;
        emitWithCtrl(clock, EVENT_INIT, state);
        clock._status = CLOCK_STATUS_DELAYING;
        return _updateClock(clock, state) || true;
      case CLOCK_STATUS_DELAYING:
        if (now >= clock._initTime + clock.delay * timeline.ticksPerSecond) {
          clock._status = CLOCK_STATUS_ACTIVE;
          clock._activeTime = clock._startTime = now;
          emitWithCtrl(clock, EVENT_START, state);
          return _updateClock(clock, state) || true;
      }
        return false;
      case CLOCK_STATUS_ACTIVE:
        var dur = (now - clock._activeTime) / timeline.ticksPerSecond, t = clock.d ? dur / clock.duration : 1 - dur / clock.duration;
        ot = clock.t;
        if (ot === t) return false;
        if (t > 1)clock.t = 1;
        else if (t < 0)clock.t = 0;
        else clock.t = t;
        clock.value = clock.ease(clock.t);
        emitWithCtrl(clock, EVENT_UPDATE, state);
        if (!clock.silent)
          state.task.invalid();
        if (t > 1 || t < 0) {
          clock._status = CLOCK_STATUS_UNKNOWN;
          _updateClock(clock, state);
      }
        return true;
      case CLOCK_STATUS_UNKNOWN:
        ot = clock.t;
        if (ot >= 1) {
          if (clock.autoReverse) {
            clock.d = 0;
            reactiveClock(clock, now);
            emitWithCtrl(clock, EVENT_REVERSE, state);
          }
          else
            return iterateClock();
      }
        else if (clock.autoReverse)
          return iterateClock(clock.d = 1);
        else
          throw Error('impossible state t=0,autoReverse=false');
        return false;
      case CLOCK_STATUS_HOLDING:
        if (now >= clock._holdTime + clock.hold * timeline.ticksPerSecond) {
          clock._status = CLOCK_STATUS_ENDED;
          clock._endTime = now;
          clock.emit(EVENT_FINISH, state);
          clock.finalize(state.task);
          return true;
      }
        return false;
  }
    function iterateClock() {
      if (clock.i > 1 || clock.infinite) {
        clock.i--;
        reactiveClock(clock, now);
        emitWithCtrl(clock, EVENT_ITERATE, state);
    }
      else {
        clock.i = 0;
        clock._holdTime = now;
        clock._status = CLOCK_STATUS_HOLDING;
        emitWithCtrl(clock, EVENT_HOLD, state);
        return _updateClock(clock, state) || true;
    }
  }
  }

  function reactiveClock(clock, now) {
    clock._status = CLOCK_STATUS_ACTIVE;
    clock._activeTime = now;
  }

  function updateClock(c, state) {
    if (c) {
      state.clock = c;
      var ret = _updateClock(c, state);
      state.clock = null;
  }
    return ret;
  }

  Flip.EASE = Clock.EASE = (function () {
  /**
   * from jQuery.easing
   * @lends Clock.EASE
   * @lends Flip.EASE
   * @memberof Flip
   * @readonly
   * @public
   * @enum {function}
   * @property {function} linear
   * @property {function} zeroStep
   * @property {function} halfStep
   * @property {function} oneStep
   * @property {function} random
   * @property {function} randomLimit
   * @property {function} backOut
   * @property {function} backIn
   * @property {function} backInOut
   * @property {function} cubicOut
   * @property {function} cubicIn
   * @property {function} cubicInOut
   * @property {function} expoOut
   * @property {function} expoIn
   * @property {function} expoInOut
   * @property {function} circOut
   * @property {function} circIn
   * @property {function} circInOut
   * @property {function} sineOut
   * @property {function} sineIn
   * @property {function} sineInOut
   * @property {function} bounceOut
   * @property {function} bounceIn
   * @property {function} bounceInOut
   * @property {function} elasticOut
   * @property {function} elasticIn
   * @property {function} elasticInOut
   * @property {function} quintOut
   * @property {function} quintIn
   * @property {function} quintInOut
   * @property {function} quartOut
   * @property {function} quartIn
   * @property {function} quartInOut
   * @property {function} quadOut
   * @property {function} quadIn
   * @property {function} quadInOut
   */
  var F = {
    linear: function (t) {
      return t;
    },
    zeroStep: function (t) {
      return t <= 0 ? 0 : 1;
    },
    halfStep: function (t) {
      return t < .5 ? 0 : 1;
    },
    oneStep: function (t) {
      return t >= 1 ? 1 : 0;
    },
    random: function () {
      return Math.random();
    },
    randomLimit: function (t) {
      return Math.random() * t;
    }
  };
    var pow = Math.pow, PI = Math.PI;
    (function (obj) {
      objForEach(obj, function (func, name) {
        var easeIn = func;
        F[name + 'In'] = easeIn;
        F[name + 'Out'] = function (t) {
          return 1 - easeIn(1 - t);
        };
        F[name + 'InOut'] = function (t) {
          return t < 0.5 ? easeIn(t * 2) / 2 : 1 - easeIn(t * -2 + 2) / 2;
        };
      });
    })({
      back: function (t) {
        return t * t * ( 3 * t - 2 );
    },
      elastic: function (t) {
        return t === 0 || t === 1 ? t : -pow(2, 8 * (t - 1)) * Math.sin(( (t - 1) * 80 - 7.5 ) * PI / 15);
    },
      sine: function (t) {
        return 1 - Math.cos(t * PI / 2);
    },
      circ: function (t) {
        return 1 - Math.sqrt(1 - t * t);
    },
      cubic: function (t) {
        return t * t * t;
    },
      expo: function (t) {
        return t == 0 ? 0 : pow(2, 10 * (t - 1));
    },
      quad: function (t) {
        return t * t;
    },
      quart: function (t) {
        return pow(t, 4)
    },
      quint: function (t) {
        return pow(t, 5)
    },
      bounce: function (t) {
        var pow2, bounce = 4;
        while (t < ( ( pow2 = pow(2, --bounce) ) - 1 ) / 11);
        return 1 / pow(4, 3 - bounce) - 7.5625 * pow(( pow2 * 3 - 2 ) / 22 - t, 2);
    }
    });
    return Object.freeze(F);
  })();
  (function (Flip) {
    var slice = Array.prototype.slice;

    function $$(slt, ele) {
      return slice.apply((ele || document).querySelectorAll(slt));
    }

    function $(slt, ele) {
      return (ele || document).querySelector(slt)
    }

    Flip.$$ = $$;
    Flip.$ = $;
    Flip.ele = createElement;

    if (document.readyState !== 'loading') {
      setTimeout(ready, 0);
    }
    document.addEventListener('DOMContentLoaded', ready);
    function ready() {
      var funcs = FlipScope.readyFuncs;
      FlipScope.global.init();
      FlipScope.readyFuncs = null;
      funcs.forEach(function (callback) {
        callback(Flip);
      });
    }
  })(Flip);
  function createElement(tagNameOrOption) {
    var tagName = isObj(tagNameOrOption) ? tagNameOrOption.tagName : tagNameOrOption, options = makeOptions(tagNameOrOption, { attributes: {} }), ele = document.createElement(tagName);
    objForEach(options.attributes, function (val, name) {
      ele.setAttribute(name, val)
    });
    return ele;
  }

  function Mat3(arrayOrX1, y1, dx, x2, y2, dy) {
    if (!(this instanceof Mat3))return new Mat3(arrayOrX1, y1, dx, x2, y2, dy);
    var eles;
    if (arrayOrX1 == undefined)eles = [1, 0, 0, 0, 1, 0, 0, 0, 1];
    else if (y1 == undefined)eles = arrayOrX1;
    else eles = [arrayOrX1, y1, 0, x2, y2, dx, dy, 1];
    this.elements = new Float32Array(eles);
  }

  var sin = Math.sin, cos = Math.cos, tan = Math.tan, map2DArray = (function () {
    var seq = [0, 1, 3, 4, 6, 7];

    function getFloat(d) {
      return (+d).toFixed(5);
  }

    return function (eles) {
      return seq.map(function (i) {
        return getFloat(eles[i])
      })
    }
  })();
  Flip.Mat3 = Mat3;
  function defaultIfNaN(v, def) {
    var ret = +v;
    return isNaN(ret) ? def : ret;
  }

  /**
   * @alias Flip.Mat3.prototype
   */
  Mat3.prototype = {
  /**
   * print the matrix elements
   * @alias Flip.Mat3#print
   * @returns {string}
   */
  print: function () {
    var e = this.elements, ret = [];
    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 3; j++)
        ret.push(e[j + i * 3].toFixed(2));
      ret.push('\n')
    }
    return ret.join(' ');
  },
    reset: function (arr) {
      this.elements = new Float32Array(arr);
      return this;
    },
    /**
     * set element value
     * @param {number}col column index (from 0 to 2)
     * @param {number}row row index (from 0 to 2)
     * @param {number}value
     * @returns {Flip.Mat3} itself
     */
    set: function (col, row, value) {
      this.elements[col * 3 + row] = value;
      return this;
    },
    /**
     * matrix multiplication
     * @param {Flip.Mat3|Array} matOrArray
     * @returns {Flip.Mat3} itself
     */
    concat: function (matOrArray) {
      var other = matOrArray instanceof Mat3 ? matOrArray.elements : matOrArray;
      return multiplyMat(this, other);
    },
    /**
     *
     * @param {number} rotationX
     * @param {number} rotationY
     * @returns {Flip.Mat3} itself
     */
    axonProject: function (rotationX, rotationY) {
      rotationX = rotationX || 0;
      rotationY = rotationY || 0;
      var cosX = cos(rotationX), sinX = sin(rotationX), cosY = cos(rotationY), sinY = sin(rotationY);
      return multiplyMat(this, [cosY, sinX * sinY, 0, 0, cosX, 0, sinY, -cosY * sinX, 0], 1)
    },
    /**
     *
     * @param {number} rV
     * @param {number} rH
     * @returns {Flip.Mat3} itself
     */
    obliqueProject: function (rV, rH) {
      rH = rH || 0;
      rV = rV || 0;
      var s = 1 / tan(rV), sSin = sin(rH) * s, sCos = cos(rH) * s;
      return multiplyMat(this, [1, 0, 0, 0, 1, 0, sCos, sSin, 0], 1)
    },
    toString: function () {
      return 'matrix(' + map2DArray(this.elements).join(',') + ')'
    },
    /**
     * use matrix for canvas2d context
     * @param {CanvasRenderingContext2D} ctx
     * @returns {Flip.Mat3} itself
     */
    applyContext2D: function (ctx) {
      ctx.transform.apply(ctx, map2DArray(this.elements));
      return this
    },
    /**
     * construct a matrix with the same elements (deep clone)
     * @returns {Flip.Mat3}
     */
    clone: function () {
      return new Mat3(this.elements);
    },
    /**
     * @param {number} [x=1]
     * @param {number} [y=1]
     * @returns {Flip.Mat3} itself
     */
    scale: function (x, y) {
      return multiplyMat(this, [defaultIfNaN(x, 1), 0, 0, 0, defaultIfNaN(y, 1), 0, 0, 0, 1]);
    },
    /**
     *
     * @param {number} angle
     * @returns {Flip.Mat3} itself
     */
    skew: function (angle) {
      return multiplyMat(this, [1, tan(angle), 0, tan(angle || 0), 1, 0, 0, 0, 1])
    },
    transform: function (m11, m12, m21, m22, dx, dy) {
      return multiplyMat(this, [m11, m21, 0, m12, m22, 0, dx || 0, dy || 0, 1])
    },
    /**
     *
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     * @returns {Flip.Mat3} itself
     */
    translate: function (x, y, z) {
      return multiplyMat(this, [1, 0, 0, 0, 1, 0, x || 0, y || 0, defaultIfNaN(z, 1)])
    },
    /**
     *
     * @param {number} angle
     * @param {boolean}[horizontal]
     * @param {number} [ratio=1]
     * @returns {Flip.Mat3} itself
     */
    flip: function (angle, horizontal, ratio) {
      var sinA = sin(angle), cosA = cos(angle);
      ratio = ratio || .6;
      return multiplyMat(this, horizontal ? [1, 0, 0, -sinA * ratio, cosA, 0, 0, 0, 1] : [cosA, sinA * ratio, 0, 0, 1, 0, 0, 0, 1]);
    },
    /**
     *
     * @param {number} angle
     * @returns {Flip.Mat3} itself
     */
    rotate: function (angle) {
      return this.rotateZ(angle);
    },
    /**
     *
     * @param {number} angle
     * @returns {Flip.Mat3} itself
     */
    rotateX: function (angle) {
      var sina = sin(angle), cosa = cos(angle);
      return multiplyMat(this, [1, 0, 0, 0, cosa, sina, 0, -sina, cosa]);
    },
    /**
     *
     * @param {number} angle
     * @returns {Flip.Mat3} itself
     */
    rotateY: function (angle) {
      var sina = sin(angle), cosa = cos(angle);
      return multiplyMat(this, [cosa, 0, -sina, 0, 1, 0, sina, 0, cosa])
    },
    /**
     *
     * @param {number} angle
     * @returns {Flip.Mat3} itself
     */
    rotateZ: function (angle) {
      var sina = sin(angle), cosa = cos(angle);
      return multiplyMat(this, [cosa, sina, 0, -sina, cosa, 0, 0, 0, 1])
    }
  };
  function multiplyMat(mat, other, reverse) {
    var a = other, b = mat.elements, out = b;
    if (reverse) {
      b = other;
      a = out = mat.elements;
    }
    else {
      a = other;
      b = out = mat.elements;

    }
    var a00 = a[0], a01 = a[1], a02 = a[2],
      a10 = a[3], a11 = a[4], a12 = a[5],
      a20 = a[6], a21 = a[7], a22 = a[8],

      b00 = b[0], b01 = b[1], b02 = b[2],
      b10 = b[3], b11 = b[4], b12 = b[5],
      b20 = b[6], b21 = b[7], b22 = b[8];

    out[0] = a00 * b00 + a01 * b10 + a02 * b20;
    out[1] = a00 * b01 + a01 * b11 + a02 * b21;
    out[2] = a00 * b02 + a01 * b12 + a02 * b22;

    out[3] = a10 * b00 + a11 * b10 + a12 * b20;
    out[4] = a10 * b01 + a11 * b11 + a12 * b21;
    out[5] = a10 * b02 + a11 * b12 + a12 * b22;

    out[6] = a20 * b00 + a21 * b10 + a22 * b20;
    out[7] = a20 * b01 + a21 * b11 + a22 * b21;
    out[8] = a20 * b02 + a21 * b12 + a22 * b22;
    return mat;
  }

  /**
   * @tutorial use-matrix
   */
  (function (Flip) {
    var strictRet = true, syncEnqueue;

    function enqueue(callback) {
      syncEnqueue ? callback() : setTimeout(callback, 0);
    }

    function Thenable(opt) {
      if (!(this instanceof Thenable))return new Thenable(opt);
      this.then = opt.then;
      this.get = opt.get;
    }

    function castToPromise(value) {
      if (value instanceof Animation)return value.promise;
      if (value instanceof Array)return Promise.all(value.map(castToPromise));
      if (likePromise(value)) return value;
      if (!strictRet)return warpPromiseValue(value);
      throw Error('cannot cast to promise');
    }

    function resolvePromise(future) {
      if (likePromise(future))return future;
      return new Thenable({
        then: function resolved(callback) {
          try {
            return resolvePromise(castToPromise(acceptAnimation(callback(future))));
        }
          catch (ex) {
            return rejectPromise(ex);
        }
        },
        get: function (proName) {
          return proName ? future[proName] : future;
      }
      })
    }

    function rejectPromise(reason) {
      if (likePromise(reason))return reason;
      return new Thenable({
        then: function rejected(callback, errorback) {
          try {
            return resolvePromise(errorback(reason));
        }
          catch (ex) {
            return rejectPromise(ex);
        }
        },
        get: function (pro) {
          return pro ? reason[pro] : reason;
        }
      })
    }

    /**
     * @namespace Flip.Promise
     * @param {function|Flip.Animation|AnimationOptions} resolver
     * @returns {Thenable}
     * @constructor
     */
    function Promise(resolver) {
      if (!(this instanceof Promise))return new Promise(resolver);
      var resolvedPromise, pending = [], ahead = [], resolved;
      if (typeof resolver === "function")
        resolver(resolve, reject);
      else
        return acceptAnimation(resolver);
      function resolve(future) {
        try {
          receive(acceptAnimation(future));
      }
        catch (ex) {
          receive(undefined, ex);
        }
    }

      function reject(reason) {
        receive(undefined, reason || new Error(''));
      }

      function receive(future, reason) {
        if (!resolved) {
          resolvedPromise = reason == undefined ? resolvePromise(future) : rejectPromise(reason);
          resolved = true;
          for (var i = 0, len = pending.length; i < len; i++) {
            enqueue(function (args, con) {
              return function () {
                var ret = resolvedPromise.then.apply(resolvedPromise, args);
                if (con)ret.then.apply(ret, con);
              }
            }(pending[i], ahead[i]))
        }
          pending = ahead = undefined;
      }
    }

      function next(resolve, reject) {
        ahead.push([resolve, reject]);
    }

      return new Thenable({
        then: function (thenable, errorBack) {
          var handler = [ensureThenable(thenable, function (v) {
            return v
          }), ensureThenable(errorBack, function (e) {
            throw e
          })];
          if (resolvedPromise)
            return warpPromiseValue(resolvedPromise.then.apply(resolvedPromise, handler))
          else {
            pending.push(handler);
            return new Promise(function (resolve, reject) {
              next(resolve, reject);
            })
        }
        },
        get: function (proname) {
          return resolvedPromise ? resolvedPromise.get(proname) : undefined;
        }
      })
    }

    function ensureThenable(obj, def) {
      var t;
      if ((t = typeof obj) === "object")
        return function () {
          return obj;
        };
      else if (t === "function")return obj;
      return def;
    }

    function acceptAnimation(obj) {
      var t;
      if (strictRet) {
        if (obj instanceof Animation)return obj._finished ? obj : obj.promise;
        if ((t = typeof obj) == "object") {
          if (likePromise(obj))return obj;
          else if (obj instanceof Array)
            return obj.map(acceptAnimation);
          else {
            return Flip.animate(obj).promise;
        }
        }
        else if (typeof t === "function")
          return acceptAnimation(obj());
        throw Error('cannot cast to animation');
    }
      return obj;
    }

    function likePromise(obj) {
      return obj instanceof Thenable
    }

    function promiseAll(promises) {
      return new Promise(function (resolve, reject) {
        var fail, num, r = new Array(num = promises.length);
        if (!promises.length) {
          return resolve(r);
        }
        promises.forEach(function (promise, i) {
          promise.then(function (pre) {
            check(pre, i);
          }, function (err) {
            check(err, i, true);
          })
      });
        function check(value, i, error) {
          if (!error) {
            try {
              r[i] = value instanceof Animation ? value : acceptAnimation(value);
            }
            catch (ex) {
              error = ex;
            }
          }
          if (error) {
            fail = true;
            r[i] = error;
          }
          if (num == 1)fail ? reject(r) : resolve(r);
          else num--;
      }
      })
  }

    /**
     * continue when all promises finished
     * @memberof Flip.Promise
     * @param {Array<Flip.Promise|AnimationOptions|function>}
     * @returns Flip.Promise
     */
    Promise.all = promiseAll;
    /**
     * @memberof Flip.Promise
     * @returns {{resolve:function,reject:function,promise:Flip.Promise}}
     */
    Promise.defer = function () {
      var defer = {};
      defer.promise = Promise(function (resolver, rejector) {
        defer.resolve = resolver;
        defer.reject = rejector;
    });
      return defer;
    };
    Promise.resolve = function (any) {
      return (any && isFunc(any.then)) ? digestThenable(any) : warpPromiseValue(any);
    };
    Promise.reject = function (reason) {
      return Promise(function (resolve, reject) {
        reject(reason);
      })
    };
    Promise.digest = digestThenable;
    Promise.option = function (opt) {
      if (!opt)return;
      strictRet = !!opt.acceptAnimationOnly;
      syncEnqueue = !!opt.sync;
    };
    FlipScope.Promise = Flip.Promise = Promise;
    function digestThenable(thenable) {
      return Promise(function (resolve, reject) {
        thenable.then(resolve, reject);
      })
  }

    function warpPromiseValue(any) {
      return Promise(function (resolve) {
        resolve(any);
      })
    }
  })(Flip);
  function loopGlobal(global) {
    var state = global.createRenderState();
    global.emit(EVENT_FRAME_START, [state]);
    updateGlobal(global, state);
    renderGlobal(global, state);
    global.emit(EVENT_FRAME_END, [state]);
  }

  function updateGlobal(global, state) {
    state.global.emit(EVENT_UPDATE, [state, global]);
    objForEach(global._tasks, function (task) {
      updateTask(task, state)
    });
  }

  function updateTask(task, state) {
    if (!task.disabled) {
      var components = task._updateObjs;
      state.task = task;
      (state.timeline = task.timeline).move();
      task.update(state);
      task.emit(EVENT_UPDATE, state);
      task._updateObjs = arrForEachThenFilter(components, updateComponent, isObj);
      state.task = null;
    }
    function updateComponent(item, index) {
      if (!isObj(item)) {
        components[index] = undefined;
      } else if (!item.disabled) {
        if (isFunc(item.update)) {
          item.update(state);
        } else if (isFunc(item.emit)) {
          item.emit(EVENT_UPDATE, state);
      }
    }
  }
  }

  function resetStyleElement(styleElement) {
    var styleSheet = styleElement.sheet;
    for (var i = styleSheet.cssRules.length; i > 0; i--) {
      styleSheet.deleteRule(i - 1)
    }
    /* var replaceNode=styleElement.cloneNode(false);
     styleElement.parentNode.replaceChild(replaceNode,styleElement);
     return replaceNode;*/
    return styleElement;
  }

  function renderGlobal(global, state) {
    if (global._invalid || state.forceRender) {
      objForEach(global._tasks, function (task) {
        renderTask(task, state);
      });
      var styleSheet = resetStyleElement(global._styleElement).sheet;
      state.styleStack.forEach(function (style, i) {
        addSafeStyle(style.selector, style.rules.join(';'), i);
      });
      var cssProxy = new CssProxy(), index = styleSheet.cssRules.length;
      objForEach(state.transformMap, function (mat, selector) {
        if (selector) {
          cssProxy.$withPrefix('transform', mat + '');
          addSafeStyle(selector, cssProxy.$toSafeCssString(), index++);
        }
      });
      global._invalid = false;
    }
    objForEach(global._tasks, function (task) {
      finalizeTask(task, state)
    });
    global._forceRender = false;
    function addSafeStyle(selector, style, index) {
      //empty style or selector will throw error in some browser.
      if (style && selector) {
        styleSheet.insertRule(combineStyleText(selector, style), index);
    }
  }
  }

  function renderTask(task, state) {
    if (!task.disabled) {
      state.task = task;
      if (task._invalid || state.forceRender) {
        task.emit(EVENT_RENDER_START, state);
        task._updateObjs.forEach(function (item) {
          if (isFunc(item.render) && !item.disabled) {
            item.render(state);
        }
      });
        task._invalid = false;
    }
      task.emit(EVENT_RENDER_END, state);
      state.task = null;
    }
  }

  function finalizeTask(task, state) {
    var taskItems = (state.task = task)._updateObjs, index, finItems = task._finalizeObjs;
    task._finalizeObjs = [];
    if (finItems.length) {
      task.invalid();
      finItems.forEach(function (item) {
        if ((index = taskItems.indexOf(item)) != -1) {
          taskItems[index] = null;
        }
        if (item._task == task) {
          item._task = null;
        }
        isObj(item) && isFunc(item.finalize) && item.finalize(state);
    });
    }
  }

  function updateAnimation(animation, renderState) {
    var clock = animation.clock;
    renderState.animation = animation;
    if (updateClock(clock, renderState)) {
      animation.invalid();
      updateAnimationParam(animation);
      animation.emit(EVENT_UPDATE, renderState);
    }
    if (clock.finished) {
      //trigger finished event after render
      animation._finished = true;
      finalizeAnimation(animation, renderState);
    }
    renderState.animatetion = null;
    return true;
  }

  function finalizeAnimation(animation) {
    var fillMode = animation.fillMode;
    if (animation.fillMode !== FILL_MODE.KEEP) {
      animation.finalize();
      if (fillMode === FILL_MODE.SNAPSHOT) {
        animation.cancelStyle = FlipScope.global.immediate(animation.lastStyleText());
      }
    }
  }

  function renderAnimation(ani, state) {
    var styleStack = state.styleStack;
    state.animation = ani;
    styleStack.push.apply(styleStack, renderAnimationCssProxies(ani));
    renderAnimationTransform(ani, state.transformMap);
    ani.emit(EVENT_RENDER, state);
    if (ani._finished) {
      ani.emit(EVENT_FINISH, state);
    }
    state.animation = null;
  }

  function updateAnimationParam(animation) {
    var p = animation.percent, cur = animation.current = objAssign({}, animation._immutable);
    objForEach(animation._variable, function (value, key) {
      cur[key] = isFunc(value) ? value(p, cur) : (isNaN(value) ? value : p * value);
    });
  }

  function renderAnimationCssProxies(animation, noUpdate) {
    var param = animation.current, results = [], animationSelector = animation.selector;
    objForEach(animation._cssHandlerMap, function (cbs, selector) {
      var globalSelector = selector.replace(/&/g, animationSelector),
        rules = [];
      cbs.forEach(function (handler) {
        var cssText = resolveCss(handler.cb, handler.proxy, animation, param, noUpdate).$toCachedCssString();
        if (cssText) {
          rules.push(cssText)
      }
      });
      if (globalSelector && rules.length) {
        results.push({ selector: globalSelector, rules: rules })
    }
    });
    return results;
  }

  function renderAnimationTransform(animation, matCache) {
    var animationSelector = animation.selector, param = animation.current;
    objForEach(animation._matHandlerMap, function (cbs, selector) {
      var globalSelector = selector.replace(/&/g, animationSelector),
        mat = getMat3BySelector(matCache, globalSelector);
      cbs.forEach(function (callback) {
        mat = callback.call(animation, mat, param) || mat;
        if (!(mat instanceof Mat3)) {
          throw Error('Transform function should return an instance of Flip.Mat3');
        }
      });
      globalSelector && (matCache[globalSelector] = mat);
    });
  }

  function getMat3BySelector(map, selector) {
    var mat = map[selector];
    if (!mat) {
      mat = new Mat3();
      if (selector) {
        map[selector] = mat;
      }
  }
    return mat;
  }

  function resolveCss(callbackOrRuleObj, cssProxy, thisObj, e, noUpdate) {
    if (!noUpdate) {
      if (isObj(callbackOrRuleObj)) {
        cssProxy.$merge(callbackOrRuleObj);
      } else if (isFunc(callbackOrRuleObj)) {
        callbackOrRuleObj.apply(thisObj || cssProxy, [cssProxy, e]);
      } else if (isStr(callbackOrRuleObj)) {
        parseCssText(callbackOrRuleObj, cssProxy);
      }
    }
    return cssProxy;
  }

  Flip.RenderGlobal = RenderGlobal;
  function RenderGlobal(opt) {
    if (!(this instanceof RenderGlobal))return new RenderGlobal(opt);
    opt = makeOptions(opt, { defaultTaskName: 'default' });
    this._tasks = {};
    this._defaultTaskName = opt.defaultTaskName;
    this._invalid = true;
    this._persistIndies = [];
    this._persistElement = createElement({ tagName: 'style', attributes: { 'data-flip': 'persist' } });
    this._styleElement = createElement({ tagName: 'style', attributes: { 'data-flip': 'frame' } });
  }

  inherit(RenderGlobal, Flip.util.Object, {
    get defaultTask() {
      var taskName = this._defaultTaskName, t = this._tasks[taskName];
      if (!t)this.add(t = new RenderTask(taskName));
      return t;
    },
    getTask: function (name, createIfNot) {
      if (!name)return this.defaultTask;
      var r = this._tasks[name];
      if (!r && createIfNot) {
        r = new RenderTask(name);
        this.add(r)
      }
      return r;
    },
    add: function (obj) {
      var task, taskName, tasks;
      if (obj instanceof RenderTask) {
        if (!(taskName = obj.name))
          throw Error('task must has a name');
        else if ((tasks = this._tasks).hasOwnProperty(taskName))
          throw Error('contains same name task');
        else if (tasks[taskName] = obj) {
          obj._global = this;
          obj.timeline.start();
          return this.invalid();
        }
      }
      else if (isObj(obj))
        return this.defaultTask.add(obj);
      return false;
    },
    immediate: function () {
      var styleSheet = this._persistElement.sheet,
        reusableIndies = this._persistIndies,
        insertedIndices = [],
        styles = arguments[0] instanceof Array ? arguments[0] : Array.prototype.slice.apply(arguments);
      styles.forEach(function (style) {
        var currentIndex;
        if (reusableIndies.length) {
          currentIndex = reusableIndies.pop();
          styleSheet.deleteRule(currentIndex);
        }
        else {
          currentIndex = styleSheet.cssRules.length;
        }
        styleSheet.insertRule(style, currentIndex);
        insertedIndices.push(currentIndex);
      });
      return cancel;
      function cancel() {
        if (styleSheet) {
          insertedIndices.forEach(function (currentIndex) {
            styleSheet.deleteRule(currentIndex);
            styleSheet.insertRule('*{}', currentIndex);
            reusableIndies.push(currentIndex);
        });
          return !(styleSheet = null);
      }
    }
    },
    refresh: function () {
      this._foreceRender = true;
    },
    init: function () {
      if (typeof window === "object") {
        var head = document.head;
        if (!this._styleElement.parentNode) {
          head.appendChild(this._styleElement);
          head.appendChild(this._persistElement);
        }
        Flip.fallback(window);
        //window.addEventListener('resize',function(){self.refresh()});
        this.loop();
      }
      this.init = function () {
        console.warn('The settings have been initiated,do not init twice');
      };
    },
    invalid: function () {
      return this._invalid = true;
    },
    loop: function (element) {
      loopGlobal(this);
      window.requestAnimationFrame(this.loop.bind(this), element || window.document.body);
    },
    createRenderState: function () {
      return {
        global: this,
        task: null,
        styleStack: [],
        forceRender: this._foreceRender,
        transformMap: {}
      }
    },
    css: function (selector, rule) {
      return setDefaultImmediateStyle(this, 'css', selector, rule)
    },
    transform: function (selector, rule) {
      return setDefaultImmediateStyle(this, 'transform', selector, rule)
  }
  });
  FlipScope.global = new RenderGlobal();
  function setDefaultImmediateStyle(renderGlobal, property, selector, rule) {
    var _cancel, ani = { _cssHandlerMap: {}, _matHandlerMap: {}, selector: isStr(selector) ? selector : '' };
    Animation.prototype[property].apply(ani, [selector, rule]);
    Flip(function () {
      var styles;
      if (property == 'css') {
        styles = renderAnimationCssProxies(ani).map(combineStyleText);
    }
      else if (property == 'transform') {
        var cache = {};
        styles = [];
        renderAnimationTransform(ani, cache);
        objForEach(cache, function (mat, selector) {
          var cssProxy = new CssProxy();
          cssProxy.$withPrefix('transform', mat + '');
          styles.push(cssProxy.$styleText(selector))
        })
      }
      else {
        throw Error('invalid property:' + property);
      }
      _cancel = renderGlobal.immediate.apply(renderGlobal, styles);
    });
    return cancel;
    function cancel() {
      if (_cancel) {
        ani = null;
        return _cancel();
      }
  }
  }

  function TimeLine(task) {
    this.last = this.now = this._stopTime = 0;
    this._startTime = this._lastStop = Date.now();
    this.task = task;
    this._isStop = true;
  }

  inherit(TimeLine, Flip.util.Object, {
    ticksPerSecond: 1000,
    stop: function () {
      if (!this._isStop) {
        this._isStop = true;
        this._lastStop = Date.now();
    }
    },
    start: function () {
      if (this._isStop) {
        this._isStop = false;
        this._stopTime += Date.now() - this._lastStop;
    }
    },
    move: function () {
      if (!this._isStop) {
        this.last = this.now;
        this.now = Date.now() - this._startTime - this._stopTime;
      }
  }
  });
  var nextUid = (function () {
    var mapSeed = {};
    return function (type) {
      if (!mapSeed.hasOwnProperty(type)) {
        mapSeed[type] = 1;
    }
      return mapSeed[type]++;
  }
  })();
  Flip.GL = {
    Scene: GLScene,
    Task: GLRenderTask,
    Vector: GLVec,
    Render: GLRender,
    Geometry: GLGeometry,
    Uniform: GLUniform,
    DynamicUniform: GLDynamicUniform,
    Attribute: GLAttribute,
    Binder: GLBinder,
    Sampler2D: GLSampler2D,
    SamplerCube: GLSamplerCube,
    Buffer: GLBuffer,
    Matrix4: Matrix4,
    Camera: GLCamera,
    FrameBuffer: GLFrameBuffer,
    Texture: GLTexture,
    RenderBuffer: GLRenderBuffer
  };
  (function (WebGLRenderingContext) {
    //Fix safari bug
    var proto = WebGLRenderingContext.prototype;
    for (var key in proto) {
      if (/^[A-Z0-9_]+$/.test(key) && !WebGLRenderingContext.hasOwnProperty(key)) {
        WebGLRenderingContext[key] = proto[key];
    }
  }
  })(window.WebGLRenderingContext);

  function GLRender(opt) {
    if (!(this instanceof GLRender))return new GLRender(opt);
    opt = opt || {};
    this.binder = {};
    this._children = [];
    this._disabled = false;
    this._parent = null;
    this.addBinder(opt.binder)
  }

  inherit(GLRender, Render.prototype, {
    get disabled() {
      return this._disabled
    },
    get parent() {
      return this._parent
    },
    set disabled(v) {
      if (this._disabled != v) {
        this._disabled = v;
        this.invalid();
      }
    },
    findChild: function (filter, deep) {
      var result;
      this._children.some(function (child) {
        if (filter(child)) {
          result = child;
      }
        else if (deep && isFunc(child.findChild)) {
          result = child.findChild(filter, deep);
        }
        return result;
    });
      return result;
    },
    update: function (state) {
      if (!this._disabled) {
        state.glRender = this;
        correlateBinder(this, state);
        this._children.forEach(function (c) {
            c.update(state)
        }
        );
      }
    },
    add: function () {
      for (var i = 0, arg = arguments[0]; arg; arg = arguments[++i]) {
        if (arg instanceof GLRender) {
          if (arrAdd(this._children, arg))
            arg._parent = this;
        }
        else {
          this.addBinder(arg);
        }
      }
      this.invalid();
      return this;
    },
    addBinder: function (nameOrBinder, func) {
      if (nameOrBinder) {
        this._invalidBinder = true;
        addBinder(this.binder, nameOrBinder, func);
      }
      return this
    },
    render: function (state) {
      if (!this._disabled) {
        useBinder(this.binder, state);
        this._children.forEach(function (c) {
          c.render(state)
      });
      }
    },
    dispose: function (gl) {
      disposeBinder(this.binder, gl);
      this._children.forEach(function (c) {
        if (isFunc(c.dispose)) {
          c.dispose(gl);
      }
      })
    }
  });
  function GLBinder(opt) {
    if (!(this instanceof GLBinder)) {
      return new GLBinder(opt);
    }
    this.name = opt.name || nextUid(this.constructor.name || 'GLBinder');
    if (isFunc(opt.bind)) {
      this.bind = opt.bind;
    }
    this.invalid();
  }

  GLBinder.prototype = {
    bind: noop,
    invalid: function () {
      var render = this._controller;
      if (render) {
        render.invalid();
    }
      this._invalid = true;
    },
    dispose: function () {
      this._controller = null;
  }
  };

  function GLUniform(opt) {
    if (!(this instanceof GLUniform)) {
      return new GLUniform(opt);
    }
    this.name = opt.name;
    this.type = opt.type;
    this.value = opt.value;
  }

  inherit(GLUniform, GLBinder.prototype, {
    get value() {
      return this._val;
    },
    set value(v) {
      this.invalid();
      this._val = convertUniformValueByType(v, this.type);
    },
    bind: function (gl, state) {
      var entry = state.glSecne.uniforms[this.name];
      if (entry) {
        entry.use(gl, this._val, this._invalid);
        this._invalid = false;
    }
  }
  });
  function GLDynamicUniform(opt) {
    if (!(this instanceof GLDynamicUniform)) {
      return new GLDynamicUniform(opt)
    }
    this.name = opt.name;
    this.type = opt.type;
    if (isFunc(opt.getValue)) {
      this.getValue = opt.getValue;
    }
  }

  inherit(GLDynamicUniform, GLUniform.prototype, {
    get value() {
      return this.getValue()
    },
    getValue: function () {
      throw Error('no value provided for:' + this.name);
    },
    bind: function (gl, state) {
      var entry = state.glSecne.uniforms[this.name];
      if (entry) {
        entry.use(gl, convertUniformValueByType(this.getValue(), this.type));
    }
  }

  });

  function UniformEntry(type, location, name) {
    this._loc = location;
    this.name = name;
    this.type = type;
    this._lastValue = void 0;
  }

  UniformEntry.prototype = {
    use: function (gl, value, force) {
      var type = this.type;
      if (this.maybeInvalid(value, type) || force) {
        uniformEntrySetter[type](gl, value, this._loc);
        if (/(mat|vec)(2|3|4)/.test(type)) {
          this._lastValue = new Float32Array(value.elements);
      }
        else {
          this._lastValue = value;
      }
      }
    },
    maybeInvalid: function (val, type) {
      var last = this._lastValue;
      if (last) {
        if (/(mat|vec)(2|3|4)/.test(type)) {
          if (isObj(val) && val.elements) {
            var currentElements = last;
            for (var i = 0, len = currentElements.length; i < len; i++) {
              if (currentElements[i] !== val.elements[i]) {
                return true
              }
            }
            return false;
        }
      }
        else if (/float|int/.test(type)) {
          return val !== last;
      }
      }
      return true;
    }
    ,
    convert: function (value) {
      var type = this.type, name = this.name;
      if (type === 'sampler2D') {
        var options;
        if (isCanvasLike(value) || isImageLike(value) || !value) {
          options = { name: name, source: value }
      }
        else if (isObj(value)) {
          options = objAssign(value, { name: name })
      }
        return new GLSampler2D(options)
    }
      else if (type === 'samplerCube') {
        throw Error('not support type:' + type);
      }
      else {
        if (isFunc(value)) {
          return new GLDynamicUniform({ name: name, type: type, getValue: value });
      }
        return new GLUniform({ name: name, value: value, type: type });
    }
  }
  };
  function convertUniformValueByType(value, type) {
    if (/vec(2|3|4)/.test(type)) {
      return convertToVec(value, +RegExp.$1);
  }
    else if (/mat(2|3|4)/.test(type)) {
      var dim = +RegExp.$1;
      return convertMat(value, dim * dim);
    }
    else if (type == 'int') {
      return parseInt(value)
    }
    else if (type == 'float') {
      return +value;
    }
    return value;
  }

  function convertToVec(vec, num) {
    if (vec instanceof GLVec) {
      return vec.clone();
    } else if (vec instanceof Array) {
      return new GLVec(vec.slice(0, num));
    } else if (vec instanceof Float32Array) {
      return new GLVec(vec.subarray(0, num));
    }
    throw Error('cannot convert to vec' + num);
  }

  var uniformEntrySetter = UniformEntry.setter = {
    vec4: function (gl, vec, loc) {
      gl.uniform4fv(loc, vec.elements);
    },
    vec3: function (gl, vec, loc) {
      gl.uniform3fv(loc, vec.elements);
    },
    vec2: function (gl, vec, loc) {
      gl.uniform2fv(loc, vec.elements);
    },
    mat4: function (gl, mat, loc) {
      gl.uniformMatrix4fv(loc, false, mat.elements);
    },
    mat3: function (gl, mat, loc) {
      gl.uniformMatrix3fv(loc, false, mat.elements);
    },
    mat2: function (gl, mat, loc) {
      gl.uniformMatrix2fv(loc, false, mat.elements);
    },
    float: function (gl, f, loc) {
      gl.uniform1f(loc, f);
    },
    sampler2D: function (gl, index, loc) {
      gl.uniform1i(loc, index);
    },
    samplerCube: function (gl, index, loc) {
      gl.uniform1i(loc, index);
    },
    int: function (gl, i, loc) {
      gl.uniform1i(loc, i);
    }
  };

  function convertMat(mat, elementCount) {
    var elements;
    if (mat instanceof Float32Array) {
      elements = new Float32Array(mat);
    }
    else if (mat instanceof Array) {
      elements = new Float32Array(elementCount);
      for (var i = 0; i < elementCount; i++) {
        elements[i] = mat[i];
      }
    }
    else if (mat.elements) {
      return convertMat(mat.elements, elementCount)
    }
    else {
      throw Error('not support');
    }
    return { elements: elements }
  }

  function GLAttribute(name, bufferOrData, stride, offset) {
    this.name = name;
    this._stride = stride || 0;
    this._offset = offset || 0;
    this.buffer = bufferOrData;
    this._invalid = true;
  }

  inherit(GLAttribute, GLBinder.prototype, {
      set buffer(v) {
        var ob = this._buffer;
        if (ob instanceof GLBuffer) {
          ob.release(this);
      }
        if (v instanceof GLBuffer) {
          this._buffer = v;
      }
        else if (v && v.buffer instanceof ArrayBuffer) {
          this._buffer = new GLBuffer(v);
      }
        else {
          throw Error('expect attribute data to be a TypedArray or GLBuffer');
      }
        this._buffer.ref(this);
    },
      get buffer() {
        return this._buffer;
    },
      get data() {
        var b = this.buffer;
        return b ? b.data : null
    },
      set data(v) {
        if (v instanceof GLBuffer) {
          this.buffer = v;
        }
        else if (v.buffer instanceof ArrayBuffer) {
          var b = this.buffer;
          if (b) {
            b.data = v;
            b.invalid();
        }
        else {
            this.buffer = new GLBuffer(v)
        }
      }
        else {
          throw Error();
        }
      this.invalid();
    },
      bind: function (gl, state) {
        var entry = state.glParam[this.name];
        this.buffer.bind(gl);
        gl.enableVertexAttribArray(entry._loc);
        gl.vertexAttribPointer(entry._loc, entry._size, gl.FLOAT, false, this._stride, this._offset);
    },
    invalid: function () {
      this.buffer.invalid();
    },
      dispose: function (gl) {
        this.buffer.release(this);
        this.buffer.finalize(gl);
    }
  }
  );
  function AttributeEntry(type, loc, name) {
    var t;
    switch (type) {
      case 'vec2':
        t = 2;
        break;
      case 'vec3':
        t = 3;
        break;
      case 'vec4':
        t = 4;
        break;
      case 'float':
        t = 1;
        break;
    }
    this._size = t;
    this._loc = loc;
    this.name = name;
  }

  AttributeEntry.prototype = {
    convert: function (array) {
      return new GLAttribute(this.name, array)
    }
  };
  function GLBuffer(data, isElementBuffer, usage) {
    this._type = typeof isElementBuffer == 'number' ? isElementBuffer :
      (isElementBuffer ? WebGLRenderingContext.ELEMENT_ARRAY_BUFFER : WebGLRenderingContext.ARRAY_BUFFER);
    if (data) {
      this.data = data;
    }
    this._refs = [];
    this._glHandle = null;
    this.usage = usage || WebGLRenderingContext.STATIC_DRAW;
    this._buffered = false;
  }

  GLBuffer.prototype = {
    getGlHandle: function (gl) {
      return this._glHandle || (this._glHandle = gl.createBuffer())
    },
    ref: function (obj) {
      arrAdd(this._refs, obj);
    },
    release: function (obj) {
      arrRemove(this._refs, obj)
    },
    invalid: function () {
      this._buffered = false;
    },
    finalize: function (gl) {
      if (this._refs.length == 0) {
        var handle = this._glHandle;
        if (handle) {
          gl.deleteBuffer(handle);
      }
        this._data = null;
    }
    },
    get data() {
      return this._data;
    },
    set data(val) {
      if (!val || val === this._data) {
        return;
    }
      if (WebGLRenderingContext.ARRAY_BUFFER === this._type) {
        this._data = val instanceof Float32Array ? val : new Float32Array(val);
      } else {
        this._data = val instanceof Int16Array ? val : new Int16Array(val);
    }
      this._buffered = false;
      this.length = val.length;
    },
    bufferData: function (gl) {
      if (!this._buffered) {
        gl.bufferData(this._type, this._data, this.usage);
        this._buffered = true;
        return true;
    }
      return false;
    },
    bind: function (gl) {
      var handle = this.getGlHandle(gl);
      gl.bindBuffer(this._type, handle);
      if (!this._buffered) {
        gl.bufferData(this._type, this._data, this.usage);
        this._buffered = true;
      }
    },
    dispose: function (gl) {
      if (this._glHandle) {
        if (this._refs.length) {
          console.warn('the buffer is being used when disposed');
        }
        gl.deleteBuffer(this._glHandle);
        this._glHandle = null;
      }
  }
  };
  function GLCamera(opt) {
    if (!(this instanceof GLCamera)) {
      return new GLCamera(opt)
    }
    opt = opt || {};
    GLBinder.call(this, { name: opt.name || 'camera' });
    this.viewMatrixUniformName = opt.viewMatrixUniformName;
    this.projectionMatrixUniformName = opt.projectionMatrixUniformName;
    this.viewProjectionMatrixUniformName = opt.viewProjectionMatrixUniformName;
    this.lookAt = opt.lookAt || [0, 0, 0];
    this.position = opt.position || [0, 0, 2];
    this.up = opt.up || [0, 1, 0];
    this.perspective = opt.perspective || [Math.PI / 6, 1, 1, 3];
  }

  (function () {
    inherit(GLCamera, GLBinder.prototype, {
      bind: function (gl, state) {
        if (this._invalid) {
          var vpEntry = state.glSecne.uniforms[this.viewProjectionMatrixUniformName];
          if (vpEntry) {
            vpEntry.use(gl, this.viewProjectionMatrix);
            this._invalid = false;
          }
          else {
            var vEntry = state.glSecne.uniforms[this.viewMatrixUniformName],
              pEntry = state.glSecne.uniforms[this.projectionMatrixUniformName];
            if (vEntry && pEntry) {
              vEntry.use(gl, this.viewMatrix);
              pEntry.use(gl, this.projectionMatrix);
              this._invalid = false;
            }
          }
        }
    },
      get viewMatrix() {
        var mat = this._viewMatrix;
        if (!mat) {
          mat = replaceNaNByIdentityMatrix(Matrix4.fromLookAt(
            this.position,
            this.lookAt,
            this.up
          ));
          this._viewMatrix = mat;
          this._vpMatrix = null;
        }
        return mat;
    },
      get projectionMatrix() {
        var mat = this._projectionMatrix;
        if (!mat) {
          mat = replaceNaNByIdentityMatrix(Matrix4.fromPerspective(this._fovy, this._aspect, this._zNear, this._zFar));
          this._projectionMatrix = mat;
          this._vpMatrix = null;
        }
        return mat;
    },
      get viewProjectionMatrix() {
        var mat = this._vpMatrix;
        if (!mat) {
          mat = this._vpMatrix = this.projectionMatrix.concat(this.viewMatrix)
        }
        return mat;
    },
      set position(vec) {
        this.posX = vec[0];
        this.posY = vec[1];
        this.posZ = vec[2];
    },
      get position() {
        return [this._posX, this._posY, this._posZ];
    },
      set lookAt(vec) {
        this.targetX = vec[0];
        this.targetY = vec[1];
        this.targetZ = vec[2];
    },
      get lookAt() {
        return [this._targetX, this._targetY, this._targetZ];
    },
      get up() {
        return [this._upX, this._upY, this._upZ]
    },
      set up(vec) {
        this.upX = vec[0];
        this.upY = vec[1];
        this.upZ = vec[2];
    },
      set perspective(val) {
        if (val instanceof Array) {
          this.setPerspective.apply(this, val);
        }
        else if (isObj(val)) {
          this.setPerspective(val.fovy, val.aspect, val.zNear || val.near, val.zFar || val.far);
        }
    },
      get perspective() {
        return [this._fovy, this._aspect, this._zNear, this._zFar];
    },
      get lookDirection() {
        return [this._targetX - this._posX, this._targetY - this._posY, this._targetZ - this._posZ];
    },
      setPerspective: function (fovy, aspect, near, far) {
        this.fovy = fovy;
        this.aspect = aspect;
        this.zNear = near;
        this.zFar = far;
        return this;
    },
      resetMatrix: function () {
        this._projectionMatrix = null;
        this._viewMatrix = null;
        this._vpMatrix = null;
    },
      config: function (cfg) {
        var self = this;
        objForEach(cfg, function (val, name) {
          if (numberProperties.indexOf(name) > -1) {
            self[name] = val;
          }
        });
        return self;
    }
    });
    var numberProperties = [
      'zNear', 'zFar', 'fovy', 'aspect',
      'targetX', 'targetY', 'targetZ',
      'posX', 'posY', 'posZ',
      'upX', 'upY', 'upZ'
    ];
    numberProperties.forEach(function (name) {
      defNumberProperty(GLCamera.prototype, name)
    });
    function replaceNaNByIdentityMatrix(mat) {
      for (var elements = mat.elements, i = 0, len = elements.length; i < len; i++) {
        if (isNaN(elements[i])) {
          return new Matrix4();
      }
    }
      return mat;
  }

    function defNumberProperty(obj, name) {
      var privateName = '_' + name;
      Object.defineProperty(obj, name, {
        get: function () {
          return this[privateName]
      },
        set: function (val) {
          if (isNaN(val)) {
            throw Error('property ' + name + ' value should be number');
        }
          if (val != this[privateName]) {
            this[privateName] = +val;
            this.resetMatrix();
            this.invalid();
        }
      }
      })
  }
  }());

  function GLFrameBuffer(opt) {
    opt = opt || {};
    if (!(this instanceof GLFrameBuffer)) {
      return new GLFrameBuffer(opt)
    }
    GLBinder.call(this, { name: opt.name });
    this._w = opt.width || 0;
    this._h = opt.height || 0;
    this._depthBuffer = opt.useDepthBuffer ? new GLRenderBuffer() : null;
    this._texture = new GLTexture(false, opt.textureDataFormat);
    this._index = null;
    this._fbo = null;
    this._textureIndex = -1;
    this._buffered = false;
    this.shouldCheckComplete = true;
    this.shouldClearTexture = true;
    this.textureParam = makeOptions(opt.textureParam, {
      TEXTURE_MAG_FILTER: 'LINEAR',
      TEXTURE_MIN_FILTER: 'LINEAR',
      TEXTURE_WRAP_S: 'CLAMP_TO_EDGE',
      TEXTURE_WRAP_T: 'CLAMP_TO_EDGE'
    });
  }

  inherit(GLFrameBuffer, GLBinder.prototype, {
    get glObj() {
      return this._fbo;
    },
    get depthBuffer() {
      return this._depthBuffer;
    },
    get texture() {
      return this._texture;
    },
    get textureIndex() {
      return this._textureIndex;
    },
    set texture(tex) {
      if (tex !== this.texture) {
        this._texture = tex;
      this._buffered = false;
      }
    },
    createSampler2DBinder: function (name, keepBindingRenderbuffer) {
      var framebuffer = this;
      return new GLBinder({
        name: name,
        bind: function (gl, state) {
          var entry = state.glParam[name];
          if (!entry) {
            throw Error('no sampler2D with name:' + name + ' in this program')
        }
          if (!keepBindingRenderbuffer) {
            framebuffer.unbind(gl);
          }
          framebuffer.bindUniformEntry(gl, entry);
      }
      })
    },
    dispose: function (gl) {
      var db = this.depthBuffer;
      if (db) {
        db.dispose(gl);
      }
      this.texture.dispose(gl);
      if (this._fbo) {
        gl.deleteFramebuffer(this._fbo);
        this._fbo = null;
      }
    },
    bindUniformEntry: function (gl, entry) {
      var textureIndex = this.textureIndex;
      this.texture.activeIndex(gl, textureIndex);
      entry.use(gl, textureIndex);
    },
    bind: function (gl) {
      if (!this.bufferData(gl)) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._fbo);
      }
    },
    unbind: function (gl) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    },
    bindTexture: function (gl, texture) {
      if ((texture instanceof GLTexture)) {
        texture.activeIndex(gl, this.textureIndex);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture.glObj, 0);
      }
      else {
        throw Error('invalid texture');
      }
    },
    bindDepthBuffer: function (gl, depthBuffer, width, height) {
      if (depthBuffer instanceof GLRenderBuffer) {
        depthBuffer.bind(gl);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer.glObj);
      }
    },
    bufferData: function (gl) {
      if (!this._buffered) {
        var w = this._w || gl.drawingBufferWidth,
          h = this._h || gl.drawingBufferHeight,
          texture = this.texture;
        if (!this._fbo) {
          this._fbo = gl.createFramebuffer();
      }
        if (this._textureIndex == -1) {
          this._textureIndex = gl.resMng.getTextureIndexByName(this.name);
      }
        this.bindTexture(gl, texture);
        if (this.shouldClearTexture) {
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, texture.dataFormat, null);
      }
        texture.useTexParam(gl, this.textureParam);
        this.bindDepthBuffer(gl, this._depthBuffer, w, h);
        if (this.shouldCheckComplete && gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
          throw Error('framebuffer fail');
      }
        this._buffered = true;
        return true;
    }
      return false;
    },
    set width(v) {
      v = parseInt(v);
      if (!v || this._w == v) {
        return;
    }
      this._w = v;
      this._buffered = false;
    },
    set height(v) {
      v = parseInt(v);
      if (!v || this._h == v) {
        return;
      }
      this._h = v;
      this._buffered = false;
  }
  });

  function GLGeometry(opt) {
    if (!(this instanceof GLGeometry)) {
      return new GLGeometry(opt);
    }
    GLRender.call(this, opt);
    this.drawMode = isNaN(opt.drawMode) ? WebGLRenderingContext.TRIANGLES : opt.drawMode;
    if (isFunc(opt.beforeDraw)) {
      this.beforeDraw = opt.beforeDraw;
    }
    else if (isFunc(opt.afterDraw)) {
      this.afterDraw = opt.afterDraw;
    }
    opt.indexBuffer ? this.indexBuffer = opt.indexBuffer : this.setDrawRange(opt.drawCount, opt.startIndex);
    this.invalid();
  }

  inherit(GLGeometry, GLRender.prototype, {
    set indexBuffer(arrayOrBuffer) {
      this.releaseBuffer();
      if (!(arrayOrBuffer instanceof GLBuffer)) {
        arrayOrBuffer = new GLBuffer(arrayOrBuffer, WebGLRenderingContext.ELEMENT_ARRAY_BUFFER);
      }
      this._indexBuffer = arrayOrBuffer;
      arrayOrBuffer.ref(this);
      this.draw = drawIndexBufferArray;
    },
    dispose: function (gl) {
      GLRender.prototype.dispose.apply(this, arguments);
      var buf = this.releaseBuffer(gl);
      if (buf) {
        buf.dispose(gl)
      }
    },
    update: function (state) {
      GLRender.prototype.update.call(this, state);
      //force rebind param
      objForEach(this.binder, function (binder) {
        if (binder instanceof GLBinder) {
          binder._invalid = true;
      }
      })
    },
    setDrawRange: function (count, start) {
      this.releaseBuffer();
      this.startIndex = start || 0;
      this.drawCount = count;
      this.draw = drawVertexArray;
    },
    beforeDraw: void 0,
    afterDraw: void 0,
    render: function (state) {
      useBinder(this.binder, state);
      if (isFunc(this.beforeDraw)) {
        this.beforeDraw(state.gl, state);
      }
      this.draw(state.gl, state);
      if (isFunc(this.afterDraw)) {
        this.afterDraw(state.gl, state);
      }
    },
    releaseBuffer: function () {
      var buffer = this._indexBuffer;
      if (buffer instanceof GLBuffer) {
        buffer.release();
      }
      return buffer;
    },
    draw: noop
  });
  function drawIndexBufferArray(gl) {
    var indexBuffer = this._indexBuffer;
    if (indexBuffer && indexBuffer.length) {
      indexBuffer.bind(gl);
      gl.drawElements(this.drawMode, indexBuffer.length, gl.UNSIGNED_SHORT, 0);
  }
  }

  function drawVertexArray(gl) {
    if (this.drawCount) {
    gl.drawArrays(this.drawMode, this.startIndex, this.drawCount);
  }
  }

  function GLManager(gl) {
    if (!(this instanceof GLManager)) {
      return new GLManager(gl);
  }
    this._maxActiveTexureNum = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS) - 1;
    this._maxCubeTextureNum = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);
    this._max2DTextureNum = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    this._maxFrameBufferNum = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
    this._maxRenderBufferNum = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
    this._maxBufferNum = 2048;
    this._texture2DS = [];
    this._textureCubes = [];
    this._buffers = [];
    this._renderBuffers = [];
    this._frameBuffers = [];
    this._textureIndexDic = {};
    this._indexUsage = new Uint8Array(this._maxActiveTexureNum);
    this._bindingTexture = this._bindingBuffer = this._bindingFrameBuffer = null;
    this._activeIndex = undefined;
  }

  GLManager.prototype = {
    getTextureIndexByName: function (name) {
      var dic = this._textureIndexDic;
      if (dic.hasOwnProperty(name)) {
        return dic[name];
      } else {
        var index = this.increaseTextureIndex(Object.getOwnPropertyNames(dic).length);
        if (name) {
          dic[name] = index;
      }
      return index;
    }
    },
    increaseTextureIndex: function (start) {
      var usages = this._indexUsage;
      for (var i = start || 0, min = usages[0], index = i, len = usages.length; i < len; i++) {
        if (usages[i] < min) {
          index = i;
          min = usages[i];
        }
    }
      usages[index]++;
      return index;
    },
    releaseTextureIndex: function (index) {
      return --this._indexUsage[index];
  }
  };
  function GLRenderBuffer() {
    this._glObj = null;
  }

  GLRenderBuffer.prototype = {
    get glObj() {
      return this._glObj
    },
    dispose: function (gl) {
      if (this._glObj) {
        gl.deleteRenderbuffer(this._glObj);
        this._glObj = null;
      }
    },
    bind: function (gl) {
      var handler = this.glObj;
      if (!handler) {
        this._glObj = handler = gl.createRenderbuffer();
      }
      gl.bindRenderbuffer(gl.RENDERBUFFER, handler);
    }
  };
  function GLRenderTask(opt) {
    if (!(this instanceof GLRenderTask)) {
      return new GLRenderTask(opt);
    }
    RenderTask.call(this, opt.name, opt);
    this.init(opt);
  }

  inherit(GLRenderTask, RenderTask, {
    init: function (opt) {
      var cvs, gl = opt.gl || (cvs = opt.canvas).getContext('webgl') || cvs.getContext('experimental-webgl');
      this.gl = gl;
      if (gl) {
      this.resMng = gl.resMng || (gl.resMng = new GLManager(gl));
    }
      else {
        console.error('webgl not support');
    }
    },
    update: function (state) {
      state.gl = this.gl;
      state.glResMng = this.resMng;
    },
    remove: function (item) {
      var upobjs = this._updateObjs, index = upobjs.indexOf(item);
      if (index > -1) {
        upobjs[index] = null;
        arrAdd(this._finalizeObjs, item);
        this.invalid();
    }
  }
  });

  function GLSampler2D(opt) {
    if (!(this instanceof GLSampler2D)) {
      return new GLSampler2D(opt);
    }
    this.name = opt.name;
    this._textureIndex = -1;
    this.flipY = opt.flipY !== false;
    this.source = opt.source;
    this.texture = opt.texture || new GLTexture(false, opt.textureDataFormat);
    this.param = makeOptions(opt.param, {
      TEXTURE_MAG_FILTER: 'LINEAR',
      TEXTURE_MIN_FILTER: 'LINEAR',
      TEXTURE_WRAP_S: opt.warpRepeat ? 'REPEAT' : 'CLAMP_TO_EDGE',
      TEXTURE_WRAP_T: opt.warpRepeat ? 'REPEAT' : 'CLAMP_TO_EDGE'
    })
  }

  function isImageLike(source) {
    return source instanceof HTMLImageElement || source instanceof Image
  }

  function isCanvasLike(source) {
    return source instanceof HTMLCanvasElement || source instanceof ImageData || source instanceof HTMLVideoElement
  }

  function checkSamplerSource(sampler, source) {
    var format;
    if (isImageLike(source)) {
      if (!source.complete) {
        throw Error('image should be loaded before use');
    }
      format = WebGLRenderingContext.RGB;
  }
    else if (isCanvasLike(source)) {
      format = WebGLRenderingContext.RGBA;
    }
    else if (isObj(source) && isObj(source.data) && +source.width && +source.height && source.data.buffer instanceof ArrayBuffer) {
      format = source.format || WebGLRenderingContext.RGBA;
    }
    else if (!source) {
      format = 0;
    } else {
      throw Error('invalid source');
    }
    sampler._source = source;
    sampler.format = format;
  }

  Flip.util.inherit(GLSampler2D, GLUniform.prototype, {
    set source(value) {
      checkSamplerSource(this, value);
      this._buffered = false;
    },
    get value() {
      return this.source;
    },
    get source() {
      return this._source
    },
    set value(v) {
      this.source = v;
    },
    get textureIndex() {
      return this._textureIndex;
    },
    set textureIndex(v) {
      if (this._textureIndex == -1) {
        this._textureIndex = v;
      }
      else if (this._textureIndex != v) {
        throw Error('sampler texture index should not change');
      }
    },
    set texture(v) {
      if (v instanceof GLTexture && v != this._texture) {
        this._texture = v;
      this._buffered = false;
      }
      else {
        throw Error('invalid texture');
      }
    },
    get texture() {
      return this._texture;
    },
    bind: function (gl, state) {
      var entry = state.glParam[this.name];
      this.textureIndex = gl.resMng.getTextureIndexByName(this.name);
      this.bufferData(gl);
      entry.use(gl, this.textureIndex);
    },
    dispose: function (gl) {
      var texture = this._texture;
      if (texture) {
        texture.dispose(gl);
        this._buffered = false;
      }
    },
    bufferData: function (gl) {
      var source = this.source, tex = this._texture;
      tex.activeIndex(gl, this.textureIndex);
      tex.bind(gl);
      if (!this._buffered) {
        if (source) {
          var format = this.format;
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, this.flipY);
          if (isCanvasLike(source) || isImageLike(source)) {
            gl.texImage2D(gl.TEXTURE_2D, 0, format, format, tex.dataFormat, source);
        }
        else {
            gl.texImage2D(gl.TEXTURE_2D, 0, format, source.width, source.height, 0, format, tex.dataFormat, source.data)
        }
          tex.useTexParam(gl, this.param);
      }
        else {
          //gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, null);
        }
        this._buffered = true;
    }
  }
  });
  function GLSamplerCube(opt) {
    if (!(this instanceof GLSamplerCube)) {
      return new GLSamplerCube(opt);
    }
  }

  function GLScene(opt) {
    if (!(this instanceof GLScene)) {
      return new GLScene(opt);
    }
    this.vertexSource = opt.vertexSource;
    this.fragSource = opt.fragSource;
    this.define = objAssign({}, opt.define);
    this._glVars = getGLVarDeclarations(this.vertexSource + this.fragSource);
    opt.binder = this.buildBinder(opt.binder);
    GLRender.call(this, opt);
  }

  inherit(GLScene, GLRender.prototype, {
    update: function (state) {
      ensureProgram(this, state.gl);
      this.updateRenderState(state);
      GLRender.prototype.update.call(this, state);
    },
    dispose: function (gl) {
      GLRender.prototype.dispose.apply(this, arguments);
      var program = this.program;
      if (program) {
        gl.deleteProgram(this.program);
        this.program = null;
    }
    },
    updateRenderState: function (state) {
      state.glSecne = this;
      state.glParam = this.glParam;
    },
    render: function (state) {
      var program = this.program, gl = state.gl;
      if (program) {
        gl.useProgram(program);
      }
      this.updateRenderState(state);
      useBinder(this.binder, state);
      this._children.forEach(function (c) {
        c.render(state)
      });
    },
    buildBinder: function (binders) {
      return buildBinder(this._glVars, binders)
  }
  });
  GLScene.buildBinder = function (source, binders) {
    return buildBinder(getGLVarDeclarations(source), binders)
  };
  function ensureProgram(scene, gl) {
    var program;
    if (!(program = scene.program)) {
      var vSource = scene.vertexSource;
      var fSource = scene.fragSource;
      program = scene.program = createGLProgram(gl, vSource, fSource, scene.define);
      var varDefs = getVarEntries(gl, program, vSource + fSource);
      scene.glParam = objAssign({}, scene.attributes = varDefs.attributes, scene.uniforms = varDefs.uniforms);
    }
  }

  function createGLProgram(gl, vSource, fSource, define) {
    var program = gl.createProgram(),
      shader = gl.createShader(gl.FRAGMENT_SHADER),
      marco = '',
      error;
    objForEach(define, function (val, key) {
      marco += '#define ' + key + ' ' + val + '\n';
    });
    gl.shaderSource(shader, marco + fSource);
    gl.compileShader(shader);
    var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
      error = gl.getShaderInfoLog(shader);
      throw Error('fragment shader fail:' + error);
    }
    gl.attachShader(program, shader);
    gl.deleteShader(shader);
    shader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(shader, marco + vSource);
    gl.compileShader(shader);
    compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
      error = gl.getShaderInfoLog(shader);
      throw Error('vertex shader fail:' + error);
    }
    gl.attachShader(program, shader);
    gl.linkProgram(program);
    gl.deleteShader(shader);
    error = gl.getProgramInfoLog(program);
    if (error) {
      throw Error('program link fail:' + error);
    }
    return program;
  }

  function getVarEntries(gl, program, source) {
    var def = getGLVarDeclarations(source),
      attributes = {},
      uniforms = {};
    objForEach(def.attributes, function (define, name) {
      var loc = gl.getAttribLocation(program, name);
      if (loc == -1) {
        console.warn('Fail to get attribute ' + name);
      }
      attributes[name] = new AttributeEntry(define.type, loc, name);
    });
    objForEach(def.uniforms, function (define, name) {
      if (!uniforms.hasOwnProperty(name)) {
        var loc = gl.getUniformLocation(program, name);
        if (loc == -1) {
          console.warn('Fail to get uniform ' + name);
      }
        uniforms[name] = new UniformEntry(define.type, loc, name);
    }
  });
    return { uniforms: uniforms, attributes: attributes }
  }

  function buildBinder(declare, map) {
    var uniforms = declare.uniforms,
      attributes = declare.attributes,
      ret = {};
    objForEach(map, function (value, name) {
      var define, converted = value;
      if (!(converted instanceof GLBinder)) {
        if (uniforms.hasOwnProperty(name) && !(value instanceof GLUniform)) {
          define = uniforms[name];
          converted = getUniform(define.name, define.type, value);
        } else if (attributes.hasOwnProperty(name) && !(value instanceof GLAttribute)) {
          converted = new GLAttribute(name, value);
        }
    }
      ret[name] = converted;
    });
    return ret;
  }

  function getUniform(name, type, value) {
    if (type == 'sampler2D') {
      return new GLSampler2D({ name: name, source: value })
  }
    else if (type == 'samplerCube') {
      throw Error('not support');
    }
    else if (isFunc(value)) {
      return new GLDynamicUniform({ name: name, type: type, getValue: value })
    }
    return GLUniform({ name: name, type: type, value: value })
  }

  function getGLVarDeclarations(source) {
    var uniforms = {},
      attributes = {},
      nrg = /\b(uniform|attribute)\s+(vec[234]|int|float|sampler2D|samplerCube|mat[234])\s+\b(\w+)\b\s?;/gm,
      match;
    while (match = nrg.exec(source)) {
      var target = match[1] === 'uniform' ? uniforms : attributes;
      var name = match[3];
      target[name] = { name: name, type: match[2] };
    }
    return { uniforms: uniforms, attributes: attributes };
  }

  function GLTexture(isCube, dataFormat) {
    this._type = isCube ? WebGLRenderingContext.TEXTURE_CUBE_MAP : WebGLRenderingContext.TEXTURE_2D;
    this.dataFormat = dataFormat == WebGLRenderingContext.FLOAT ? WebGLRenderingContext.FLOAT : WebGLRenderingContext.UNSIGNED_BYTE;
  }

  GLTexture.prototype = {
    get glObj() {
      return this._glHandle;
    },
    dispose: function (gl) {
      var handle = this._glHandle;
      if (handle) {
        gl.deleteTexture(handle);
        this._glHandle = null;
    }
    },
    getGlHandle: function (gl) {
      if (!this._glHandle) {
        this._glHandle = gl.createTexture();
        if (this.dataFormat == WebGLRenderingContext.FLOAT) {
          var ext = gl.getExtension('OES_texture_float');
          if (!ext) {
            console.warn('float texture is not support');
          }
        }
    }
      return this._glHandle;
    },
    bind: function (gl) {
      gl.bindTexture(this._type, this.getGlHandle(gl));
    },
    activeIndex: function (gl, index) {
      gl.activeTexture(gl['TEXTURE' + index]);
      this.bind(gl);
    },
    useTexParam: function (gl, param, target) {
      var method = 'texParameteri';
      var params = {};
      target = target == void 0 ? gl.TEXTURE_2D : target;
      ['TEXTURE_MAG_FILTER', 'TEXTURE_MIN_FILTER', 'TEXTURE_WRAP_S', 'TEXTURE_WRAP_T'].forEach(function (key) {
        var val = param[key];
        if (isStr(val)) {
          val = gl[val];
      }
        if (!isNaN(val)) {
          params[key] = val;
        }
    });
      if (this.dataFormat == gl.FLOAT) {
        method = 'texParameterf';
        if (params['TEXTURE_MAG_FILTER'] == gl.LINEAR || params['TEXTURE_MIN_FILTER'] == gl.LINEAR) {
          var ext = gl.getExtension("OES_texture_float_linear");
          if (!ext) {
            console.warn('float linear filter is not support');
        }
      }
      }
      objForEach(params, function (val, key) {
        gl[method](target, gl[key], val);
    });
  }
  };
  function GLVec(VecOrArrayOrNum) {
    if (!(this instanceof GLVec)) {
      return new GLVec(VecOrArrayOrNum);
  }
    if (VecOrArrayOrNum instanceof GLVec) {
      return VecOrArrayOrNum.clone();
    } else {
      this.elements = new Float32Array(VecOrArrayOrNum);
    }
  }

  GLVec.prototype = {
    clone: function () {
      return new GLVec(this.elements)
    },
    get length() {
      return this.elements.length
    },
    vecDot: function (vecOrNumber) {
      return vecDot(this, vecOrNumber)
    },
    vecLength: function () {
      return vecLength(this)
    },
    vecAdd: function (vec) {
      return vecAdd(this, vec)
    },
    vecNormalize: function () {
      return vecNormalize(this)
    },
    /**
     * set selected components returns a new GLVec instance
     *  vec.set({x:3,z:1});
     *  vec.set(3,null,1);
     * @param componentsOrx
     */
    set: function (componentsOrx) {
      var vec = this.clone();
      if (isObj(componentsOrx)) {
        objForEach(componentsOrx, function (val, key) {
          vec[key] = val;
        })
    }
      else {
        for (var i = 0, len = this.length; i < len; i++) {
          var num = arguments[i];
          if (!isNaN(num)) {
            vec.elements[i] = num;
          }
        }
      }
      return vec;
  }
  };
  GLVec.vecDot = vecDot;
  GLVec.vecMix = vecMix;
  GLVec.vecAdd = vecAdd;
  GLVec.vecLength = vecLength;
  GLVec.vecNormalize = vecNormalize;

  function vecMix(vec1, p1, vec2, p2) {
    var length = vec1.length;
    if (length !== vec2.length) {
      throw Error('dot vec of different dimensions');
  }
    for (var i = 0, ret = []; i < length; i++) {
      ret[i] = p1 * vec1[i] + p2 * vec2[i]
    }
    return new GLVec(ret);
  }

  function vecDot(vec1, vec2) {
    if (typeof vec2 === "number") {
      return vecScale(vec1, vec2);
    }
    var length = vec1.length;
    if (length !== vec2.length) {
      throw Error('dot vec of different dimensions');
    }
    var ret = [];
    for (var i = 0; i < length; i++) {
      ret[i] = vec1[i] * vec2[i];
    }
    return new GLVec(ret);
  }

  function vecScale(vec, scale) {
    var ret = [];
    for (var i = 0; i < vec.length; i++) {
      ret[i] = vec[i] * scale;
    }
    return new GLVec(ret);
  }

  function vecAdd(vec1, vec2) {
    var length = vec1.length;
    if (length !== vec2.length) {
      throw Error('add vec of different dimensions');
    }
    var ret = [];
    for (var i = 0; i < length; i++) {
      ret[i] = vec2[i] + vec1[i];
    }
    return new GLVec(ret);
  }

  function vecLength(vec) {
    for (var i = 0, len = vec.length, sum = 0; i < len; i++) {
      var num = vec[i];
      sum += num * num;
    }
    return Math.sqrt(sum);
  }

  function vecNormalize(vec) {
    var vLen = vecLength(vec);
    if (vLen == 0) {
      return new GLVec(vec.length);
    }
    for (var i = 0, ret = []; i < vec.length; i++) {
      ret[i] = vec[i] / vLen;
    }
    return new GLVec(ret);
  }

  /*
   like a gl vec, vec component can be accessed by index or name
   var vec=new GLVec([1,2,3,4]);
   vec.x    // 1
   vec[1]  //2
   vec.b  //3
   vec.w == vec.a == vec[3] == 4
   */
  ['0,0', 'x,0', 'r,0', '1,1', 'y,1', 'g,1', '2,2', 'z,2', 'b,2', '3,3', 'w,3', 'a,3'].forEach(function (def) {
    var components = def.split(','), index = +components[1], name = components[0];
    Object.defineProperty(GLVec.prototype, name, {
      get: function () {
        return this.elements[index]
    },
      set: function (val) {
        this.elements[index] = +val;
    }
    });

  });
  var EPSILON = 0.000001;

  function Matrix4(arrayOrMat4) {
    if (!(this instanceof Matrix4)) {
      return new Matrix4(arrayOrMat4);
    }
    var elements;
    if (arrayOrMat4 instanceof Array) {
      elements = new Float32Array(arrayOrMat4)
    }
    else if (arrayOrMat4 instanceof Matrix4) {
      elements = new Float32Array(arrayOrMat4.elements)
    }
    else if (arrayOrMat4 && arrayOrMat4.buffer instanceof ArrayBuffer) {
      elements = new Float32Array(arrayOrMat4);
    }
    else {
      elements = new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ])
    }
    this.elements = elements;
  }

  Matrix4.prototype = {
    clone: function () {
      return new Matrix4(this);
    },
    translate: function (x, y, z) {
      translateMatrix4(this.elements, this.elements, [x, y, z]);
      return this;
    },
    scale: function (x, y, z) {
      scaleMatrix4(this.elements, this.elements, [x, y, z]);
      return this;
    },
    rotate: function (rad, axis) {
      rotateMatrix4(this.elements, this.elements, rad, axis);
      return this;
    },
    concat: function (matrix) {
      concatMatrix4(this.elements, this.elements, matrix.elements);
      return this;
    },
    perspective: function (fovy, aspect, near, far) {
      concatMatrix4(this.elements, this.elements, matrix4Perspective(new Float32Array(16), fovy, aspect, near, far));
      return this;
    },
    lookAt: function (eye, center, up) {
      concatMatrix4(this.elements, this.elements, matrix4LookAt(new Float32Array(16), eye, center, up));
      return this;
    },
    toString: function (fix) {
      var a = this.elements, str = '';
      fix = fix || 3;
      for (var i = 0, index; i < 4; i++) {
        str += a[index = i * 4].toFixed(fix) + '\t' + a[index + 1].toFixed(fix) + '\t' +
          a[index + 2].toFixed(fix) + '\t' + a[index + 3].toFixed(fix) + '\n';
    }
      return str;
    },
    concatVec4: function (x, y, z, w) {
      return vec4ConcatMat4([], [+x, +y, +z, isNaN(w) ? 1 : +w], this.elements);
  }
  };
  Matrix4.fromPerspective = function (fovy, aspect, near, far) {
    var elements = new Float32Array(16);
    matrix4Perspective(elements, fovy, aspect, near, far);
    return new Matrix4(elements)
  };
  Matrix4.fromLookAt = function (eye, center, up) {
    var elements = new Float32Array(16);
    matrix4LookAt(elements, eye, center, up);
    return new Matrix4(elements)
  };
  Matrix4.fromScale = function (x, y, z) {
    var mat = new Matrix4(), elements = mat.elements;
    scaleMatrix4(elements, elements, [x, y, z]);
    return mat;
  };
  Matrix4.fromTranslate = function (x, y, z) {
    var mat = new Matrix4(), elements = mat.elements;
    translateMatrix4(elements, elements, [x, y, z]);
    return mat;
  };
  Matrix4.fromConcat = function (a, b) {
    var mat = new Matrix4(), elements = mat.elements;
    concatMatrix4(elements, a.elements, b.elements);
    return mat;
  };
  Matrix4.fromRotate = function (rad, axis) {
    var mat = new Matrix4(), elements = mat.elements;
    rotateMatrix4(elements, elements, rad, axis);
    return mat;
  };
  function matrix4LookAt(out, eye, center, up) {
    var x0, x1, x2, y0, y1, y2, z0, z1, z2, len,
      eyex = eye[0],
      eyey = eye[1],
      eyez = eye[2],
      upx = up[0],
      upy = up[1],
      upz = up[2],
      centerx = center[0],
      centery = center[1],
      centerz = center[2];

    if (Math.abs(eyex - centerx) < EPSILON &&
      Math.abs(eyey - centery) < EPSILON &&
      Math.abs(eyez - centerz) < EPSILON) {
      [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ].forEach(function (number, i) {
        out[i] = number;
      });
      return out;
  }

    z0 = eyex - centerx;
    z1 = eyey - centery;
    z2 = eyez - centerz;

    len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    z0 *= len;
    z1 *= len;
    z2 *= len;

    x0 = upy * z2 - upz * z1;
    x1 = upz * z0 - upx * z2;
    x2 = upx * z1 - upy * z0;
    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
    if (!len) {
      x0 = 0;
      x1 = 0;
      x2 = 0;
    } else {
      len = 1 / len;
      x0 *= len;
      x1 *= len;
      x2 *= len;
  }

    y0 = z1 * x2 - z2 * x1;
    y1 = z2 * x0 - z0 * x2;
    y2 = z0 * x1 - z1 * x0;

    len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
    if (!len) {
      y0 = 0;
      y1 = 0;
      y2 = 0;
    } else {
      len = 1 / len;
      y0 *= len;
      y1 *= len;
      y2 *= len;
  }

    out[0] = x0;
    out[1] = y0;
    out[2] = z0;
    out[3] = 0;
    out[4] = x1;
    out[5] = y1;
    out[6] = z1;
    out[7] = 0;
    out[8] = x2;
    out[9] = y2;
    out[10] = z2;
    out[11] = 0;
    out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
    out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
    out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
    out[15] = 1;

    return out;
  }

  function matrix4Perspective(out, fovy, aspect, near, far) {
    var f = 1.0 / Math.tan(fovy / 2),
      nf = 1 / (near - far);
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = 2 * far * near * nf;
    out[15] = 0;
    return out;
  }

  function rotateMatrix4(out, a, rad, axis) {
    var x = axis[0], y = axis[1], z = axis[2],
      len = Math.sqrt(x * x + y * y + z * z),
      s, c, t,
      a00, a01, a02, a03,
      a10, a11, a12, a13,
      a20, a21, a22, a23,
      b00, b01, b02,
      b10, b11, b12,
      b20, b21, b22;

    if (Math.abs(len) < EPSILON) {
      return null;
    }

    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;

    s = Math.sin(rad);
    c = Math.cos(rad);
    t = 1 - c;

    a00 = a[0];
    a01 = a[1];
    a02 = a[2];
    a03 = a[3];
    a10 = a[4];
    a11 = a[5];
    a12 = a[6];
    a13 = a[7];
    a20 = a[8];
    a21 = a[9];
    a22 = a[10];
    a23 = a[11];

    // Construct the elements of the rotation matrix
    b00 = x * x * t + c;
    b01 = y * x * t + z * s;
    b02 = z * x * t - y * s;
    b10 = x * y * t - z * s;
    b11 = y * y * t + c;
    b12 = z * y * t + x * s;
    b20 = x * z * t + y * s;
    b21 = y * z * t - x * s;
    b22 = z * z * t + c;

    // Perform rotation-specific matrix multiplication
    out[0] = a00 * b00 + a10 * b01 + a20 * b02;
    out[1] = a01 * b00 + a11 * b01 + a21 * b02;
    out[2] = a02 * b00 + a12 * b01 + a22 * b02;
    out[3] = a03 * b00 + a13 * b01 + a23 * b02;
    out[4] = a00 * b10 + a10 * b11 + a20 * b12;
    out[5] = a01 * b10 + a11 * b11 + a21 * b12;
    out[6] = a02 * b10 + a12 * b11 + a22 * b12;
    out[7] = a03 * b10 + a13 * b11 + a23 * b12;
    out[8] = a00 * b20 + a10 * b21 + a20 * b22;
    out[9] = a01 * b20 + a11 * b21 + a21 * b22;
    out[10] = a02 * b20 + a12 * b21 + a22 * b22;
    out[11] = a03 * b20 + a13 * b21 + a23 * b22;

    if (a !== out) { // If the source and destination differ, copy the unchanged last row
      out[12] = a[12];
      out[13] = a[13];
      out[14] = a[14];
      out[15] = a[15];
    }
    return out;
  }

  function scaleMatrix4(out, a, v) {
    var x = v[0], y = v[1], z = v[2];

    out[0] = a[0] * x;
    out[1] = a[1] * x;
    out[2] = a[2] * x;
    out[3] = a[3] * x;
    out[4] = a[4] * y;
    out[5] = a[5] * y;
    out[6] = a[6] * y;
    out[7] = a[7] * y;
    out[8] = a[8] * z;
    out[9] = a[9] * z;
    out[10] = a[10] * z;
    out[11] = a[11] * z;
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
  }

  function translateMatrix4(out, a, v) {
    var x = v[0], y = v[1], z = v[2],
      a00, a01, a02, a03,
      a10, a11, a12, a13,
      a20, a21, a22, a23;

    if (a === out) {
      out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
      out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
      out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
      out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
    } else {
      a00 = a[0];
      a01 = a[1];
      a02 = a[2];
      a03 = a[3];
      a10 = a[4];
      a11 = a[5];
      a12 = a[6];
      a13 = a[7];
      a20 = a[8];
      a21 = a[9];
      a22 = a[10];
      a23 = a[11];

      out[0] = a00;
      out[1] = a01;
      out[2] = a02;
      out[3] = a03;
      out[4] = a10;
      out[5] = a11;
      out[6] = a12;
      out[7] = a13;
      out[8] = a20;
      out[9] = a21;
      out[10] = a22;
      out[11] = a23;

      out[12] = a00 * x + a10 * y + a20 * z + a[12];
      out[13] = a01 * x + a11 * y + a21 * z + a[13];
      out[14] = a02 * x + a12 * y + a22 * z + a[14];
      out[15] = a03 * x + a13 * y + a23 * z + a[15];
    }

    return out;
  }

  function concatMatrix4(out, a, b) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
      a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
      a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
      a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    // Cache only the current line of the second matrix
    var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
    out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b[4];
    b1 = b[5];
    b2 = b[6];
    b3 = b[7];
    out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b[8];
    b1 = b[9];
    b2 = b[10];
    b3 = b[11];
    out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b[12];
    b1 = b[13];
    b2 = b[14];
    b3 = b[15];
    out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    return out;
  }

  function vec4ConcatMat4(out, a, m) {
    var x = a[0], y = a[1], z = a[2], w = a[3];
    out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
    out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
    out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
    out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
    return out;
  }

  function useBinder(target, renderState) {
    var gl = renderState.gl, scene = renderState.glSecne;
    objForEach(target, function (binderOrFunc) {
      if (isFunc(binderOrFunc)) {
        binderOrFunc(gl, renderState);
      } else if (isFunc(binderOrFunc.bind)) {
        binderOrFunc.bind(gl, renderState);
    }
    })
  }

  function correlateBinder(ctrl, state) {
    var scene = state.glSecne,
      attributes = scene.attributes,
      uniforms = scene.uniforms,
      target = ctrl.binder;
    if (ctrl._invalidBinder) {
      objForEach(target, function (binderOrFunc, name) {
        var convertedBinder;
        if (binderOrFunc instanceof GLBinder) {
          convertedBinder = binderOrFunc;
      }
        else if (uniforms.hasOwnProperty(name) && !(binderOrFunc instanceof GLUniform)) {
          convertedBinder = uniforms[name].convert(binderOrFunc);
        }
        else if (isFunc(binderOrFunc)) {
          convertedBinder = new GLBinder({ name: name, bind: binderOrFunc })
        }
        else if ((attributes.hasOwnProperty(name) && !(binderOrFunc instanceof GLAttribute))) {
          convertedBinder = attributes[name].convert(binderOrFunc);
        }
        else {
          return;
        }
        target[name] = convertedBinder;
        convertedBinder._controller = ctrl;
      });
      ctrl._invalidBinder = false;
    }
  }

  function addBinder(target, nameOrBinder, func) {
    if (isObj(nameOrBinder) && !(nameOrBinder instanceof GLBinder)) {
      objForEach(nameOrBinder, function (value, key) {
        add(key, value);
      });
    } else {
      if (isFunc(nameOrBinder) && !func) {
        func = nameOrBinder;
        nameOrBinder = 'GLBinder' + nextUid('GLBinder');
    }
      add(nameOrBinder, func);
  }
    return target;
    function add(nameOrBinder, func) {
      if (isStr(nameOrBinder) && (isFunc(func) || func instanceof GLBinder)) {
        target[nameOrBinder] = func;
      } else if (isObj(nameOrBinder) && nameOrBinder.name) {
        target[nameOrBinder.name] = nameOrBinder;
      }
      else {
        throw Error('argument error');
      }
    }
  }

  function disposeBinder(obj, gl) {
    objForEach(obj, function (val) {
      if (isObj(val) && isFunc(val.dispose)) {
        val.dispose(gl)
      }
    })
  }
})();