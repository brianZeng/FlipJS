window.addEventListener('DOMContentLoaded', function () {
    function Atrk(opt) {
      this.reset(opt);
    }

    Atrk.prototype = {
      paint: function (ctx) {
        ctx.save();
        ctx.fillStyle = ctx.getGradient(this.size);
        ctx.translate(this.x, this.y);
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      },
      reset: function (opt) {
        this.size = opt.size || 5;
        this.x = opt.x || 0;
        this.y = opt.y || 0;
        this.vx = opt.vx || 1;
        this.vy = opt.vy || 3;
        this.now = opt.now || Date.now();
      },
      move: function (now) {
        var last, time;
        last = this.now;
        time = (now - last) / 1000;
        this.x += this.vx * time;
        this.y += this.vy * time;
        this.now = now;
        return this;
      }
    };
    function Stage(opt) {
      var ctx, gm;
      ctx = this.ctx = (this.cvs = document.createElement('canvas')).getContext('2d');
      gm = this.gradients = {};
      ctx.getGradient = function (size) {
        // return 'white';
        size = parseInt(size);
        var g = gm[size];
        if (!g) {
          gm[size] = g = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
          g.addColorStop(0, 'white');
          g.addColorStop(0.8, 'rgba(200,200,200,0.5)');
          g.addColorStop(0.9, 'rgba(0,0,0,0)');
        }
        return g;
      };
      this.width = opt.width || 512;
      this.height = opt.height || 512;
      this.maxVy = opt.maxVy || 8;
      this.atrks = [];
      this.maxAtrk = opt.maxAtrk || 200;
    }

    Stage.prototype = {
      set height(v) {
        this.cvs.height = parseInt(v);
      },
      get height() {
        return this.cvs.height
      },
      set width(v) {
        this.cvs.width = parseInt(v);
      },
      get width() {
        return this.cvs.width;
      },
      addAtrks: function (num) {
        var max = num, now = Date.now(), vy = this.maxVy;
        if (max + this.atrks.length >= this.maxAtrk)
          max = this.maxAtrk - this.atrks.length;
        for (var i = 0, atrks = [], width = this.width, h = this.height, dx = width / max; i < max; i++)
          atrks.push(new Atrk({
            y: random(h) - h,
            x: random(dx) + dx * i,
            vx: random(20) - 10,
            vy: random(vy) + vy,
            size: random(5),
            now: now
          }));
        atrks.push.apply(this.atrks, atrks);
        return atrks;
      },
      init: function () {
        this.paint();
      },
      paint: function () {
        var self = this, ctx = this.ctx, time = Date.now(), h = this.height, w = this.width;
        ctx.clearRect(0, 0, this.width, h);
        this.addAtrks(20);
        this.atrks.forEach(function (artk) {
          artk.move(time).paint(ctx);
        });
        this.atrks = this.atrks.filter(function (a) {
          return a.y < h;
        });
        window.requestAnimationFrame(function () {
          self.paint();
        });
      }
    };
    function random(num) {
      return Math.random() * num || 1
    }

    function $$(slt) {
      return Array.prototype.slice.apply(document.querySelectorAll(slt));
    }

    if (!window.requestAnimationFrame)
      window.requestAnimationFrame = function (callback) {
        setTimeout(callback, 30);
      };
    $$('.snow-board').forEach(function (ele) {
      var stage, img = ele.getElementsByTagName('img')[0];

      function init() {
        var style;
        stage = new Stage({width: ele.clientWidth, height: ele.clientHeight, maxVy: 9});
        stage.init();
        ele.insertBefore(stage.cvs, ele.childNodes[0]);
        style = stage.cvs.style;
        style.float = 'left';
        style.position = 'absolute';
      }

      if (img)
        if (img.complete) init();
        else img.onload = init;
    });
  }
);
