/**
 * Created by Administrator on 2015/3/6.
 */
function CssContainer(obj){
  if(!(this instanceof CssContainer))return new CssContainer(obj);
  this.merge(obj);
}
(function(){
  var p=CssContainer.prototype={
    toString:function(){
     var rules=[];
     objForEach(this,function(value,key){
       rules.push(key.replace(/[A-Z]/g,function(c){return '-'+ c.toLowerCase()})+':'+value);
     });
     return rules.join(';')
   },
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
   },
   template:function(string){
     var arg=arguments,r;
     return string.replace(/\{(\d+)\}/g,function($i,i){
       return ((r=arg[i])==undefined)?$i:formatValue(r);
     })
   }
 };
  Flip.template=p.t=p.template;
})();