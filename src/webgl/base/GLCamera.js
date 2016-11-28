function GLCamera(opt) {
  if (!(this instanceof GLCamera)) {
    return new GLCamera(opt)
  }
  opt = opt || {};
  GLBinder.call(this, { name: opt.name || 'camera' });
  this.viewMatrixUniformName = opt.viewMatrixUniformName;
  this.projectionMatrixUniformName = opt.projectionMatrixUniformName;
  this.viewProjectionMatrixUniformName = opt.viewProjectionMatrixUniformName;
  this.lookAt = opt.lookAt || [0, 0, 0];
  this.position = opt.position || [0, 0, 2];
  this.up = opt.up || [0, 1, 0];
  this.perspective = opt.perspective || [Math.PI / 6, 1, 1, 3];
}
(function () {
  inherit(GLCamera, GLBinder.prototype, {
    bind: function (gl, state) {
      if (this._invalid) {
        var vpEntry = state.glSecne.uniforms[this.viewProjectionMatrixUniformName];
        if (vpEntry) {
          vpEntry.use(gl, this.viewProjectionMatrix);
          this._invalid = false;
        }
        else {
          var vEntry = state.glSecne.uniforms[this.viewMatrixUniformName],
            pEntry = state.glSecne.uniforms[this.projectionMatrixUniformName];
          if (vEntry && pEntry) {
            vEntry.use(gl, this.viewMatrix);
            pEntry.use(gl, this.projectionMatrix);
            this._invalid = false;
          }
        }
      }
    },
    get viewMatrix() {
      var mat = this._viewMatrix;
      if (!mat) {
        mat = replaceNaNByIdentityMatrix(Matrix4.fromLookAt(
          this.position,
          this.lookAt,
          this.up
        ));
        this._viewMatrix = mat;
        this._vpMatrix = null;
      }
      return mat;
    },
    get projectionMatrix() {
      var mat = this._projectionMatrix;
      if (!mat) {
        mat = replaceNaNByIdentityMatrix(Matrix4.fromPerspective(this._fovy, this._aspect, this._zNear, this._zFar));
        this._projectionMatrix = mat;
        this._vpMatrix = null;
      }
      return mat;
    },
    get viewProjectionMatrix() {
      var mat = this._vpMatrix;
      if (!mat) {
        mat = this._vpMatrix = this.projectionMatrix.concat(this.viewMatrix)
      }
      return mat;
    },
    set position(vec) {
      this.posX = vec[0];
      this.posY = vec[1];
      this.posZ = vec[2];
    },
    get position() {
      return [this._posX, this._posY, this._posZ];
    },
    set lookAt(vec) {
      this.targetX = vec[0];
      this.targetY = vec[1];
      this.targetZ = vec[2];
    },
    get lookAt() {
      return [this._targetX, this._targetY, this._targetZ];
    },
    get up() {
      return [this._upX, this._upY, this._upZ]
    },
    set up(vec) {
      this.upX = vec[0];
      this.upY = vec[1];
      this.upZ = vec[2];
    },
    set perspective(val) {
      if (val instanceof Array) {
        this.setPerspective.apply(this, val);
      }
      else if (isObj(val)) {
        this.setPerspective(val.fovy, val.aspect, val.zNear || val.near, val.zFar || val.far);
      }
    },
    get perspective() {
      return [this._fovy, this._aspect, this._zNear, this._zFar];
    },
    get lookDirection() {
      return [this._targetX - this._posX, this._targetY - this._posY, this._targetZ - this._posZ];
    },
    setPerspective: function (fovy, aspect, near, far) {
      this.fovy = fovy;
      this.aspect = aspect;
      this.zNear = near;
      this.zFar = far;
      return this;
    },
    resetMatrix: function () {
      this._projectionMatrix = null;
      this._viewMatrix = null;
      this._vpMatrix = null;
    },
    config: function (cfg) {
      var self = this;
      objForEach(cfg, function (val, name) {
        if (numberProperties.indexOf(name) > -1) {
          self[name] = val;
        }
      });
      return self;
    }
  });
  var numberProperties = [
    'zNear', 'zFar', 'fovy', 'aspect',
    'targetX', 'targetY', 'targetZ',
    'posX', 'posY', 'posZ',
    'upX', 'upY', 'upZ'
  ];
  numberProperties.forEach(function (name) {
    defNumberProperty(GLCamera.prototype, name)
  });
  function replaceNaNByIdentityMatrix(mat) {
    for (var elements = mat.elements, i = 0, len = elements.length; i < len; i++) {
      if (isNaN(elements[i])) {
        return new Matrix4();
      }
    }
    return mat;
  }

  function defNumberProperty(obj, name) {
    var privateName = '_' + name;
    Object.defineProperty(obj, name, {
      get: function () {
        return this[privateName]
      },
      set: function (val) {
        if (isNaN(val)) {
          throw Error('property ' + name + ' value should be number');
        }
        if (val != this[privateName]) {
          this[privateName] = +val;
          this.resetMatrix();
          this.invalid();
        }
      }
    })
  }
}());

