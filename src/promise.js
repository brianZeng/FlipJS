/**
 * Created by 柏子 on 2015/1/29.
 */
(function(Flip){
  var strictRet=true,syncEnqueue;
  function enqueue(callback){
   syncEnqueue? callback():setTimeout(callback,0);
  }
  function Thenable(opt){
    if(!(this instanceof Thenable))return new Thenable(opt);
    this.then=opt.then;
    this.get=opt.get;
  }
  function castToPromise(value){
    if(value instanceof Animation)return value.promise;
    else if(value instanceof Array)return Promise.all(value.map(castToPromise));
    else if(likePromise(value))return value;
    throw Error('cannot cast to promise');
  }
  function resolvePromise(future){
    if(likePromise(future))return future;
    return new Thenable({
      then:function resolved(callback){
        try{
          return resolvePromise(castToPromise(acceptAnimation(callback(future))));
        }
        catch (ex){
          return rejectPromise(ex);
        }
      },
      get:function (proName){
        return proName? future[proName]:future;
      }
    })
  }
  function rejectPromise(reason){
    if(likePromise(reason))return reason;
    return new Thenable({
      then: function rejected(callback,errorback){
        try{
          return resolvePromise(errorback(reason));
        }
        catch (ex){
          return rejectPromise(ex);
        }
      }
    })
  }
  function Promise(resolver){
    if(!(this instanceof Promise))return new Promise(resolver);
    var resolvedPromise,pending=[],ahead=[],resolved;
    if(typeof resolver==="function")
        resolver(resolve,reject);
    else
      return acceptAnimation(resolver);
    function resolve(future){
      try{
        receive(acceptAnimation(future));
      }
      catch (ex){
        receive(undefined,ex);
      }
    }
    function reject(reason){
      receive(undefined,reason||new Error(''));
    }
    function receive(future,reason){
      if(!resolved){
        resolvedPromise=reason==undefined?resolvePromise(future):rejectPromise(reason);
        resolved=true;
        for(var i= 0,len=pending.length;i<len;i++)
        {
          enqueue(function(args,con){
            return function(){
              var ret=resolvedPromise.then.apply(resolvedPromise,args);
              if(con)ret.then.apply(ret,con);
            }
          }(pending[i],ahead[i]))
        }
        pending=ahead=undefined;
      }
    }
    function next(resolve,reject){
      ahead.push([resolve,reject]);
    }
    return new Thenable({
      then:function(thenable,errorBack){
        var _success=ensureThenable(thenable,function(v){return v}),
          _fail=ensureThenable(errorBack,function(e){throw e});
        if(resolvedPromise){
          enqueue(function(){resolvedPromise.then(_success,_fail); });
          return new Promise(function(resolver){resolvedPromise.then(resolver); })
        }
        else{
          pending.push([_success,_fail]);
          return new Promise(function(resolve,reject){next(resolve,reject);})
        }
      },
      get:function(proname){
        return resolvedPromise? resolvedPromise.get(proname):undefined;
      }
    })
  }
  function ensureThenable(obj,def){
    var t;
    if((t=typeof obj)==="object")
      return function(){return obj;};
    else if(t==="function")return obj;
    return def;
  }
  function acceptAnimation(obj){
    var t,ani;
    if(strictRet){
      if(obj instanceof Animation)return obj;
      if((t=typeof obj)=="object"){
        if(likePromise(obj))return obj;
        else if(obj instanceof Array)
          return obj.map(acceptAnimation);
        else{
          ani=Flip.animate(obj);
          if(obj.autoStart!==false)ani.start();
          return ani.promise;
        }
      }
      else if(typeof t==="function")
        return acceptAnimation(obj());
      throw Error('cannot cast to animation');
    }
    return obj;
  }
  function likePromise(obj){return obj instanceof Thenable}
  function promiseAll(promises){
    return new Promise(function(resolve,reject){
      var fail,num,r=new Array(num=promises.length);
      promises.forEach(function(promise,i){
        promise.then(function(pre){
          check(pre,i);
        },function(err){
          check(err,i,true);
        })
      });
      function check(value,i,error){
        if(!error){
          try{
            r[i]=value instanceof Animation? value:acceptAnimation(value);
          }
          catch (ex){
            error=ex;
         }
        }
        if(error){
          fail=true;
          r[i]=error;
        }
        if(num==1)fail? reject(r):resolve(r);
        else num--;
      }
    })
  }
  Promise.all=promiseAll;
  Promise.defer=function(){
    var defer={};
    defer.promise=Promise(function(resolver,rejector){
       defer.resolve=resolver;
       defer.reject=rejector;
    });
    return defer;
  };
  Promise.option=function(opt){
    if(!opt)return;
    strictRet=!!opt.acceptAnimationOnly;
    syncEnqueue=!!opt.sync;
  };
  FlipScope.Promise=Flip.Promise=Promise;
})(Flip);