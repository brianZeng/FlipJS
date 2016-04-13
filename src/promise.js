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
    if(value instanceof Array)return Promise.all(value.map(castToPromise));
    if(likePromise(value)) return value;
    if(!strictRet)return warpPromiseValue(value);
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
      },
      get: function (pro) {return pro ? reason[pro]:reason;}
    })
  }

  /**
   * @namespace Flip.Promise
   * @param {function|Flip.Animation|AnimationOptions} resolver
   * @returns {Thenable}
   * @constructor
   */
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
        var handler=[ensureThenable(thenable,function(v){return v}),ensureThenable(errorBack,function(e){throw e})];
        if(resolvedPromise)
          return warpPromiseValue(resolvedPromise.then.apply(resolvedPromise,handler))
        else{
          pending.push(handler);
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
    var t;
    if(strictRet){
      if(obj instanceof Animation)return obj._finished? obj:obj.promise;
      if((t=typeof obj)=="object"){
        if(likePromise(obj))return obj;
        else if(obj instanceof Array)
          return obj.map(acceptAnimation);
        else{
          return Flip.animate(obj).promise;
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
      if (!promises.length) {
        return resolve(r);
      }
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

  /**
   * continue when all promises finished
   * @memberof Flip.Promise
   * @param {Array<Flip.Promise|AnimationOptions|function>}
   * @returns Flip.Promise
   */
  Promise.all=promiseAll;
  /**
   * @memberof Flip.Promise
   * @returns {{resolve:function,reject:function,promise:Flip.Promise}}
   */
  Promise.defer=function(){
    var defer={};
    defer.promise=Promise(function(resolver,rejector){
       defer.resolve=resolver;
       defer.reject=rejector;
    });
    return defer;
  };
  Promise.resolve = function (any){
    return (any && isFunc(any.then)) ? digestThenable(any) : warpPromiseValue(any);
  };
  Promise.reject=function(reason){
    return Promise(function(resolve,reject){
      reject(reason);
    })
  };
  Promise.digest = digestThenable;
  Promise.option=function(opt){
    if(!opt)return;
    strictRet=!!opt.acceptAnimationOnly;
    syncEnqueue=!!opt.sync;
  };
  FlipScope.Promise=Flip.Promise=Promise;
  function digestThenable(thenable){
    return Promise(function (resolve, reject){
      thenable.then(resolve, reject);
    })
  }

  function warpPromiseValue(any){
    return Promise(function (resolve){
      resolve(any);
    })
  }
})(Flip);