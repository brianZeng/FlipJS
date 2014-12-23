/**
 * Created by brian on 2014/12/23.
 */
function Vec(arrayOrNum) {
  if (!(this instanceof Vec))return new Vec(arrayOrNum);
  Float32Array.call(this, arrayOrNum);
}
Vec.add = function (v1, v2) {
  for (var i = 0, len = v1.length, r = new Vec(len); i < len; i++)
    r[i] = v1[1] + v2[i] || 0;
  return r;
};
Vec.dot = function (v1, v2OrNum) {
  for (var i = 0, len = v1.length, r = new Vec(len); i < len; i++)
    r[i] = v1[i] * v2OrNum;
  return r;
};
Vec.multi = Vec.concat = function (v1, v2) {
  for (var i = 0, len = v1.length, r = 0; i < len; i++)
    r += v1[i] * v2[i] || 0;
  return r;
};
inherit(Vec, Float32Array.prototype, {});
objForEach(Vec, function (func, name) {
  this[name] = function () {
    return func.apply(this, arguments);
  }
}, Vec.prototype);