/**
 * Created by Administrator on 2015/10/27.
 */
describe('Css Proxy test',function(){
  var proxy;

  function isChrome(){
    return !!window.chrome
  }

  function isSafari(){
    return /Safari/.test(navigator.userAgent)
  }

  function isFireFox(){
    return /Firefox/.test(navigator.userAgent);
  }
  beforeEach(function () {
    proxy=new Flip.CssProxy();
  });
  it('1.wrap valid css rule key to properties',function(){
    var proxy=new Flip.CssProxy();
    proxy.width='2px';
    expect(proxy.width).toBe(proxy.$$width);
    expect(proxy.$invalid).toBeTruthy();
    expect(proxy.$toSafeCssString('')).toBe('width:2px');
  });
  it('2.ignore invalid value',function(){
    var proxy=new Flip.CssProxy();
    proxy.width=[];
    expect(proxy.width).toBe(void 0);
  });

  it('3.support dash property', function () {
    var proxy=new Flip.CssProxy();
    proxy['background-color']='red';
    expect(proxy.backgroundColor).toBe('red');
    expect(proxy.$toSafeCssString('')).toBe('background-color:red');
    if (isChrome() || isSafari()) {
      proxy['-webkit-appearance']='none';
      expect(proxy.webkitAppearance).toBe('none')
    }
    else if (isFireFox()) {
      proxy = new Flip.CssProxy();
      proxy['-moz-appearance'] = 'none';
      expect(proxy.mozAppearance).toBe('none');
      expect(proxy.MozAppearance).toBe('none');
      expect(proxy.$toSafeCssString('')).toBe('-moz-appearance:none')
    }
  });
  it('4.string template test', function () {
    var proxy=new Flip.CssProxy();
    expect(proxy.$template('${1}px solid ${2}',3,'red')).toBe('3px solid red');
    expect(proxy.$template('${1}px ${2}px ${1}px ${3}px',2,3,4)).toBe('2px 3px 2px 4px')
  });
  it('5.change css property value cause stage $invalid', function () {
    proxy.$invalid=false;
    proxy.color='red';
    expect(proxy.$invalid).toBeTruthy();
    proxy.$invalid=false;
    proxy.babab=123;
    expect(proxy.$invalid).toBeFalsy();
    proxy.color='red';
    expect(proxy.$invalid).toBeFalsy();
  });
  it('6.with prefix', function (){
    var t = 'translate(0,0)';
    proxy.$withPrefix('transform', t, ['-moz-', '-webkit-']);
    expect(proxy.webkitTransform).toBe(t);
    expect(proxy.mozTransform).toBe(t);
    if (isChrome() || isSafari()) {
      proxy.$withPrefix('appearance', 'none');
      expect(proxy['-webkit-appearance']).toBe('none');
    }
    else if (isFireFox()) {
      proxy.$withPrefix('transformOrigin', '0 0');
      expect(proxy['-moz-transform-origin']).toBe('0 0')
    }
  })
});