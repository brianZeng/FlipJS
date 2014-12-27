/**
 * Created by brian on 2014/12/23.
 */
function Vec(arrayOrNum) {
  if (!(this instanceof Vec))return new Vec(arrayOrNum);
  if (arrayOrNum instanceof Array)
    this.push.apply(this, arrayOrNum);
  else if (!isNaN(arrayOrNum)) {
    this.length = arrayOrNum;
    for (var i = 0; i < arrayOrNum; i++)
      this[i] = 0;
  }

}
Vec.add = function (v1, v2) {
  for (var i = 0, len = v1.length, r = new Vec(len); i < len; i++)
    r[i] = v1[1] + v2[i] || 0;
  return r;
};
Vec.dot = function (v1, v2OrNum) {
  if (typeof v2OrNum === "number")
    for (var i = 0, len = v1.length, r = new Vec(len); i < len; i++)
      r[i] = v1[i] * v2OrNum;
  else
    for (i = 0, len = v1.length, r = 0; i < len; i++)
      r += v1[i] * v2OrNum[i];
  return r;
};
Vec.multi = Vec.concat = function (v1, v2) {
  for (var i = 0, len = v1.length, r = new Vec(len); i < len; i++)
    r [i] = v1[i] * v2[i];
  return r;
};
inherit(Vec, [], {
  clone: function () {
    return new Vec(this);
  },
  toString: function () {
    return this.map(function (a) {
      return a.toFixed(2).replace('.00', '  ')
    }).join(' ');
  },
  add: function (vec) {
    return Vec.add(this.clone(), vec);
  },
  dot: function (vecOrNum) {
    return Vec.dot(this, vecOrNum);
  },
  multi: function (a) {
    if (typeof a === "number")return Vec.dot(this, a);
    return Vec.multi(this, a);
  }
});
Flip.Vec = Vec;