/**
 * Created by Administrator on 2015/3/5.
 */
describe('multi task',function(){
  var anotherTask=Flip.instance.getTask('second',true),defaultTask=Flip.instance.defaultTask;
  function aniCount(task){return task._updateObjs.length}
  it('1.a renderGlobal render all of its tasks',function(done){
    var i= 2,t1,t2;
    function allRun(){
      if(i==0){
        expect(anotherTask).toBeTruthy();
        expect(defaultTask).toBeTruthy();
        done();
      }
    }
    anotherTask.once('update',function(){
      t1=anotherTask;
      allRun(--i);
    });
    defaultTask.once('update',function(){
      t2=defaultTask;
      allRun(--i);
    })
  });
  it('2.when construct a animation set taskName to change the task it belongs',function(){
    var ac=aniCount(anotherTask),dc=aniCount(defaultTask);
    Flip.animate({
      duration:.3,
      taskName:anotherTask.name
    });
    expect(ac+1).toBe(aniCount(anotherTask));
    expect(dc).toBe(aniCount(defaultTask));
  })
});