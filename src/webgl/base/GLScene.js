/**
 * Created by Administrator on 2015/3/31.
 */
function GLScene(opt) {
  if (!(this instanceof GLScene)) {
    return new GLScene(opt);
  }
  this.vertexSource = opt.vertexSource;
  this.fragSource = opt.fragSource;
  this.define = objAssign({}, opt.define);
  this._glVars = getGLVarDeclarations(this.vertexSource + this.fragSource);
  opt.binder = this.buildBinder(opt.binder);
  GLRender.call(this, opt);
}
inherit(GLScene, GLRender.prototype, {
  update: function (state) {
    ensureProgram(this, state.gl);
    this.updateRenderState(state);
    GLRender.prototype.update.call(this, state);
  },
  dispose: function (gl) {
    GLRender.prototype.dispose.apply(this, arguments);
    var program = this.program;
    if (program) {
      gl.deleteProgram(this.program);
      this.program = null;
    }
  },
  updateRenderState: function (state) {
    state.glSecne = this;
    state.glParam = this.glParam;
  },
  render: function (state) {
    var program = this.program, gl = state.gl;
    if (program) {
      gl.useProgram(program);
    }
    this.updateRenderState(state);
    useBinder(this.binder, state);
    this._children.forEach(function (c) {
      c.render(state)
    });
  },
  buildBinder: function (binders) {
    return buildBinder(this._glVars, binders)
  }
});
GLScene.buildBinder = function (source, binders) {
  return buildBinder(getGLVarDeclarations(source), binders)
};
function ensureProgram(scene, gl) {
  var program;
  if (!(program = scene.program)) {
    var vSource = scene.vertexSource;
    var fSource = scene.fragSource;
    program = scene.program = createGLProgram(gl, vSource, fSource, scene.define);
    var varDefs = getVarEntries(gl, program, vSource + fSource);
    scene.glParam = objAssign({}, scene.attributes = varDefs.attributes, scene.uniforms = varDefs.uniforms);
  }
}
function createGLProgram(gl, vSource, fSource, define) {
  var program = gl.createProgram(),
    shader = gl.createShader(gl.FRAGMENT_SHADER),
    marco = '',
    error;
  objForEach(define, function (val, key) {
    marco += '#define ' + key + ' ' + val + '\n';
  });
  gl.shaderSource(shader, marco + fSource);
  gl.compileShader(shader);
  var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!compiled) {
    error = gl.getShaderInfoLog(shader);
    throw Error('fragment shader fail:' + error);
  }
  gl.attachShader(program, shader);
  gl.deleteShader(shader);
  shader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(shader, marco + vSource);
  gl.compileShader(shader);
  compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!compiled) {
    error = gl.getShaderInfoLog(shader);
    throw Error('vertex shader fail:' + error);
  }
  gl.attachShader(program, shader);
  gl.linkProgram(program);
  gl.deleteShader(shader);
  error = gl.getProgramInfoLog(program);
  if (error) {
    throw Error('program link fail:' + error);
  }
  return program;
}
function getVarEntries(gl, program, source) {
  var def = getGLVarDeclarations(source),
    attributes = {},
    uniforms = {};
  objForEach(def.attributes, function (define, name) {
    var loc = gl.getAttribLocation(program, name);
    if (loc == -1) {
      console.warn('Fail to get attribute ' + name);
    }
    attributes[name] = new AttributeEntry(define.type, loc, name);
  });
  objForEach(def.uniforms, function (define, name) {
    if (!uniforms.hasOwnProperty(name)) {
      var loc = gl.getUniformLocation(program, name);
      if (loc == -1) {
        console.warn('Fail to get uniform ' + name);
      }
      uniforms[name] = new UniformEntry(define.type, loc, name);
    }
  });
  return { uniforms: uniforms, attributes: attributes }
}
function buildBinder(declare, map) {
  var uniforms = declare.uniforms,
    attributes = declare.attributes,
    ret = {};
  objForEach(map, function (value, name) {
    var define, converted = value;
    if (!(converted instanceof GLBinder)) {
      if (uniforms.hasOwnProperty(name) && !(value instanceof GLUniform)) {
        define = uniforms[name];
        converted = getUniform(define.name, define.type, value);
      } else if (attributes.hasOwnProperty(name) && !(value instanceof GLAttribute)) {
        converted = new GLAttribute(name, value);
      }
    }
    ret[name] = converted;
  });
  return ret;
}
function getUniform(name, type, value) {
  if (type == 'sampler2D') {
    return new GLSampler2D({ name: name, source: value })
  }
  else if (type == 'samplerCube') {
    throw Error('not support');
  }
  else if (isFunc(value)) {
    return new GLDynamicUniform({ name: name, type: type, getValue: value })
  }
  return GLUniform({ name: name, type: type, value: value })
}
function getGLVarDeclarations(source) {
  var uniforms = {},
    attributes = {},
    nrg = /\b(uniform|attribute)\s+(vec[234]|int|float|sampler2D|samplerCube|mat[234])\s+\b(\w+)\b\s?;/gm,
    match;
  while (match = nrg.exec(source)) {
    var target = match[1] === 'uniform' ? uniforms : attributes;
    var name = match[3];
    target[name] = { name: name, type: match[2] };
  }
  return { uniforms: uniforms, attributes: attributes };
}
