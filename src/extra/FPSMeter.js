function FPSMeter(opt){
  if(!(this instanceof FPSMeter))return new FPSMeter(opt);
  this.sections={};
}
inherit(Flip.FPSMeter=FPSMeter,Flip.Render.prototype,{
  start:function(sectionName){
    this.sections[sectionName||nextUid('fps-section')]={
      _startTime:0,
      _lastStop:0,
      disabled:0,
      fps:[],
      frameCount:0
    };
  },update:function(e){
    var now= e.timeline.now,last;
    objForEach(this.sections,function(section){
      if(!section.disabled){
        if(!section._startTime)
          section._startTime=section._lastStop=now;
        else{
          section.frameCount++;
          last=section._lastStop;
          section._lastStop=now;
          section.fps.push(1000/(now-last))
        }
      }
    });
  },
  end:function(sectionName){
    var section;
    if(arguments.length==1){
      if(section=this.sections[sectionName])section.disabled=1;
    }else
      objForEach(this.sections,function(section){section.disabled=1});
    return section;
  },
  analyze:function(section){
    var fps=section.fps,startTime=section._startTime,endTime=section._lastStop,dur=(endTime-startTime)/1000;
    return {
      duration:dur,
      startTime:startTime,
      avgFPS:fps.reduce(function(pre,n){return pre+n},0)/fps.length,
      fps:section.fps.slice(0)
    }
  }
});