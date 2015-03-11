/**
 * Created by 柏然 on 2014/12/13.
 */
describe('Construct translate animation:', function () {

  it('2.create from Flip.animate:', function () {
    var ani = Flip.animate({animationType: 'translate',param:{dx:20,dy:100,get sx(){return 40}}, iteration: 10});
    expect(ani._param.dx).toBe(20);
    expect(ani._param.dy).toBe(100);
    expect(ani.clock.iteration).toBe(10);
  });
});