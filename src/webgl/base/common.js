function useBinder(target,renderState){
  var gl=renderState.gl,scene=renderState.glSecne;
  objForEach(target,function(binderOrFunc){
    if(isFunc(binderOrFunc))
      binderOrFunc(gl,renderState);
    else if(isFunc(binderOrFunc.bind))
      binderOrFunc.bind(gl,renderState);
  })
}
function correlateBinder(ctrl,state){
  var scene=state.glSecne,attributes=scene.attributes,uniforms=scene.uniforms,param,cvt,target=ctrl.binder;
  if(ctrl._invalidBinder){
    objForEach(target,function(binderOrFunc,key){
      if(((param=attributes[key])&&!(param instanceof GLAttribute))||(param=uniforms[key])&&!(param instanceof GLUniform))
      {
        cvt=target[key]=param.convert(binderOrFunc);
        cvt._controller=ctrl;
      }
      else if(isFunc(binderOrFunc)){
        cvt=target[key]=new GLBinder({name:key,bind:binderOrFunc})
      }
    });
    ctrl._invalidBinder=false;
  }
}
function addBinder(target,nameOrBinder,func){
  if(isObj(nameOrBinder))objForEach(nameOrBinder,function(value,key){
    add(key,value);
  });
  else add(nameOrBinder,func);
  return target;
  function add(nameOrBinder,func){
    if( typeof nameOrBinder==="string")
      target[nameOrBinder]=func;
    else if(isObj(nameOrBinder)&&nameOrBinder.name)
      target[nameOrBinder.name]=nameOrBinder;
    else throw Error('argument error');
  }
}