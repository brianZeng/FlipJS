/**
 * Created by Administrator on 2015/3/5.
 */
describe('clock test',function(){
  var opt={},clock,t1,t2,t3;
 function setClock(option){
   if(option) opt=option;
    clock=Flip.Clock(opt);
    Flip.instance.defaultTask.add(clock);
    clock.start();
   return clock
  }
  function now(){return Date.now()}
  function clamp(v,max,min){
    expect(v).toBeLessThan(max);
    expect(v).toBeGreaterThan(min);
  }
  function clampTime(millsec,base){
   console.log( millsec=millsec/1000);
    expect(millsec).not.toBeLessThan(base);
    expect(millsec).toBeLessThan(base*1.15+20);
  }
  it('1.support autoReverse',function(done){
    var t1,dur=.2,t2,t3;
    setClock(opt={
      duration:dur,
      autoReverse:1
    });

    clock.on('start',function(){
      t1=Date.now();
    });
    clock.on('reverse',function(){
      clampTime((t2=now())-t1,dur);
      //clamp((t2=now())-t1,dur*1190,dur*1000);
    });
    clock.on('finish',function(){
      clampTime(now()-t1,dur*2);
      done();
    });
  });
  it('2.support delay',function(done){
    setClock({delay:.3,duration:.2}).on('init',function(){
      t1=now();
    }).once('start',function(){
      clampTime(now()-t1,.3);
    }).on('finish',function(){
      clampTime(now()-t1,.4999);
      done();
    });
  });
  it('3.support iteration',function(done){
    setClock({duration:.2,iteration:2}).on('start',function(){
      t1=now();
    }).on('iterate',function(){clampTime(now()-t1,.2)})
      .on('finish',function(){ clampTime(now()-t1,.4);done()})
  });
  it('6.support hold time',function(done){
    setClock({duration:.2,hold:.3}).on('start',function(){
      t1=now();
    }).once('hold',function(){
      clampTime(now()-t1,.2)
    }).once('finish',function(){
      clampTime(now()-t1,.5);
      done();
    })
  });
  it('4.when infinite,emits iterate event',function(done){
    var i=5;
    setClock({duration:.2,infinite:true}).on('start',function(){
      t1=now();
    }).on('iterate',function(){
      clampTime(now()-t1,.2*(6-i));
      if(--i==0){
        clock.finalize();
      }
    }).on('finalize',done);
  });
  it('5.when infinite and autoReverse,emits reverse and reverse events',function(done){
    var i=2;
    setClock({duration:.1,infinite:true,autoReverse:true}).on('start',function(){
      t1=now();
    }).on('reverse',function(){
      i--;
    }).on('iterate',function(){
      if(i==0){
        clampTime(now()-t1,.4);
        done();
      }
    })
  });

});