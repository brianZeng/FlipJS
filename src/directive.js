/**
 * Created by 柏然 on 2014/12/13.
 */
(function (Flip) {
  var slice=Array.prototype.slice;
  function $$(slt, ele) {
    return slice.apply((ele||document).querySelectorAll(slt));
  }
  function $(slt,ele){
    return (ele||document).querySelector(slt)
  }
  Flip.$$ = $$;
  Flip.$=$;
  Flip.ele=createElement;
  function createElement(tagNameOrOption){
    var tagName=isObj(tagNameOrOption)? tagNameOrOption.tagName:tagNameOrOption,options=makeOptions(tagNameOrOption,{attributes:{}}),ele=document.createElement(tagName);
    objForEach(options.attributes,function(val,name){ele.setAttribute(name,val)});
    return ele;
  }
  document.addEventListener('DOMContentLoaded', function () {
    var funcs=FlipScope.readyFuncs;
    FlipScope.global.init();
    FlipScope.readyFuncs = null;
    funcs.forEach(function (callback) {
      callback(Flip);
    });
  });
})(Flip);
