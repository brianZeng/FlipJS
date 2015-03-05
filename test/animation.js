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
    it('first param can be animation type', function () {
      var ani = Flip.animate('translate');
      expect(ani instanceof Flip.Animation).toBeTruthy();
    });
    it('animation clock ticks when change:', function (done) {
      var tickSpy = jasmine.createSpy('tick'), finishSpy = jasmine.createSpy('finish');
      var ani = Flip.animate({duration: 0.2, range: 1, autoStart: true});
      ani.clock.once(Flip.Clock.EVENT_NAMES.TICK, function () {
        tickSpy();
        console.log(arguments);
      });
      ani.clock.once(Flip.Clock.EVENT_NAMES.FINISHED, function () {
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
        expect(ani._invalid).toBeTruthy();
      });
      ani.once('render',function(){
        expect(ani.percent).toBe(0);
        expect(ani._invalid).toBeFalsy();
      });
      ani.once('finished',function(){
        expect(ani.percent).toBe(1);
        expect(ani.lastStyleRule.indexOf('width:100')).toBeGreaterThan(-1);
        notCall=jasmine.createSpy();
        ani.once('finished',notCall);
      });
      ani.once('finalized',function(){
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
      ani.on('finalized',function(){
        expect(this.percent).toBe(0);
        done();
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
});
