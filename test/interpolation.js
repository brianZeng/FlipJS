/**
 * Created by 柏子 on 2015/2/9.
 */
describe('interpolation basic test',function(){
  var data=[[0,0],[10,10],[20,20]],itpl;
  function pointEquals(p1,p2){
    expect(Flip.Vec.get(p1,'x')).toBeCloseTo(Flip.Vec.get(p2,'x'));
    expect(Flip.Vec.get(p1,'y')).toBeCloseTo(Flip.Vec.get(p2,'y'));
  }
  itpl=Flip.interpolate('linear',data);
    it('1.interpolate point',function(){
      pointEquals(itpl.when(0),data[0]);
      pointEquals(itpl.when(0.5),data[1]);
      pointEquals(itpl.when(1),data[2]);
    });
  it('2.interpolate derivative point',function(){
    expect(itpl.deriveWhen(0)).toBe(1);
    expect(itpl.deriveWhen(0.5)).toBe(1);
    expect(itpl.deriveWhen(1)).toBe(1);
  })
});