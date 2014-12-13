/**
 * Created by 柏然 on 2014/12/13.
 */
describe('Construct Animation:', function () {
  it('1.Animation.createOptProxy:', function () {
    var proxy = Flip.Animation.createOptProxy({elements: [], duration: 0.5, abc: 3});
    expect(proxy.result.elements).toEqual([]);
    expect(proxy.result.clock.duration).toBe(0.5);
    expect(Object.getOwnPropertyNames(proxy.result).length).toBe(2)
  });
  it('2.use Flip.animation() to construct an animation', function () {
    var ani = Flip.animation('translate');
    expect(ani instanceof Flip.Animation).toBeTruthy();
  });
});