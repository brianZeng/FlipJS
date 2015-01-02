angular.module('flipEditor').controller('editorController', ['lineFactory', '$scope', function (lineFactory, $scope) {
  var self = this;
  ['lines', 'points', 'interpolations'].forEach(function (pro) {
    Object.defineProperty(self, pro, Object.getOwnPropertyDescriptor(lineFactory, pro));
  });
  this.pointTypes = [{type: 'data', color: 'red'}, {type: 'control', color: 'green'}];
  self.modelChange = function () {
    lineFactory.pointModel = self.pointModel;
  };
  lineFactory.pointModel = this.pointModel = this.pointTypes[0];
  self.addInterpolation = function (name) {
    var inter = Flip.interpolate({
      name: name, data: self.points.sort(function (a, b) {
        return a.i > b.i
      })
    });
    lineFactory.clearPoints();
    lineFactory.addLine({
      color: 'blue', points: inter.itor().all(), name: name
    });
  }
}]);
