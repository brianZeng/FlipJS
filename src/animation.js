/**
 * Created by 柏然 on 2014/12/13.
 */
function Animation(opt) {
  if (!(this instanceof Animation))return new Animation(opt);
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
  setter('elements', elements || []);
  return setter;
};
Flip.ANIMATION_TYPE = {};
Animation.EVENT_NAMES = {
  UPDATE: 'update',
  DESTROY: 'destroy',
  RENDER: 'render',
  FINISHED: 'finished'
};
(function () {
  var idCache = {};

  function main() {
    var firstParam = typeof arguments[0], constructor, opt;
    if (firstParam === "string") {
      constructor = Flip.animation[arguments[0]];
      opt = arguments[1];
    }
    else if (firstParam === "object") {
      constructor = Flip.animation[arguments[0].animationType];
      opt = arguments[0];
    }
    if (!constructor) constructor = Animation;
    return setAniEnv(main.createOptProxy(opt, 0, 0, 1).result, new constructor(opt));
  }

  function setAniEnv(aniOpt, animation) {
    var global = FlipScope.global;
    if (aniOpt.defaultGlobal)
      (global._tasks.findBy('name', aniOpt.taskName) || global.activeTask).add(animation);
    if (aniOpt.autoStart) animation.start();
    return animation;
  }
  main.createOptProxy = function (setter, autoStart, taskName, defaultGlobal) {
    setter = createProxy(setter);
    setter('autoStart', autoStart, 'taskName', taskName, 'defaultGlobal', defaultGlobal);
    return setter;
  };
  Flip.animate = main;
  function getCSS(ele) {
    return ele.currentStyle || window.getComputedStyle(ele)
  }

  function normalizeEleTransformStyle(ele) {
    var style = ele.style, position = getCSS(ele).position;
    style.transformOrigin = 'center';
  }

  function getAniId(type) {
    type = type || 'Animation';
    var i = idCache[type] || 0;
    idCache[type] = i++;
    return '_F_' + type + ':' + i;
  }

  function invalidWhenTick(state) {
    state.animation.invalid();
    state.animation.emit(Animation.EVENT_NAMES.UPDATE, state);
  }

  function removeWhenFinished(state) {
    debugger;
    var ani = state.animation;
    ani.render(state);
    ani.emit(Animation.EVENT_NAMES.FINISHED, state);
    ani.destroy(state);
  }

  inherit(Animation, Flip.util.Object, {
    set clock(c) {
      var oc = this._clock;
      c = c || null;
      if (oc == c)return;
      if (oc && c)throw Error('remove the animation clock before add a new one');
      this._clock = c;
      //add a clock
      if (c) {
        c.ontick = invalidWhenTick;
        c.on(Clock.EVENT_NAMES.FINISHED, removeWhenFinished);
        c.controller = this;
      }//remove a clock
      else if (oc) {
        oc.off(Clock.EVENT_NAMES.TICK, invalidWhenTick);
        oc.off(Clock.EVENT_NAMES.FINISHED, removeWhenFinished);
        oc.controller = null;
      }
    },
    get clock() {
      return this._clock;
    },
    get finished() {
      var clock;
      return (clock = this.clock) ? clock.finished : true;
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
      return true;
    },
    render: function (state) {
      state.animation = this;
      this.apply(state);
      this.emit(Animation.EVENT_NAMES.RENDER, state);
      state.animation = null;
    },
    invalid: function () {
      if (this._task) this._task.invalid();
    },
    destroy: function (state) {
      var task, clock;
      if (task = this._task)
        task.remove(this);
      this.elements = null;
      if ((clock = this.clock))clock.emit(Animation.EVENT_NAMES.DESTROY, state);
      this.clock = null;
    },
    apply: function (state) {
      var mat = this.getMatrix(state).toString(), css = this.getCss();
      this.elements.forEach(function (ele) {
        var style = ele.style;
        style.transform = mat;
        objForEach(css, cloneFunc, style);
      });
    },
    getCss: function () {
      return 0;
    },
    getMatrix: function () {
      return new Mat3();
    }
  });
  'start,stop'.split(',').forEach(function (funcName) {
    Animation.prototype[funcName] = function () {
      var clock = this._clock;
      if (clock)
        clock[funcName].apply(clock, arguments);
      return this;
    }
  });
})();
Flip.animation = (function () {
  function _beforeCallBase(proxy, opt, instance) {
    return proxy;
  }

  function register(option) {
    var beforeCallBase, defParam, name = option.name, Constructor;
    beforeCallBase = option.beforeCallBase || _beforeCallBase;
    defParam = option.defParam || {};
    Constructor = function (opt) {
      if (!(this instanceof Constructor))return new Constructor(opt);
      var proxy = createProxy(opt);
      objForEach(defParam, function (value, key) {
        proxy(key, value)
      });
      objForEach(proxy.result, cloneFunc, this);
      beforeCallBase.apply(this, [proxy, opt]);
      Animation.call(this, opt);
    };
    if (name) {
      register[name] = Constructor;
      Constructor.name = name;
    }
    inherit(Constructor, Animation.prototype, option.prototype);
    return Constructor;
  }

  return register;
})();

