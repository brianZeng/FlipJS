/**
 * Created by Administrator on 2015/3/31.
 */

function GLAttribute(name, bufferOrData, stride, offset) {
  this.name = name;
  this._stride = stride || 0;
  this._offset = offset || 0;
  this.buffer = bufferOrData;
  this._invalid = true;
}
inherit(GLAttribute, GLBinder.prototype, {
  set buffer(v) {
    var ob = this._buffer;
    if (ob instanceof GLBuffer) {
      ob.release(this);
      }
    if (v instanceof GLBuffer) {
      this._buffer = v;
    }
    else if (v && v.buffer instanceof ArrayBuffer) {
      this._buffer = new GLBuffer(v);
    }
      else {
      throw Error('expect attribute data to be a TypedArray or GLBuffer');
      }
    this._buffer.ref(this);
  },
  get buffer() {
    return this._buffer;
  },
  get data() {
    var b = this.buffer;
    return b ? b.data : null
  },
  set data(v) {
    if (v instanceof GLBuffer) {
      this.buffer = v;
    }
    else if (v.buffer instanceof ArrayBuffer) {
      var b = this.buffer;
      if (b) {
        b.data = v;
        b.invalid();
      }
      else {
        this.buffer = new GLBuffer(v)
      }
    }
      else {
      throw Error();
    }
    this.invalid();
  },
  bind: function (gl, state) {
    var entry = state.glParam[this.name];
    this.buffer.bind(gl);
    gl.enableVertexAttribArray(entry._loc);
    gl.vertexAttribPointer(entry._loc, entry._size, gl.FLOAT, false, this._stride, this._offset);
  },
  invalid: function () {
    this.buffer.invalid();
  },
  dispose: function (gl) {
    this.buffer.release(this);
    this.buffer.finalize(gl);
    }
  }
);
function AttributeEntry(type, loc, name) {
  var t;
  switch (type) {
    case 'vec2':
      t = 2;
      break;
    case 'vec3':
      t = 3;
      break;
    case 'vec4':
      t = 4;
      break;
    case 'float':
      t = 1;
      break;
  }
  this._size = t;
  this._loc = loc;
  this.name = name;
}
AttributeEntry.prototype = {
  convert: function (array) {
    return new GLAttribute(this.name, array)
  }
};