/**
 * Created by Administrator on 2015/3/25.
 */

function Mat3(arrayOrX1,y1,dx,x2,y2,dy){
  if(!(this instanceof Mat3))return new Mat3(arrayOrX1,y1,dx,x2,y2,dy);
  var eles;
  if(arrayOrX1==undefined)eles=[1,0,0,0,1,0,0,0,1];
  else if(y1==undefined)eles=arrayOrX1;
  else eles=[arrayOrX1,y1,0,x2,y2,dx,dy,1];
  this.elements=new Float32Array(eles);
}

var sin=Math.sin,cos=Math.cos,tan=Math.tan,map2DArray=(function(){
  var seq=[0,1,3,4,6,7];
  function getFloat(d) {
    return (+d).toFixed(5);
  }
  return function(eles){
    return seq.map(function(i){return getFloat(eles[i])})
  }
})();
Flip.Mat3=Mat3;
function defaultIfNaN(v,def){
  var ret=+v;
  return isNaN(ret)?def:ret;
}
Mat3.prototype={
  print:function(){
    var e=this.elements,ret=[];
    for(var i=0;i<3;i++){
      for(var j=0;j<3;j++)
        ret.push(e[j+i*3].toFixed(2));
      ret.push('\n')
    }
    return ret.join(' ');
  },
  reset:function(arr){
    this.elements=new Float32Array(arr);
    return this;
  },
  set:function(col,row,value){
    this.elements[col*3+row]=value;
    return this;
  },
  concat:function(matOrArray){
    var other=matOrArray instanceof Mat3? matOrArray.elements:matOrArray;
    return multiplyMat(this,other);
  },
  axonProject:function(rotationX,rotationY){
    rotationX=rotationX||0;rotationY=rotationY||0;
    var cosX=cos(rotationX),sinX=sin(rotationX),cosY=cos(rotationY),sinY=sin(rotationY);
    return multiplyMat(this,[cosY,sinX*sinY,0,0,cosX,0,sinY,-cosY*sinX,0],1)
  },
  obliqueProject:function(rV,rH){
    rH=rH||0;rV=rV||0;
    var s=1/tan(rV),sSin=sin(rH)*s,sCos=cos(rH)*s;
    return multiplyMat(this,[1,0,0,0,1,0,sCos,sSin,0],1)
  },
  toString: function(){
    return 'matrix('+map2DArray(this.elements).join(',')+')'
  },
  applyContext2D:function(ctx){
    ctx.transform.apply(ctx,map2DArray(this.elements));
  },
  clone:function(){
    return new Mat3(this.elements);
  },
  scale:function(x,y){
    return multiplyMat(this,[defaultIfNaN(x,1),0,0,0,defaultIfNaN(y,1),0,0,0,1]);
  },
  skew:function(angleX,angleY){
    return multiplyMat(this,[1,tan(angleX),0,tan(angleY),1,0,0,1]);
  },
  translate:function(x,y,z){
    return multiplyMat(this,[1,0,0,0,1,0,x||0,y||0,z||0])
  },
  flip:function(angle,horizontal){
    var sinA = sin(angle), cosA = cos(angle);
    return multiplyMat(this,horizontal?[1,0,0,-sinA,cosA,0,0,0,1]:[cosA,sinA,0,0,1,0,0,0,1]);
  },
  rotate:function(angle){
    return this.rotateZ(angle);
  },
  rotateX:function(angle){
    var sina=sin(angle),cosa=cos(angle);
    return multiplyMat(this,[1,0,0,0,cosa,sina,0,-sina,cosa]);
  },
  rotateY:function(angle){
    var sina=sin(angle),cosa=cos(angle);
    return multiplyMat(this,[cosa,0,-sina,0,1,0,sina,0,cosa])
  },
  rotateZ:function(angle){
    var sina=sin(angle),cosa=cos(angle);
    return multiplyMat(this,[cosa,sina,0,-sina,cosa,0,0,0,1])
  }
};
function multiplyMat(mat,other,reverse){
  var a=other,b=mat.elements,out=b;
  if(reverse){
    b=other;
    a=out=mat.elements;
  }
  else{
    a=other;
    b=out=mat.elements;
  }
   var a00 = a[0], a01 = a[1], a02 = a[2],
    a10 = a[3], a11 = a[4], a12 = a[5],
    a20 = a[6], a21 = a[7], a22 = a[8],

    b00 = b[0], b01 = b[1], b02 = b[2],
    b10 = b[3], b11 = b[4], b12 = b[5],
    b20 = b[6], b21 = b[7], b22 = b[8];

  out[0] = a00*b00+a01*b10+a02*b20;
  out[1] = a00*b01+a01*b11+a02*b21;
  out[2] = a00*b02+a01*b12+a02*b22;

  out[3] = a10*b00+a11*b10+a12*b20;
  out[4] = a10*b01+a11*b11+a12*b21;
  out[5] = a10*b02+a11*b12+a12*b22;

  out[6] = a20*b00+a21*b10+a22*b20;
  out[7] = a20*b01+a21*b11+a22*b21;
  out[8] = a20*b02+a21*b12+a22*b22;
  return mat;
}