/**
 * Created by Administrator on 2015/3/12.
 */
describe('interrupt animation',function(){
  var ani,opt;
  function setAni(option){
    ani=Flip.animate(opt=(option||{duration:0.1}));
    ani.start();
    return ani;
  }
  function clamp(v,min,max){
    expect(v).toBeGreaterThan(min);
    expect(v).toBeLessThan(max);
  }
   it('pause and resume',function(done){
     var pauseSpy=jasmine.createSpy('paused'),onresume=jasmine.createSpy('resumed'),t1=Date.now();
     setAni({duration:0.1,once:{
       pause:pauseSpy,
       resume:onresume,
       start:function(){
         ani.pause();
         t1=Date.now();
         setTimeout(function(){ani.resume()},300);
       }
     }}).then(function(ani){
       clamp(Date.now()-t1,300,630);
       expect(pauseSpy).toHaveBeenCalled();
       expect(onresume).toHaveBeenCalled();
       done();
     });
   });
  it('cancel -> reset -> start',function(done){
      var oncancel=jasmine.createSpy('canceled'),t1;
      setAni({
        duration:.1,
        once:{
          cancel:oncancel,update:function(){
            ani.cancel();
          }
        }
      }).then(function(){
        expect(true).toBe(false);
      },function(){
        setTimeout(function(){ani.start()},300);
        ani.once('init',function() {
          clamp(Date.now()-t1,300,330);
          t1=Date.now();
        });
        t1=Date.now();
        return ani.reset();
      }).then(function(){
        clamp(Date.now()-t1,100,110);
        expect(oncancel).toHaveBeenCalled();
        done();
      })
  });
  it('cancel -> restart',function(done){
    var oncancel=jasmine.createSpy('canceled'),t1;
    setAni({
      duration:.1,
      once:{
        cancel:oncancel,
        update:function(){
          ani.cancel();
        }}
    }).then(function(){
      expect(true).toBe(false);
    },function(){
      t1=Date.now();
      return ani.restart();
    }).then(function(){
      clamp(Date.now()-t1,100,136);
      expect(oncancel).toHaveBeenCalled();
      done();
    })
  })
});