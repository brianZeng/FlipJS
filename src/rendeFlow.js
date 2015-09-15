/**
 * Created by Administrator on 2015/3/6.
 */
function loopGlobal(global){
  var state = global.createRenderState();
  global.emit(EVENT_FRAME_START, [state]);
  updateGlobal(global,state);
  renderGlobal(global,state);
  global.emit(EVENT_FRAME_END, [state]);
}
function updateGlobal(global,state){
  state.global.emit(EVENT_UPDATE, [state,global]);
  objForEach(global._tasks,function(task){updateTask(task,state)});
  global.apply();
}
function updateTask(task,state){
  if(!task.disabled){
    var components=task._updateObjs;
    state.task=task;
    (state.timeline = task.timeline).move();
    task.update(state);
    task.emit(EVENT_UPDATE, state);
    task._updateObjs=arrForEachThenFilter(components,updateComponent,isObj);
    state.task=null;
  }
  function updateComponent(item,index) {
    if (!isObj(item))
      components[index]=undefined;
    else if(!item.disabled){
      if (isFunc(item.update))
        item.update(state);
      else if (isFunc(item.emit))
        item.emit(EVENT_UPDATE,state);
    }
  }
}
function renderGlobal(global,state){
  if(global._invalid||state.forceRender){
    objForEach(global._tasks,function(task){renderTask(task,state);});
    styleEleUseRules(global._styleElement,state.styleStack);
    FlipScope.forceRender=global._invalid=false;
  }
  objForEach(global._tasks,function(task){finalizeTask(task,state)});
}
function renderTask(task,state){
  if(!task.disabled){
    state.task=task;
    if (task._invalid||state.forceRender) {
      task.emit(EVENT_RENDER_START, state);
      task._updateObjs.forEach(function (item) {
        if(isFunc(item.render)&&!item.disabled)
          item.render(state);
      });
      task._invalid = false;
    }
    task.emit(EVENT_RENDER_END, state);
    state.task=null;
  }
}
function finalizeTask(task,state){
  var taskItems=(state.task=task)._updateObjs,index,finItems=task._finalizeObjs;
  task._finalizeObjs=[];
  if(finItems.length){
    task.invalid();
    finItems.forEach(function(item){
      if((index=taskItems.indexOf(item))!=-1)
        taskItems[index]=null;
      if(item._task==task)
        item._task=null;
      isObj(item)&&isFunc(item.finalize)&&item.finalize(state);
    });
  }
}
function finalizeAnimation(animation){
  var fillMode=animation.fillMode;
  if(animation.fillMode!==FILL_MODE.KEEP){
    animation.finalize();
    if(fillMode===FILL_MODE.SNAPSHOT)
      animation.cancelStyle=FlipScope.global.immediate(animation.lastStyleRule);
  }
}
function styleEleUseRules(style,rules,notClearRules){
  var sheet=style.sheet,len=sheet.cssRules.length,i;
  if(!notClearRules)
    while(len--)
      sheet.deleteRule(0);
  for(i=0,len=rules.length;i<len;i++)
    sheet.insertRule(rules[i],i);
}
