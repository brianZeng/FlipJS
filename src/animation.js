/**
 * Created by 柏然 on 2014/12/13.
 */
/**
 * @namespace Flip.Animation
 * @param {AnimationOptions} opt
 * @returns {Flip.Animation}
 * @property {number} percent the percentage of the animation [0-1]
 * @property {boolean} finished if the animation is finished
 * @property {Flip.Promise} promise the animation promise for continuation
 * @property {Flip.Clock} clock animation clock for timing
 * @constructor
 */
function Animation(opt) {
  if (!(this instanceof Animation))return new Animation(opt);
  var r = Animation.createOptProxy(opt).result;
  this.selector= r.selector||Error('Elements selector required');
  this.clock = r.clock;
  this.persistAfterFinished= r.persistAfterFinished;
  this._cssMap={};
  this._matCallback={};
  this._cssCallback={};
  this._immutable={};
  this._variable={};
  this._param={};
  this.current={};
  this.use(opt);
  this.init();
}
inherit(Animation,Render,
  /**
   * @lends Flip.Animation.prototype
   */
  {
  get percent(){
    return this.clock.value||0;
  },
  set clock(c) {
    var oc = this._clock;
    c = c || null;
    if (oc == c)return;
    if (oc && c)throw Error('remove the animation clock before add a new one');
    this._clock = c;
    //add a clock
    if (c) {
      c.controller = this;
    }//remove a clock
    else if (oc) {
      oc.controller = null;
    }
  },
  get clock() {
    return this._clock;
  },
  get promise(){
    return this._promise||(this._promise=getPromiseByAni(this));
  },
  get finished() {
    return this._finished;
  },
  get id() {
    if (!this._id)this._id = nextUid('Animation'+this.type);
    return this._id;
  },
  get elements() {
    return Flip.$(this.selector);
  },
    /**
     * mostly you don't need to call this manually
     * @alias Flip.Animation#init
     * @function
     */
  init:function(){
    this._promise=null;
    this._canceled=this._finished=false;
    this.invalid();
  },
    /**
     * reset the animation
     * @alias Flip.Animation#reset
     * @function
     * @return {Flip.Animation} the animation itself
     */
  reset:function(skipInit){
    var clock;
    if(clock=this.clock)
      clock.reset(1);
    if(!skipInit)
      this.init();
    return this;
  },
  use:function(opt){
    useAniOption(this,opt);
    return this;
  },
    /**
     * set the animation calculate parameter
     * @alias Flip.Animation#param
     * @param {string|Object}key
     * @param {?any}value
     * @param {?boolean}immutable is it an immutable param
     * @returns {Flip.Animation}
     * @example
     * ani.param('rotation',Math.PI*2);
     * ani.param({
     *  translateX:100,
     *  translateY:200
     * });
     * // you can use {@link AnimationOptions} to set param when construct
     * Flip({
     *  immutable:{
     *    width:200
     *  },
     *  variable:{
     *    scaleX:2
     *  }
     * })
     */
  param:function(key,value,immutable){
    if(isObj(key))
      cloneWithPro(key,this[value?'_immutable':'_variable']);
    else if(typeof key==="string")
      this[immutable?'_immutable':'_variable'][key]=value;
    return this;
  },
    /**
     * set the animation transform update function
     * @see {@link Flip.Mat3} for matrix manipulation
     * @alias Flip.Animation#transform
     * @param {string|transformUpdate|AnimationTransformOptions}selector
     * @param {transformUpdate}matCallback
     * @returns {Flip.Animation}
     * @example
     * ani.transform(function(mat,param){
     *  mat.translate(param.translateX,param.translateY)
     * });
     * ani.transform('.rotate',function(mat,param){
     *  mat.rotate(param.rotation)
     * });
     * //or set with {@link AnimationOptions}
     * ani.transform({
     *  '&':function(mat){};
     *  '& div':function(mat){};
     * })
     */
  transform:function(selector,matCallback){
    var map=this._matCallback;
    objForEach(normalizeMapArgs(arguments),function(callback,selector){
      addMap(selector,map,callback)
    });
    return this;
  },
    /**
     * set the css update function
     * @alias Flip.Animation#css
     * @param {string|cssUpdate|AnimationCssOptions}selector
     * @param {Object} [mapOrFunc]
     * @returns {Flip.Animation}
     * @see {@link CssProxy}
     * @example
     * ani.css('&:hover',{fontSize:'larger'});
     * ani.css(function(css,param){
     *  css.withPrefix('border-radius',param.borderRadius);
     * });
     * //set multiple rules
     * ani.css({
     *  '&.invalid':{
     *    backgroundColor:'#333'
     *  },
     *  '&.invalid >*':function(css){
     *    css.opacity=1-this.percent
     *  }
     * })
     */
  css:function(selector,mapOrFunc){
    var map=this._cssCallback;
    objForEach(normalizeMapArgs(arguments),function(callback,selector){
      addMap(selector,map,callback)
    });
    return this;
  },
  update: function (state) {
    updateAnimation(this,state);
  },
  render: function (state) {
    renderAnimation(this,state);
  },
  invalid: function () {
    if (this._task)this._task.invalid();
  },
  finalize:function(){
    var task;
    if(task=this._task)
    {
      this._ltName=task.name;
      task.toFinalize(this);
    }
    else if(!this._canceled) {
      this.reset(1);
      this.emit(ANI_EVT.FINALIZE);
    }
    return this;
  },
  getStyleRule:function(){
    return getAnimationStyle(this);
  },
    /**
     * start the animation, it won't take effect on started animation
     * @returns {Flip.Animation} return itself
     */
  start:function(){
    findTaskToAddOrThrow(this);
    return this._canceled? this.restart():invokeClock(this,'start');
  },
    /**
     * @alias Flip.Animation#resume
     * @param {Object} [evt] trigger event param
     * @returns {Flip.Animation} returns itself
     */
  resume:function(evt){
    return invokeClock(this,'resume',ANI_EVT.RESUME,evt);
  },
    /**
     * @alias Flip.Animation#pause
     * @param {Object} [evt] trigger event param
     * @returns {Flip.Animation} returns itself
     */
  pause:function(evt){
    return invokeClock(this,'pause',ANI_EVT.PAUSE,evt);
  },
    /**
     * @alias Flip.Animation#cancel
     * @param {Object} [evt] trigger event param
     * @returns {Flip.Animation} returns itself
     */
  cancel:function(evt){
    var t;
    if(!this._canceled &&!this._finished){
      if(t=this._task)this._ltName=t.name;
      this._canceled=true;
      this.emit(ANI_EVT.CANCEL,evt);
      this.finalize();
    }
    return this;
  },
    /**
     * @alias Flip.Animation#restart
     * @returns {Flip.Animation} returns itself
     */
  restart:function(opt){
    findTaskToAddOrThrow(this,opt);
    this.clock.reset();
    this.init();
    return this.start();
  },
    /**
     * @alias Flip.Animation#then
     * @param {function} [onFinished] callback when animation finished
     * @param {function} [onerror] callback when animation interrupted
     * @returns {Flip.Promise}
     */
  then:function(onFinished,onerror){
    return this.promise.then(onFinished,onerror);
  }
});
/** triggered when in every frame after animation starts
 * @event Flip.Animation#update  */
