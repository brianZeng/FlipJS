/**
 * Created by 柏然 on 2014/12/13.
 */
describe('Construct translate animation:', function () {
  it('1.create from Flip.animate:', function () {
    var ani = Flip.animate({animationType: 'translate',param:{dx:20,dy:100,get sx(){return i++}}, iteration: 10}),i=0;
    expect(ani._param.dx).toBe(20);
    expect(ani._param.dy).toBe(100);
    expect(ani._param.sx).toBe(0);
    expect(ani._param.sx).toBe(1);
    expect(ani.clock.iteration).toBe(10);
  });
});