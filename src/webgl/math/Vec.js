/**
 * Created by Administrator on 2015/4/2.
 */
function GLVec(VecOrArrayOrNum){
  if(VecOrArrayOrNum instanceof GLVec)
    return VecOrArrayOrNum.clone();
  else
    this.elements=new Float32Array(VecOrArrayOrNum);
}
GLVec.prototype={
  clone:function(){
    return new GLVec(this.elements)
  },
  get x() {
    return this.elements[0];
  },
  get y() {
    return this.elements[1];
  },
  get z() {
    return this.elements[2];
  },
  get w() {
    return this.elements[3];
  }, set x(v) {
    this.elements[0] = v;
  },
  set y(v) {
    this.elements[1] = v;
  },
  set z(v) {
    this.elements[2] = v;
  },
  set w(v){
    this.elements[3]=v;
  },
  get r(){
    return this.elements[0]
  },
  get g(){
    return this.elements[1]
  },
  get b(){
    return this.elements[2]
  },
  get a(){
    return this.elements[3]
  },
  set r(v){
    this.elements[0]=v
  },
  set g(v){
    this.elements[1]=v
  },
  set b(v){
    this.elements[2]=v
  },
  set a(v){
    this.elements[3]=v
  },
  get length(){
    return this.elements.length
  },
  add:function(vec){
    var src=vec instanceof GLVec? vec.elements:vec;
    for(var i=0,eles=this.elements,len=this.elements.length;i<len;i++){
      eles[i]+=src[i]||0
    }
  }
};