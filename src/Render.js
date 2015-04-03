/**
 * Created by Administrator on 2015/3/23.
 */
function Render(){
}
inherit(Flip.Render=Render,Flip.util.Object,{
  update:function(){},
  render:function(){},
  invalid:function(){
    var t,p;
    if(t=this._task) t.invalid();
    else if(p=this.parent) p.invalid();
    this._invalid=true;
  }
});