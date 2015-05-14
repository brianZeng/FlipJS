/**
 * Created by Administrator on 2015/4/15.
 */
Flip.animation({
  name:'polygon',
  variable:{
    rotateY:Math.PI*2,
    faceTranslate:0
  },
  immutable:{
    projectY:Math.PI/6,
    projectX:Math.PI/6,
    faceWidth:100,
    faceHeight:100,
    faceCount:4
  },
  css:{
    '&':{
      position:'relative'
    }
  },
  afterInit:function(proxy){
    var imm=this._immutable, n=imm.faceCount,self=this,faceClass=proxy.faceClass||'f';
    var faceRotate=Math.PI*2/ n,dz=-imm.faceWidth/2/Math.tan(faceRotate/2),rotateY=this._variable.rotateY|| 0,ryFunc,lastAngle,indices;
    ryFunc=typeof rotateY=="number"?function(p){return rotateY*p}:rotateY;
    for(var i=0;i<n;i++)
      registerFace(i);
    this.param('zIndices',function(p){
      var ry=ryFunc(p),ret=[],rf=faceRotate,min=1,max=-1;
      if(lastAngle&&Math.abs(lastAngle-ry)<rf)return indices;
      for(var i= 0,v;i<n;i++){
        v=ret[i]=Math.cos(ry+rf*i);
        if(v<=min)min=v;
        if(v>=max)max=v;
      }
      var range=max-min;
      return indices= ret.map(function(num){
        return Math.round((num-min)/range*6);
      })
    });
    Flip.$(proxy.selector+'> *[class]').forEach(function(ele){
      ele.className+=' '+faceClass;
    });
    this.css('& .'+faceClass,{
      width:imm.faceWidth+'px',
      height:imm.faceHeight+'px',
      position:'absolute',
      transformOrigin:'center'
    });
    function registerFace(index){
      var selector='& .'+faceClass+index,fR=faceRotate*i;
      self.css(selector,function(css,param){
        css.zIndex=param.zIndices[index]});
      self.transform(selector,function(mat,param){
        mat.rotateY(fR).translate(0,0,dz-param.faceTranslate).axonProject(param.projectX,param.projectY+param.rotateY)
      })
    }
  }
});