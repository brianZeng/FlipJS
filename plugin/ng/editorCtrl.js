angular.module('flipEditor').controller('editorController', ['lineFactory', '$scope', function (lineFactory, $scope) {
  var self = this;
  ['lines', 'interpolations'].forEach(function (pro) {
    Object.defineProperty(self, pro, Object.getOwnPropertyDescriptor(lineFactory, pro));
  });
  ['removeLine', 'removePoint', 'decomposeLine'].forEach(function (n) {
    self[n] = lineFactory[n];
  });
  this.itplModel = lineFactory.interpolations[0];
  this.allPoints = [];
  this.pointTypes = [{type: 'data', color: 'red'}, {type: 'control', color: 'green'}];
  lineFactory.on('change', function () {
    self.allPoints = lineFactory.points.concat(lineFactory.controlPoints).sort(function (a, b) {
      return a.id > b.id
    });
  });
  self.modelChange = function () {
    lineFactory.pointModel = self.pointModel;
  };
  lineFactory.pointModel = this.pointModel = this.pointTypes[0];
  self.addInterpolation = function () {
    var model = self.itplModel;
    lineFactory.addInterpolation(model.name, model.color || 'blue');
  };

}]);
