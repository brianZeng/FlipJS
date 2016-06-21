/**
 * Created by Administrator on 2015/3/31.
 */
function GLUniform(opt) {
  if (!(this instanceof GLUniform)) {
    return new GLUniform(opt);
  }
  this.name = opt.name;
  this.value = opt.value;
}
inherit(GLUniform, GLBinder.prototype, {
  get value() {
    return this._val;
  },
  set value(v) {
    this.invalid();
    this._val = v;
  },
  bind: function (gl, state) {
    var entry;
    if (this._invalid && (entry = state.glSecne.uniforms[this.name])) {
      entry.use(gl, this._val);
      this._invalid = false;
    }
  }
});
function UniformEntry(type, location, name) {
  this._loc = location;
  this.name = name;
  this.type = type;
}

UniformEntry.prototype = {
  use: function (gl, value) {
    uniformEntrySetter[this.type](gl, value, this._loc);
  },
  convert: function (value) {
    return uniformEntryConverter[this.type](this.name, value);
  }
};
function convertToVec(vec, num) {
  var arr;
  if (vec instanceof GLVec) {
    arr = vec.elements;
  } else if (vec instanceof Array) {
    return new GLVec(vec.slice(0, num));
  }
  if (vec.subarray) {
    return new GLVec(arr.subarray(0, num));
  }
  throw Error('cannot convert to vec' + num);
}
var uniformEntryConverter = UniformEntry.converter = {
  vec4: function (name, value) {
    return new GLUniform({ name: name, value: convertToVec(value, 4) })
  },
  vec3: function (name, value) {
    return new GLUniform({ name: name, value: convertToVec(value, 3) })
  },
  vec2: function (name, value) {
    return new GLUniform({ name: name, value: convertToVec(value, 2) })
  },
  mat4: function (name, mat) {
    return new GLUniform({ name: name, value: convertMat(mat, 16) })
  },
  mat3: function (name, mat) {
    return new GLUniform({ name: name, value: convertMat(mat, 9) });
  },
  mat2: function (name, mat) {
    return new GLUniform({ name: name, value: convertMat(mat, 4) });
  },
  float: function (name, val) {
    return new GLUniform({ name: name, value: parseFloat(val) })
  },
  sampler2D: function (name, source) {
    return new GLSampler2D({ name: name, source: source })
  },
  samplerCube: function (name, source) {
    throw Error('not implement')
  },
  int: function (name, val) {
    return new GLUniform({ name: name, value: parseInt(val) })
  }
};
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
  else {
    throw Error('not support');
  }
  return { elements: elements }
}
