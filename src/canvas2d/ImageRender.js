/**
 * Created by Administrator on 2015/4/17.
 */
function ImageRender(opt){
  if(!(this instanceof ImageRender))return new ImageRender(opt);
  CanvasRender.call(this,opt);
  opt.src? (this.src=opt.src):(this.img=opt.img);
  this.sourceLocation=opt.sourceLocation;
}
Flip.util.inherit(Flip.ImageRender=ImageRender,CanvasRender.prototype,{
  set src(val){
    var img=new Image(),self=this;
    img.src=val;
    img.onload=function(){
      self.img=img;
    };
    this.img=null;
  },
  set img(image){
    if(image instanceof HTMLImageElement||image instanceof Image){
      if(!image.complete)throw Error('image should be loaded');
      var loc=this.sourceLocation;
      if(loc)
      {
        loc=loc.slice(0,4);
        loc.unshift(image);
      }
      else
        loc=[image,0,0,image.naturalWidth,image.naturalHeight];
      loc.push(0,0,this.w,this.h);
      this._paintArg=loc;
      this._img=image;
      this.invalid();
    }
    else if(image)
      throw Error('Image required')
  },
  get img(){return this._img},
  paint:function(ctx){
    var img=this._img;
    if(img)
      ctx.drawImage.apply(ctx,this._paintArg);
  }
});