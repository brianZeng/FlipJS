/**
 * Created by 柏然 on 2014/12/13.
 */

function Mat3(arrayOrMat3) {
  if (!(this instanceof Mat3))return new Mat3(arrayOrMat3);
  var s, d;
  if (arrayOrMat3) {
    if (arrayOrMat3.elements)
      s = arrayOrMat3.elements;
    else s = arrayOrMat3;
    d = new Float32Array(s);
  }
  this.elements = d || new Float32Array([1, 0, 0, 0, 1, 0]);
}
Flip.Mat3 = Mat3;
Mat3.set = function (x1, x2, y1, y2, dx, dy) {
  return new Mat3([x1, y1, dx, x2, y2, dy]);
};
Mat3.setTranslate = function (dx, dy) {
  return new Mat3([1, 0, dx || 0, 0, 1, dy || 0]);
};
Mat3.setScale = function (x, y) {
  return new Mat3([x || 1, 0, 0, 0, y || 1, 0]);
};
Mat3.setFlip=function(angle,vertical){
  var sin = Math.sin(angle), cos = Math.cos(angle);
  return new Mat3(vertical ? [cos, 0, 0, sin, 1, 0] : [1, -sin, 0, 0, cos, 0])
};
Mat3.setRotate = function (angle) {
  if (typeof angle == "string") {
    var match = angle.match(/^((\d+(\.\d+)?)|(\.\d+))d|deg/i);
    if (match) angle = (parseFloat(match[1]) / 180) * Math.PI;
  }
  angle = parseFloat(angle) || 0;
  var a00 = 1, a01 = 0, a02 = 0, a10 = 0, a11 = 1, a12 = 0, s = Math.sin(angle), c = Math.cos(angle), out = [];
  out[0] = c * a00 + s * a10;
  out[1] = c * a01 + s * a11;
  out[2] = c * a02 + s * a12;

  out[3] = c * a10 - s * a00;
  out[4] = c * a11 - s * a01;
  out[5] = c * a12 - s * a02;
  return new Mat3(out);
};
function getFloat(d) {
  return parseFloat(d).toFixed(5);
}
Mat3.prototype = {
  toString: (function (seq) {
    return function () {
      var e = this.elements, r = seq.map(function (i) {
        return getFloat(e[i])
      });
      return 'matrix(' + r.join(',') + ')';
    }
  })([0, 3, 1, 4, 2, 5]),
  translate: function (dx, dy, overwrite) {
    return this.concat(Mat3.setTranslate(dx, dy), overwrite);
  },
  scale: function (x, y, overwrite) {
    return this.concat(Mat3.setScale(x, y), overwrite);
  },
  rotate: function (angle, overwrite) {
    return this.concat(Mat3.setRotate(angle), overwrite);
  },
  flip:function(angle,vertical,overwrite){
    return this.concat(Mat3.setFlip(angle,vertical),overwrite);
  },
  concat: function (mat3, overwrite) {
    var n = this.elements, e = mat3.elements, r;
    var m11 = e[0], m21 = e[1], mx = e[2], m12 = e[3], m22 = e[4], my = e[5],
      n11 = n[0], n21 = n[1], nx = n[2], n12 = n[3], n22 = n[4], ny = n[5];
    r = new Mat3([m11 * n11 + m12 * n21, m21 * n11 + m22 * n21, mx * n11 + my * n21 + nx, m11 * n12 + m12 * n22, m21 * n12 + m22 * n22, mx * n12 + my * n22 + ny]);
    if (overwrite) this.elements = new Float32Array(r.elements);
    return r;
  },
  set:function(x1, y1, dx, x2, y2, dy,overwrite){
    if(arguments.length<=2){
      var eles=x1;
      overwrite=arguments[1];
    }else{
      eles=[x1, y1, dx, x2, y2, dy];
    }
    if(overwrite) this.elements=new Float32Array(eles);
    return new Mat3(eles);
  }
};