/**
 * Created by Administrator on 2015/3/31.
 */
function GLScene(opt){
  if (!(this instanceof GLScene)) {
    return new GLScene(opt);
  }
  GLRender.call(this, opt);
  this.vertexSource = opt.vertexSource;
  this.fragSource = opt.fragSource;
}
inherit(GLScene, GLRender.prototype, {
  update: function (state){
    ensureProgram(this, state.gl);
    this.updateRenderState(state);
    updateGLRender(this, state);
  },
  finalize: function (state){
    GLRender.prototype.finalize.call(this, state);
    var program = this.program;
    if (program) {
      state.gl.deleteProgram(this.program);
    }
  },
  updateRenderState: function (state){
    state.glSecne = this;
    state.glParam = this.glParam;
  },
  render: function (state){
    var program = this.program, gl = state.gl;
    if (program) {
      gl.useProgram(program);
    }
    this.updateRenderState(state);
    useBinder(this.binder, state);
    this._children.forEach(function (c){
      c.render(state)
    });
  }
});
function ensureProgram(scene, gl){
  var program, vSource, fSource, attr, unif;
  if (!(program = scene.program)) {
    program = scene.program = createGLProgram(gl, vSource = scene.vertexSource, fSource = scene.fragSource);
    attr = scene.attributes = getAttributeEntries(gl, program, vSource);
    unif = scene.uniforms = getUniformEntries(gl, program, vSource, fSource);
    scene.glParam = mixObj(attr, unif)
  }
}

function createGLProgram(gl, vSource, fSource){
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
function getAttributeEntries(gl, program, vSource){
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
function getUniformEntries(gl, program, vSource, fSource){
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
}

