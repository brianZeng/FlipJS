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
  it('1accept animation',function(done){
    var opt={
      selector:'*',duration:0.1
    },ani;
    ani=Flip.animate(opt);
    var d=Date.now();
    ani.then({selector:'div',duration:0.2}).
      then({selector:'div',duration:0.2}).
      then(function(){
        expect(Date.now()-d).toBeGreaterThan(400);
        done();
      });
    ani.start();
  });
  it('2 animation::then accept array of animations',function(done){
    var ani=Flip.animate({selector:'div',duration:1}),now=Date.now();
    ani.then([{selector:'div',duration:0.2},{selector:'div',duration:0.5}]).
      then(function(ans){
        expect(ans.length).toBe(2);
        expect(ans.every(function(ani){return ani.finished})).toBe(true);
        expect(Date.now()-now).toBeGreaterThan(1500);
        done();
      });
    ani.start();
  });
  it('3support continue with a promise',function(done){
     var ani=Flip.animate({selector:'div',duration:0.2});
    ani.then(function(){
      return Flip.Promise(function(resolve){
        setTimeout(function(){
          resolve({selector:'#uni',duration:0.3})
        },500);
      });
    }).then(function(pre){
      expect(pre.finished).toBe(true);
      expect(pre.selector).toBe('#uni');
      done();
    });
    ani.start();
  });
  it('4. digest other promise',function(done){
    expect(typeof window.Promise).toBe('function');
    expect(window.Promise).not.toBe(Promise);
    Promise.option({acceptAnimationOnly:1,sync:0});
    var last=Date.now();
    Promise.digest(window.Promise.resolve({duration:.1})).then(function(animation){
      expect(animation instanceof Flip.Animation).toBeTruthy();
      expect(Date.now()-last).toBeGreaterThan(100);
      done();
    },function(){
      expect(1).toBe(0);
      done();
    });
  })
});