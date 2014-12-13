describe('Construct translate animation:', function () {
  it('1. .dx .dy stands for the translation distance:', function () {
    var proxy = Flip.animation.translate.createOptProxy({dx: 100, dy: 200});
    expect(proxy.result.dx).toBe(100);
    expect(proxy.result.dy).toBe(200);
  });
  it('2.create from Flip.animation:', function () {
    var ani = Flip.animation({animationType: Flip.ANIMATION_TYPE.translate, dx: 20, dy: 100, iteration: 10});
    expect(ani.dx).toBe(20);
    expect(ani.dy).toBe(100);
    expect(ani.clock.iteration).toBe(10);
  })


});
describe('Construct Animation:', function () {
  describe('1.Animation.createOptProxy:', function () {
    it('proxy result contains .clock .elements', function () {
      var proxy = Flip.Animation.createOptProxy({elements: [], duration: 0.5, abc: 3});
      expect(proxy.result.elements).toEqual([]);
      expect(proxy.result.clock.duration).toBe(0.5);
      expect(Object.getOwnPropertyNames(proxy.result).length).toBe(2)
    });
    it('.elements can be chosen by .selector', function () {
      var proxy = Flip.Animation.createOptProxy({selector: 'body'});
      expect(proxy.result.elements.length).toBe(1);
      var eles = [1, 2, 3];
      proxy = Flip.Animation.createOptProxy({selector: 'body', elements: eles});
      expect(proxy.result.elements).toBe(eles);
    })

  });
  describe('2.use Flip.animation() to construct an animation:', function () {
    it('first param can be animation type', function () {
      var ani = Flip.animation('translate');
      expect(ani instanceof Flip.Animation).toBeTruthy();
    });
  });
});

describe('test build in renderScope:', function () {
  it('automatic init when domReady:', function () {
    var spy = spyOn(console, 'warn');
    Flip.instance.init();
    expect(spy).toHaveBeenCalled();
  });
  it('automatic add animation created by Flip.animation', function () {
    var ani = Flip.animation('translate');
    expect(Flip.instance.activeTask._updateObjs).toContain(ani);
  });
});