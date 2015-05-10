#Construct
Animation Construct Options
```` javascript
//default values
{
    duration:.7            //animation duration in second
    selector:''            //css selector to apply animation
    iteration:1            //how many times it will iterate,an animation will not delay since the second iteration
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
You can also use `new Flip.Animation(options)` to construct an animation, but you should add it to a specific RenderTask.
If use `Flip(options)` to construct an animation,this animation will be added to default RenderGlobal,mostly you don't need to care about this

#Event
By default, an animation update itself in forward direction, changing `animation#percent` from 0 to 1.
If `animation#autoReverse` it will update itself in backward direction, changing `animation#percent` from 1 to 0, after it ends in forward direction.
Animation events are:
* init          when it first update its time line
* finished      when it ends (this will never triggered if `animation#infinite`)
* reverse       when it begin to update in backward direction
* iterate       when it ends one iteration (If it auto reverse, one iteration is one forward updating plus by one backward updating)
* start         when it really begin to play (After delay)
* update        when it update frame
* render        when it render
* cancel        when it is canceled
* pause         when it is paused
* resume        when it is recovered from pause
* finalize      when it is finalized (Do resource clean in this event)
you can see [this example](../demo/rotate-ring.html) for using animations events and css transition to loop animation

