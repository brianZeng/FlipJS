declare module Flip {
    class EventEmitter {
        constructor();
        on(event:string, handler:()=>void, once?:boolean):EventEmitter;

        once(event:string, handler:()=>void):EventEmitter;

        emit(event:string, arg:any):EventEmitter;

        off(event:string, handler?:()=>void);

        forEach(callback:(val:any, key:string)=>void, thisObj?:any);
    }
    export class Render extends EventEmitter {
        render(state:RenderState);

        update(state:RenderState);

        finalize();

        invalid();
    }
    export class RenderTask extends EventEmitter {
        name:string;
        timeline:TimeLine;

        invalid();

        toFinalize(target:any);

        add(target:Render, type?:string);

        remove(target:any);
    }
    class TimeLine {
        ticksPerSecond:number;

        stop();

        start();

        move();
    }
    export class RenderGlobal extends EventEmitter {
        constructor();
        get defaultTask():RenderTask;

        getTask(name:string, createIfNot?:boolean = false);

        add(target:any);

        immediate(styleText:string):()=>void;

        refresh();

        init();

        invalid();

        loop();

        createRenderState():RenderState;
    }
    export interface EASE {
        backIn: clockEaseFunction
        backInOut: clockEaseFunction
        backOut: clockEaseFunction
        bounceIn: clockEaseFunction
        bounceInOut: clockEaseFunction
        bounceOut: clockEaseFunction
        circIn: clockEaseFunction
        circInOut: clockEaseFunction
        circOut: clockEaseFunction
        cubicIn: clockEaseFunction
        cubicInOut: clockEaseFunction
        cubicOut: clockEaseFunction
        elasticIn: clockEaseFunction
        elasticInOut: clockEaseFunction
        elasticOut: clockEaseFunction
        expoIn: clockEaseFunction
        expoInOut: clockEaseFunction
        expoOut: clockEaseFunction
        halfStep: clockEaseFunction
        linear: clockEaseFunction
        oneStep: clockEaseFunction
        quadIn: clockEaseFunction
        quadInOut: clockEaseFunction
        quadOut: clockEaseFunction
        quartIn: clockEaseFunction
        quartInOut: clockEaseFunction
        quartOut: clockEaseFunction
        quintIn: clockEaseFunction
        quintInOut: clockEaseFunction
        quintOut: clockEaseFunction
        random: clockEaseFunction
        randomLimit: clockEaseFunction
        sineIn: clockEaseFunction
        sineInOut: clockEaseFunction
        sineOut: clockEaseFunction
        zeroStep: clockEaseFunction
    }
    export class Clock extends EventEmitter {
        value:number;
        v:number;
    }
    export class Animation extends Render implements Promise {
        constructor(options:AnimationOptions|void);
        get percent():number;

        clock:Clock;

        get promise():Promise;

        get finished():boolean;

        get id():string;

        get elements():HTMLElement[];

        transform:AnimationTransformAPI;
        css:AnimationCSSProxyAPI;
        param:AnimationParamsAPI;

        start(event?:any):Animation;

        pause(event?:any):Animation;

        cancel(event?:any):Animation;

        restart(event?:any):Animation;

        resume(event?:any):Animation;

        then();
    }

    export class Promise {
        constructor(resolver:(resolve:(data:any)=>void, reject:(data:any)=>void)=>void);

        then(onData:(data:any)=>any, onError:(error:any)=>any):Promise;

        static all(promises:Promise[]):Promise;

        static resolve(data:any):Promise;

        static reject(error:any):Promise;

        static digest(promiseLike:{then:()=>void}):Promise;

        static defer():{promise:Promise;resolve:(data:any)=>void;reject:(error:any)=>void};
    }
    export class CssProxy {
        $styleText(selector:string, separator?:string):string;

        $toCachedCssString(reset:boolean):string;

        $toSafeCssString(separator?:string):string;

        $withPrefix(key:string, value:string, prefixes:string[]);

        $merge(source:Object|CssProxy):CssProxy;

        $template(template:string, ...args:string[]):string;

        $t(template:string, ...args:any[]):string;
    }
    export class Mat3 {
        constructor(def:Mat3|number[]|void);
        print():string;

        reset(elements:number[]):Mat3;

        set(col:number, row:number, value:number):Mat3;

        concat(mat:Mat3|number[]):Mat3;

        applyContext2D(ctx:CanvasRenderingContext2D):Mat3;

        clone():Mat3;

        scale(x:number, y:number):Mat3;

        skew(angle:number):Mat3;

        transform(m11:number, m12:number, m21:number, m22:number, dx:number, dy:number):Mat3;

        translate(x:number, y:number, z?:number):Mat3;

        rotate(angle:number):Mat3;

        flip(angle:number, horizontal?:boolean, ration?:number):Mat3;

        axonProject(rotateX:number, rotateY:number):Mat3;

        rotateX(angle:number):Mat3;

        rotateY(angle:number):Mat3;

        rotateZ(angle:number):Mat3;
    }
    interface RenderState {
        global:RenderGlobal;
        task:RenderTask;
        clock?:Clock;
        animation?:Animation;
        styleStack:string[];
        forceRender:boolean;
    }
    interface ClockOptions {
        ease?:string|clockEaseFunction;
        duration?:number;
        iteration?:number;
        delay?:number;
        infinite?:boolean;
        hold?:number;
        autoReverse?:boolean;
        silent?:boolean;
    }
    interface AnimationOptions extends ClockOptions {
        animationName?:string;
        selector?:string;
        fillMode?:string;
        autoStart?:boolean;
        css?:cssUpdateHandler|{[selector:string]:cssUpdateHandler|string};
        transform?:mat3UpdateHandler|{[selector:string]:mat3UpdateHandler|Mat3}|Mat3;
        on?:{[event:string]:(eventArg:any)=>void};
        once?:{[event:string]:(eventArg:any)=>void};
        variable?:Object<number|(time:number)=>any>;
        immutable?:Object<string>
    }
    interface AnimationParamsAPI {
        (key:string, value:any, immutable?:boolean):Animation;
        (map:{[key:string]:string}, immutable?:boolean):Animation;
    }
    interface AnimationCSSProxyAPI {
        (css:CssProxy|cssUpdateHandler):Animation;
        (selector:string, css:cssUpdateHandler):Animation;
        (proxyMap:{[selector:string]:cssUpdateHandler|CssProxy}):Animation;
    }
    interface AnimationTransformAPI {
        (transform:mat3UpdateHandler|Mat3):Animation;
        (selector:string, transform:mat3UpdateHandler|Mat3):Animation;
        (transformMap:{[selector:string]:mat3UpdateHandler|Mat3}):Animation;
    }
    interface cssUpdateHandler {
        (css:CssProxy, params:Object):void
    }
    interface mat3UpdateHandler {
        (mat:Mat3, params:Object):void|Mat3
    }
    interface clockEaseFunction {
        (time:number):number
    }

    export function stringTemplate(template:string, ...args:string[]):string;

    export function animate(options:AnimationOptions):Animation;

    export function $(selector:string, element?:HTMLElement|Document = document):HTMLElement;

    export function $$(selector:string, element?:HTMLElement|Document = document):HTMLElement[];
    export function parseCssText(cssText:string):{[property:string]:string}
    export function parseStyleText(styleText:string):{[selector:string]:{[property:string]:string}[]}
}
declare interface Flip{
    (onDomReady:(f_module:Flip)=>void):void;
    (animationOptions:Flip.AnimationOptions):void;
    instance:Flip.RenderGlobal;
    css(selector:string,rule:{[key:string]:string}):()=>void;
    css(ruleMap:{[selector:string]:{[key:string]:string}}):()=>void;
    transform(selector:string,mat:Flip.Mat3):()=>void;
    transform()
}
