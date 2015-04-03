/**
 * Created by Administrator on 2015/3/31.
 */

function GLAttribute(name, bufferOrData, stride, offset) {
  this.name = name;
  this._stride = stride || 0;
  this._offset = offset || 0;
  this.buffer=bufferOrData;
  this._invalid = true;
}
GLAttribute.prototype={
  set buffer(v){
    if(v instanceof GLBuffer) this._buffer=v;
    else if(v.length) this._buffer=new GLBuffer(v);
    else throw Error('expect data array or GLBuffer');
  },
  get buffer(){
    return this._buffer;
  },
  get data(){
    var b=this.buffer;
    return b? b.data:null
  },
  set data(v){
    var b=this.buffer;
    b? b.data=v:this.buffer=v;
  },
  bind:function(gl,state){
    var entry=state.glParam[this.name];
    this.buffer.bind(gl);
    gl.vertexAttribPointer(entry._loc, entry._size, gl.FLOAT, false, this._stride, this._offset);
  },
  invalid:function(){
    this.buffer.invalid();
  },
  dispose:function(){
    this.buffer.dispose();
  }
};
function AttributeEntry(type, loc,name) {
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
  this.name=name;
}
AttributeEntry.prototype={
  convert:function(array){
    return new GLAttribute(this.name,array)
  }
};