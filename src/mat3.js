/**
 * Created by Administrator on 2015/3/25.
 */
function Mat3(arrayOrX1,y1,dx,x2,y2,dy){
  if(!(this instanceof Mat3))return new Mat3(arrayOrX1,y1,dx,x2,y2,dy);
  var eles;
  if(arrayOrX1==undefined)eles=[1,0,0,1,0,0];
  else if(y1==undefined)eles=arrayOrX1;
  else eles=[arrayOrX1,x2,y1,y2,dx,dy];
  this.elements=new Float32Array(eles);
}
function getFloat(d) {
  return parseFloat(d).toFixed(5);
}
var sin=Math.sin,cos=Math.cos,tan=Math.tan;
Flip.Mat3=Mat3;
Mat3.prototype={
  concat:function(mat){
    var eles=mat.elements;
    return concatMat(this,eles[0],eles[2],eles[4],eles[1],eles[3],eles[5]);
  },
  /*
  * z=f(x,y)=> z= m*x+n*y+dz
  * @param rX rotation angle of x
  * @param rY rotation angle of y
  * @param [mx]
  * @param [ny]
  * @param [dz]
  * @returns {Flip.Mat3}
  */
  axonProject:function(rX,rY,mx,ny,dz){
    rX=rX||0;rY=rY||0;mx=mx||0;ny=ny||0;dz=dz||0;
    var cosX=cos(rX),sinX=sin(rX),cosY=cos(rY),sinY=sin(rY),yd=-cosY*sinX;

    return concatMat(this,mx*sinY+cosY,ny*sinY,sinY*dz,sinY*sinX+yd*mx,cosX+ny*yd,yd*dz);
  },
  obliqueProject:function(rV,rH,mx,ny,dz){
    rH=rH||0;rV=rV||0;
    var s=1/tan(rV),sSin=sin(rH)*s,sCos=cos(rH)*s;
    mx=mx||0;ny=ny||0;dz=dz||0;
    return concatMat(this,1+mx*sCos,sCos*ny,sCos*dz,sSin*mx,1+ny*sSin,sSin*dz);
  },
  toString:function(){
    return 'matrix('+Array.prototype.map.call(this.elements,getFloat).join(',')+')';
  },
  applyContext2D:function(ctx){
    ctx.transform.apply(ctx,this.elements);
  },
  clone:function(){
    return new Mat3(this.elements);
  },
  scale:function(x,y){
    return concatMat(this,x||1,0,0,0,y||1,0);
  },
  skew:function(angleX,angleY){
    return concatMat(this,1,tan(angleX),0,tan(angleY),1,0)
  },
  translate:function(x,y){
    return concatMat(this,1,0,x||0,0,1,y||0);
  },
  flip:function(angle,horizontal){
    var sinA = sin(angle), cosA = cos(angle);
    return horizontal? concatMat(this,cosA,0,0,sinA,1,0):concatMat(this,1,-sinA, 0, 0, cosA, 0);
  },
  rotate:function(angle){
    var sina=sin(angle),cosa=cos(angle);
    return concatMat(this,cosa,-sina,0,sina,cosa,0)
  }
};
/*
          |t1 t2 0| |x1 x2 0|  |(t1*x1+t2*y1)   (t1*x2+t2*y2)     0|
  [x,y,1] |p1 p2 0| |y1 y2 0|=>|(p1*x1+p2*y1)   (p1*x2+p2*y2)     0|
          |dt dp 1| |dx dy 1|  |(dt*x1+dp*y1+dx)(dt*x2+dp*y2+dy)  1|

 */
function concatMat(mat,x1,y1,dx,x2,y2,dy){
  var eles=mat.elements,t1=eles[0],t2=eles[1],p1=eles[2],p2=eles[3],dt=eles[4],dp=eles[5];
  mat.elements=new Float32Array([t1*x1+t2*x2,t1*x2+t2*y2,p1*x1+p2*y1,p1*x2+p2*y2,dt*x1+dp*y1+dx,dt*x2+dp*y2+dy]);
  return mat;
}