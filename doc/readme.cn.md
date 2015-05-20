#FlipJS -所想即所能

##开始旅程
最便捷的方法是使用bower进行安装
````
bower install flip-js
````
当页面中加载了flip.js文件后，就可以写小动画了！
```` HTML
<div class='cubic'></div>
<script>
//这是一个旋转的小方块
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
当DOM Ready 事件后，动画开始执行，点此查看[动画构建参数](animation.md#construct)和[动画播放事件](animation.md#event)。
更多有趣的例子在[demo](../demo)文件夹中，有兴趣的话打开看看吧！
##简化计算
如果我们要把一个元素在x方向从 20 移动到 100，你可以这样写代码
To translate an element from 20 to 100 in x direction, you can write directly:
```` javascript
Flip({
    ....
    transform:function(mat){
        //this.percent 代表动画进程，当一个动画从开始到结束时，动画进程从0增加到1
        mat.translate(20+80*this.percent);
    }
})
````
但我觉得这不是组织良好的代码，好的代码要能复用，所以建议你这样写
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
````
上面的动画同样表示 从 20 移动到 100，不过这样的写法实现了代码和数据的分离，方便修改和调试。

当动画每帧更新时，`variable`里面的数据会被自动乘以动画进程`animation.percent`,
而`immutable`中的数据会保持定值，数据按照相同的key被合并到一个新的Object中，作为`function transform(mat,param)`的第二个参数，
而第一个参数是一个矩阵，如果想挑战炫酷的动画，[了解矩阵运算](matrix.md)还是很必要的。
用图来解释`param`是怎么合成的
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
        //可以是function(percent){}->any
       }
````
##动画组件
三个臭皮匠赛过诸葛亮，一个好的动画也需要很多元素的组合。

让我们来做一个可以正反面翻转的卡片，动画需要三个元素，卡片的正反面和卡片的容器。
下面的代码是简化代码，[这里是详细代码](two-sides-card.html)
```` HTML
<div class='flip-card'>
    <img class='front-side'>
    <img class='back-side'>
</div>
<script>
//省略具体计算细节
//'&' 代表 animation.selector，也就是说 '& img' 会被转化为 '.flip img'
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
当动画以组件的形式实现时，再复杂的动画也可以很容易被重用，如果写的多了，就会拥有一个属于自己的创意原地。
##动画衔接
这两年“异步编程”这个概念在JS领域很火，动画衔接也需要用到异步模型，请记住*一个为时2秒的动画，不一定会在开始后2秒停止*。
这其中的原因主要在于显示器刷新频率，所以一般来说我们用回调来进行动画衔接。
```` js
Flip.animate(optA).on('finish',function(){
    //do something
    Flip.animate(optB).on('finish',function(){
        //do something
        Flip.animate(optC)
    });
});
````
上述是顺序A—B—C动画，用回调来衔接虽然简单，但是随着动画数目增多，就会出现“嵌套危机”(Callbacks Hell)。
不仅如此，有些时候流程控制是十分繁琐的，如果要等待多个动画完成，那么还需要计数器。
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
上面的代码表示A—B—[C,D]—E，当B结束后开始C和D，最后当C和D都结束时开始E，代码不难懂，就是看着难受。

建议用Promise模型来改写上面的代码，简单明了：
```` js
Flip.animate(optA).then(optB).then([optC,optD]).then(optE)
````
没错，这是真的，这不是梦。掌握了[动画Promise](promise.md)，动画衔接变得超级轻松(so easy),
在使用它之前，建议你看看[使用Promise的例子](../demo/world-map.html)
