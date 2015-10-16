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
    finalizeAnimation(animation);
  }
  renderState.animatetion=null;
  return true;
}

function renderAnimation(ani,state){
  state.animation = ani;
  updateAnimationCss(ani);
  state.styleStack.push.apply(state.styleStack,getAnimationStyles(ani));
  ani.emit(EVENT_RENDER, state);
  if(ani._finished)ani.emit(EVENT_FINISH,state);
  state.animation = null;
}
function updateAnimationParam(animation){
  var p=animation.percent,cur=animation.current=Object.create(animation._immutable);
  objForEach(animation._variable,function(value,key){
    cur[key]=isFunc(value)? value(p,cur):(isNaN(value)?value:p*value);
  });
}
function updateAnimationCss(animation){
  var cssMap=animation._cssMap={},cssRule,cur=animation.current;
  objForEach(animation._cssCallback,function(cbs,selector){
    cssRule=new CssProxy();
    cbs.forEach(function(cb){resolveCss(cb,animation,cssRule,cur)});
    mergeRule(cssMap,selector,cssRule);
  });
  objForEach(animation._matCallback,function(cbs,selector){
    var mat=new Mat3(),arg=[mat,cur];
    cssRule=new CssProxy();
    cbs.forEach(function(cb){mat=cb.apply(animation,arg)||mat});
    cssRule.withPrefix('transform',mat.toString());
    mergeRule(cssMap,selector,cssRule);
  });
}
function resolveCss(rule,thisObj,cssProxy,e){
  var ret=cssProxy||new CssProxy(),arg=[ret,e];
  if(isObj(rule))
    objForEach(rule,cloneFunc,ret);
  else if(isFunc(rule))
     ret=rule.apply(thisObj,arg)||ret;
  return ret;
}
function getStyleRuleStr(ruleObj,selector,separator,ignoreEmpty){
  separator=separator||';';
  var cssText=CssProxy.toSafeCssString(ruleObj,separator);
  if(!cssText)return '';
  return selector +'{'+separator+cssText+separator+'}';
}
function addMap(key,Map,cb){
  var cbs=Map[key];
  if(!cbs)Map[key]=[cb];
  else arrAdd(cbs,cb);
}
function getAnimationStyles(ani){
  var styles=[],slt=ani.selector||'';
  objForEach(ani._cssMap,function(ruleObj,selector){
    styles.push(getStyleRuleStr(ruleObj,selector.replace(/&/g,slt)));
  });
  return ani.lastStyleRules=styles;
}
function mergeRule(map,selector,cssProxy){
  var oriRule=map[selector];
  if(oriRule)
    oriRule.merge(cssProxy);
  else map[selector]=cssProxy;
}