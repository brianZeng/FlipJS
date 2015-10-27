/**
 * Created by Administrator on 2015/10/27.
 */
fdescribe('Css Proxy test',function(){
  it('1.wrap valid css rule key to properties',function(){
    var proxy=new Flip.CssProxy();
    proxy.width='2px';
    expect(proxy.width).toBe(proxy.$$width);
    expect(proxy.$invalid).toBeTruthy();
    expect(proxy.toSafeCssString('')).toBe('width:2px');
  });
  it('2.ignore invalid value',function(){
    var proxy=new Flip.CssProxy();
    proxy.width=[];
    expect(proxy.width).toBe(void 0);
  })
});