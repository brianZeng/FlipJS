/**
 * Created by Administrator on 2015/4/3.
 */
function GLRender(opt){
  if(!(this instanceof GLRender))return new GLRender(opt);
  opt=opt||{};
  this.binder={};
  this._children=[];
  this._parent=null;
  this.addBinder(opt.binder)
}
function updateGLRender(render,state){
  state.glRender=render;
  correlateBinder(render,state);
}
inherit(GLRender,Render.prototype,{
  get parent(){return this._parent},
  update:function(state){
    updateGLRender(this, state);
    this._children.forEach(function (c){
        c.update(state)
      }
    );
  },
  finalize:function(state){
    finalizeBinder(this.binder,state.glResMng);
    this._children.forEach(function(c){c.finalize(state)});
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
    useBinder(this.binder, state);
    this._children.forEach(function (c){
      c.render(state)
    });
  }
});