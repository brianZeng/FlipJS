/**
 * Created by 柏然 on 2014/12/13.
 */
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
/**
 * Created by 柏然 on 2014/12/13.
 */
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
describe('css function',function(){
  it('Flip.css setImmediate css style',function(){
    var cancel= Flip.css('a',{color:'red'});
    expect(Flip.instance._persistStyles[cancel.id]).toBeTruthy();
    cancel();
    expect(Flip.instance._persistStyles[cancel.id]).toBeFalsy();
  })
});

/**
 * Created by 柏子 on 2015/3/1.
 */
describe('clock test',function(){
  it('support delay',function(done){
    var ani=Flip.animate({duration:0.2,delay:1,once:{
      update:function(){
        expect(Date.now()-t1).toBeGreaterThan(1000)
      },
      finished:function(){
        expect(Date.now()-t1).toBeGreaterThan(1200);
        done();
      }
    }}),t1=Date.now();
    ani.start();
  });
  it('not delay when revert',function(done){
    var t1=Date.now(),ani=Flip.animate({duration:0.5,delay:0.5,autoReverse:1,once:{
      update:function(){
        expect(Date.now()-t1).toBeGreaterThan(500);
      },
      finished:function(){
        expect(Date.now()-t1).toBeLessThan(1700);
        done();
      }
    }});
    ani.clock.once('reverse',function(){
      expect(Date.now()-t1).toBeGreaterThan(1000);
      expect(Date.now()-t1).toBeLessThan(1100);
    });
    ani.start();
  });
  it('not delay when iterate',function(done){
    var t1=Date.now(),ani=Flip.animate({duration:0.5,delay:0.5,iteration:1,once:{
      update:function(){
        expect(Date.now()-t1).toBeGreaterThan(500);
      },
      finished:function(){
        expect(Date.now()-t1).toBeLessThan(600);
        expect(Date.now()-t1).toBeGreaterThan(500);
        done();
      }
    }});
    ani.clock.once('iterate',function(){
      expect(Date.now()-t1).toBeGreaterThan(1000);
      expect(Date.now()-t1).toBeLessThan(1100);
      t1=Date.now();
    });
    ani.start();
  })
});
/**
 * Created by 柏子 on 2015/2/9.
 */
describe('interpolation basic test',function(){
  var data=[[0,0],[10,10],[20,20]],itpl;
  function pointEquals(p1,p2){
    expect(Flip.Vec.get(p1,'x')).toBeCloseTo(Flip.Vec.get(p2,'x'));
    expect(Flip.Vec.get(p1,'y')).toBeCloseTo(Flip.Vec.get(p2,'y'));
  }
  itpl=Flip.interpolate('linear',data);
    it('1.interpolate point',function(){
      pointEquals(itpl.when(0),data[0]);
      pointEquals(itpl.when(0.5),data[1]);
      pointEquals(itpl.when(1),data[2]);
    });
  it('2.interpolate derivative point',function(){
    expect(itpl.deriveWhen(0)).toBe(1);
    expect(itpl.deriveWhen(0.5)).toBe(1);
    expect(itpl.deriveWhen(1)).toBe(1);
  })
});
/**
 * Created by 柏子 on 2015/1/29.
 */
xdescribe('promise test',function(){
  var Promise=Flip.Promise;
  beforeEach(function(){
    Promise.option({acceptAnimationOnly:false});
  });
  afterEach(function(){
    Promise.option({acceptAnimationOnly:true});
  });
  it('resolve later',function(done){
   var promise= Promise(function(resolve){
      setTimeout(function(){
        resolve('a')
      })
    });
    promise.then(function(a){
      expect(a).toBe('a');
      return 'b';
    }).then(function(b){
      expect(b).toBe('b');
     return 'c';
    }).then(function(c){
      expect(c).toBe('c');
    });
    promise.then(function(a){
      expect(a).toBe('a');
    });
    promise.then(function(a){
      expect(a).toBe('a');
    });
    promise.then(function(a){
      expect(a).toBe('a');
      return 'e';
    }).then(function(e){
      expect(e).toBe('e');
      done();
    });
  });
  it('receive promise',function(done){
    var a=Promise(function(resolve){
      setTimeout(function(){
        resolve('a');
      },100);
    }),b=Promise(function(resolve){
      setTimeout(function(){
        resolve('b');
      },10);
    });
    a.then(function(a){
      expect(a).toBe('a');
      return b;
    }).then(function(b){
      expect(b).toBe('b');
    });
    b.then(function(b){
      expect(b).toBe('b');
      done();
    })
  });
  it('reject error',function(done){
    var a=new Promise(function(resolve,reject){
       setTimeout(function(){
         reject(new Error('a'));
       },10);
    });
    a.then(function(){
      expect('not go here').toBeFalsy();
    },function(error){
      expect(error.message).toBe('a');
    }).then(function(){
      throw Error('b');
    }).then(function(){
      expect('not go here').toBeFalsy();
    },function(err){
      expect(err.message).toBe('b');
    });
    Promise(function(resolve,reject){
      setTimeout(function(){
        reject(new Error('c'));
      },200)
    }).then(function(){
    }).then(function(){
      expect('not go here').toBeFalsy();
    },function(err){
      expect(err.message).toBe('c');
    });
    Promise(function(resolve){
      setTimeout(function(){
        resolve();
      },300)
    }).then(function(){
      throw Error('d')
    },function(){
      expect('not go here').toBeFalsy();
    }).then(function(){
      expect('not go here').toBeFalsy();
    },function(err){
      expect(err.message).toBe('d');
      return 'd';
    }).then(function(d){
      expect(d).toBe('d');
      done();
    })
  })
});
xdescribe('animation promise',function(){
  var Promise=Flip.Promise;
  it('accept animation',function(done){
    var opt={
      selector:'*',duration:0.1
    },ani;
    ani=Flip.animate(opt);
    var d=Date.now();
    ani.then({selector:'div',duration:0.2,animationType:'translate'}).
      then({selector:'div',duration:0.2,animationType:'rotate'}).
      then(function(){
        expect(Date.now()-d).toBeGreaterThan(400);
        done();
      });
    ani.start();
  });
  it('animation follow many animations',function(done){
    var ani=Flip.animate({selector:'div',duration:1}),now=Date.now();
    ani.follow({selector:'div',duration:0.2,animationType:'flip'},{selector:'div',duration:0.5}).
      then(function(ans){
        expect(ans.length).toBe(2);
        expect(ans.every(function(ani){return ani.finished})).toBe(true);
        expect(Date.now()-now).toBeGreaterThan(1500);
        done();
      });
    ani.start();
  });
  it('support continue with a promise',function(done){
     var ani=Flip.animate({selector:'div',animationType:'rotate',duration:0.2});
    ani.then(function(){
      return Flip.Promise(function(resolve){
        setTimeout(function(){
          resolve({selector:'div',animationType:'scale',duration:0.3})
        },500);
      });
    }).then(function(pre){
      expect(pre.finished).toBe(true);
      expect(pre.type).toBe('scale');
      done();
    });
    ani.start();
  })
});