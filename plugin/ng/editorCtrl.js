angular.module('flipEditor').controller('editorController', ['lineFactory', '$scope', function (lineFactory, $scope) {
  var self = this;
  ['lines', 'points', 'interpolations'].forEach(function (pro) {
    //Object.defineProperty(self, pro, Object.getOwnPropertyDescriptor(lineFactory, pro));
    self[pro] = lineFactory[pro];
  });
  self.addInterpolation = function (name) {
    var inter = Flip.interpolate({name: name, data: self.points});
    lineFactory.clearPoints();
    lineFactory.addLine({
      color: 'blue', points: inter.itor().all(), name: name
    });
  }
}]);
