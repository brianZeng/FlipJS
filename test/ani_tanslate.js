/**
 * Created by 柏然 on 2014/12/13.
 */
describe('Construct translate animation:', function () {
  it('1. .dx .dy stands for the translation distance:', function () {
    var ani = Flip.animation.translate({dx: 100, dy: 200});
    expect(ani.dx).toBe(100);
    expect(ani.dy).toBe(200);
  });
  it('2.create from Flip.animation:', function () {
    var ani = Flip.animation({animationType: 'translate', dx: 20, dy: 100, iteration: 10});
    expect(ani.dx).toBe(20);
    expect(ani.dy).toBe(100);
    expect(ani.clock.iteration).toBe(10);
  })


});