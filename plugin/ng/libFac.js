/**
 * Created by 柏然 on 2015/1/3.
 */
angular.module('flipEditor').factory('libFactory', function () {
  var interpolations = [];

  function InterDef(name, requireCP) {
    if (!(this instanceof InterDef))return new InterDef(name, requireCP);
    this.name = name;
    this.requireCP = !!requireCP;
    interpolations.push(this);
  }

  ['linear', 'quadratic', 'cubic', 'lagrange'].forEach(InterDef);
  InterDef('beizer-2', 1);
  InterDef('beizer-3', 1);
  return {
    interpolations: interpolations
  }
});