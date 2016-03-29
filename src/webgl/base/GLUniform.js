/**
 * Created by Administrator on 2015/3/31.
 */
function GLUniform(opt){
  if (!(this instanceof GLUniform)) {
    return new GLUniform(opt);
  }
  this.name = opt.name;
  this.value = opt.value;
}
inherit(GLUniform, GLBinder.prototype, {
  get value(){
    return this._val;
  },
  set value(v){
    this.invalid();
    this._val = v;
  },
  bind: function (gl, state){
    var entry;
    if (this._invalid && (entry = state.glSecne.uniforms[this.name])) {
      entry.use(gl, this._val);
      this._invalid = false;
    }
  }
});
function UniformEntry(type, location, name){
  this.set = UniformEntry.setter[type];
  this.convert = UniformEntry.converter[type];
  this._loc = location;
  this.name = name;
}
function convertToVec(vec, num){
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
UniformEntry.converter = {
  vec4: function (value){
    return new GLUniform({ name: this.name, value: convertToVec(value, 4) })
  },
  vec3: function (value){
    return new GLUniform({ name: this.name, value: convertToVec(value, 3) })
  },
  vec2: function (value){
    return new GLUniform({ name: this.name, value: convertToVec(value, 2) })
  },
  mat4: function (mat){
    return convertMat(mat, 16);
  },
  mat3: function (mat){
    return convertMat(mat, 9);
  },
  mat2: function (mat){
    return convertMat(mat, 4);
  },
  float: function (val){
    return new GLUniform({ name: this.name, value: parseFloat(val) })
  },
  sampler2D: function (source){
    return new GLSampler2D({ name: this.name, source: source })
  },
  samplerCube: function (gl, index){
    throw Error('not implement')
  },
  int: function (val){
    return new GLUniform({ name: this.name, value: parseInt(val) })
  }
};
UniformEntry.setter = {
  vec4: function (gl, vec){
    gl.uniform4fv(this._loc, vec.elements);
  },
  vec3: function (gl, vec){
    gl.uniform3fv(this._loc, vec.elements);
  },
  vec2: function (gl, vec){
    gl.uniform2fv(this._loc, vec.elements);
  },
  mat4: function (gl, mat){
    gl.uniformMatrix4fv(this._loc, false, mat.elements);
  },
  mat3: function (gl, mat){
    gl.uniformMatrix3fv(this._loc, false, mat.elements);
  },
  mat2: function (gl, mat){
    gl.uniformMatrix2fv(this._loc, false, mat.elements);
  },
  float: function (gl, f){
    gl.uniform1f(this._loc, f);
  },
  sampler2D: function (gl, index){
    gl.uniform1i(this._loc, index);
  },
  samplerCube: function (gl, index){
    gl.uniform1i(this._loc, index);
  },
  int: function (gl, i){
    gl.uniform1i(this._loc, i);
  }
};
function convertMat(mat, elementCount){
  var elements;
  if (mat instanceof GLUniform) {
    return mat;
  } else if (mat instanceof Float32Array) {
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
UniformEntry.prototype = {
  use: function (gl, value){
    this.set(gl, value);
  }
};