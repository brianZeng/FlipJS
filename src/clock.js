/**
 * Created by 柏然 on 2014/12/12.
 */

function Clock(opt) {
  if (!(this instanceof Clock))return new Clock(opt);
  objForEach(Clock.createOptProxy(opt, 1, 1, 1, 0, Clock.TIMEFUNCS.linear, 0, 0, 0).result, cloneFunc, this);
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
Flip.TIMEFUNCS = Clock.TIMEFUNCS = (function () {
  /**
   * @name Clock.TIMEFUNCS
   * @name Flip.TIMEFUNCS
   * @type {{linear: linear, sineEaseIn: sineEaseIn, sineEaseOut: sineEaseOut, sineEaseInOut: sineEaseInOut, quintEaseIn: quintEaseIn, quintEaseOut: quintEaseOut, quintEaseInOut: quintEaseInOut, quartEaseIn: quartEaseIn, quartEaseOut: quartEaseOut, quartEaseInOut: quartEaseInOut, circEaseIn: circEaseIn, circEaseOut: circEaseOut, circEaseInOut: circEaseInOut, quadEaseIn: quadEaseIn, quadEaseOut: quadEaseOut, quadEaseInOut: quadEaseInOut, cubicEaseIn: cubicEaseIn, cubicEaseOut: cubicEaseOut, cubicEaseInOut: cubicEaseInOut, bounceEaseOut: bounceEaseOut, bounceEaseIn: bounceEaseIn, bounceEaseInOut: bounceEaseInOut, expoEaseIn: expoEaseIn, expoEaseOut: expoEaseOut, expoEaseInOut: expoEaseInOut, zeroStep: zeroStep, halfStep: halfStep, oneStep: oneStep, random: random, randomLimit: randomLimit}}
   */
  var FUNCS = {
    linear: function (t) {
      return t;
    },
    sineEaseIn: function (t) {
      return -Math.cos(t * (Math.PI / 2)) + 1;
    },
    sineEaseOut: function (t) {
      return Math.sin(t * (Math.PI / 2));
    },
    sineEaseInOut: function (t) {
      return -.5 * (Math.cos(Math.PI * t) - 1);
    }, quintEaseIn: function (t) {
      return t * t * t * t * t;
    }, quintEaseOut: function (t) {
      t--;
      return t * t * t * t * t + 1;
    },
    quintEaseInOut: function (t) {
      t /= .5;
      if (t < 1) {
        return .5 * t * t * t * t * t;
      }
      t -= 2;
      return .5 * (t * t * t * t * t + 2);
    }, quartEaseIn: function (t) {
      return t * t * t * t;
    }, quartEaseOut: function (t) {
      t--;
      return -(t * t * t * t - 1);
    }, quartEaseInOut: function (t) {
      t /= .5;
      if (t < 1) {
        return .5 * t * t * t * t;
      }
      t -= 2;
      return -.5 * (t * t * t * t - 2);
    }, circEaseIn: function (t) {
      return -(Math.sqrt(1 - t * t) - 1);
    }, circEaseOut: function (t) {
      t--;
      return Math.sqrt(1 - t * t);
    }, circEaseInOut: function (t) {
      t /= .5;
      if (t < 1) {
        return -.5 * (Math.sqrt(1 - t * t) - 1);
      }
      t -= 2;
      return .5 * (Math.sqrt(1 - t * t) + 1);
    }, quadEaseIn: function (t) {
      return t * t;
    }, quadEaseOut: function (t) {
      return -1 * t * (t - 2);
    }, quadEaseInOut: function (t) {
      t /= .5;
      if (t < 1) {
        return .5 * t * t;
      }
      t--;
      return -.5 * (t * (t - 2) - 1);
    }, cubicEaseIn: function (t) {
      return t * t * t;
    }, cubicEaseOut: function (t) {
      t--;
      return t * t * t + 1;
    }, cubicEaseInOut: function (t) {
      t /= .5;
      if (t < 1) {
        return .5 * t * t * t;
      }
      t -= 2;
      return .5 * (t * t * t + 2);
    }, bounceEaseOut: function (t) {
      if (t < 1 / 2.75) {
        return 7.5625 * t * t;
      } else {
        if (t < 2 / 2.75) {
          t -= 1.5 / 2.75;
          return 7.5625 * t * t + .75;
        } else {
          if (t < 2.5 / 2.75) {
            t -= 2.25 / 2.75;
            return 7.5625 * t * t + .9375;
          } else {
            t -= 2.625 / 2.75;
            return 7.5625 * t * t + .984375;
          }
        }
      }
    }, bounceEaseIn: function (t) {
      return 1 - FUNCS.bounceEaseOut(1 - t);
    }, bounceEaseInOut: function (t) {
      if (t < .5) {
        return FUNCS.bounceEaseIn(t * 2) * .5;
      } else {
        return FUNCS.bounceEaseOut(t * 2 - 1) * .5 + .5;
      }
    }, expoEaseIn: function (t) {
      return t == 0 ? 0 : Math.pow(2, 10 * (t - 1));
    }, expoEaseOut: function (t) {
      return t == 1 ? 1 : -Math.pow(2, -10 * t) + 1;
    }, expoEaseInOut: function (t) {
      if (t == 0)  return 0;
      else if (t == 1) return 1;
      else if (t / .5 < 1) return .5 * Math.pow(2, 10 * (t / .5 - 1));
      else  return .5 * (-Math.pow(2, -10 * (t / .5 - 1)) + 2);
    }, zeroStep: function (t) {
      return t <= 0 ? 0 : 1;
    }, halfStep: function (t) {
      return t < .5 ? 0 : 1;
    }, oneStep: function (t) {
      return t >= 1 ? 1 : 0;
    }, random: function (t) {
      return Math.random();
    }, randomLimit: function (t) {
      return Math.random() * t;
    }
  };
  return Object.freeze(FUNCS);
})();
Clock.EVENT_NAMES = {
  UPDATE: 'update',
  END: 'end',
  REVERSED: 'reversed',
  TICK: 'tick',
  FINISHED: 'finished'
};
inherit(Clock, obj, {
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
  ontick: {set: function (f) {
    this.on(Clock.EVENT_NAMES.TICK, f)
  }},
  onend: {set: function (f) {
    this.on(Clock.EVENT_NAMES.END, f)
  }},
  onreverse: {set: function (f) {
    this.on(Clock.EVENT_NAMES.REVERSED, f)
  }},
  onfinished: {set: function (f) {
    this.on(Clock.EVENT_NAMES.FINISHED, f)
  }},
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
      if ((typeof src === "function" && (t = src)) || (t = Clock.TIMEFUNCS[src]))
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