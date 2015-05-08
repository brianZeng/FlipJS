###quick start
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
this animation starts after dom ready you don't need to worry about timing,for more options see
and see  for animation event
### calculation parameter
to translate an element from 20 to 100 in x direction,you can write directly
```` javascript
Flip({
    transform:function(mat){
        mat.translate(20+80*this.percent);
    }
})
````
but this is not an optimistic way,because the distance may change making the code difficult to maintain
````
Flip({
    immutable:{
        sx:20
    },
    variable:{
        dx:80,
        tx:function(percent){return 20+80*percent} //you can also pass a function
    },
    transform:function(mat,param){
        mat.translate(param.sx+param.dx)
        //or mat.translate(param.tx)
    }
})
````
the values in variable and immutable will merge to the second parameter of transform function,as the name suggests,
immutable values keep the same in every frame,the animation auto update the variable with animation percentage,
in this way you can focus on the transform formula and css rules


