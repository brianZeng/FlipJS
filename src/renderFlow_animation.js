/**
 * Created by Administrator on 2015/3/6.
 */

function updateAnimation(animation, renderState) {
  var clock = animation.clock;
  renderState.animation = animation;
  if (updateClock(clock, renderState)) {
    animation.invalid();
    updateAnimationParam(animation);
    animation.emit(EVENT_UPDATE, renderState);
  }
  if (clock.finished) {
    //trigger finished event after render
    animation._finished = true;
    finalizeAnimation(animation, renderState);
  }
  renderState.animatetion = null;
  return true;
}
function finalizeAnimation(animation) {
  var fillMode = animation.fillMode;
  if (animation.fillMode !== FILL_MODE.KEEP) {
    animation.finalize();
    if (fillMode === FILL_MODE.SNAPSHOT) {
      animation.cancelStyle = FlipScope.global.immediate(animation.lastStyleText());
    }
  }
}
function renderAnimation(ani, state) {
  var styleStack = state.styleStack;
  state.animation = ani;
  styleStack.push.apply(styleStack, renderAnimationCssProxies(ani));
  renderAnimationTransform(ani, state.transformMap);
  ani.emit(EVENT_RENDER, state);
  if (ani._finished) {
    ani.emit(EVENT_FINISH, state);
  }
  state.animation = null;
}
function updateAnimationParam(animation) {
  var p = animation.percent, cur = animation.current = objAssign({}, animation._immutable);
  objForEach(animation._variable, function (value, key) {
    cur[key] = isFunc(value) ? value(p, cur) : (isNaN(value) ? value : p * value);
  });
}
function renderAnimationCssProxies(animation, noUpdate) {
  var param = animation.current, results = [], animationSelector = animation.selector;
  objForEach(animation._cssHandlerMap, function (cbs, selector) {
    var globalSelector = selector.replace(/&/g, animationSelector),
      rules = [];
    cbs.forEach(function (handler) {
      var cssText = resolveCss(handler.cb, handler.proxy, animation, param, noUpdate).$toCachedCssString();
      if (cssText) {
        rules.push(cssText)
      }
    });
    if (globalSelector && rules.length) {
      results.push({ selector: globalSelector, rules: rules })
    }
  });
  return results;
}
function renderAnimationTransform(animation, matCache) {
  var animationSelector = animation.selector, param = animation.current;
  objForEach(animation._matHandlerMap, function (cbs, selector) {
    var globalSelector = selector.replace(/&/g, animationSelector),
      mat = getMat3BySelector(matCache, globalSelector);
    cbs.forEach(function (callback) {
      mat = callback.call(animation, mat, param) || mat;
      if (!(mat instanceof Mat3)) {
        throw Error('Transform function should return an instance of Flip.Mat3');
      }
    });
    globalSelector && (matCache[globalSelector] = mat);
  });
}
function getMat3BySelector(map, selector) {
  var mat = map[selector];
  if (!mat) {
    mat = new Mat3();
    if (selector) {
      map[selector] = mat;
    }
  }
  return mat;
}
function resolveCss(callbackOrRuleObj, cssProxy, thisObj, e, noUpdate) {
  if (!noUpdate) {
    if (isObj(callbackOrRuleObj)) {
      cssProxy.$merge(callbackOrRuleObj);
    } else if (isFunc(callbackOrRuleObj)) {
      callbackOrRuleObj.apply(thisObj || cssProxy, [cssProxy, e]);
    } else if (isStr(callbackOrRuleObj)) {
      parseCssText(callbackOrRuleObj, cssProxy);
    }
  }
  return cssProxy;
}
