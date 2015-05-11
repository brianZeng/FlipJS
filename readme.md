#FlipJS -The only limit is your imagination.
##Quick Start
Install FlipJS by bower.
````
bower install flip-js
````
Include the file in your HTML, and write your first animation with flip.
```` HTML
<div class='cubic'></div>
<script>
Flip({
    selector:'.cubic',
    infinite:true,
    css:{
        width:100+'px',
        height:100+'px',
        margin:'40px auto',
        background:'red'
    },
    variable:{
        rotation:Math.PI*2
    },
    transform:function(matrix,param){
        matrix.flip(param.rotation)
    }
})
</script>
````
This animation starts after dom ready, so you don't need to worry about timing. For more details, please check [construct options](doc/animation.md#construct) and [animation events](doc/animation.md#event)
## Calculation Parameter
To translate an element from 20 to 100 in x direction, you can write directly:
```` javascript
Flip({
    transform:function(mat){
        mat.translate(20+80*this.percent);
    }
})
````
But this is not an optimistic way, because possible distance changes will make the code difficult to maintain. It is recommended to write code like below:
```` javascript
Flip({
    immutable:{
        sx:20
    },
    variable:{
        dx:80
    },
    transform:function(mat,param){
        mat.translate(param.sx+param.dx)
    }
});
//or
Flip({
    variable:{
        tx:function(percent){return 20+80*percent}
    },
    transform:function(mat,param){
        mat.translate(param.tx)
    }
});
````
We want the math formula and css rules decoupled with the data, making it easy to debug and reuse.
When updating, the animation combines the *immutable* and *variable* values to one object, then pass this object to  `function transform(mat,param)` and `function css(css,param)`.
As the name suggests, immutable values keep the same in every frame, while every variable value is multiplied by animation percentage.
````
Animation
    -percentage
    -immutable:{
         a:any           param:{
         b:any              a:immutable.a,
       }          --->      b:immutable.a,
    -variable:{             c:variable.c * percent,
        c:number            d:variable.d(percent)
        d:function(){}     }
       }
````
##Animation Components
The amazing effects take efforts and many elements.
Suppose we want a two-sides card and make it rotate, this requires at least 3 elements,
You may write the code according to the HTML elements to make the animation as a whole component, [see the details](demo/two-sides-card.html)
```` HTML
<div class='flip-card'>
    <img class='front-side'>
    <img class='back-side'>
</div>
<script>
//details are omitted
//'&' represents the animation selector
Flip({
    selector:'.flip',
    css:{
        '&':{},
        '& img':{},
        '& .front-side':function(css){}
        '& .back-side':function(css){}
    },
    transform:{
        '& .back-side':function(mat){},
        '& .front-side':function(mat){}
    }
})
</script>
````
In this way, you can also use the animation for other elements, just change the selector and animation options.
With your cool imagination you can have your special animation toolkit!
#Animation Continuation
Combine animations in sequence is another aspect of "async programming". The easiest way to do this is to use callbacks.
```` js
Flip.animate(optA).on('finish',function(){
    //do something
    Flip.animate(optB).on('finish',function(){
        //do something
        Flip.animate(optC)
    });
});
````
"The Callbacks Hell" comes with the increasing amount of animation. In the callback way, It is tedious to control the orders.
Imaging after animation B we need start C,D together and wait both of them to finish before starts animation E, you don't want your code like this
```` js
Flip.animate(optA).on('finish',function(){
    //do something
    Flip.animate(optB).on('finish',function(){
        //do something
        var completed=0;
        Flip.animate(optC).on('finish',onfinish);
        Flip.animate(optD).on('finish',onfinish);
        function onfinish(){
            if(++completed==2)
                Flip.animate(optE)
        }
    });
});
````
The better way is to use [Promise](https://github.com/petkaantonov/bluebird#what-are-promises-and-why-should-i-use-them) to rewrite code like below:
```` js
Flip.animate(optA).then(optB).then([optC,optD]).then(optE)
````
Please check [the differences in promise](doc/promise.md) and [the example](demo/world-map.html) before try the cool stuff.

