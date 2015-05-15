#Animation as Promise
If you are familiar with promise, just read the code examples to see the differences between the standard promise.
You may think that promises is something will be cast to animations, if you pass a construct option to `animation#then()`, 
the option will be cast to an animation, you can continue you animation in a simple way without callback.
what's more `animation#then()` returns another promise can be called `then()` again.
`animation.then(optA).then(optB).then(optC)` will cast these options when the previous animation ends.
You can pass another option to the second parameter of `then()`, which will be cast to an animation if the previous animation is cancelled.
So `animation.then(optS,optF)` will be continued by `optS` if it finishes timing and ends, or by `optF` if `animation.cancel()` is called before normally ends.
An animation can not be both ends or cancelled ,so if you cancel it after finished, `optF` will not be cast.
`animation.then(optC,optC)` will make the animation always continued by what optC cast.
#Thenable
There are four types of argument can be pass to `animation#then()`
### Animation Like
You can pass an animation options or an animation instance
```` js
Flip.animate(optA).then(OptB);//or
Flip.animate(optA).then(Flip.animate(OptB));
````
These two method are slightly different. The first line construct animation B after animation A finished, while the second construct A,B at the same time.
You should pay attention the time if construct OptB has side effects.
### Promise
If animation B requires an image to play, you should wait until the image and animation A both are complete,so convert the animation to a promise.
```` js
var promiseB=new Flip.Promise(function(resolve,reject){
  var img=new Image();
  //init image;
  img.onload=function(){
    resolve(optB);
  };
  img.onerror=function(){
    reject(optB);
  }
});
animationA.then(promiseB);
````
You don't need to worry which will complete first.
### Array
If you pass an array, every element of the array should be Animation Like or Animation Promise.This will cast the array to a promise,
which waits all of the elements.
````js
animation.then([optA,optB,animationC,PromiseD]);
````
### Function
The standard way of promise is to pass a function to execute after async task end. The function should return value of previous three types.
````js
animation.then(function(lastAnimation){
    return optA
});
var animationB=Flip.animate(optB);
animation.then(function(lastAnimation){
    return animationB
});
var promiseC=Flip.Promise(...)
animation.then(function(...){
    return promiseC;
});
animation.then(function(...){
    return [optA,animationB,promiseC]
})
````

see this [simple example](../demo/basic.html)