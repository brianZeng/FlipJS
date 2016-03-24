function useBinder(target,renderState){
  var gl=renderState.gl,scene=renderState.glSecne;
  objForEach(target,function(binderOrFunc){
    if(isFunc(binderOrFunc))
      binderOrFunc(gl,renderState);
    else if(isFunc(binderOrFunc.bind))
      binderOrFunc.bind(gl,renderState);
  })
}
function finalizeBinder(binder,state){
  var gl=state.gl,resMng=state.glResMng;
  objForEach(binder,function(b){
    if(isFunc(b.finalize))
      b.finalize(state,gl,resMng);
  })
}
function correlateBinder(ctrl,state){
  var scene = state.glSecne, attributes = scene.attributes, uniforms = scene.uniforms, target = ctrl.binder;
  if(ctrl._invalidBinder){
    objForEach(target,function(binderOrFunc,key){
      var convertedBinder;
      if ((attributes.hasOwnProperty(key) && !(target[key] instanceof GLAttribute)) ||
        (uniforms.hasOwnProperty(key) && !(target[key] instanceof GLUniform))) {
        convertedBinder = target[key] = (attributes[key] || uniforms[key]).convert(binderOrFunc);
      }
      else if(isFunc(binderOrFunc)){
        convertedBinder = target[key] = new GLBinder({ name: key, bind: binderOrFunc })
      }
      else if (binderOrFunc instanceof GLBinder) {
        convertedBinder = binderOrFunc;
      }
      else {
        return;
      }
      convertedBinder._controller = ctrl;
    });
    ctrl._invalidBinder=false;
  }
}
function addBinder(target,nameOrBinder,func){
  if (isObj(nameOrBinder) && !nameOrBinder.name) {
    objForEach(nameOrBinder, function (value, key){
      add(key, value);
    });
  } else {
    add(nameOrBinder, func);
  }
  return target;
  function add(nameOrBinder,func){
    if( typeof nameOrBinder==="string")
      target[nameOrBinder]=func;
    else if (isObj(nameOrBinder) && nameOrBinder.name)
      target[nameOrBinder.name]=nameOrBinder;
    else throw Error('argument error');
  }
}