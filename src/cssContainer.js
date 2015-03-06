/**
 * Created by Administrator on 2015/3/6.
 */
function CssContainer(){
  if(!(this instanceof CssContainer))return new CssContainer();
}
CssContainer.prototype={
  withPrefix:function(key,value,prefixes){
    var self=this;
    (prefixes||['-moz-','-ms-','-webkit-','-o-','']).forEach(function(prefix){
      self[prefix+key]=value;
    });
    return self;
  },
  merge:function(obj){
    if(isObj(obj)&&obj!==this)
      objForEach(obj,cloneFunc,this);
    return this;
  }
};