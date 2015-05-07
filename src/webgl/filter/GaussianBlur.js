/**
 * Created by Administrator on 2015/4/6.
 */
function GaussianBlurFilter(opt){
  opt=opt||{};
  var scene=new GLScene({
    vertexSource:GaussianBlurFilterSetting.vertexShader,
    fragSource:GaussianBlurFilterSetting.fragShader(opt.radius)
  }),sampler=new GLSampler2D({name:'sImg'});
  scene.addBinder({
    PI:Math.PI,
    sigma:opt.sigma||1,
    uPixelOffset: [opt.offsetX||.001,opt.offsetY||.001],
    aVertex:[-1,1,1,1,-1,-1,1,-1],
    sImg:sampler
  });
  this.sampler=sampler;
  this.disabled=true;
}
GaussianBlurFilter.prototype={
  process:function(source,opt){
    this.sampler.source=source;

  }
};

var GaussianBlurFilterSetting={
  vertexShader:' precision mediump float;attribute vec2 aVertex;varying vec2 vTexCoord;void main(){gl_Position= vec4(aVertex,0.0,1.0);vTexCoord=vec2(aVertex.x*0.5+0.5,aVertex.y*0.5+0.5);}',
  _fshader:'precision mediump float;varying vec2 vTexCoord;uniform sampler2D sImg;uniform float sigma;uniform float PI;uniform vec2 uPixelOffset;float gaussianWeight(float x,float y){float dev=2.0*sigma*sigma;return exp(-(x*x+y*y)/dev)/(PI*dev);}void main(){vec4 color=vec4(0.0);float sumWeight=0.0;vec2 minCoord=vec2(0.0);vec2 maxCoord=vec2(1.0);float fx;float fy;for(int y=-$radius;y<=$radius;y++)for(int x=-$radius;x<=$radius;x++){fx=float(x);fy=float(y);vec2 coord=vec2(vTexCoord.x+fx*uPixelOffset.x,vTexCoord.y+fy*uPixelOffset.y);coord=clamp(coord,minCoord,maxCoord);float weight=gaussianWeight(fx,fy);sumWeight+=weight;color+=texture2D(sImg,coord)*weight;}gl_FragColor=color/sumWeight;}',
  fragShader:function(radius){
    radius=radius||1;
    return GaussianBlurFilterSetting._fshader.replace(/\$radius/g,radius);
  }
};


