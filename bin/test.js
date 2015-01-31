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
describe('animation promise',function(){
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