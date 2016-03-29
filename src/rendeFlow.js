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
function resetStyleElement(styleElement){
  var replaceNode=styleElement.cloneNode(false);
  styleElement.parentNode.replaceChild(replaceNode,styleElement);
  return replaceNode;
}
function renderGlobal(global,state){
  if(global._invalid||state.forceRender){
    objForEach(global._tasks,function(task){renderTask(task,state);});
    var styleStack = state.styleStack, transformMap = state.transformMap;
    if (styleStack.length || Object.getOwnPropertyNames(transformMap).length) {
      var styleEle = global._styleElement = resetStyleElement(global._styleElement), styleSheet = styleEle.sheet;
      styleStack.forEach(function (style, i){
        styleSheet.addRule(style.selector, style.rules.join(';'), i)
      });
      var cssProxy = new CssProxy(), index = styleSheet.cssRules.length;
      objForEach(transformMap, function (mat, selector){
        cssProxy.$withPrefix('transform', mat + '');
        styleSheet.addRule(selector, cssProxy.$toSafeCssString(), index++);
      });
    }
    global._invalid=false;
  }
  objForEach(global._tasks,function(task){finalizeTask(task,state)});
  global._forceRender=false;
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