/** triggered when animation render new frame
 * @event Flip.Animation#render  */
/** triggered when animation ends
 * @event Flip.Animation#finish  */
/** triggered when animation is finalized
 * @event Flip.Animation#finilize  */
/** triggered when animation is canceled
 * @event Flip.Animation#cancel  */
/** triggered when animation is paused
 * @event Flip.Animation#pause   */
/** triggered when animation is resumed from pause
 * @event Flip.Animation#resume  */
var ANI_EVT=Animation.EVENT_NAMES =Object.seal({
  UPDATE: 'update',
  FINALIZE: 'finalize',
  RENDER: 'render',
  FINISH: 'finish',
  CANCEL:'cancel',
  PAUSE:'pause',
  RESUME:'resume'
});
function findTaskToAddOrThrow(ani,opt){
  var t,global;
  if(!(t=ani._task)){
    opt=opt||{};
    t=opt.task||(global=opt.global||FlipScope.global).getTask(opt.taskName||ani._ltName)||global.defaultTask;
    if(t instanceof RenderTask)
      t.add(ani);
    else
      throw Error('please specify the render task for animation to restart');
  }return t;
}
function invokeClock(animation,method,evtName,evtArg){
  var clock=animation.clock;
  if(clock){
    clock[method]();
    if(evtName) animation.emit(evtName,evtArg);
  }
  return animation;
}
function getPromiseByAni(ani){
  return FlipScope.Promise(function(resolve,reject){
    ani.once(ANI_EVT.FINISH,function(state){
      if(state&&state.global)
        state.global.once('frameEnd',go);
      else go();
    }).once(ANI_EVT.CANCEL,function(){reject(ani)});
    function go(){resolve(ani);}
  });
}
function cloneWithPro(from,to){
  var pro,getter;
  to=to||{};
  objForEach(from,function(value,key){
    if((pro=Object.getOwnPropertyDescriptor(from,key))&&(typeof (getter=pro.get)=="function"))
      Object.defineProperty(to,key,{get:getter});
    else to[key]=value
  });
  return to;
}
Animation.createOptProxy = function (setter,selector,persist) {
  setter = createProxy(setter);
  if (!setter.proxy.clock)
    setter('clock', new Clock(setter));
  setter('selector',selector);
  setter('persistAfterFinished',persist);
  return setter;
};
/**
 * construct an animation instance see {@link AnimationOptions}
 * you can also construct an animation by {@link Flip.Animation}
 * @function
 * @param {AnimationOptions} opt
 * @memberof Flip
 * @return {Flip.Animation}
 * @example
 * //start animation when dom ready
 * Flip(function(){
 *  //imitate 3D rotateZ
 *  Flip.animate({
 *     selector:'.double-face',
 *    duration:.8,
 *    autoReverse:true,
 *    iteration:2,
 *    immutable:{
 *      width:150
 *    },
 *    variable:{
 *      rotation:Math.PI,// every frame,it will refresh the param.rotation from 0 to Math.PI
 *      showFront:function(percent){
 *        //if it rotate to back end the front end will not display
 *        return percent <= 0.5
 *      }
 *    },
 *    css:{
 *      '&,& div':function(css,param){
 *        css.width=css.height=param.width+'px';
 *      },
 *      '& .front':function(css,param){
 *        css.display=param.showFront? 'block':'none';
 *        css.backgroundColor='orange';
 *      },
 *      '& .back':function(css,param){
 *        css.display=!param.showFront? 'block':'none';
 *        css.backgroundColor='yellow';
 *      }
 *    },
 *    transform:{
 *     '&':function(mat,param){
 *        mat.flip(param.rotation);
 *      }
 *    }
 *  })
 * });
 */
