/**
 * pass to {@link cssUpdate} for update animation
 * @namespace CssProxy
 * @param {Object|CssProxy} [obj] css rules to combine
 * @returns {CssProxy}
 * @constructor
 */
function CssProxy(obj){
  if(!(this instanceof CssProxy))return new CssProxy(obj);
  this.merge(obj);
}


(function(){
  var defaultPrefixes= ['-moz-','-ms-','-webkit-','-o-',''],toSafeCssString=CssProxy.toSafeCssString;
  function formatNum(value){
    return isNaN(value)? value:Number(value).toFixed(5).replace(/\.0+$/,'')
  }
  CssProxy.toSafeCssString=(function(){
    var cssPropertyKeys=Object.getOwnPropertyNames(document.documentElement.style);
    function toCssPropertyKey(key){
      return key.replace(/[A-Z]/g,function(c){return '-'+ c.toLowerCase()})
    }

    return function(target,separator){
      var rules=[];
      objForEach(target,function(value,key){
        if(cssPropertyKeys.indexOf(key)>-1 || 1)
          rules.push(toCssPropertyKey(key)+':'+formatNum(value));
      });
      return rules.join(separator||';');
    }
  })();
  var p=CssProxy.prototype={
    toSafeCssString:function(separator){
      return toSafeCssString(this,separator)
    },
    toString:function(){
     var rules=[];
     objForEach(this,function(value,key){rules.push(toCssPropertyKey(key)+':'+value);});
     return rules.join(';')
   },
    /**
     * combine key with prefixes
     * @param {string} key   css rule name
     * @param {string} value css value
     * @param {Array<String>}[prefixes=['-moz-','-ms-','-webkit-','-o-','']] prefixes to combine
     * @returns {CssProxy} return itself
     * @example
     * css.withPrefix('border-radius','50%')
     * //add css rules: -moz-border-radius,-webkit-border-radius,-ms-border-radius
     */
   withPrefix:function(key,value,prefixes){
     var self=this;
     (prefixes||defaultPrefixes).forEach(function(prefix){
       self[prefix+key]=value;
     });
     return self;
   },
    /**
     * combine another css rules
     * @param {CssProxy|Object}obj
     * @returns {CssProxy} return itself
     */
   merge:function(obj){
     if(isObj(obj)&&obj!==this)
       objForEach(obj,cloneFunc,this);
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
   template:function(stringTemplate){
     var arg=arguments,r;
     return stringTemplate.replace(/\$\{(\d+)\}/g,function($i,i){
       return ((r=arg[i])==undefined)?$i:formatNum(r);
     })
   }
 };
  Flip.stringTemplate=p.t=p.template;

})();