#construct
Animation Construct Options
```` javascript
//default values
{
    duration:.7            //animation duration in second
    selector:''            //css selector to apply animation
    iteration:1            //how many times it will iterate
    delay:0                //how many seconds it will delay after starts
    infinite:false          //ignore iteration and replay forever
    autoReverse:false       //it will replay in reverse order if true
    autoStart:true          //will it start immediately,otherwise you should call Animation#start()
    persistAfterFinished:false  //will the animation css still apply after it ends
    ease:Flip.EASE.LINEAR   //easing function of the animation
    animationType:''        //search for registered animation
    css:{}                  //css rules for animation
    transform:{}            //transform rules for animation
    on:{}                   //event handlers for animation
    once:{}                 //event handlers(fire once) for animation
    variable:{}             //variable parameter of the animation(the value update with animation#percent in every frame)
    immutable:{}            //immutable parameter of the animation
}
````
you can also use `new Flip.Animation(options)` to construct an animation,but you should add it to a specific RenderTask.

if use `Flip(options)` to construct an animation,this animation will be added to default RenderGlobal,mostly you don't need to care about this

#event
you can see [this example](../demo/rotate-ring.html) for using animations events and css transition to loop animation
```` js


````