function animate(opt) {
  if (isObj(opt)) {
    var  constructor = Flip.animation[arguments[0].animationType];
    opt = arguments[0];
  }
  else throw Error('cannot construct an animation');
  if (!constructor) constructor = Animation;
  return setAniEnv(animate.createOptProxy(opt).result, new constructor(opt));
  }
function setAniEnv(aniOpt, animation) {
  (aniOpt.renderGlobal||FlipScope.global).getTask(aniOpt.taskName,true).add(animation);
  if(aniOpt.autoStart!==false)
    animation.start();
  return animation;
}
animate.createOptProxy = function (setter, autoStart, taskName, defaultGlobal) {
    setter = createProxy(setter);
    setter('autoStart', autoStart, 'taskName', taskName, 'renderGlobal', defaultGlobal);
    return setter;
};

Flip.animate = animate;
/**
 * set css style immediately,you can cancel it later
 * @param {string|AnimationCssOptions} selector
 * @param {?Object} rule
 * @memberof Flip
 * @returns {function} cancel the css style
 * @example
 * var cancel=Flip.css('.content',{
 *  width:document.documentElement.clientWidth+'px',
 *  height:document.documentElement.clientHeight+'px'
 * });
 *  //cancel the style 2s later
 *  setTimeout(cancel,2000);
 *  // you can pass multiple style rules
 *  Flip.css({
 *    body:{
 *      margin:0
 *    },
 *    '.danger':{
 *       color:'red',
 *       borderColor:'orange'
 *    }
 *  })
 */
