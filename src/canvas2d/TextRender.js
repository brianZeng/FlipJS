/**
 * Created by Administrator on 2015/4/17.
 */
function TextRender(opt){
  if(!(this instanceof TextRender))return new TextRender(opt);
  opt=opt||{};
  CanvasRender.call(this,opt);
  this.text= opt.text||'';
  this.font=opt.font;   this.change();
}
Flip.util.inherit(Flip.TextRender=TextRender,CanvasRender.prototype,{
  change:function(){
    this._changed=true;
    this.invalid();
  },
  get text(){
    return this._txt;
  },
  set text(t){
    this._txt=t;
    this.change();
  },
  get font(){
    return this._font;
  },
  set font(f){
    this._font=f;
    this.change();
  },
  clipPath:function(){},
  paint:function(ctx){
    ctx.textBaseline='hanging';
    ctx.font=this.font;
    ctx.fillStyle=this.color;
    ctx.fillText(this.text,0,0);
  },
  update:function(state){
    var ctx=state.ctx;
    if(!this.disabled){
      var ani=this.animation;
      if(ani)ani.update(state);
      this.adjust(ctx);
    }
  },
  adjust:function(ctx){
    var p,w;
    if(this._changed){
      ctx.font=this.font;
      w=this.location[2]=ctx.measureText(this.text).width;
      if((p=this.parent)&&this.autoAlign){
        this.location[0]=(p.w-w)/2+this.dx;
      }
      this._changed=false;
    }
  }
});