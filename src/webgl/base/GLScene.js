/**
 * Created by Administrator on 2015/3/31.
 */
function GLScene(opt) {
  if (!(this instanceof GLScene)) {
    return new GLScene(opt);
  }
  GLRender.call(this, opt);
  this.vertexSource = opt.vertexSource;
  this.fragSource = opt.fragSource;
}
inherit(GLScene, GLRender.prototype, {
  update: function (state) {
    ensureProgram(this, state.gl);
    this.updateRenderState(state);
    updateGLRender(this, state);
  },
  finalize: function (state) {
    GLRender.prototype.finalize.call(this, state);
    var program = this.program;
    if (program) {
      state.gl.deleteProgram(this.program);
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
  buildBinder: function (binder) {
    return buildBinder(this.fragSource + this.vertexSource, binder)
  }
});
GLScene.buildBinder = buildBinder;
function ensureProgram(scene, gl) {
  var program, vSource, fSource, varDefs;
  if (!(program = scene.program)) {
    program = scene.program = createGLProgram(gl, vSource = scene.vertexSource, fSource = scene.fragSource);
    varDefs = getVarEntries(gl, program, vSource + fSource);
    scene.glParam = mixObj(
      scene.attributes = varDefs.attributes,
      scene.uniforms = varDefs.uniforms
    );
  }
}
function createGLProgram(gl, vSource, fSource) {
  var program = gl.createProgram(), shader = gl.createShader(gl.FRAGMENT_SHADER), error;
  gl.shaderSource(shader, fSource);
  gl.compileShader(shader);
  var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!compiled) {
    error = gl.getShaderInfoLog(shader);
    console.log('fshader Failed to compile shader: ' + error);
  }
  gl.attachShader(program, shader);
  gl.deleteShader(shader);
  shader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(shader, vSource);
  gl.compileShader(shader);
  compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!compiled) {
    error = gl.getShaderInfoLog(shader);
    console.log('vshader Failed to compile shader: ' + error);
  }
  gl.attachShader(program, shader);
  gl.linkProgram(program);
  gl.deleteShader(shader);
  return program;
}
function getVarEntries(gl, program, source) {
  var def = getGLVarDeclarations(source),
    attributes = {},
    uniforms = {};
  objForEach(def.attributes, function (define, name) {
    var loc = gl.getAttribLocation(program, name);
    if (loc == -1) {
      throw Error('Fail to get attribute ' + name);
    }
    attributes[name] = new AttributeEntry(define.type, loc, name);
    gl.enableVertexAttribArray(loc);
  });
  objForEach(def.uniforms, function (define, name) {
    if (!uniforms.hasOwnProperty(name)) {
      var loc = gl.getUniformLocation(program, name);
      if (loc == -1) {
        throw Error('Fail to get uniform ' + name);
      }
      uniforms[name] = new UniformEntry(define.type, loc, name)
    }
  });
  return { uniforms: uniforms, attributes: attributes }
}
/*
 function getAttributeEntries(gl, program, vSource) {
  var u = {}, loc, name, match, nrg = /\battribute\s+(vec[234]|float)\s+\b(\w+)\b\s?;/gm;
  while ((match = nrg.exec(vSource))) {
    loc = gl.getAttribLocation(program, name = match[2]);
    if (loc == -1) {
      throw Error('get attribute ' + name + ' fail');
    }
    u[name] = new AttributeEntry(match[1], loc, name);
    gl.enableVertexAttribArray(loc);
  }
  return u;
}
 function getUniformEntries(gl, program, vSource, fSource) {
  var u = {}, source = vSource + fSource, match, name, loc, nrg = /\buniform\s+(vec[234]|float|sampler2D|samplerCube|mat[234])\s+\b(\w+)\b\s?;/gm;
  while ((match = nrg.exec(source))) {
    loc = gl.getUniformLocation(program, name = match[2]);
    if (loc == -1) {
      throw Error('get uniform ' + name + ' fail');
    }
    if (!u[name]) {
      u[name] = new UniformEntry(match[1], loc, name);
    }
  }
  return u;
 }*/
function buildBinder(source, map) {
  var dec = getGLVarDeclarations(source),
    uniforms = dec.uniforms,
    attributes = dec.attributes,
    ret = {};
  objForEach(map, function (value, name) {
    var define;
    if (uniforms.hasOwnProperty(name)) {
      define = uniforms[name];
      ret[name] = uniformEntryConverter[define.type](define.name, value);
    } else if (attributes.hasOwnProperty(name)) {
      ret[name] = new GLAttribute(name, value);
    }
  });
  return ret;
}
function getGLVarDeclarations(source) {
  var uniforms = {},
    attributes = {},
    nrg = /\b(uniform|attribute)\s+(vec[234]|float|sampler2D|samplerCube|mat[234])\s+\b(\w+)\b\s?;/gm,
    match;
  while (match = nrg.exec(source)) {
    var target = match[1] === 'uniform' ? uniforms : attributes;
    var name = match[3];
    target[name] = { name: name, type: match[2] };
  }
  return { uniforms: uniforms, attributes: attributes };
}
