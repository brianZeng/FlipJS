#Construct
Animation Construct Options
```` javascript
//default values
{
    duration:.7            //animation duration in second
    selector:''            //css selector to apply animation
    iteration:1            //how many times it will iterate, an animation will not delay since the second iteration
    delay:0                //how many seconds it will delay after started
    infinite:false          //ignore iteration and replay forever
    autoReverse:false       //it will replay in reverse order if true
    autoStart:true          //will it start immediately, otherwise you should call Animation#start()
    fillMode:'remove'       // 'remove','snapshot','keep'
    ease:Flip.EASE.LINEAR   //easing function of the animation
    animationType:''        //search for registered animation type
    css:{}                  //css rules for animation
    transform:{}            //transform rules for animation
    on:{}                   //event handlers for animation
    once:{}                 //event handlers(fire once) for animation
    variable:{}             //variable parameter of the animation(these values update with animation#percent in every frame)
    immutable:{}            //immutable parameter of the animation
}
````
You can also use `new Flip.Animation(options)` to construct an animation, but you should add it to a specific RenderTask.
If use `Flip(options)` to construct an animation, this animation will be added to default RenderGlobal, mostly you don't need to care about this.

#Event
By default, an animation update itself in forward direction, changing `animation#percent` from 0 to 1.
If `animation#autoReverse` it will update itself in backward direction, changing `animation#percent` from 1 to 0, after it ends in forward direction.
Animation events are:
* **init**          when it first update its time line
* **finished**      when it ends (this will never triggered if `animation#infinite`)
* **reverse**       when it begin to update in backward direction
* **iterate**       when it ends one iteration
* **start**         when it really begin to play (After delay)
* **update**        when it update frame
* **render**        when it render
* **cancel**        when it is canceled
* **pause**         when it is paused
* **resume**        when it is recovered from pause
* **finalize**      when it is finalized (Do resource clean in this event)

###What is "one iteration"
With different properties, animations update like below

* autoReverse = true,infinite = false

    0(fires **start** once after delay) ---> 1(fires **reverse**) ---> 0 (fires **iterate/end**)
* autoReverse = false,infinite = false

    0(fires **start** once after delay) ---> 1(fires **iterate/end**)
* autoReverse = false,infinite = true

    0(fires **start** once after delay) ---> 1(fires **iterate**)
* autoReverse = true,infinite = true

    0(fires **start** once after delay) ---> 1(fires **reverse**) ---> 0 (fires **iterate**)

----
you can see [this example](../demo/rotate-ring.html) for using animations events and css transition to loop animation.

