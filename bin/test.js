xdescribe('Construct translate animation:', function () {
  it('1. .dx .dy stands for the translation distance:', function () {
    var ani = Flip.animation.translate({dx: 100, dy: 200});
    expect(ani.dx).toBe(100);
    expect(ani.dy).toBe(200);
  });
  it('2.create from Flip.animation:', function () {
    var ani = Flip.animation({animationType: 'translate', dx: 20, dy: 100, iteration: 10});
    expect(ani.dx).toBe(20);
    expect(ani.dy).toBe(100);
    expect(ani.clock.iteration).toBe(10);
  })


});
xdescribe('Construct Animation:', function () {
  xdescribe('1.Animation.createOptProxy:', function () {
    xit('proxy result contains .clock .elements', function () {
      var proxy = Flip.Animation.createOptProxy({elements: [], duration: 0.5, abc: 3});
      expect(proxy.result.elements).toEqual([]);
      expect(proxy.result.clock.duration).toBe(0.5);
      expect(Object.getOwnPropertyNames(proxy.result).length).toBe(2)
    });
    xit('.elements can be chosen by .selector', function () {
      var proxy = Flip.Animation.createOptProxy({selector: 'body'});
      expect(proxy.result.elements.length).toBe(1);
      var eles = [1, 2, 3];
      proxy = Flip.Animation.createOptProxy({selector: 'body', elements: eles});
      expect(proxy.result.elements).toBe(eles);
    });
  });
  describe('2.use Flip.animation() to construct an animation:', function () {

    it('first param can be animation type', function () {
      var ani = Flip.animation('translate');
      expect(ani instanceof Flip.Animation).toBeTruthy();
    });
    it('animation clock ticks when change:', function (done) {
      var tickSpy = jasmine.createSpy('tick'), finishSpy = jasmine.createSpy('finish');
      var ani = Flip.animation({duration: 0.2, range: 1, autoStart: true});
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
});

Flip(function () {
  describe('!Clock test', function () {
    var opt, clock, timestart;

    function createClock(option) {
      clock = Flip.Clock(opt = option);
      Flip.instance.add(clock);
      return clock;
    }

    function countOnFromFirstTick(clock) {
      firstTick(function (e) {
        timestart = e.timeline.last;
      }, clock);
    }

    function firstTick(func, C) {
      (C || clock).once(Flip.Clock.EVENT_NAMES.TICK, func);
    }

    function getInterval(now) {
      var i = now - timestart;
      console.log(i);
      return i;
    }

    describe('1.fire finished Events:', function () {
      afterEach(function () {
        clock.off();
      });
      it('i=0,reverse=0', function (done) {
        createClock({duration: 0.2});
        firstTick(function (e) {
          timestart = e.timeline.last;
        });
        clock.onfinished = function (e) {
          expect(this.value).toBe(1);
          expect(getInterval(e.timeline.now)).toBeGreaterThan(200);
          done();
        };
        clock.start();
      });
      it('i=0,reverse=1', function (done) {
        var clock = createClock({duration: 0.2, autoReverse: 1});
        countOnFromFirstTick(clock);
        expect(clock.autoReverse).toBeTruthy();
        var spy = jasmine.createSpy('reverse');
        clock.onreverse = function () {
          spy();
        };
        clock.onfinished = function (e) {
          expect(this.value).toBe(0);
          expect(spy.calls.count()).toBe(1);
          expect(getInterval(e.timeline.now)).toBeGreaterThan(400);
          done();
        };
        clock.start();

      });
      it('i=2', function (done) {
        var clock = createClock({duration: 0.2, iteration: 2});
        countOnFromFirstTick(clock);
        var spy = jasmine.createSpy('iterate');
        clock.oniterate = function () {
          spy();
        };
        clock.onfinished = function (e) {
          expect(spy.calls.count()).toBe(clock.iteration);
          expect(getInterval(e.timeline.now)).toBeGreaterThan(600);
          done();
        };
        clock.start();
      });
      it('i=3,reverse=1', function (done) {
        var clock = createClock({
          duration: 0.1,
          iteration: 3,
          autoReverse: 1
        }), spyI = jasmine.createSpy('iterate'), spyR = jasmine.createSpy('reverse');
        countOnFromFirstTick(clock);
        clock.oniterate = spyI;
        clock.onreverse = spyR;
        clock.onfinished = function (e) {
          expect(spyR.calls.count()).toBe(4);
          expect(spyI.calls.count()).toBe(3);
          expect(getInterval(e.timeline.now)).toBeGreaterThan((clock.iteration + 1) * 200);
          done();
        };
        clock.start();
      })
    });
  });
});

describe('test build in renderScope:', function () {
  it('automatic init when domReady:', function () {
    var spy = spyOn(console, 'warn');
    Flip.instance.init();
    expect(spy).toHaveBeenCalled();
  });
  it('automatic add animation created by Flip.animation', function () {
    var ani = Flip.animate('translate');
    expect(Flip.instance.activeTask._updateObjs).toContain(ani);
  });
});