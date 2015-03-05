/**
 * Created by 柏然 on 2014/12/13.
 */
describe('Construct translate animation:', function () {
  it('1. .dx .dy stands for the translation distance:', function () {
    var ani = Flip.animation.translate({dx: 100, dy: 200});
    expect(ani.dx).toBe(100);
    expect(ani.dy).toBe(200);
  });
  it('2.create from Flip.animation:', function () {
    var ani = Flip.animate({animationType: 'translate', dx: 20, dy: 100, iteration: 10});
    expect(ani.dx).toBe(20);
    expect(ani.dy).toBe(100);
    expect(ani.clock.iteration).toBe(10);
  });
  xit('work will',function(){
    var ani = Flip.animate('translate',{dx: 100, dy: 200,selector:'div',duration:2});
    ani.start();
  })
});
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
    it('finalize do not rest an animation',function(){
      isNewAnimation(ani);
      ani.start();
      ani.on('finalized',function(){

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

/**
 * Created by 柏子 on 2015/2/9.
 */
xdescribe('interpolation basic test',function(){
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
 * Created by Administrator on 2015/3/5.
 */
describe('multi task',function(){
  var anotherTask=Flip.instance.getTask('second',true),defaultTask=Flip.instance.defaultTask;
  function aniCount(task){return task._updateObjs.length}
  it('1.a renderGlobal render all of its tasks',function(done){
    var i= 2,t1,t2;
    function allRun(){
      if(i==0){
        expect(anotherTask).toBeTruthy();
        expect(defaultTask).toBeTruthy();
        done();
      }
    }
    anotherTask.once('update',function(){
      t1=anotherTask;
      allRun(--i);
    });
    defaultTask.once('update',function(){
      t2=defaultTask;
      allRun(--i);
    })
  });
  it('2.when construct a animation set taskName to change the task it belongs',function(){
    var ac=aniCount(anotherTask),dc=aniCount(defaultTask);
    Flip.animate({
      duration:.3,
      taskName:anotherTask.name
    });
    expect(ac+1).toBe(aniCount(anotherTask));
    expect(dc).toBe(aniCount(defaultTask));
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