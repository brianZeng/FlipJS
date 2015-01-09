/**
 * Created by 柏子 on 2015/1/9.
 */
describe('flipEditor', function () {
  beforeEach(function () {
    module('flipEditor');
  });

  function pointIn(point, x, y) {
    expect(point.x).toBe(x);
    expect(point.y).toBe(y);
  }

  describe('undo:', function () {
    var dataFac, actMng, point, line;

    function hasRecord(n, aMng) {
      expect((aMng || actMng).records.length).toBe(n);
    }

    function hasLine(n, dFac) {
      expect((dFac || dataFac).lines.length).toBe(n);
    }

    function hasPoint(n, dFac) {
      expect((dFac || dataFac).points.length).toBe(n);
    }

    beforeEach(inject(['dataFac', 'actMng', function (a, b) {
      dataFac = a;
      actMng = b.clearRecords();
    }]));
    it('add point', inject(function (dataFac, actMng) {
      point = dataFac.addPoint({x: 100, y: 100});
      expect(actMng.records.length).toBe(1);
      expect(dataFac.points.length).toBe(1);
      actMng.undo();
      expect(dataFac.points.length).toBe(0);
      expect(actMng.records.length).toBe(0);
    }));
    it('remove point', inject(function (dataFac, actMng) {
      point = dataFac.addPoint({x: 100, y: 100});
      hasRecord(1, actMng);
      actMng.act('choose', {target: point}, true);
      expect(dataFac.activePoint).toBe(point);
      actMng.act('move', {position: {x: 20, y: 20}});
      pointIn(point, 20, 20);
      hasRecord(2, actMng);
      actMng.act('release', {position: {x: 50, y: 50}}, true);
      hasRecord(3, actMng);
      pointIn(point, 50, 50);
      actMng.undo();
      pointIn(point, 100, 100);
      hasRecord(1, actMng);
    }));
    function addTestPoints(){
      dataFac.reset();
      dataFac.addPoint({x: 0, y: 0});
      dataFac.addPoint({x: 10, y: 10});
      dataFac.addPoint({x: 40, y: 0});
    }
    it('add line', function () {
      dataFac.interpolation = 'cubic';
      addTestPoints();
      actMng.clearRecords();
      hasRecord(0);
      hasLine(0);
      hasPoint(3);
      dataFac.addLine();
      hasRecord(1);
      hasLine(1);
      hasPoint(0);
      actMng.undo();
      hasRecord(0);
      hasLine(0);
      hasPoint(3);
    });
    it('remove line',function(){
      addTestPoints();
      actMng.clearRecords();
      hasRecord(0);
      hasLine(0);
      hasPoint(3);
      dataFac.addLine();
      hasRecord(1);
      hasLine(1);
      hasPoint(0);
      dataFac.removeLine();
      hasRecord(2);
      hasLine(0);
      hasPoint(0);
      dataFac.undo();
      hasRecord(1);
      hasLine(1);
      hasPoint(0);
    });
    it('decompose line',function(){
      addTestPoints();
      actMng.clearRecords();
      hasRecord(0);
      hasLine(0);
      hasPoint(3);
      dataFac.addLine();
      hasRecord(1);
      hasLine(1);
      hasPoint(0);
      dataFac.decomposeLine();
      hasRecord(2);
      hasLine(0);
      hasPoint(3);
      dataFac.undo();
      hasRecord(1);
      hasLine(1);
      hasPoint(0);

    });
  });

});