/**
 * Created by Administrator on 2015/3/6.
 */
function loopGlobal(global){
  var state = global.createRenderState();
  global.emit(RenderGlobal.EVENT_NAMES.FRAME_START, [state]);
  updateGlobal(global,state);
  renderGlobal(global,state);
  global.emit(RenderGlobal.EVENT_NAMES.FRAME_END, [state]);
}
function updateGlobal(global,state){
  state.global.emit(RenderGlobal.EVENT_NAMES.UPDATE, [state,global]);
  objForEach(global._tasks,function(task){updateTask(task,state)});
  global.apply();
}
function updateTask(task,state){
  var updateParam = [state, state.task=task];
  (state.timeline = task.timeline).move();
  task.emit(RenderTask.EVENT_NAMES.UPDATE, updateParam);
  task._updateObjs = arrSafeFilter(task._updateObjs, filterIUpdate, state);
}
function renderGlobal(global,state){
  if(global._invalid||state.forceRender){
    objForEach(global._tasks,function(task){renderTask(task,state);});
    global._styleElement.innerHTML=state.styleStack.join('\n');
    global._invalid=false;
  }
  objForEach(global._tasks,function(task){finalizeTask(task,state)});
}
function renderTask(task,state){
  var evtParam = [state, state.task=task];
  if (task._invalid||state.forceRender) {
    task.emit(RenderTask.EVENT_NAMES.RENDER_START, evtParam);
    task._updateObjs.forEach(function (item) {if(isFunc(item.render))item.render(state);});
    task._invalid = false;
  }
  task.emit(RenderTask.EVENT_NAMES.RENDER_END, evtParam);
}
function finalizeTask(task,state){
  var taskItems=(state.task=task)._updateObjs,index,finItems=task._finalizeObjs;
  if(finItems.length){
    task.invalid();
    finItems.forEach(function(item){
      if((index=taskItems.indexOf(item))!=-1)
        taskItems[index]=null;
      if(item._task==task)
        item._task=null;
      isObj(item)&&isFunc(item.finalize)&&item.finalize(state);
    });
    task._finalizeObjs=[];
  }
}
function finalizeAnimation(animation){
  var task;
  if(!animation.persistAfterFinished&&(task=animation._task)){
    task.toFinalize(animation);
  }
}
