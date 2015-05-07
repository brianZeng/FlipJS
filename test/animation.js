/**
 * Created by 柏然 on 2014/12/13.
 */
describe('Construct Animation:', function () {
  var global=Flip.instance,task=global.defaultTask;
  describe('1.Animation.createOptProxy:', function () {
    it('proxy result contains .clock .elements', function () {
      var proxy = Flip.Animation.createOptProxy({selector:'.NO_ELE', duration: 0.5, abc: 3,persistAfterFinished:3});
      expect(proxy.result.duration).toBe(undefined);
      expect(proxy.result.persistAfterFinished).toBe(3);
      expect(Object.getOwnPropertyNames(proxy.result).length).toBe(3)
    });
  });
  describe('2.use Flip.animation() to construct an animation:', function () {
    it('2.ease function set by name or ease',function(){
      var ani=Flip.animate({
        ease:Flip.EASE.backIn
      });
      expect(ani.clock.ease).toBe(Flip.EASE.backIn);
      ani.clock.ease='backInOut';
      expect(ani.clock.ease).toBe(Flip.EASE.backInOut);
    });
    it('animation clock ticks when change:', function (done) {
      var tickSpy = jasmine.createSpy('tick'), finishSpy = jasmine.createSpy('finish');
      var ani = Flip.animate({duration: 0.2, range: 1, autoStart: true});
      ani.clock.once(Flip.Clock.EVENT_NAMES.TICK, function () {
        tickSpy();
        console.log(arguments);
      });
      ani.clock.once(Flip.Clock.EVENT_NAMES.FINISH, function () {
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
        debugger;
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
