/**
 * Created by 柏然 on 2014/12/12.
 */

function Clock(opt) {
  if (!(this instanceof Clock))return new Clock(opt);
  objForEach(Clock.createOptProxy(opt, 1, Clock.EASE.linear, 0, 0, 0).result, cloneFunc, this);
  this.reset(1);
  this._paused = false;
}
Flip.Clock = Clock;

Clock.createOptProxy = function (opt, duration, timingFunction, infinite, iteration, autoReverse) {
  var setter = createProxy(opt);
  setter('duration', duration, 'timingFunction', timingFunction, 'infinite', infinite, 'iteration', iteration, 'autoReverse', autoReverse);
  return setter;
};
(function (EVTS) {
  Object.seal(EVTS);
  inherit(Clock, obj, {
    get controller() {
      return this._controller || null;
    },
    set controller(c) {
      var oc = this.controller;
      c = c || null;
      if (oc === c)return;
      this._controller = c;
      this.emit(EVTS.CONTROLLER_CHANGED, {before: oc, after: c, clock: this});
    },
    get finished() {
      return this._stopped && this.i <= 0;
    },
    get paused() {
      return this._paused;
    },
    get timingFunction() {
      return this._tf;
    },
    set timingFunction(src) {
      var t;
      if ((typeof src === "function" && (t = src)) || (t = Clock.EASE[src]))this._tf = src;
    },
    start: function () {
      if (this.t == 0) {
        this.reset(0, 1).emit(EVTS.START, this);
        return true;
      }
      return false;
    },
    reverse: function () {
      if (this.t == 1) {
        this.reset(0, 1, 1, 1).emit(EVTS.REVERSE, this);
        return true;
      }
      return false;
    },
    restart: function () {
      this.t = 0;
      return this.start();
    },
    reset: function (stop, keepIteration, atEnd, reverseDir, pause) {
      this._startTime = -1;
      if (!keepIteration)this.i = this.iteration;
      this.d = !reverseDir;
      this.t = this.value = atEnd ? 1 : 0;
      this._stopped = !!stop;
      this._paused = !!pause;
      return this;
    },
    finish: function (evtArg) {
      this.emit(EVTS.FINISHED, evtArg);
      this.reset(1);
    },
    end: function (evtArg) {
      this.autoReverse ? this.reverse(evtArg) : this.iterate(evtArg, 0);
    },
    iterate: function (evtArg) {
      if (this.infinite)this.toggle();
      else if (0 < this.i--) {
        this.emit(EVTS.ITERATE, evtArg);
        this.reset(0, 1);
      }
      else this.finish(evtArg);
    },
    pause: function () {
      if (!this._paused) {
        this._pausedTime = -1;
        this._pausedDur = 0;
        this._paused = true;
      }
    },
    restore: function () {
      if (this._paused && this._startTime > 0) {
        this._startTime += this._pausedDur;
        this._paused = false;
      }
    },
    toggle: function () {
      if (this.t == 0)
        this.start();
      else if (this.t == 1)
        this.reverse();
    },
    update: updateClock
  });
  objForEach(EVTS, function (evtName, key) {
    Object.defineProperty(this, 'on' + evtName, {
      set: function (func) {
        this.on(EVTS[key], func);
      }
    })
  }, Clock.prototype);
  function updateClock(state) {
    if (!this._stopped) {
      var timeline = state.timeline;
      if (this._startTime == -1) {
        this.emit(EVTS.START, state);
        return (this._startTime = timeline.now) >= 0;
      }
      if (this._paused) {
        var pt = this._pausedTime;
        pt == -1 ? this._pausedTime = timeline.now : this._pausedDur = timeline.now - pt;
        return true;
      }
      var dur = (timeline.now - this._startTime) / timeline.ticksPerSecond, curValue, evtArg;
      if (dur > 0) {
        var ov = this.value, t;
        t = this.t = this.d ? dur / this.duration : 1 - dur / this.duration;
        if (t > 1)t = this.t = 1;
        else if (t < 0)t = this.t = 0;
        curValue = this.value = this.timingFunction(t);
        evtArg = Object.create(state);
        evtArg.clock = this;
        evtArg.currentValue = curValue;
        evtArg.lastValue = ov;
        if (ov != curValue) this.emit(EVTS.TICK, evtArg);
        if (t == 1)this.end(evtArg);
        else if (t == 0)this.iterate(evtArg);
        if (state.clock === this)state.clock = null;
      }
      return true;
    }
    else
      state.task.remove(this);
  }
})(Clock.EVENT_NAMES = {
  UPDATE: 'update',
  ITERATE: 'iterate',
  START: 'start',
  REVERSE: 'reverse',
  TICK: 'tick',
  FINISHED: 'finished',
  CONTROLLER_CHANGED: 'controllerChanged'
});


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
    objForEach(obj, function (func, name) {
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