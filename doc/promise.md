#Thenable
There are four types of argument can be pass to `animation#then`
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