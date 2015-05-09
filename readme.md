#Quick Start
install flipJS by bower

````
bower install flip-js
````

include the file in your HTML,and then write your first animation with flip
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
this animation starts after dom ready you don't need to worry about timing,for more details check [construct options](doc/animation.md#construct) and [animation events](doc/animation.md#event)
# Calculation parameter
To translate an element from 20 to 100 in x direction,you can write directly
```` javascript
Flip({
    transform:function(mat){
        mat.translate(20+80*this.percent);
    }
})
````
But this is not an optimistic way,because the distance may change making the code difficult to maintain.It is recommended to write code like blow
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
We want the math formula and css rules be decoupled with the data,making it easy to debug and reuse.
When updating,the animation combines the *immutable* and *variable* values to one object then pass to  `function transform(mat,param)` and `function css(css,param)` .
As the name suggests,immutable values keep the same in every frame,while every variable value is multiplied by animation percentage.
````
Animation
    -percentage
    -immutable          param
        -a               -a
        -b         --->  -b
    -variable            -c*percentage
        -c               -d*percentage
        -d
````
#Animation Components



