/**
 * Created by Administrator on 2015/4/17.
 */
function CanvasRender(opt){
  if(!(this instanceof  CanvasRender))return new CanvasRender(opt);
  opt=opt||{};
  this.location=(opt.location||[0,0,100,100]).slice(0,4);
  this.z=opt.z||0;
  this.animation=opt.animation;
  this.disabled=opt.disabled;
  this.color=opt.color;
  this.opacity=opt.opacity==undefined?1:opt.opacity;
  this.children=[];
}
CanvasRender.register=function(canvas,global){
  var ctx=canvas.getContext('2d');
  (global||Flip.instance).on('frameStart',function(state){state.ctx=ctx;});
};
Flip.util.inherit(Flip.CanvasRender=CanvasRender,Flip.Render,{
  set x(val){
    this.location[0]=+val;
    this.invalid();
  },
  set y(val){
    this.location[1]=+val;
    this.invalid();
  },
  set w(val){
    this.location[2]=+val;
    this.invalid();
  },
  set h(val){
    this.location[3]=+val;
    this.invalid();
  },
  get x(){return this.location[0]},
  get y(){return this.location[1]},
  get w(){return this.location[2]},
  get h(){return this.location[3]},
  update:function(state){
    if(!this.disabled){
      var ani=this.animation;
      if(ani)ani.update(state);
      this.children=this.children.filter(function(child){
        if(child)
        {
          child.update(state);
          return true;
        }
      })
    }
  },
  findChild:function(idOrFunc,value){
    return arrFind(this.children,idOrFunc,value);
  },
  transform:function(ctx){ ctx.translate(this.x,this.y)},
  clipPath:function(ctx){
    ctx.beginPath();
    ctx.rect(0,0,this.w,this.h);
    ctx.clip();
  },
  paint:function(ctx){
    ctx.fillStyle=this.color;
    ctx.fillRect(0,0,this.w,this.h);
  },
  render:function(state){
    if(!this.disabled){
      var ctx=state.ctx;
      ctx.save();
      this.transform(ctx);
      this.clipPath(ctx);
      ctx.globalAlpha=ctx.globalAlpha*this.opacity;
      this.paint(ctx);
      this.children.forEach(function(child){child.render(state)});
      ctx.restore();
    }
  },
  add:function(){
    for(var j= 0,added,children=this.children,len=arguments.length,render=arguments[0];j<len;render=arguments[++j]){
      if(render instanceof CanvasRender&&children.indexOf(render)==-1){
        children.push(render);
        render.parent=this;
      }
      else if(render instanceof Flip.Animation){
        this.animation=render;
        if(this._task){this._task.add(render);}
      }
    }
    if(added){
      this.children.sort(function(a,b){return a.z - b.z});
      this.invalid();
    }
  },
  remove:function(){
    for(var i= 0,child,len=arguments.length;i<len;i++)
    {
      this.children[this.children.indexOf(child=arguments[i])]=null;
      if(child&&child.parent==this)child.parent=null;
    }
    return this;
  }
});