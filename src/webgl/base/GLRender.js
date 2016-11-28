/**
 * Created by Administrator on 2015/4/3.
 */
function GLRender(opt){
  if(!(this instanceof GLRender))return new GLRender(opt);
  opt=opt||{};
  this.binder={};
  this._children=[];
  this._disabled = false;
  this._parent=null;
  this.addBinder(opt.binder)
}
inherit(GLRender,Render.prototype,{
  get disabled() {
    return this._disabled
  },
  get parent(){return this._parent},
  set disabled(v) {
    if (this._disabled != v) {
      this._disabled = v;
      this.invalid();
    }
  },
  findChild: function (filter, deep) {
    var result;
    this._children.some(function (child) {
      if (filter(child)) {
        result = child;
      }
      else if (deep && isFunc(child.findChild)) {
        result = child.findChild(filter, deep);
      }
      return result;
    });
    return result;
  },
  update: function (state) {
    if (!this._disabled) {
      state.glRender = this;
      correlateBinder(this, state);
      this._children.forEach(function (c) {
          c.update(state)
        }
      );
    }
  },
  add:function(){
    for(var i=0,arg=arguments[0];arg;arg=arguments[++i]){
      if(arg instanceof GLRender){
        if(arrAdd(this._children,arg))
          arg._parent=this;
      }
      else {
        this.addBinder(arg);
      }
    }
    this.invalid();
    return this;
  },
  addBinder:function(nameOrBinder,func){
    if(nameOrBinder){
      this._invalidBinder=true;
      addBinder(this.binder,nameOrBinder,func);
    }
    return this
  },
  render:function(state){
    if (!this._disabled) {
      useBinder(this.binder, state);
      this._children.forEach(function (c) {
        c.render(state)
      });
    }
  },
  dispose: function (gl) {
    disposeBinder(this.binder, gl);
    this._children.forEach(function (c) {
      if (isFunc(c.dispose)) {
        c.dispose(gl);
      }
    })
  }
});