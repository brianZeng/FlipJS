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
function finalizeAnimation(animation){
  var fillMode=animation.fillMode;
  if(animation.fillMode!==FILL_MODE.KEEP){
    animation.finalize();
    if(fillMode===FILL_MODE.SNAPSHOT)
      animation.cancelStyle=FlipScope.global.immediate(animation.lastStyleText());
  }
}
function renderAnimation(ani,state){
  var styleStack=state.styleStack;
  state.animation = ani;
  styleStack.push.apply(styleStack,renderAnimationCssProxies(ani));
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
function renderAnimationCssProxies(animation,noUpdate){
  var param=animation.current,results=[],body,animationSelector=animation.selector;
  objForEach(animation._cssHandlerMap,function(cbs,selector){
    body=cbs.map(function(handler){return resolveCss(handler.cb,handler.proxy,animation,param,noUpdate).$toCachedCssString(true)});
    results.push(combineStyleText(selector.replace(/&/g,animationSelector),body.join(';')));
  });
  return results;
}
function resolveCss(callbackOrRuleObj,cssProxy,thisObj,e,noUpdate){
  if(!noUpdate){
    if(isObj(callbackOrRuleObj))
      cssProxy.$merge(callbackOrRuleObj);
    else if(isFunc(callbackOrRuleObj))
      callbackOrRuleObj.apply(thisObj||cssProxy,[cssProxy,e]);
  }
  return cssProxy;
}
