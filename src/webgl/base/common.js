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
