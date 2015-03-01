window.addEventListener('DOMContentLoaded', function () {
    function Atrk(opt) {
      this.reset(opt);
    }
    var flowerImg=(function(){
      var dataUrl='data:image/png;base64,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',img=new Image();
      img.src=dataUrl;
      img.onload=function(){
        imgHeight=img.naturalHeight;
        imgWidth=img.naturalWidth;
      };
      return img;
    })(),imgWidth,imgHeight;
    Atrk.prototype = {
      paint: function (ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.drawImage(flowerImg,0,0,imgWidth,imgWidth,0,0,this.size,this.size);
        /*ctx.fillStyle = ctx.getGradient(this.size);
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();*/
        ctx.restore();
      },
      reset: function (opt) {
        this.size = opt.size || 10;
        this.angle=opt.angle||0;
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
            size: random(10),
            angle:random(Math.PI*2),
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
