/**
 * pass to {@link cssUpdate} for update animation
 * @namespace CssProxy
 * @param {Object|CssProxy} [obj] css rules to combine
 * @returns {CssProxy}
 * @constructor
 */
function CssProxy(obj) {
  if (!(this instanceof CssProxy))return new CssProxy(obj);
  this.$merge(obj);
  this.$invalid = true;
}
Flip.CssProxy = CssProxy;
(function () {
  var defaultPrefixes , cssPrivateKeyPrefix = '$$';
  var cssPropertyKeys = Object.getOwnPropertyNames(document.documentElement.style), cssPrivateKeys = [];

  function formatNum(value) {
    return isNaN(value) ? value : Number(value).toFixed(5).replace(/\.0+$/, '')
  }

  var p = CssProxy.prototype = {
    $styleText: function (selector,separator) {
      return combineStyleText(selector,this.$toSafeCssString(separator));
    },
    $toCachedCssString:function(reset){
      if(this.$invalid)
      {
        this.$cachedCssString=this.$toSafeCssString();
        this.$invalid=!!reset;
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
      return rules.join(';'+(separator || ''));
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
        self[prefix + key] = value;
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
    var privateKey = cssPrivateKeyPrefix + key, lowerCaseKey = toLowerCssKey(key);
    cssPrivateKeys.push(privateKey);
    registerProperty(p, [key, /^(webkit|moz|o|ms)[A-Z]/.test(key) ? ('-' + lowerCaseKey) : lowerCaseKey], {
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

    return toLowerCssKey(key);
  });
  defaultPrefixes=['-moz-','-ms-','-webkit-','-o-',''].filter(function(prefix){var key=prefix.substring(1);return cssPropertyKeys.some(function(pro){return pro.indexOf(key)==0})});
  Flip.stringTemplate = p.$t = stringTemplate;
  function stringTemplate(stringTemplate) {
    var arg = arguments, r;
    return stringTemplate.replace(/\$\{(\d+)}/g, function ($i, i) {
      return ((r = arg[i]) == undefined) ? $i : formatNum(r);
    })
  }

  function castInvalidValue(val) {
    var type = typeof val;
    return type == 'string' || type == 'number' ? val : void  0;
  }

  function toLowerCssKey(key) {
    return key.replace(/[A-Z]/g, function (str) {
      return '-' + str.toLowerCase()
    })
  }

  function registerProperty(target, keys, define) {
    keys.forEach(function (key) {
      Object.defineProperty(target, key, define);
    })
  }
})();
function combineStyleText(selector,body){
  return selector +'{'+body+'}';
}