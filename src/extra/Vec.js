/**
 * Created by brian on 2014/12/23.
 */
function Vec(arrayOrNum) {
  if (!(this instanceof Vec)) {
    return new Vec(arrayOrNum);
  }
  if (arrayOrNum instanceof Array) {
    this.push.apply(this, arrayOrNum);
  } else if (!isNaN(arrayOrNum)) {
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
Vec.dot = vecDot;
function vecDot(v1, v2OrNum) {
  if (typeof v2OrNum === "number") {
    for (var i = 0, len = v1.length, r = new Vec(len); i < len; i++)
      r[i] = v1[i] * v2OrNum;
  } else {
    for (i = 0, len = v1.length, r = 0; i < len; i++)
      r += v1[i] * v2OrNum[i];
  }
  return r;
}
Vec.multi = Vec.concat = function (v1, v2) {
  if (v2 instanceof Matrix) {
    return Vec.multiMat(v1, v2);
  }
  for (var i = 0, len = v1.length, r = new Vec(len); i < len; i++)
    r [i] = v1[i] * v2[i];
  return r;
};
Vec.get = function (vec, index) {
  if (isNaN(index)) {
    if ('x' === index) {
      return 'x' in vec ? vec.x : vec[0];
    } else if ('y' === index) {
      return 'y' in vec ? vec.y : vec[1];
    } else {
      return undefined;
    }
  }
  return vec[index];
};
Vec.multiMat = function (vec, mat) {
  var row = vec.length, col, sum, r;
  if (row !== mat.row) {
    return NaN;
  }
  col = mat.col;
  r = new Vec(row);
  for (var iCol = 0; iCol < col; iCol++) {
    sum = 0;
    for (var iRow = 0; iRow < row; iRow++)
      sum += vec[iRow] * mat[iRow][iCol];
    r[iCol] = sum;
  }
  return r;
};
Vec.length = vecLength;
function vecLength(vec) {
  for (var i = 0, len = vec.length, sum = 0; i < len; i++) {
    var num = vec[i];
    sum += num * num;
  }
  return Math.sqrt(sum)
}
Vec.normalize = function (vec) {
  var len = vecLength(vec);
  return vecDot(vec, 1 / len);
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
  normalize: function () {
    return new Vec(this).normalize();
  },
  multi: function (a) {
    if (typeof a === "number") {
      return Vec.dot(this, a);
    }
    return Vec.multi(this, a);
  }
});
Flip.Vec = Vec;