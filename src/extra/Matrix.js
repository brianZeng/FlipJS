/**
 * Created by 柏然 on 2014/12/27.
 */
function Matrix(opt) {
  if (!(this instanceof Matrix))return new Matrix(opt);
  this.init(opt);
}
Matrix.luDecompose = function (mat) {
  var n = mat.row, L, U, abs = Math.abs;
  if (n !== mat.col)throw  Error('Decomposition require row equals col');
  L = Matrix.identify(n);
  U = mat.clone();
  for (var iRow = 0, pivot = new Array(n), maxValue, factor; iRow < n; ++iRow) {
    pivot[iRow] = iRow;
    maxValue = abs(U[iRow][iRow]);
    for (var iNextRow = iRow + 1, temp; iNextRow < n; ++iNextRow) {
      if (maxValue < abs(temp = U[iNextRow][iRow])) {
        pivot[iRow] = iNextRow;
        maxValue = temp;
      }
    }
    if (!maxValue) return false;
    if (pivot[iRow] != iRow)
      U.swapRow(iRow, pivot[iRow]);
    for (iNextRow = iRow + 1; iNextRow < n; iNextRow++) {
      L[iNextRow][iRow] = factor = U[iNextRow][iRow] / U[iRow][iRow];
      U[iNextRow][iRow] = 0;
      for (var iCol = iRow + 1; iCol < n; iCol++)
        U[iNextRow][iCol] -= U[iRow][iCol] * factor;
    }
  }
  return {L: L, U: U}
};
Matrix.luSolve = function (L, U, B) {
  var n = L.row, Y, X;
  if (n !== L.col || n !== U.row || n !== U.col) throw Error('invalid dimensions in L U Matrix');
  Y = new Flip.Float32Array(n);
  X = new Vec(n);
  for (var i = 0, j; i < n; i++) {
    Y[i] = B[i];
    for (j = 0; j < i; j++)
      Y[i] -= Y[j] * L[i][j];
  }
  for (i = n - 1; i >= 0; i--) {
    X[i] = Y[i];
    for (j = i + 1; j < n; j++)
      X[i] -= X[j] * U[i][j];
    X[i] /= U[i][i];
  }
  return X;
};
Matrix.identify = function (n) {
  var mat = new Matrix(n);
  for (var i = 0; i < n; i++) mat[i][i] = 1;
  return mat;
};
Matrix.fromRows = function () {
  var row = arguments.length, col = arguments[0].length, mat = new Matrix({row: row, col: col});
  for (var i = 0; i < row; i++)
    mat[i] = Matrix.constructRow(arguments[i]);
  return mat;
};
Matrix.fromCols = function () {
  var cols = arguments, colNum = cols[0].length, rowNum = arguments.length, mat = new Matrix({
    row: rowNum,
    col: colNum
  });
  for (var i = 0; i < rowNum; i++)
    for (var j = 0; j < colNum; j++)
      mat[i][j] = cols[j][i];
  return mat;
};

Matrix.constructRow = (function () {
  function toString() {
    var len, r = new Array(len = this.length);
    for (var i = 0; i < len; i++)
      r[i] = this[i].toFixed(2).replace('.00', '  ');
    return r.join(' ').trim();
  }

  return function (arryOrNum) {
    var row = new Flip.Float32Array(arryOrNum);
    row.toString = toString;
    return row;
  }
})();
Flip.Matrix = Matrix;
inherit(Matrix, [], {
  get length() {
    return this.row * this.col;
  },
  init: function (opt) {
    var row, col;
    if (typeof opt == "number") {
      this.row = this.col = row = col = opt;
    }
    else if (opt == undefined)throw Error('row and col must be declared');
    else {
      row = this.row = opt.row;
      col = this.col = opt.col;
    }
    for (var i = 0; i < row; i++)
      this[i] = Matrix.constructRow(col);
    return this;
  },
  solve: function (B) {
    var lu = Matrix.luDecompose(this);
    return lu ? Matrix.luSolve(lu.L, lu.U, B) : null;
  },
  transpose: function () {
    return Matrix.fromCols.apply(null, this);
  },
  inverse: function () {
    var n = this.row, cols = new Array(n), B;
    if (n == this.col) {
      for (var i = 0; i < n; i++) {
        B = new Vec(n);
        B[i] = 1;
        cols[i] = this.solve(B);
      }
      return Matrix.fromCols.apply(null, cols);
    }

  },
  clone: function () {
    var mat = new Matrix(this);
    for (var i = 0, row = this.row; i < row; i++)
      mat[i] = Matrix.constructRow(this[i]);
    return mat;
  },
  multiVec: function (vec) {
    var len, r = new Vec(len = this.row);
    for (var i = 0; i < len; i++)
      r[i] = Vec.dot(this[i], vec);
    return r;
  },
  multiMat: function (mat) {
    var row = this.row, col = mat.col, r = new Matrix({col: col, row: row}), sum;
    for (var ir = 0; ir < row; ir++)
      for (var ic = 0; ic < col; ic++) {
        sum = 0;
        for (var i = 0; i < row; i++)
          sum += this[ir][i] * mat[i][ic];
        r[ir][ic] = sum;
      }
    return r;
  },
  multi: function (a) {
    if (typeof  a === "number")return this.dot(a);
    if (a instanceof Matrix)return this.multiMat(a);
    if (a instanceof Vec || a.length !== undefined)return this.multiVec(a);
  },
  dot: function (a) {
    var mat = new Matrix(this);
    for (var row = this.row, col = this.col, i = 0; i < row; i++)
      for (var j = 0; j < col; j++) mat[i][j] = this[i][j] * a;
    return mat;
  },
  get: function (row, col) {
    var colLen = this.col;
    return this[(row % this.row) * colLen][col % colLen];
  },
  set: function (row, col, value) {
    var colLen = this.col;
    return this[(row % this.row) * colLen][col % colLen] = value;
  },
  setRow: function (rowIndex, elements, startIndex) {
    var row = this[rowIndex];
    startIndex = startIndex || 0;
    for (var i = 0, len = elements.length; i < len; i++)
      row[i + startIndex] = elements[i];
    return this;
  },
  swapRow: function (i, j) {
    var tem = this[j];
    this[j] = this[i];
    this[i] = tem;
    return this;
  },
  toString: function () {
    for (var i = 0, row = this.row, r = new Array(row); i < row; i++)
      r[i] = this[i].toString().trim();
    return r.join('\n');
  }
});