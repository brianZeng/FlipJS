(function () {
  var Flip = function () {
    var first = arguments[0];
    if (typeof first === "function") arrAdd(FlipScope.readyFuncs, first);
  }, FlipScope = {readyFuncs: []};
  Object.defineProperty(Flip, 'instance', {get: function () {
    return FlipScope.global;
  }});
  Flip.fallback = function (window) {
    if (!window.requestAnimationFrame)
      window.requestAnimationFrame = function (callback) {
        setTimeout(callback, 30);
      };
    if (!window.Float32Array) {
      window.Float32Array = inherit(function (lengthOrArray) {
        if (!(this instanceof arguments.callee))return new arguments.callee(lengthOrArray);
        var i = 0, from, len;
        if (typeof lengthOrArray === "number") {
          from = [0];
          len = lengthOrArray;
        } else
          len = (from = lengthOrArray).length;
        for (i; i < len; i++)
          this[i] = from[i] || 0;
      }, Array.prototype)
    }
  };
  if (typeof module !== "undefined" && module.exports)
    module.exports = Flip;
  else if (window) window.Flip = Flip;

  Flip.util = {Object: obj, Array: array, inherit: inherit};
  function createProxy(obj) {
    var from, result = {}, func, objType = typeof obj;
    if (objType == "function")from = obj.proxy;
    else if (objType == "object") from = obj;
    else from = {};
    func = function () {
      for (var i = 0, v, prop, value, len = arguments.length; i < len; i += 2) {
        prop = arguments[i];
        value = arguments[i + 1];
        if (!from.hasOwnProperty(prop)) {
          v = value;
          delete from[prop];
        }
        else v = from[prop];
        result[prop] = v;
      }
    };
    func.source = function () {
      if (arguments.length == 1)return from[arguments[0]];
      for (var i = 0, prop, len = arguments.length; i < len; i += 2) {
        prop = arguments[i];
        if (!from.hasOwnProperty(prop))from[prop] = arguments[i + 1];
      }
      return from[arguments[0]];
    };
    func.result = result;
    func.proxy = from;
    return func;
  }

  function inherit(constructor, baseproto, expando, propertyObj) {
    if (typeof  baseproto == "function")baseproto = new baseproto();
    baseproto = baseproto || {};
    var proto = constructor.prototype = Object.create(baseproto), proDes;
    if (expando)
      for (var i in expando) {
        proDes = Object.getOwnPropertyDescriptor(expando, i);
        if (proDes) Object.defineProperty(proto, i, proDes);
        else
          proto[i] = expando[i];
      }
    if (propertyObj)
      obj.forEach(propertyObj, function (key, value) {
        Object.defineProperty(proto, key, value);
      });
    return constructor;
  }

  function array(arrayLike) {
    if (!(this instanceof array))return new array(arrayLike);
    if (arrayLike && arrayLike.length)
      for (var i = 0, len = arrayLike.length; i < len; i++)
        this[i] = arrayLike[i];
  }

  function arrAdd(array, item) {
    var i = array.indexOf(item);
    if (i == -1)
      return !!array.push(item);
    return false;
  }

  function arrRemove(array, item) {
    var i = array.indexOf(item);
    if (i >= 0)
      return !!array.splice(i, 1);
    return false;
  }

  array.remove = arrRemove;
  array.add = arrAdd;
  function mapProName(proNameOrFun) {
    if (typeof proNameOrFun == "function")return proNameOrFun;
    else if (proNameOrFun && typeof proNameOrFun == "string")
      return function (item) {
        return item ? item[proNameOrFun] : undefined;
      };
    else return function (item) {
        return item;
      }
  }

  function arrFind(array, proNameOrFun, value, unstrict) {
    var fun = mapProName(proNameOrFun), i, item;
    if (unstrict) {
      for (i = 0, item = array[0]; item; item = array[++i]) if (fun(item) == value)return item;
    }
    else {
      for (i = 0, item = array[0]; item; item = array[++i]) if (fun(item) === value)return item;
    }
    return undefined;
  }

  array.findBy = arrFind;
  function arrSafeFilter(array, filter, thisObj) {
    var copy = array.slice();
    if (thisObj == undefined)thisObj = array;
    return copy.filter(filter, thisObj).filter(function (item) {
      return array.indexOf(item) > -1;
    });
  }

  array.safeFilter = arrSafeFilter;
  inherit(array, Array, {
    add: function (item) {
      return arrAdd(this, item);
    },
    findBy: function (proNameOrFun, value, unstrict) {
      return arrFind(this, proNameOrFun, value, unstrict);
    },
    remove: function (item) {
      return arrRemove(this, item);
    },
    safeFilter: function (callback, thisObj) {
      return arrSafeFilter(this, callback, thisObj);
    }
  });

  function obj(from) {
    if (!(this instanceof obj))return new obj(from);
    if (typeof from === "object")
      objForEach(from, function (key, value) {
        this[key] = value;
      }, this);
  }

  function addEventListener(obj, evtName, handler) {
    if (typeof evtName == "string" && evtName && typeof handler == "function") {
      var cbs, hs;
      if (!obj.hasOwnProperty('_callbacks'))obj._callbacks = {};
      cbs = obj._callbacks;
      if (!(hs = cbs[evtName]))hs = cbs[evtName] = [];
      arrAdd(hs, handler);
    }
    return obj;
  }

  obj.on = addEventListener;
  function emitEvent(obj, evtName, argArray, thisObj) {
    var callbacks , handlers;
    if (!(obj.hasOwnProperty('_callbacks')) || !(handlers = (callbacks = obj._callbacks)[evtName]))return false;
    if (!argArray)argArray = [];
    else if (!(argArray instanceof Array)) argArray = [argArray];
    if (thisObj === undefined) thisObj = obj;
    return (callbacks[evtName] = arrSafeFilter(handlers, function (call) {
      return call.apply(thisObj, argArray) != -1;
    })).length;
  }

  obj.emit = emitEvent;
  function removeEventListener(obj, evtName, handler) {
    var cbs, hs;
    if (evtName === undefined)delete obj._callbacks;
    else if ((cbs = obj._callbacks) && (hs = cbs[evtName]) && hs) {
      if (handler) array.remove(hs, handler);
      else delete cbs[evtName];
    }
    return obj;
  }

  obj.off = removeEventListener;
  function addEventListenerOnce(obj, evtName, handler) {
    if (typeof handler == "function")
      obj.on(evtName, function () {
        handler.apply(obj, arguments);
        return -1;
      });
    return obj;
  }

  obj.once = addEventListenerOnce;
  function objForEach(object, callback, thisObj, arg) {
    if (object) {
      if (thisObj == undefined)thisObj = object;
      for (var i = 0, names = Object.getOwnPropertyNames(object), name = names[0]; name; name = names[++i])
        callback.apply(thisObj, [name, object[name], arg]);
    }
    return object;
  }

  obj.forEach = objForEach;
  function objMap(object, callback, thisObj, arg) {
    var r = obj();
    if (object) {
      if (thisObj == undefined)thisObj = object;
      for (var keys = Object.getOwnPropertyNames(object), i = 0, key = keys[0]; key; key = keys[++i])
        r[key] = callback.apply(thisObj, [key, object[key], arg]);
    }
    return r;
  }

  obj.map = objMap;
  function objReduce(object, callback, initialValue, thisObj, arg) {
    if (object) {
      if (thisObj == undefined)thisObj = object;
      for (var keys = Object.getOwnPropertyNames(object), i = 0, key = keys[0]; key; key = keys[++i])
        initialValue = callback.apply(thisObj, [initialValue, key, object[key], arg]);
    }
    return initialValue;
  }

  obj.reduce = objReduce;
  inherit(obj, null, {
    on: function (evtName, handler) {
      return addEventListener(this, evtName, handler);
    },
    emit: function (evtName, argArray, thisObj) {
      return emitEvent(this, evtName, argArray, thisObj);
    },
    off: function (evtName, handler) {
      return removeEventListener(this, evtName, handler);
    },
    once: function (evtName, handler) {
      return addEventListenerOnce(this, evtName, handler);
    },
    forEach: function (callback, thisObj, arg) {
      return objForEach(this, callback, thisObj, arg);
    }
  });
  function cloneFunc(key, value) {
    this[key] = value;
  }

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
      elements = Flip.$(selector);
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

    function invalidWhenTick(o, v, state) {
      state.animation.invalid();
      state.animation.emit(Animation.EVENT_NAMES.UPDATE, state);
    }

    function removeWhenFinished(o, v, state) {
      var ani = state.animation;
      ani.render(state);
      ani.emit(Animation.EVENT_NAMES.FINISHED, state);
      ani.destroy(state);
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
      var beforeCallBase, defParam, name = option.name;
      beforeCallBase = option.beforeCallBase || _beforeCallBase;
      defParam = option.defParam || {};
      if (name)
        register[name] = Constructor;
      function Constructor(opt) {
        if (!(this instanceof Constructor))return new Constructor(opt);
        var proxy = createProxy(opt);
        objForEach(defParam, function (key, value) {
          proxy(key, value)
        });
        objForEach(proxy.result, cloneFunc, this);
        beforeCallBase.apply(this, [proxy, opt]);
        Animation.call(this, opt);
      }

      inherit(Constructor, Animation.prototype, option.prototype);
      return Constructor;
    }

    return register;
  })();


  function Clock(opt) {
    if (!(this instanceof Clock))return new Clock(opt);
    objForEach(Clock.createOptProxy(opt, 1, 1, 1, 0, Clock.EASE.linear, 0, 0, 0).result, cloneFunc, this);
    this.reset(0, 0, 1, 1);
    this._paused = false;
  }

  Flip.Clock = Clock;

  Clock.createOptProxy = function (opt, duration, direction, range, offset, timingFunction, infinite, iteration, autoReverse) {
    var setter = createProxy(opt);
    setter('duration', duration, 'direction', direction, 'range', range, 'offset', offset, 'timingFunction', timingFunction,
      'infinite', infinite, 'iteration', iteration, 'autoReverse', autoReverse);
    return setter;
  };

  Flip.EASE = Clock.EASE = (function () {
    /**
     * from jQuery.easing
     * @lends Clock.EASE
     * @lends Flip.EASE
     * @enum {function}
     * @property {function} linear
     * @property {function} zeroStep
     * @property {function} halfStep
     * @property {function} oneStep
     * @property {function} random
     * @property {function} randomLimit
     * @property {function} backOut
     * @property {function} backIn
     * @property {function} backInOut
     * @property {function} cubicOut
     * @property {function} cubicIn
     * @property {function} cubicInOut
     * @property {function} expoOut
     * @property {function} expoIn
     * @property {function} expoInOut
     * @property {function} circOut
     * @property {function} circIn
     * @property {function} circInOut
     * @property {function} sineOut
     * @property {function} sineIn
     * @property {function} sineInOut
     * @property {function} bounceOut
     * @property {function} bounceIn
     * @property {function} bounceInOut
     * @property {function} elasticOut
     * @property {function} elasticIn
     * @property {function} elasticInOut
     * @property {function} quintOut
     * @property {function} quintIn
     * @property {function} quintInOut
     * @property {function} quartOut
     * @property {function} quartIn
     * @property {function} quartInOut
     * @property {function} quadOut
     * @property {function} quadIn
     * @property {function} quadInOut
     */
    var F = {
      linear: function (t) {
        return t;
      },
      zeroStep: function (t) {
        return t <= 0 ? 0 : 1;
      },
      halfStep: function (t) {
        return t < .5 ? 0 : 1;
      },
      oneStep: function (t) {
        return t >= 1 ? 1 : 0;
      },
      random: function () {
        return Math.random();
      },
      randomLimit: function (t) {
        return Math.random() * t;
      }
    };
    var pow = Math.pow, PI = Math.PI;
    (function (obj) {
      objForEach(obj, function (name, func) {
        var easeIn = func;
        F[name + 'In'] = easeIn;
        F[name + 'Out'] = function (t) {
          return 1 - easeIn(t);
        };
        F[name + 'InOut'] = function (t) {
          return t < 0.5 ? easeIn(t * 2) / 2 : 1 - easeIn(t * -2 + 2) / 2;
        };
      });
    })({
      back: function (t) {
        return t * t * ( 3 * t - 2 );
      },
      elastic: function (t) {
        return t === 0 || t === 1 ? t : -pow(2, 8 * (t - 1)) * Math.sin(( (t - 1) * 80 - 7.5 ) * PI / 15);
      },
      sine: function (t) {
        return 1 - Math.cos(t * PI / 2);
      },
      circ: function (t) {
        return 1 - Math.sqrt(1 - t * t);
      },
      cubic: function (t) {
        return t * t * t;
      },
      expo: function (t) {
        return t == 0 ? 0 : pow(2, 10 * (t - 1));
      },
      quad: function (t) {
        return t * t;
      },
      quart: function (t) {
        return pow(t, 4)
      },
      quint: function (t) {
        return pow(t, 5)
      },
      bounce: function (t) {
        var pow2, bounce = 4;
        while (t < ( ( pow2 = pow(2, --bounce) ) - 1 ) / 11);
        return 1 / pow(4, 3 - bounce) - 7.5625 * pow(( pow2 * 3 - 2 ) / 22 - t, 2);
      }
    });

    return Object.freeze(F);
  })();

  Clock.EVENT_NAMES = {
    UPDATE: 'update',
    END: 'end',
    REVERSED: 'reversed',
    TICK: 'tick',
    FINISHED: 'finished'
  };
  inherit(Clock, obj, {
    get finished() {
      return this._stopped && this.i <= 0;
    },
    set ontick(f) {
      this.on(Clock.EVENT_NAMES.TICK, f);
    },
    set onend(f) {
      this.on(Clock.EVENT_NAMES.END, f)
    },
    set onreversed(f) {
      this.on(Clock.EVENT_NAMES.REVERSED, f)
    },
    set onfinished(f) {
      this.on(Clock.EVENT_NAMES.FINISHED, f)
    },
    start: function () {
      if (this.t != (this.direction == 1 ? 0 : 1)) return false;
      return this.restart();
    },
    restart: function () {
      this.reset(0, 0, 0, 1);
      this._stopped = false;
      return this;
    },
    reset: function (toEnd, reverseDir, stopped, iteration) {
      this._startTime = -1;
      if (iteration)this.i = this.iteration;
      this.d = reverseDir ? -this.direction : this.direction;
      this.t = toEnd ? (this.d == 1 ? 1 : 0) : (this.d == 1 ? 0 : 1);
      this.value = this.t * this.range + this.offset;
      this._stopped = !!stopped;
      return this;
    },
    end: function () {
      return this.reset(1, 0, 1);
    },
    pause: function () {
      if (!this._paused) {
        this._pausedTime = -1;
        this._pausedDur = 0;
        this._paused = true;
        // var t = this.t, p;
        // if (t == 0 || t == 1)
        // if ((p = this.parent) && (p = p.task)) p.remove(this);
      }
    },
    restore: function () {
      if (this._paused && this._startTime > 0) {
        this._startTime += this._pausedDur;
        this._paused = false;
        var t = this.t;
        //if (t < 0 && t > 1)this.waitUpdate();
      }
    },
    reverse: function () {
      if (this.t != ((this.direction == 1 ? 1 : 0))) return false;
      this.reset(0, 1, 0, 1);
      return true;
    },
    toggle: function () {
      if (this.t == 0)
        this.start();
      else if (this.t == 1)
        this.reverse();
    },
    update: updateClock
  }, {
    paused: {
      get: function () {
        return this._paused;
      },
      set: function (v) {
        if (this._paused = !!v)
          this.pause();
        else this.restore()
      }
    },
    reversing: {get: function () {
      return this.d == -this.direction;
    }},
    isStopped: {get: function () {
      return this._stopped;
    }},
    timingFunction: {
      get: function () {
        return this._tf;
      },
      set: function (src) {
        var t;
        if ((typeof src === "function" && (t = src)) || (t = Clock.EASE[src]))
          this._tf = t;
      }
    }
  });
  function updateClock(state) {
    if (!this._stopped) {
      var timeline = state.timeline;
      if (this._startTime == -1)
        return (this._startTime = timeline.now) >= 0;
      if (this._paused) {
        var pt = this._pausedTime;
        pt == -1 ? this._pausedTime = timeline.now : this._pausedDur = timeline.now - pt;
        return true;
      }
      var dur = (timeline.now - this._startTime) / timeline.ticksPerSecond, curValue, evtArg;
      if (dur > 0) {
        var ov = this.value, evt;
        this.t = this.d == 1 ? dur / this.duration : 1 - dur / this.duration;
        if (this.t > 1)this.t = 1;
        else if (this.t < 0)this.t = 0;
        curValue = this.value = this.timingFunction(this.t) * this.range + this.offset;
        state.clock = this;
        evtArg = [ov, curValue, state];
        if (this.t == 0) evt = Clock.EVENT_NAMES.REVERSED;
        else if (this.t == 1) evt = Clock.EVENT_NAMES.END;

        if (ov != curValue) this.emit(Clock.EVENT_NAMES.TICK, evtArg);
        if (evt) {
          this._stopped = true;
          this.emit(evt, evtArg);
          if (this.infinite) this.toggle();
          else if (this.i-- > 0)
            this.reset(0, this.autoReverse && this.i % 2 == 0, 0, 0);
          else
            this.emit(Clock.EVENT_NAMES.FINISHED, evtArg);
        }
        if (state.clock === this)state.clock = null;
      }
      return true;
    }
    else
      state.task.remove(this);
  }

  (function (Flip) {
    function $(slt, ele) {
      var r = [], root = ele || document;
      if (slt)
        slt.split(',').forEach(function (selector) {
          r.push.apply(r, r.slice.apply(root.querySelectorAll(selector)))
        });
      return r;
    }

    Flip.$ = Flip.$ = $;
    document.addEventListener('DOMContentLoaded', function () {
      FlipScope.global.init();
      FlipScope.readyFuncs.forEach(function (callback) {
        callback(Flip);
      });
      FlipScope.readyFuncs = null;
    });
  })(Flip);

  Flip.RenderGlobal = RenderGlobal;
  function RenderGlobal() {
    this._tasks = new Flip.util.Array();
  }

  RenderGlobal.EVENT_NAMES = {
    FRAME_START: 'frameStart',
    FRAME_END: 'frameEnd',
    UPDATE: 'update'
  };
  inherit(RenderGlobal, Flip.util.Object, {
    set activeTask(t) {
      var tasks = this._tasks, target = this._activeTask;
      if (target) target.timeline.stop();
      if (t instanceof RenderTask)
        if (tasks.indexOf(t) > -1 || this.add(t)) target = t;
        else if (typeof t == "string") target = tasks.findBy('name', t);
        else target = null;
      this._activeTask = target;
      if (target) target.timeline.start();
    },
    get activeTask() {
      var t = this._activeTask;
      if (!t) {
        this._tasks.length ? (t = this._tasks[0]) : this.add(t = new RenderTask('default'));
        this._activeTask = t;
      }
      return t;
    },
    add: function (obj) {
      var task, taskName, tasks;
      if (obj instanceof RenderTask) {
        if (!(taskName = obj.name)) throw Error('task must has a name');
        else if ((task = (tasks = this._tasks).findBy('name', taskName)) && task !== obj) throw Error('contains same name task');
        else if (tasks.add(obj)) return !!(obj._global = this);
      }
      else if (obj instanceof Animation || obj instanceof Clock)
        return this.activeTask.add(obj);
      return false;
    },
    init: function (taskName) {
      this.activeTask = taskName;
      this.loop();
      this.activeTask.timeline.start();
      typeof window === "object" && Flip.fallback(window);
      this.init = function () {
        console.warn('The settings have been initiated,do not init twice');
      };
    },
    loop: function () {
      var state = this.createRenderState();
      this.emit(RenderGlobal.EVENT_NAMES.FRAME_START, [state]);
      this.update(state);
      this.render(state);
      this.emit(RenderGlobal.EVENT_NAMES.FRAME_END, [state]);
      window.requestAnimationFrame(this.loop.bind(this), window.document.body);
    },
    render: function (state) {
      state.task.render(state);
    },
    update: function (state) {
      state.global.emit(RenderGlobal.EVENT_NAMES.UPDATE, [state, this]);
      state.task.update(state);
    },
    createRenderState: function () {
      return {global: this, task: this.activeTask}
    }
  });
  FlipScope.global = new RenderGlobal();


  function Mat3(arrayOrMat3) {
    if (!(this instanceof Mat3))return new Mat3(arrayOrMat3);
    var s, d;
    if (arrayOrMat3) {
      if (arrayOrMat3.elements)
        s = arrayOrMat3.elements;
      else s = arrayOrMat3;
      d = new Float32Array(s);
    }
    this.elements = d || new Float32Array([1, 0, 0, 0, 1, 0]);
  }

  Flip.Mat3 = Mat3;
  Mat3.set = function (x1, x2, y1, y2, dx, dy) {
    return new Mat3([x1, y1, dx, x2, y2, dy]);
  };
  Mat3.setTranslate = function (dx, dy) {
    return new Mat3([1, 0, dx || 0, 0, 1, dy || 0]);
  };
  Mat3.setScale = function (x, y) {
    return new Mat3([x || 1, 0, 0, 0, y || 1, 0]);
  };
  Mat3.setRotate = function (angle) {
    if (typeof angle == "string") {
      var match = angle.match(/^((\d+(\.\d+)?)|(\.\d+))d|deg/i);
      if (match) angle = (parseFloat(match[1]) / 180) * Math.PI;
    }
    angle = parseFloat(angle) || 0;
    var a00 = 1, a01 = 0, a02 = 0, a10 = 0, a11 = 1, a12 = 0, s = Math.sin(angle), c = Math.cos(angle), out = [];
    out[0] = c * a00 + s * a10;
    out[1] = c * a01 + s * a11;
    out[2] = c * a02 + s * a12;

    out[3] = c * a10 - s * a00;
    out[4] = c * a11 - s * a01;
    out[5] = c * a12 - s * a02;
    return new Mat3(out);
  };
  function getFloat(d) {
    return parseFloat(d).toFixed(5);
  }

  Mat3.prototype = {
    toString: (function (seq) {
      return function () {
        var e = this.elements, r = seq.map(function (i) {
          return getFloat(e[i])
        });
        return 'matrix(' + r.join(',') + ')';
      }
    })([0, 3, 1, 4, 2, 5]),
    translate: function (dx, dy, overwrite) {
      return this.concat(Mat3.setTranslate(dx, dy), overwrite);
    },
    scale: function (x, y, overwrite) {
      return this.concat(Mat3.setScale(x, y), overwrite);
    },
    rotate: function (angle, overwrite) {
      return this.concat(Mat3.setRotate(angle), overwrite);
    },
    concat: function (mat3, overwrite) {
      var n = this.elements, e = mat3.elements, r;
      var m11 = e[0], m21 = e[1], mx = e[2], m12 = e[3], m22 = e[4], my = e[5],
        n11 = n[0], n21 = n[1], nx = n[2], n12 = n[3], n22 = n[4], ny = n[5];
      r = new Mat3([m11 * n11 + m12 * n21, m21 * n11 + m22 * n21, mx * n11 + my * n21 + nx, m11 * n12 + m12 * n22, m21 * n12 + m22 * n22, mx * n12 + my * n22 + ny]);
      if (overwrite) this.elements = new Float32Array(r.elements);
      return r;
    }
  };
  function RenderTask(name) {
    if (!(this instanceof  RenderTask))return new RenderTask(name);
    this.name = name;
    this.timeline = new TimeLine(this);
    this._updateObjs = [];
    this._onAction = false;
    this._global = null;
  }

  Flip.RenderTask = RenderTask;
  RenderTask.EVENT_NAMES = {
    RENDER_START: 'renderStart',
    RENDER_END: 'renderEnd',
    UPDATE: 'update',
    BEFORE_CONSUME_EVENTS: 'beforeConsumeEvents',
    AFTER_CONSUME_EVENTS: 'afterConsumeEvents'
  };
  inherit(RenderTask, Flip.util.Object, {
    update: function (state) {
      var t = state.task, updateParam = [state, this];
      (state.timeline = t.timeline).move();
      this.emit(RenderTask.EVENT_NAMES.UPDATE, updateParam);
      this._updateObjs = arrSafeFilter(this._updateObjs, filterIUpdate, state);
    },
    invalid: function () {
      this._invalid = true;
    },
    render: function (state) {
      var evtParam = [state, this];
      if (this._invalid) {
        this.emit(RenderTask.EVENT_NAMES.RENDER_START, evtParam);
        this._updateObjs.forEach(function (component) {
          if (component.render) component.render(state);
        });
        this._invalid = false;
      }
      this.emit(RenderTask.EVENT_NAMES.RENDER_END, evtParam);
    },
    add: function (obj, type) {
      if (type == 'update') return arrAdd(this._updateObjs, obj);
      if (obj instanceof Clock || obj instanceof Animation)
        arrAdd(this._updateObjs, obj) && (obj._task = this);
    },
    remove: function (obj) {
      if (obj._task == this)
        obj._task = null;
      arrRemove(this._updateObjs, obj);
    }
  });
  function filterIUpdate(obj) {
    if (obj == null || !(typeof obj == "object"))return false;
    else if (typeof obj.update == "function")return obj.update(this);
    else if (typeof obj.emit == "function") return obj.emit(RenderTask.EVENT_NAMES.UPDATE, this);
  }

  function TimeLine(task) {
    this.now = this._stopTime = 0;
    this._startTime = this._lastStop = Date.now();
    this.task = task;
    this._isStop = true;
  }

  inherit(TimeLine, Flip.util.Object, {
    ticksPerSecond: 1000,
    stop: function () {
      if (!this._isStop) {
        this._isStop = true;
        this._lastStop = Date.now();
      }
    },
    start: function () {
      if (this._isStop) {
        this._isStop = false;
        this._stopTime += Date.now() - this._lastStop;
      }
    },
    move: function () {
      if (!this._isStop)
        this.now = Date.now() - this._startTime - this._stopTime;
    }
  });
  Flip.animation({
    name: 'flip',
    defParam: {
      vertical: true, angle: Math.PI
    }, beforeCallBase: function (proxy) {
      proxy.source('timingFunction', Clock.EASE.bounceOut);
    },
    prototype: {
      getMatrix: function () {
        var angle = this.angle * this.clock.value, sin = Math.sin(angle), cos = Math.cos(angle);
        return new Mat3(this.vertical ? [cos, 0, 0, sin, 1, 0] : [1, -sin, 0, 0, cos, 0])
      }
    }
  });
  (function (register) {
    function formatMoney(n, c, d, t) {
      var s = n < 0 ? "-" : "", i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", j;
      j = (j = i.length) > 3 ? j % 3 : 0;
      c = isNaN(c = Math.abs(c)) ? 2 : c;
      d = d == undefined ? "." : d;
      t = t == undefined ? "," : t;
      return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
    }

    function mapValue(ele) {
      var v = ele.innerHTML || ele.value, d = v.replace(/\,|[^\d\.]/g, '');
      ele.unit = v.replace(/.*\d(.*)/, '$1');
      return parseFloat(d);
    }

    function applyValue(ele, value, prec) {
      ele.innerHTML = ele.value = prec == -1 ? value + ele.unit : formatMoney(value, prec).replace(/\.0+$/, '');
    }

    register(
      {
        name: 'increase',
        beforeCallBase: function (proxy) {
          var eles = proxy.source('elements', Flip.$(proxy.source('selector')));
          this.targets = eles.map(mapValue);
          proxy.source('duration', 1.2);
        },
        defParam: {
          fracPrecision: 1
        },
        prototype: {
          apply: function () {
            var v = this.clock.value, targets = this.targets, precition = this.finished ? -1 : this.fracPrecision;
            this.elements.forEach(function (ele, i) {
              applyValue(ele, targets[i] * v, precition);
            });
          }
        }
      }
    )


  })(Flip.animation);
  Flip.animation({
    name: 'rotate',
    defParam: {
      angle: Math.PI * 2
    },
    beforeCallBase: function (proxy) {
      proxy.source('timingFunction', Flip.EASE.circInOut);
    },
    prototype: {
      getMatrix: function () {
        return Flip.Mat3.setRotate(this.angle * this.clock.value);
      }
    }
  });
  Flip.animation({
    name: 'scale',
    defParam: {
      sx: 0, sy: 0, dy: 1, dx: 1
    },
    beforeCallBase: function (proxy) {
      proxy.source('timingFunction', Flip.EASE.sineInOut);
    },
    prototype: {
      getMatrix: function () {
        var sx = this.sx, sy = this.sy, dx = this.dx, dy = this.dy, v = this.clock.value;
        return Mat3.setScale(sx + (dx - sx) * v, sy + (dy - sy) * v);
      }
    }
  });
  Flip.animation({
    name: 'translate',
    defParam: {
      sx: 0, dx: 100, sy: 0, dy: 0
    },
    prototype: {
      getMatrix: function () {
        var v = this.clock.value, sx = this.sx, sy = this.sy;
        return Mat3.setTranslate(sx + (this.dx - sx) * v, sy + (this.dy - sy) * v);
      }
    }
  });
})();