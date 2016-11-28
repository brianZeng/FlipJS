/**
 * Created by Administrator on 2015/4/2.
 */
function GLVec(VecOrArrayOrNum) {
  if (!(this instanceof GLVec)) {
    return new GLVec(VecOrArrayOrNum);
  }
  if (VecOrArrayOrNum instanceof GLVec) {
    return VecOrArrayOrNum.clone();
  } else {
    this.elements = new Float32Array(VecOrArrayOrNum);
  }
}
GLVec.prototype = {
  clone: function () {
    return new GLVec(this.elements)
  },
  get length() {
    return this.elements.length
  },
  vecDot: function (vecOrNumber) {
    return vecDot(this, vecOrNumber)
  },
  vecLength: function () {
    return vecLength(this)
  },
  vecAdd: function (vec) {
    return vecAdd(this, vec)
  },
  vecNormalize: function () {
    return vecNormalize(this)
  },
  /**
   * set selected components returns a new GLVec instance
   *  vec.set({x:3,z:1});
   *  vec.set(3,null,1);
   * @param componentsOrx
   */
  set: function (componentsOrx) {
    var vec = this.clone();
    if (isObj(componentsOrx)) {
      objForEach(componentsOrx, function (val, key) {
        vec[key] = val;
      })
    }
    else {
      for (var i = 0, len = this.length; i < len; i++) {
        var num = arguments[i];
        if (!isNaN(num)) {
          vec.elements[i] = num;
        }
      }
    }
    return vec;
  }
};
GLVec.vecDot = vecDot;
GLVec.vecMix = vecMix;
GLVec.vecAdd = vecAdd;
GLVec.vecLength = vecLength;
GLVec.vecNormalize = vecNormalize;

function vecMix(vec1, p1, vec2, p2) {
  var length = vec1.length;
  if (length !== vec2.length) {
    throw Error('dot vec of different dimensions');
  }
  for (var i = 0, ret = []; i < length; i++) {
    ret[i] = p1 * vec1[i] + p2 * vec2[i]
  }
  return new GLVec(ret);
}
function vecDot(vec1, vec2) {
  if (typeof vec2 === "number") {
    return vecScale(vec1, vec2);
  }
  var length = vec1.length;
  if (length !== vec2.length) {
    throw Error('dot vec of different dimensions');
  }
  var ret = [];
  for (var i = 0; i < length; i++) {
    ret[i] = vec1[i] * vec2[i];
  }
  return new GLVec(ret);
}
function vecScale(vec, scale) {
  var ret = [];
  for (var i = 0; i < vec.length; i++) {
    ret[i] = vec[i] * scale;
  }
  return new GLVec(ret);
}
function vecAdd(vec1, vec2) {
  var length = vec1.length;
  if (length !== vec2.length) {
    throw Error('add vec of different dimensions');
  }
  var ret = [];
  for (var i = 0; i < length; i++) {
    ret[i] = vec2[i] + vec1[i];
  }
  return new GLVec(ret);
}
function vecLength(vec) {
  for (var i = 0, len = vec.length, sum = 0; i < len; i++) {
    var num = vec[i];
    sum += num * num;
  }
  return Math.sqrt(sum);
}
function vecNormalize(vec) {
  var vLen = vecLength(vec);
  if (vLen == 0) {
    return new GLVec(vec.length);
  }
  for (var i = 0, ret = []; i < vec.length; i++) {
    ret[i] = vec[i] / vLen;
  }
  return new GLVec(ret);
}
/*
 like a gl vec, vec component can be accessed by index or name
 var vec=new GLVec([1,2,3,4]);
 vec.x    // 1
 vec[1]  //2
 vec.b  //3
 vec.w == vec.a == vec[3] == 4
 */
['0,0', 'x,0', 'r,0', '1,1', 'y,1', 'g,1', '2,2', 'z,2', 'b,2', '3,3', 'w,3', 'a,3'].forEach(function (def) {
  var components = def.split(','), index = +components[1], name = components[0];
  Object.defineProperty(GLVec.prototype, name, {
    get: function () {
      return this.elements[index]
    },
    set: function (val) {
      this.elements[index] = +val;
    }
  });

});