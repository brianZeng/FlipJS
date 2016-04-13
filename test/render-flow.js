describe('render flow', function (){
  it('1.cascade transform with selector', function (done){
    var matrix, mm;
    Flip.animate({
      selector: 'a1',
      transform: function (mat){
        matrix = mat;
      }
    });
    Flip.animate({
      selector: 'a1',
      transform: function (mat){
        expect(matrix).toBe(mat);
      }
    });
    Flip.animate({
      selector: 'a2',
      transform: function (){
        mm = new Flip.Mat3();
        return mm;
      }
    });
    Flip.animate({
      selector: 'a2',
      transform: function (mat){
        expect(mm).toBe(mat);
        done();
      }
    })
  });
  it('2.animation with no selector will be calculated but not render', function (done){
    var callSpy = jasmine.createSpy('animation-render');
    Flip.animate({
      css: function (css){
        callSpy();
      },
      once: {
        update: function (){
          Flip.instance.on('frameEnd', function (e){
            expect(e.styleStack.some(function (style){
              return !style.selector
            })).toBeFalsy();
            expect(callSpy).toHaveBeenCalled();
            done();
          })
        }
      }
    });

  });
  it('3.transform without selector will not cascade', function (done){
    var matrix;
    Flip.animate({
      transform: function (mat){
        matrix = mat;
      }
    });
    Flip.animate({
      transform: function (mat){
        expect(mat).not.toBe(matrix);
        done();
      }
    });
  });

});