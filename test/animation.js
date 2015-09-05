/**
 * Created by 柏然 on 2014/12/13.
 */
describe('Construct Animation:', function () {
  var global=Flip.instance,task=global.defaultTask;
  function now(){return Date.now()}
  function clamp(v,min,max){
    expect(v).toBeLessThan(max);
    expect(v).toBeGreaterThan(min);
  }
  function clampTime(millsec,base){
    console.log( millsec=millsec/1000);
    expect(millsec).not.toBeLessThan(base);
    expect(millsec).toBeLessThan(base*1.15+20);
  }
  describe('1.Animation create', function () {
    it('proxy result contains .clock .elements', function () {
      var opt={selector:'.NO_ELE', duration: 0.5, abc: 3,fillMode:'forever'},animation = new Flip.Animation(opt);
      expect(animation.clock.duration).toBe(0.5);
      expect(animation.fillMode).toBe('forever');
      expect(animation.abc).toBe(undefined);
    });
  });
  describe('2.use Flip.animate() to construct an animation:', function () {
    it('2.ease function set by name or ease',function(){
      var ani=Flip.animate({
        ease:Flip.EASE.backIn
      });
      expect(ani.clock.ease).toBe(Flip.EASE.backIn);
      ani.clock.ease='backInOut';
      expect(ani.clock.ease).toBe(Flip.EASE.backInOut);
    });
    it('animation clock update when change:', function (done) {
      var tickSpy = jasmine.createSpy('tick'), finishSpy = jasmine.createSpy('finish');
      var ani = Flip.animate({duration: 0.2, range: 1, autoStart: true});
      ani.clock.once('update', function () {
        tickSpy();
        console.log(arguments);
      });
      ani.clock.once('finish', function () {
        finishSpy(this.value);
        expect(tickSpy).toHaveBeenCalled();
        expect(finishSpy).toHaveBeenCalledWith(1);
        done();
      });
    });
  });
  describe('3.animation render flow',function(){
    var ani;
    function animationCount(){
      return Flip.instance.defaultTask._updateObjs.length
    }
    function construct(){
      if(!ani)
        ani=Flip.animate({
        duration:0.5,
        selector:'div',
        css:function(css){
          css.width=this.percent*100;
        }
      });
    }
    beforeEach(construct);
    function isNewAnimation(animation){
      expect(animation.lastStyleRule).toBeFalsy();
      expect(animation._promise).toBeFalsy();
      expect(animation.finished).toBeFalsy();
      expect(animation.percent).toBe(0);
    }

    it('auto add animation to default task',function(){
      var len=animationCount();
      Flip.animate({
        duration:0.5,
        selector:'.t-ani'
      });
      expect(len+1).toBe(animationCount());
    });
    it('when constructs an animation,it is new ',function(){
       isNewAnimation(ani);
    });
    it('after started emit update event',function(done){
      var notCall;
      ani.start();
      ani.once('update',function(){
        expect(ani.percent).toBe(0);
      });
      ani.once('render',function(){
        expect(ani.percent).toBe(0);
      });
      ani.once('finish',function(){
        expect(ani.percent).toBe(1);
        expect(ani.lastStyleRule.indexOf('width:100')).toBeGreaterThan(-1);
        notCall=jasmine.createSpy();
        ani.once('finish',notCall);
      });
      ani.once('finalize',function(){
        expect(notCall).not.toHaveBeenCalled();
        expect(ani.finished).toBe(true);
        ani=null;
        done();
      })
    });
    it('finalize do not rest an animation',function(done){
      isNewAnimation(ani);
      ani.clock.autoReverse=true;
      ani.start();
      ani.on('finalize',function(){
        expect(this.percent).toBe(0);
        done();
      })
    })
  });
  describe('4.restart animation',function(){
    it('add to last task if not specify',function(done){
      var ani= Flip.animate({
        duration:.2
      }),spy=jasmine.createSpy('onrestart'),t=Date.now();
      ani.start();
      ani.then(function(){
        ani.restart();
        ani.once('start',function(){
          expect(task._updateObjs).toContain(ani);
          spy();
        });
        return ani;
      }).then(function(last){
        expect(last).toBe(ani);
        expect(Date.now()-t).toBeGreaterThan(400);
        done();
      });
    });
    it('add to specify task',function(done){
      var ani= Flip.animate({
        duration:.1
      }),t2=global.getTask('t2',true);
      ani.start();
      ani.once('start',function(){
        expect(ani._task).toBe(task);

      }).then(function(){
        expect(ani._ltName).toBe(task.name);
        return ani.restart({task:t2}).once(function(){
          expect(ani._task).toBe(t2);
          expect(task._updateObjs).not.toContain(ani);
        })
      }).then(function(){
        expect(ani._ltName).toBe(t2.name);
        done();
      })
    })
  });
  describe('5.fillMode',function(){
    var task=Flip.instance.defaultTask;
    it('remove animation by default',function(done){
      var ani=Flip.animate({duration:.1,
        once:{
          finalize:function(){
            Flip.instance.once('frameEnd',function(){
              expect(task._updateObjs).not.toContain(ani);
              done();
            })
          }
        }})
    });
    it('never remove if keep', function (done) {
      var ani=Flip.animate({duration:.1,
        fillMode:'keep',
        once:{
        finish:function(){
          Flip.animate({duration:.1,once:{
            init:function(){
              expect(task._updateObjs).toContain(ani);
            },
            finalize:function(){
              tick=0;
              expect(task._updateObjs).toContain(ani);
              task.remove(ani);
            }
          }});
        },
          finalize: function () {
            expect(tick).toBe(0);
            done();
          }
      }}),tick=5;
    });
    it('snapshot remove animation but add its last css style to global', function (done) {
      var ani=Flip.animate({duration:.1,
        fillMode:'snapshot',
        once:{
        finalize:function(){
          expect(task._updateObjs).not.toContain(ani);
          expect(typeof ani.cancelStyle).toBe('function');
          done();
        }
      },css:{color:'#ccc'}})
    })
  });
  describe('6.hold',function(){
    it('1.next animation will be delayed by hold property',function(done){
      var t;
      Flip.animate({
        duration:.5,
        hold:.5,
        on:{
          start:function(){
            t=now();
          },
          hold:function(){
            clamp(now()-t,500,550);
            expect(this.finished).toBe(false);
          }
        }
      }).then({
        duration:.1,
        on:{
          start:function(){
            clamp(now()-t,1000,1100);
          },
          finish:function(){
            done();
          }
        }
      })
    })
  })
});
describe('css function',function(){
  it('Flip.css setImmediate css style',function(){
    var cancel= Flip.css('a',{color:'red'});
    expect(Flip.instance._persistStyles[cancel.id]).toBeTruthy();
    cancel();
    expect(Flip.instance._persistStyles[cancel.id]).toBeFalsy();
  });
  it('animation css overwrite and merge',function(done){
     var ani=Flip.animate({
       duration:.5,selector:'a',
       css:{
         '&:hover':{
           background:'#fff'
         }
       },
       once:{
         render:function(){
           expect(this.lastStyleRule).toContain('background:#fff');
           expect(this.lastStyleRule).toContain('border:none');
           expect(this._cssMap['&'].color).toBe('red');
           done();
         }
       }
     });
    ani.css({
      '&:hover':{
        border:'none'
      }
    });
    ani.css({color:'red'});
    ani.start();
  });

});
