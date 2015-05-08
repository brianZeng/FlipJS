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
