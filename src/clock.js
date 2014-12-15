/**
 * Created by 柏然 on 2014/12/12.
 */

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