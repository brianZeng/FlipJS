/**
 * Created by Administrator on 2015/3/26.
 */
var canvasWidth,canvasHeight,sourceArr,targetArr,middleArr,middleImgData;
var blurTime=0;
var handler={
  start:function(msg){
    var imgData=msg.source;
    canvasHeight=imgData.height;
    canvasWidth=imgData.width;
    sourceArr=imgData.data;
    targetArr=copy(sourceArr);
    middleArr=(middleImgData=msg.middle).data;
    gaussBlur_4(sourceArr,targetArr,canvasWidth,canvasHeight,30);
    return sendMsg('init',{imgData:middleImgData})
  },
  interrupt:function(msg){
    blurTime=0;
    return handler.interpolate(msg)
  },
  interpolate:function(msg){
    var p=msg.percent;
    if(sourceArr){
      mix(sourceArr,targetArr,middleArr,p);
      return sendMsg('blur',{imgData:middleImgData,percent:p})
    }
  },
  black:function(msg){

  }
};
onmessage=function(e){
  var msg= e.data,handle=handler[msg.event],ret=handle(msg);
  if(ret)
    postMessage(ret);
};
function sendMsg(event,ret){
   ret.event=event;
  return ret;
}
function black(arr,target){
  for(var i= 0,len=arr.length;i<len;i+=4){
    target[i]=target[i+1]=target[i+2]=(arr[i]+arr[i+1]+arr[i+2])/3;
    target[i+3]=arr[i+3];
  }
}
function mix(from,to,ret,percent){
  for(var i= 0,len=from.length,fp=(1-percent);i<len;i++){
    ret[i]=from[i]*fp+to[i]*percent;
  }
  return ret;
}
//these methods are adopted form
// http://blog.ivank.net/fastest-gaussian-blur.html
function boxesForGauss(sigma, n) {
  var wIdeal = Math.sqrt((12 * sigma * sigma / n) + 1);  // Ideal averaging filter width
  var wl = Math.floor(wIdeal);
  if (wl % 2 == 0) wl--;
  var wu = wl + 2;
  var mIdeal = (12 * sigma * sigma - n * wl * wl - 4 * n * wl - 3 * n) / (-4 * wl - 4);
  var m = Math.round(mIdeal);// var sigmaActual = Math.sqrt( (m*wl*wl + (n-m)*wu*wu - n)/12 );
  var sizes = [];
  for (var i = 0; i < n; i++) sizes.push(i < m ? wl : wu);
  return sizes;
}
function copy(unitArr){
  return new (Uint8ClampedArray||Uint8Array)(unitArr);
}
function gaussBlur_4(source, target, w, h, r) {
  var bxs = boxesForGauss(r, 3);
  source=copy(source);
  boxBlur(source, target, w, h, (bxs[0] - 1) / 2);
  boxBlur(target, source, w, h, (bxs[1] - 1) / 2);
  boxBlur(source, target, w, h, (bxs[2] - 1) / 2);
}
function boxBlur(scl, tcl, w, h, r) {
  for (var i = 0; i < scl.length; i++)
    tcl[i] = scl[i];
  boxBlurH(tcl, scl, w, h, r);
  boxBlurT(scl, tcl, w, h, r);
}
function boxBlurH(source, target, w, h, radius) {
  var iarr = 1 / (radius + radius + 1),index,colIndex,nextIndex,preIndex,to=w-radius,xInc=radius*4;
  //Vi=V(i-1)-S(i-1-r)+S(i+r)
  for(var y= 0,rowIndex= 0,rowInc=w*4;y<h;y++){
    var rLeft=source[rowIndex],gLeft=source[rowIndex+1],bLeft=source[rowIndex+2];
    var rRight=source[index=(rowIndex+rowInc-4)],gRight=source[index+1],bRight=source[index+2];
    var vr=rLeft*radius,vg=gLeft*radius,vb=bLeft*radius;
    //x=0,v0
    index=rowIndex;
    for(var i=0;i<radius;i++){
      vr+=source[index];
      vg+=source[index+1];
      vb+=source[index+2];
      index+=4;
    }
    colIndex=0;
    for(var x= 1,xIndex=x*4;x<radius;x++){
      vr+=source[nextIndex=(xInc+xInc+rowIndex)]-rLeft;
      vg+=source[nextIndex+1]-gLeft;
      vb+=source[nextIndex+2]-bLeft;
      target[index=(colIndex+rowIndex)]=vr*iarr;
      target[index+1]=vg*iarr;
      target[index+2]=vb*iarr;
      colIndex+=4;
      xIndex+=4;
    }
    for(x=radius,xIndex=x*4;x<to;x++)
    {
      vr+=source[nextIndex=(xIndex+xInc+rowIndex)]-source[preIndex=(xIndex-xInc+rowIndex)];
      vg+=source[nextIndex+1]-source[preIndex+1];
      vb+=source[nextIndex+2]-source[preIndex+2];
      target[index=(colIndex+rowIndex)]=vr*iarr;
      target[index+1]=vg*iarr;
      target[index+2]=vb*iarr;
      colIndex+=4;
      xIndex+=4;
    }
    for(x=to;x<w;x++){
      vr+=rRight-source[preIndex=(xIndex-xInc+rowIndex)];
      vg+=gRight-source[preIndex+1];
      vb+=bRight-source[preIndex+2];
      target[index=(colIndex+rowIndex)]=vr*iarr;
      target[index+1]=vg*iarr;
      target[index+2]=vb*iarr;
      colIndex+=4;
      xIndex+=4;
    }
    rowIndex+=rowInc;
  }
}
function boxBlurT(source, target, w, h, radius) {
  var iarr = 1 / (radius + radius + 1), y,rolIndex,index,nextIndex,preIndex,rowInc=w* 4,to=h-radius,yInc=radius*rowInc,yIndex;
  var maxRowIndex=(h-1)*rowInc;
  for(var x= 0,colIndex=0;x<w;x++){
    var rTop=source[colIndex],gTop=source[colIndex+1],bTop=source[colIndex+2];
    var rDown=source[colIndex+maxRowIndex],gDown=source[colIndex+maxRowIndex+1],bDown=source[colIndex+maxRowIndex+2];
    // y=0,v0
    var vr=radius*rTop,vg=radius*gTop,vb=radius*bTop;
    for(var i=0;i<=radius;i++){
      vr+=source[index=(colIndex+i*rowInc)];
      vg+=source[index+1];
      vb+=source[index+2];
    }
    rolIndex=0;
    index=colIndex;
    target[index]=vr*iarr;
    target[index+1]=vg*iarr;
    target[index+2]=vb*iarr;
    for(y=1,yIndex=y*rowInc;y<radius;y++){
      vr+=source[nextIndex=(colIndex+yIndex+yInc)]-rTop;
      vg+=source[nextIndex+1]-gTop;
      vb+=source[nextIndex+2]-bTop;
      target[index=(colIndex+rolIndex)]=vr*iarr;
      target[index+1]=vg*iarr;
      target[index+2]=vb*iarr;
      rolIndex+=rowInc;
      yIndex+=rowInc;
    }
    for(y=radius,yIndex=y*rowInc;y<to;y++){
      vr+=source[nextIndex=(colIndex+yIndex+yInc)]-source[preIndex=(colIndex+yIndex-yInc)];
      vg+=source[nextIndex+1]-source[preIndex+1];
      vb+=source[nextIndex+2]-source[preIndex+2];
      target[index=(colIndex+rolIndex)]=vr*iarr;
      target[index+1]=vg*iarr;
      target[index+2]=vb*iarr;
      rolIndex+=rowInc;
      yIndex+=rowInc;
    }
    for(y=to,yIndex=y*rowInc;y<h;y++ ){
      vr+=rDown-source[preIndex=(colIndex+yIndex-yInc)];
      vg+=gDown-source[preIndex+1];
      vb+=bDown-source[preIndex+2];
      target[index=(colIndex+rolIndex)]=vr*iarr;
      target[index+1]=vg*iarr;
      target[index+2]=vb*iarr;
      rolIndex+=rowInc;
      yIndex+=rowInc;
    }
    colIndex+=4;
  }
}
function gaussBlur_3 (source, tcl, w, h, r) {
  var bxs = boxesForGauss(r, 3);
  source=copy(source);
  boxBlur_3 (source, tcl, w, h, (bxs[0]-1)/2);
  boxBlur_3 (tcl, source, w, h, (bxs[1]-1)/2);
  boxBlur_3 (source, source, w, h, (bxs[2]-1)/2);
}
function boxBlur_3(scl, tcl, w, h, r) {
  for(var i=0; i<scl.length; i++)
    tcl[i] = scl[i];
  boxBlurH_3(tcl, scl, w, h, r);
  boxBlurT_3(scl, tcl, w, h, r);
}
function boxBlurH_3 (source, target, w, h, radius) {
  var d=1/(radius+radius+1);
  for(var y= 0,rowIndex= 0,rowInc=w*4,index; y<h; y++){
    for(var j= 0,jIndex=0; j<w;++j)  {
      var r=0,g=0,b= 0;
      for(var ix=j-radius,xm=j+radius+1; ix<xm; ix++) {
        index=rowIndex+Math.min(w-1, Math.max(0, ix))*4;//x=Math.min(w-1, Math.max(0, ix))
        r+=source[index];
        g+=source[index+1];
        b+=source[index+2];
      }
      index=rowIndex+jIndex;
      target[index]=r*d;
      target[index+1]=g*d;
      target[index+2]=b*d;
      jIndex+=4;
    }
    rowIndex+=rowInc;
  }
}
function boxBlurT_3 (source, target, w, h, radius) {
  var d=1/(radius+radius+1),index;
  for(var i= 0,rowIndex= 0,rowInc=w*4; i<h; i++){
    for(var x= 0,colIndex=0; x<w; x++) {
      var r= 0,g= 0,b= 0;
      for(var iy=i-radius; iy<i+radius+1; iy++) {
        index=Math.min(h-1, Math.max(0, iy))*rowInc+colIndex;//y = Math.min(h-1, Math.max(0, iy))
        r+=source[index];
        g+=source[index+1];
        b+=source[index+2];
      }
      index=rowIndex+colIndex;
      target[index]=r*d;
      target[index+1]=g*d;
      target[index+2]=b*d;
      colIndex+=4;
    }
    rowIndex+=rowInc;
  }
}