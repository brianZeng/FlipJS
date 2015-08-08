/**
 * Created by Administrator on 2015/8/8.
 */
describe('Matrix test',function(){
  var map=['x1','y1',0,'x2','y2',0,'dx','dy',1];
  function getElement(mat){
     var eles=mat.elements,ret=[];
    for(var i= 1,len=arguments.length;i<len;i++){
       ret[i-1]=eles[map.indexOf(arguments[i])]
    }
    return ret;
  }
   it('1.translate test',function(){
     debugger;
     var mat=Flip.Mat3().translate(10,10).scale(0.5,1).translate(10,10);
     expect(getElement(mat,'dx','dy')).toEqual([15,20]);
   })
});