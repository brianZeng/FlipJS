/**
 * Created by 柏子 on 2015/1/29.
 */
xdescribe('promise test',function(){
  var Promise=Flip.Promise;
  beforeEach(function(){
    Promise.checkRetAnimation(false);
  });
  afterEach(function(){
    Promise.checkRetAnimation(true);
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
        done();});
    ani.start();
  });
  it('animation follow many animations',function(done){
    var ani=Flip.animate({selector:'div',duration:0.2}),nextAni;
    ani.follow(function(){
        nextAni=Flip.animate({selector:'div',duration:0.2,animationType:'flip'});
        nextAni.then(function(pre){
          expect(pre.type).toBe('flip');
        });
        return nextAni.start();
      },{selector:'div',duration:0.2}).then(function(ans){
        expect(ans.length).toBe(2);
        done();
      });
    ani.start();
  })
});