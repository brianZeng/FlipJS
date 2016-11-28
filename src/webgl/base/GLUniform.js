/**
 * Created by Administrator on 2015/3/31.
 */


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
