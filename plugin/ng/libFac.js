/**
 * Created by 柏然 on 2015/1/3.
 */
angular.module('flipEditor').factory('libFactory', function () {
  var interpolations = [];

  function InterDef(name, requireCP, color) {
    if (!(this instanceof InterDef))return new InterDef(name, requireCP, color);
    this.name = name;
    this.requireCP = !!requireCP;
    this.color = color || 'blue';
    interpolations.push(this);
  }

  InterDef('linear');
  InterDef('quadratic');
  InterDef('cubic');
  InterDef('lagrange');
  InterDef('beizer-2', 1);
  InterDef('beizer-3', 1);
  return {
    interpolations: interpolations
  }
});