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
     var prefix={
       line:'has lines ',
       record:'has records ',
       point:'has points '
     };
    function hasRecord(n, aMng,pre) {
      var r=(pre||'')+'has records ';
      expect(r+(aMng || actMng).records.length).toBe(r+n);
    }

    function hasLine(n, dFac,pre) {
      var l=(pre||'')+'has lines ';
      expect(l+(dFac || dataFac).lines.length).toBe(l+n);
    }

    function hasPoint(n, dFac,pre) {
      var p=(pre||'')+'has points ';
      expect(p+(dFac || dataFac).points.length).toBe(p+n);
    }
    function has(record,line,point,pre){
      pre=pre||'';
      hasLine(line,0,pre);
      hasPoint(point,0,pre);
      hasRecord(record,0,pre);
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
      has(0,0,3,'after clear:');
      dataFac.addLine();
      has(1,1,0,'add Line:');
      actMng.undo();
      has(0,0,3,'undo add line:');
    });
    it('remove line',function(){
      addTestPoints();
      actMng.clearRecords();
      has(0,0,3,'after clear:');
      dataFac.addLine();
      has(1,1,0,'add Line:');
      dataFac.removeLine();
      has(2,0,0,'after remove l');
      actMng.undo();
      has(1,1,0,'after undo remove');
    });
    it('decompose line',function(){
      addTestPoints();
      actMng.clearRecords();
      has(0,0,3,'after clear:');
      dataFac.addLine();
      has(1,1,0,'add Line:');
      dataFac.decomposeLine();
      has(2,0,3,'after decompose:');
      actMng.undo();
      has(1,1,0,'after undo decompose:');
    });
  });

});