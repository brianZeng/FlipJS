/**
 * animation timing clock ,do not operate clock until you know what you are doing
 * @namespace Clock
 * @alias Flip.Clock
 * @param opt
 * @returns {Clock}
 * @constructor
 */
function Clock(opt) {
  if (!(this instanceof Clock))return new Clock(opt);
  useOptions(this,makeOptions(opt,{
    duration:1,
    ease:Clock.EASE.linear,
    infinite:false,
    iteration:1,
    silent:false,
    autoReverse:false,
    delay:0,
    hold:0
  })).reset();
}
Flip.Clock = Clock;
/**
 * triggered when animation iterate
 * @event Flip.Animation#iterate
 */
/**
 * triggered when animation reverse play
 * @event Flip.Animation#reverse
 */
/**
 * triggered when animation first update(not constructed)
 * @event Flip.Animation#init
 */
var EVENT_INIT='init',EVENT_ITERATE='iterate',EVENT_REVERSE='reverse',EVENT_START='start',EVENT_CONTROLLER_CHANGE='controllerChange',EVENT_HOLD='hold';
var CLOCK_STATUS_IDLE= 0,CLOCK_STATUS_PAUSED= 1,CLOCK_STATUS_ACTIVE= 2,CLOCK_STATUS_DELAYING= 3,CLOCK_STATUS_HOLDING= 4,CLOCK_STATUS_ENDED= 5,CLOCK_STATUS_UNKNOWN= 6,CLOCK_STATUS_STARTED= 7,CLOCK_STATUS_CANCELED=8;
inherit(Clock, obj, {
    get controller() {
      return this._controller || null;
    },
    set controller(c) {
      var oc = this.controller;
      c = c || null;
      if (oc === c)return;
      this._controller = c;
      this.emit(EVENT_CONTROLLER_CHANGE, {before: oc, after: c, clock: this});
    },
    get started(){
      return this._startTime!==-1;
    },
    get finished() {
      return this._status==CLOCK_STATUS_ENDED;
    },
    get paused() {
      return this._status==CLOCK_STATUS_PAUSED;
    },
    get ease() {
      return this._tf;
    },
    set ease(src) {
      var tf;
      if ((isFunc(tf=src))||(tf = Clock.EASE[src]))
        this._tf = tf;
    },
    start: function () {
      if (this._status==CLOCK_STATUS_IDLE) {
        this._status=CLOCK_STATUS_STARTED;
      }
      return false;
    },
    restart: function () {
      return this.reset().start();
    },
    reset: function () {
      this._status=CLOCK_STATUS_IDLE;
      this.d=1;
      this.i=this.iteration;
      this._endTime=this._initTime=this._activeTime=this._startTime=this._holdTime=this._pausedTime=0;
      return this;
    },
    pause: function () {
      if(this._status !==CLOCK_STATUS_PAUSED){
        this._lastStatus=this._status;
        this._status=CLOCK_STATUS_PAUSED;
        emitWithCtrl(this,EVENT_PAUSE);
      }
    },
    resume: function () {
      if (this._status==CLOCK_STATUS_PAUSED) {
        this._status=this._lastStatus;
        emitWithCtrl(this,EVENT_RESUME);
      }
    },
    cancel:function(){
      if(this._status!==CLOCK_STATUS_CANCELED){
        this._status=CLOCK_STATUS_CANCELED;
        this.finalize();
        if(this.controller)
          this.controller.cancel();
        this.emit(EVENT_CANCEL);
      }
    },
    finalize:function(){
      var task=this._task;
      if(task instanceof RenderTask)
        task.toFinalize(this);
      else
        this.emit(EVENT_FINALIZE);
    },
    update:function(state){
      if(this.finished)
        this.finalize();
      else
        updateClock(this,state);
    }
  });
function emitWithCtrl(clock,evtName,arg){
  var ctrl=clock.controller;
  clock.emit(evtName,arg);
  if(ctrl&&isFunc(ctrl.emit))ctrl.emit(evtName,arg);
}
function _updateClock(clock,state){
  var timeline=state.timeline,now=timeline.now,ot;
  switch (clock._status){
    case CLOCK_STATUS_STARTED:
      clock._initTime=now;
      emitWithCtrl(clock,EVENT_INIT,state);
      clock._status= CLOCK_STATUS_DELAYING;
      return _updateClock(clock,state)||true;
    case CLOCK_STATUS_DELAYING:
      if(now >=clock._initTime+ clock.delay*timeline.ticksPerSecond)
      {
        clock._status=CLOCK_STATUS_ACTIVE;
        clock._activeTime=clock._startTime=now;
        emitWithCtrl(clock,EVENT_START,state);
        return _updateClock(clock,state)||true;
      }
      return false;
    case CLOCK_STATUS_ACTIVE:
      var dur=(now-clock._activeTime)/timeline.ticksPerSecond,t = clock.d ? dur / clock.duration : 1 - dur / clock.duration;
      ot=clock.t;
      if(ot===t) return false;
      if(t>1)clock.t=1;
      else if(t<0)clock.t=0;
      else clock.t=t;
      clock.value=clock.ease(clock.t);
      emitWithCtrl(clock,EVENT_UPDATE,state);
      if(!clock.silent)
        state.task.invalid();
      if(t>1|| t<0){
        clock._status=CLOCK_STATUS_UNKNOWN;
        _updateClock(clock,state);
      }
      return true;
    case CLOCK_STATUS_UNKNOWN:
      ot=clock.t;
      if(ot>=1){
        if(clock.autoReverse){
          clock.d=0;
          reactiveClock(clock,now);
          emitWithCtrl(clock,EVENT_REVERSE,state);
        }
        else
          return iterateClock();
      }
      else if(clock.autoReverse)
        return iterateClock(clock.d=1);
      else
        throw Error('impossible state t=0,autoReverse=false');
      return false;
    case CLOCK_STATUS_HOLDING:
      if(now >= clock._holdTime+clock.hold*timeline.ticksPerSecond){
        clock._status=CLOCK_STATUS_ENDED;
        clock._endTime=now;
        clock.emit(EVENT_FINISH,state);
        clock.finalize(state.task);
        return true;
      }
      return false;
  }
  function iterateClock(){
    if(clock.i>1 ||clock.infinite)
    {
      clock.i--;
      reactiveClock(clock,now);
      emitWithCtrl(clock,EVENT_ITERATE,state);
    }
    else {
      clock.i=0;
      clock._holdTime=now;
      clock._status=CLOCK_STATUS_HOLDING;
      emitWithCtrl(clock,EVENT_HOLD,state);
      return _updateClock(clock,state)||true;
    }
  }
}
function reactiveClock(clock,now){
  clock._status=CLOCK_STATUS_ACTIVE;
  clock._activeTime=now;
}
function updateClock(c,state) {
  if(c){
    state.clock=c;
    var ret=_updateClock(c,state);
    state.clock=null;
  }
  return ret;
}
Flip.EASE = Clock.EASE = (function () {
  /**
   * from jQuery.easing
   * @lends Clock.EASE
   * @lends Flip.EASE
   * @memberof Flip
   * @readonly
   * @public
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
        return 1-easeIn(1-t);
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