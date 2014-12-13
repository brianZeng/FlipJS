/**
 * Created by 柏然 on 2014/12/13.
 */
function Animation(opt) {
  var r = Animation.createOptProxy(opt).result;
  this.elements = r.elements;
  this.clock = r.clock;
}
Animation.createOptProxy = function (setter, elements) {
  var selector;
  setter = createProxy(setter);
  if (!setter.proxy.clock)
    setter('clock', new Clock(setter));
  if ((selector = setter.proxy.selector) && !setter.proxy.elements)
    elements = Flip.$$(selector);
  setter('elements', elements);
  return setter;
};
Flip.Animation = Animation;
Flip.ANIMATION_TYPE = {};
Animation.EVENT_NAMES = {
  UPDATE: 'update'
};
(function () {
  var idCache = {};

  function main() {
    var firstParam = typeof arguments[0], constructor, opt, animation, aniOpt;
    if (firstParam === "string") {
      constructor = main[arguments[0]];
      opt = arguments[1];
    }
    else if (firstParam === "object") {
      constructor = main[arguments[0].animationType];
      opt = arguments[0];
    }
    if (!constructor) throw Error('undefined animation type');
    aniOpt = main.createOptProxy(opt, 0, 0, 1).result;
    animation = new constructor(opt);
    if (aniOpt.defaultGlobal)
      (FlipScope.global._tasks.findBy('name', aniOpt.taskName) || FlipScope.global.activeTask).add(animation);
    if (aniOpt.autoStart) animation.start();
    return animation;
  }

  main.createOptProxy = function (setter, autoStart, taskName, defaultGlobal) {
    setter = createProxy(setter);
    setter('autoStart', autoStart);
    setter('taskName', taskName);
    setter('defaultGlobal', defaultGlobal);
    return setter;
  };
  Flip.animation = main;
  function getCSS(ele) {
    return ele.currentStyle || window.getComputedStyle(ele)
  }

  function normalizeEleTransformStyle(ele) {
    var style = ele.style;
    style.transformOrigin = 'center';
    if (getCSS(ele).position !== 'fixed')style.position = 'absolute';
  }

  function getAniId(type) {
    type = type || '*';
    var i = idCache[type] || 0;
    idCache[type] = i++;
    return '_F_' + type + ':' + i;
  }

  function invalidWhenTick(o, v, state) {
    state.animation.invalid();
    state.animation.emit(Animation.EVENT_NAMES.UPDATE, state);
  }

  function removeWhenFinished(o, v, state) {
    state.animation.destroy(state);
  }

  inherit(Animation, Flip.util.Object, {
    set clock(c) {
      var oc = this._clock;
      if (oc == c)return;
      if (oc && c)throw Error('remove the animation clock before add a new one');
      this._clock = c;
      if (c) {
        c.ontick = invalidWhenTick;
        c.on(Clock.EVENT_NAMES.FINISHED, removeWhenFinished)
      }
      else if (oc) {
        oc.off(Clock.EVENT_NAMES.TICK, invalidWhenTick);
        oc.off(Clock.EVENT_NAMES.FINISHED, removeWhenFinished);
      }
    },
    get clock() {
      return this._clock;
    },
    get id() {
      if (!this._id)this._id = getAniId(this.type);
      return this._id;
    },
    set elements(eles) {
      var oe = this._eles;
      if (oe == eles)return;
      if (eles instanceof Element) eles = [eles];
      else if (!eles) return this._eles = null;
      else if (this._eles) throw Error('remove elements before add');
      (this._eles = eles).forEach(normalizeEleTransformStyle);
    },
    get elements() {
      return this._eles.slice();
    },
    update: function (state) {
      state.animation = this;
      this._clock.update(state);
      state.animation = null;
    },
    render: function (state) {
      state.animation = this;
      this.apply(state);
      state.animation = null;
    },
    invalid: function () {
      if (this._task) this._task.invalid();
    },
    destroy: function (state) {
      var task;
      if (task = this._task) {
        task.remove(this);
        task.remove(this.clock);
      }
      this.elements = null;
      this.clock = null;
    },
    apply: function (state) {
      var mat = this.getMatrix(state).toString();
      this.elements.forEach(function (ele) {
        ele.style.transform = mat;
      });
    },
    getMatrix: function () {
      return new Mat3();
    }
  });
})();