Flip.css=function(selector,rule){
  var literal=[];
  if(arguments.length==2){
    resolve(rule,selector);
  }
  else if(isObj(selector)){
    objForEach(selector,resolve)
  }
  else throw Error('argument error');
  return FlipScope.global.immediate(literal.join('\n'));
  function resolve(rule,selector){
    var str=getStyleRuleStr(resolveCss(rule),selector,'\n',1);
    if(str)literal.push(str);
  }
};
/**
 * set transform style immediately
 * @param {string|AnimationTransformOptions} selector
 * @param {?Object|Flip.Mat3} rule
 * @memberof Flip
 * @returns {function} cancel the css style
 * @example
 * Flip.transform('.scale',Flip.Mat3().scale(0.5))
 */
Flip.transform=function(selector,rule){
  var matMap={},literal=[];
  if(arguments.length==2)
    warpMatrix(rule,selector);
  else if(isObj(selector))
    objForEach(selector,warpMatrix);
  else throw Error('argument error');
  objForEach(matMap,function(mat,selector){
    literal.push(selector,'{','transform:'+mat,'}')
  });
  return FlipScope.global.immediate(literal.join('\n'));
  function warpMatrix(val,selector){
    var mat;
    if(isFunc(val)) mat=val(mat=new Mat3())||mat;
    else if(val instanceof Mat3) mat=val;
    else mat=new Mat3(val);
    matMap[selector]=mat;
  }
};
Flip.animation = (function () {
  function register(definition) {
    var beforeCallBase, name = definition.name, Constructor,afterCallBase;
    beforeCallBase = definition.beforeCallBase || _beforeCallBase;
    Constructor = function (opt) {
      if (!(this instanceof Constructor))return new Constructor(opt);
      var proxy = createProxy(opt);
      beforeCallBase.apply(this, [proxy, opt]);
      Animation.call(this,opt);
      (definition.afterInit||noop).call(this,proxy,opt);
    };
    if (name) {
      register[name] = Constructor;
      Constructor.name = name;
    }
    inherit(Constructor, Animation.prototype,{
      type:definition.name,
      use:function(opt){
        return useAniOption(this,definition,opt);
      }
    });
    return Constructor;
  }
  return register;
  function _beforeCallBase(proxy, opt, definition) {
    return proxy;
  }
})();
function useAniOption(animation){
  for(var i= 1,opt=arguments[1],optPro;opt;opt=arguments[++i])
  {
    useAniOption.pros.forEach(function(proName){
      if(isFunc(optPro=opt[proName]))
        animation[proName](optPro);
      else if(isObj(optPro)){
        hasNestedObj(optPro)? objForEach(optPro,function(rule,slt){animation[proName](slt,rule)})
          :animation[proName](optPro);
      }});
    animation.param(opt.param).param(opt.variable).param(opt.immutable,true);
  }
  return animation;
}
useAniOption.pros=['transform','css','on','once'];
function normalizeMapArgs(args){
  var ret={},arg;
  if(args.length==2){
    ret[args[0]]=args[1];
  }
  else if(isFunc(arg=args[0])||!hasNestedObj(arg)){
    ret['&']=arg;
  }
  else if(!isObj(arg)) throw Error('argument Error');
  //isNestedObj
  else{
    ret=arg;
  }
  return ret;
}
function hasNestedObj(obj){
  return isObj(obj)&&Object.getOwnPropertyNames(obj).some(function(key){
      var t=typeof obj[key];
      return t=="object"||t=="function"
    });
}
Flip.Animation=Animation;

