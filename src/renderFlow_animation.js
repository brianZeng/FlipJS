/**
 * Created by Administrator on 2015/3/6.
 */

function updateAnimation(animation,renderState){
  var clock=animation.clock;
  renderState.animation=animation;
  if(updateClock(clock,renderState)){
    animation.invalid();
    updateAnimationParam(animation);
    animation.emit(EVENT_UPDATE, renderState);
  }
  if(clock.finished){
    //trigger finished event after render
    animation._finished=true;
    finalizeAnimation(animation,renderState);
  }
  renderState.animatetion=null;
  return true;
}

function renderAnimation(ani,state){
  state.animation = ani;
  state.styleStack.push(updateAnimationCssProxies(ani));
  ani.emit(EVENT_RENDER, state);
  if(ani._finished)
    ani.emit(EVENT_FINISH,state);
  state.animation = null;
}
function updateAnimationParam(animation){
  var p=animation.percent,cur=animation.current=Object.create(animation._immutable);
  objForEach(animation._variable,function(value,key){
    cur[key]=isFunc(value)? value(p,cur):(isNaN(value)?value:p*value);
  });
}
function updateAnimationCssProxies(animation){
  var cssProxyMap=animation._cssMap,param=animation.current,proxies,results,retMap={},animationSelector=animation.selector;
  objForEach(animation._cssCallback,function(cbs,selector){
    proxies=cssProxyMap[selector];
    retMap[selector.replace(/&/g,animationSelector)]=results=[];
    cbs.forEach(function(cb,i){results.push(resolveCss(cb,animation,proxies[i],param)); });
  });
  return retMap;
}
function resolveCss(rule,thisObj,cssProxy,e){
  var ret=cssProxy;
  if(isObj(rule))
    ret.$merge(rule);
  else if(isFunc(rule))
    ret=rule.apply(thisObj,[ret,e])||ret;
  return ret;
}
function addMap(key,Map,cb){
  var cbs=Map[key];
  if(!cbs)Map[key]=[cb];
  else arrAdd(cbs,cb);
}