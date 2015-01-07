/**
 * Created by 柏然 on 2015/1/5.
 */
(function () {
  var actionType = {
    DOWN: 1, MOVE: 0, UP: 2
  }, eventType = {
    NULL: 0,
    PRESS: 1, CLICK: 2, DRAG: 3, RELEASE: 4, MOVE: 5//point
  };

  function EventPool(element) {
    this.registerHandlers(element);
    this.minMoveDistance = 8;
    this.skipFrameNum = 2;
    this.shouldClear = true;
    this.preventAll = false;
    this._skipped = 0;
    this.pEvents = {};
    this.kEvents = [];
    this.keyDefinition = {
      codes: [], index: [], names: []
    };
    this._lastPoints = {};
    this._lastKey = null;
  }

  inherit(EventPool, obj, {
    get shouldSkipFrame() {
      return this._skipped < this.skipFrameNum;
    },
    get lastPointEvents() {
      var r = [], e, ps = this.pEvents, len;
      objForEach(ps, function (array, name) {
        len = array.length;
        if (len == 0) delete ps[name];
        else e = array[len - 1];
        if (e == undefined) return;
        e.identifier = name;
        r.push(e);
      });
      return r;
    },
    get lastKeyEvents() {
      return this.kEvents.slice(-1);
    },
    ignoreEvent: function (current, preview) {
      if (preview instanceof PointEvent)
        return this.minMoveDistance > Math.abs(preview.clientX - current.clientX) + Math.abs(preview.clientY - current.clientY);
      return false;
    },
    registerHandlers: function (element) {
      if (!(element instanceof HTMLElement) || element.eventPool)return;
      var pool = this, preventFun = function (e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      };
      objForEach(handlers, function (f, name) {
        if (typeof f == "function") {
          element.addEventListener(name, f.bind(pool), true);
          element.addEventListener(name, preventFun, true);
        }
        else
          document.addEventListener(name, f.fun.bind(pool));
      });
      element.eventPool = pool;
      pool.element = element;
    },
    clear: function () {
      var pes = this.pEvents, keys = Object.getOwnPropertyNames(pes), lps = this._lastPoints;
      keys.remove('mouse');
      keys.forEach(function (name) {
        if (!lps[name] || lps[name].action == actionType.UP) delete lps[name];
      });
      this.pEvents = {};
      this.kEvents = [];
    },
    update: function (cfg) {
      if (this.preventAll)return this.clear();
      var evts = this.lastKeyEvents.concat(this.lastPointEvents);
      if (!this.shouldSkipFrame) {
        this.shouldClear = true;
        this.emit('update', [evts, cfg]);
        if (this.shouldClear)this.clear();
        this._skipped = 0;
      }
      else
        this._skipped += 1;
    },
    add: function (event) {
      var evtArray, preview;
      if (event instanceof PointEvent) {
        evtArray = this.pEvents[event.identifier];
        if (!evtArray) this.pEvents[event.identifier] = evtArray = [];
        preview = this._lastPoints[event.identifier];
        if (!event.combine(preview)) {
          evtArray.push(event);
          this._lastPoints[event.identifier] = event;
        }
      }
      else if (event instanceof KeyEvent)
        if (!event.combine(this._lastKey)) {
          this.kEvents.push(event);
          this._lastKey = event;
          event.defination = this.getKeyDefinition(event.keyCode);
        }
      return this;
    },
    addKeyDefinition: function (name, code) {
      var d = this.keyDefinition, codes = d.codes, names = d.names, nameIndex;
      if (arguments.length > 2)
        for (var i = 1, f = this.addKeyDefinition.bind(this, name), arg = arguments[i]; arg; arg = arguments[++i])
          f(arg);
      else {
        if (codes.indexOf(code) > -1)return this;
        nameIndex = names.indexOf(name);
        if (nameIndex == -1) {
          names.push(name);
          nameIndex = names.length - 1;
        }
        codes.push(code);
        d.index.push(nameIndex);
      }
      return this;
    },
    getKeyDefinition: function (keyCode) {
      var d = this.keyDefinition, nameIndex = d.index[d.codes.indexOf(keyCode)];
      return nameIndex == undefined ? undefined : d.names[nameIndex];
    },
    getKeyCodes: function (name) {
      var d = this.keyDefinition, nameIndex = d.names.indexOf(name);
      if (nameIndex < 0)return undefined;
      for (var i = 0, indecies = d.index, len = indecies.length, r = [], codes = d.codes; i < len; i++)
        if (indecies[i] == nameIndex)r.push(codes[i]);
      return r;
    },
    hasCodeDefinition: function (code) {
      return this.keyDefinition.codes.indexOf(code) != -1;
    },
    set onupdate(f) {
      if (typeof f == "function")
        this.on('update', f);
    }
  });
  function eventTypeName(type) {
    switch (type) {
      case 0:
        return 'unknown';
      case 1:
        return 'press';
      case 2:
        return 'click';
      case 3:
        return 'drag';
      case 4:
        return 'release';
      case 5:
        return 'move';
      default:
        return undefined;
    }
  }

  function equalEventType(type, name) {
    return name.toLowerCase() == eventTypeName(type);
  }

  function KeyEvent(e, action) {
    this.action = action;
    this.keyCode = e.keyCode || e.which;
    this.defination = undefined;
    this.repeat = 1;
    this.event = action == actionType.DOWN ? eventType.PRESS : eventType.RELEASE;
    this.startTime = this.timeStamp = Date.now();
  }

  function PointEvent(e, action) {
    if (e.identifier == undefined)
      e.identifier = 'mouse';
    else {
      var target = e.target;
      e.offsetX = e.clientX - target.clientLeft - target.offsetLeft;
      e.offsetY = e.clientY - target.clientTop - target.offsetTop;
    }
    this.identifier = e.identifier;
    this.action = action;
    this.clientX = e.clientX;
    this.clientY = e.clientY;
    this.offsetX = e.offsetX;
    this.offsetY = e.offsetY;
    this.dx = this.dy = 0;
    this.accumulatedX = this.accumulatedY = 0;
    this.event = eventType.NULL;
    this.startTime = this.timeStamp = Date.now();
  }

  PointEvent.prototype = {
    combine: function (preview) {
      if (!preview)
        switch (this.action) {
          case actionType.DOWN:
            this.event = eventType.PRESS;
            return false;
          case actionType.MOVE:
            this.event = eventType.MOVE;
            return false;
          case actionType.UP:
            this.event = eventType.CLICK;
            return true;
          default :
            throw '';
        }
      var pEvt = preview.event;
      this.dx = this.clientX - preview.clientX;
      this.dy = this.clientY - preview.clientY;
      switch (this.action) {
        case actionType.DOWN:
          this.event = eventType.PRESS;
          switch (pEvt) {
            case eventType.DRAG:
              preview.event = eventType.RELEASE;
              return false;
            case eventType.PRESS:
              preview.event = eventType.NULL;
              return false;
            default :
              return false;
          }
        case actionType.MOVE:
          this.startTime = preview.startTime;
          this.accumulatedX = preview.accumulatedX + this.dx;
          this.accumulatedY = preview.accumulatedY + this.dy;
          switch (pEvt) {
            case eventType.DRAG:
              this.event = eventType.DRAG;
              return false;
            case eventType.PRESS:
              this.event = eventType.DRAG;
              return false;
            default:
              if (pEvt !== eventType.MOVE)this.startTime = this.timeStamp;
              this.event = eventType.MOVE;
              return false;
          }
        case actionType.UP:
          this.startTime = preview.startTime;
          switch (pEvt) {
            case eventType.PRESS:
              this.event = eventType.CLICK;
              return false;
            case eventType.DRAG:
              this.accumulatedX = preview.accumulatedX + this.dx;
              this.accumulatedY = preview.accumulatedY + this.dy;
              this.event = eventType.RELEASE;
              return false;
            default:
              this.event = eventType.NULL;
              return true;
          }
      }
      throw '';
    },
    equalType: function (name) {
      return equalEventType(this.event, name);
    },
    get eventType() {
      return eventTypeName(this.event);
    },
    get defination() {
      return eventTypeName(this.event);
    },
    type: 'point'
  };

  KeyEvent.prototype = {
    combine: function (preview) {
      if (!preview)return false;
      if (preview.event == eventType.PRESS)
        if (this.action == actionType.DOWN) {
          this.event = eventType.PRESS;
          this.repeat += preview.repeat;
          preview.event = eventType.NULL;
          return false;
        }
        else if (preview.repeat == 1) {
          this.event = eventType.CLICK;
          return true;
        }
      return false;
    },
    equalType: function (name) {
      return equalEventType(this.event, name);
    },
    get eventType() {
      return eventTypeName(this.event);
    },
    type: 'key',
    identifier: 'key'
  };
  var handlers = {
    click: function (e) {
    },
    mousedown: function (e) {
      this.add(new PointEvent(e, actionType.DOWN));
    },
    mouseup: function (e) {
      this.add(new PointEvent(e, actionType.UP));
    },
    mousemove: function (e) {
      var cur = new PointEvent(e, actionType.MOVE),
        array = this.pEvents[cur.identifier], pre;
      if (array && array.length > 0)pre = array[array.length - 1];
      if (!this.ignoreEvent(cur, pre))
        this.add(cur);
    },
    keydown: {
      fun: function (e) {
        if (this.hasCodeDefinition(e.keyCode))
          this.add(new KeyEvent(e, actionType.DOWN));
      }
    },
    keyup: {
      fun: function (e) {
        if (this.hasCodeDefinition(e.keyCode))
          this.add(new KeyEvent(e, actionType.UP));
      }
    },
    touchstart: function (e) {
      for (var i = 0, touches = e.changedTouches, touch = touches[0]; touch; touch = touches[++i])
        handlers.mousedown.apply(this, [touch]);
    },
    touchmove: function (e) {
      for (var i = 0, touches = e.changedTouches, touch = touches[0]; touch; touch = touches[++i])
        handlers.mousemove.apply(this, [touch]);
    },
    touchend: function (e) {
      for (var i = 0, touches = e.changedTouches, touch = touches[0]; touch; touch = touches[++i])
        handlers.mouseup.apply(this, [touch]);
    },
    touchcancel: function (e) {
      for (var i = 0, touches = e.changedTouches, touch = touches[0]; touch; touch = touches[++i])
        handlers.mouseup.apply(this, [touch]);
    }

  }, exporer = {};
  exporer.getEventPool = function (element) {
    var p = element.eventPool;
    if (!p)p = new EventPool(element);
    return p;
  };

  Flip.getEventPool = exporer.getEventPool;
  return exporer;
})();