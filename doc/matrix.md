#Matrix
### What is it?
You may have noticed that some animations in [demos](../demo) use transform callback `function transform(mat,param)`.
The first parameter of this callback is a matrix while the second parameter is the calculation param object.
It provides an easy way to write the css style `transform:matrix()`, your matrix manipulations will be write to css in every frame.
For a given point (x,y) on screen,matrix can change the final position of the point (nx,ny)
````
|m11 m21 dx| |x|     |m11*x+m21*y+dx|  |nx|
|m12 m22 dy| |y| =>  |m12*x+m22*y+dy| =|ny|
|0    0   1| |1|     |      1       |  | 1|
````
For `scale(0.5,0.5)` the matrix is,which make every point half the distance in both x,y direction
````
|0.5 0   0| |x|
|0   0.5 0| |y| => [0.5x,0.5y]
|0   0   1| |1|
````
Be careful about manipulation orders,one manipulation will accumulate effects on later ones.
For example, `mat.translate(100,0).scale(.5,.5)` is not the same as `mat.scale(.5,.5).translate(100,0)`,
The first will translate point 100px in x direction and the shrink the point, 
but the second will shrink the point first which makes the translation half the distance too, the actual translation will be 50px.
### API
The Matrix manipulation APIs are:
* `scale(x=1,y=1)` 
* `skew(angle=0)`
* `translate(x=0,y=0,z=0)`   
* `flip(angle=0,horizontal)` the second parameter indicates flip axis is horizontal or vertical(default) 
* `rotate(angle=0)`          the same as `rotateZ(angle)`
* `rotateZ(angle=0)`         z axis is point into screen, positive value inside
* `rotateY(angle=0)`         y axis is in vertical direction, positive value to down
* `rotateX(angle=0)`         x axis is in horizontal direction, positive value to right
* `axonProject(rx=0,ry=0)`   rotate x,y axis for projection, this can fake 3D effects
* `transform(m11,m12,m21,m22,dx,dy)` multiply with another matrix

Every manipulation API returns matrix itself, so you can write chain methods like:
```` js
mat.rotate(Math.PI).skew(Math.PI/2).translate(100,200)
````
Combine this method or write your own can create amazing visual effect

### Projection
