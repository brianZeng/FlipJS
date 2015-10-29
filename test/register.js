/**
 * Created by 柏然 on 2014/12/13.
 */
describe('register animation:', function () {
  it('1.rewrite default properties:', function () {
    Flip.register({
      name:'test',
      duration:1.2,
      iteration:3
    });
    var ani=Flip.animate({
      animationType:'test',
      selector:'ss',
      duration:2
    });
    expect(ani.clock.duration).toBe(2);
    expect(ani.selector).toBe('ss');
    expect(ani.clock.iteration).toBe(3);
  });
  it('2.combine or overwrite parameter',function(){
    Flip.register({
      name:'test',
      immutable:{
        s:1,b:2
      }
    });
    var ani=Flip.animate({
      animationType:'test',
      immutable:{
        s:3,a:2
      },
      variable:{
        v:4
      }
    });
    expect(ani._immutable).toEqual({s:3,a:2,b:2});
    expect(ani._variable).toEqual({v:4})
  });
  it('3.add css and transform',function(){
    Flip.register({
      name:'test',
      css:{
        '&':{
          color:'red'
        }
      },
      transform:function(mat){}
    });
    var ani=Flip.animate({
      animationType:'test',
      css:{
        '&':{
          fontSize:'32px'
        }
      },
      transform:{
        '&':function(mat){}
      }
    });
    expect(ani._cssHandlerMap['&'].length).toBe(2);
    expect(ani._matCallback['&'].length).toBe(2);
  })
});