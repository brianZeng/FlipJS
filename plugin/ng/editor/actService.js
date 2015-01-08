/**
 * Created by 柏子 on 2015/1/7.
 */
angular.module('flipEditor').factory('actMng',['actDefs',function(defs){
  var mng;
  function objFindValue(obj,func){
    for(var i= 0,keys=Object.getOwnPropertyNames(obj),key,len=keys.length;i<len;i++)
      if(func(obj[key=keys[i]],key))return obj[key]
  }
  function ActionManger(){
    this.actDefs={};
    this.records=[];
    this.maxRecords=100;
  }
  Flip.util.inherit(ActionManger,Flip.util.Object,{
    register:function(name,def){
      var defMap=this.actDefs;
      if(defMap[name])throw Error('contain action:'+name);
      defMap[name]=def;
      def.name=name;
      def.id=Object.getOwnPropertyNames(defMap).length;
      Object.freeze(def);
      return this;
    },
    act:function(idOrName,arg,trace){
      var action,defMap=this.actDefs,rds,record;
      if(isNaN(idOrName))
        action=isNaN(idOrName)?defMap[idOrName]:objFindValue(defMap,function(def){return def.id==idOrName});
      if(action){
        this.emit('act:'+action.name,[arg,action]);
        if(trace){
          (rds=this.records).push(record={name:action.name,arg:arg});
          record.previous=rds[rds.length-2];
          if(rds.length>this.maxRecords)
            this.unshift();
        }
      }else this.emit('act:'+idOrName,arg);
    },
    undo:function(){
      var res=this.records, rec=res.pop();
      if(rec)
        this.on('undo:'+rec.name,[rec.arg,{action:this.actDefs[rec.name],previous:rec.previous}]);
    },
    react:function(actionName,handler,once){
      var evtName='act:'+actionName,h=once?'once':'on';
      this[h](evtName,handler);
      return this;
    },
    fallback:function(actionName,handler,once){
      var evtName='undo:'+actionName,h=once?'once':'on';
      this[h](evtName,handler);
      return this;
    },
    pair:function(actionName,react,fallback,once){
      this.react(actionName,react,once);
      return this.fallback(actionName,fallback,once);
    }
  });
  mng=new ActionManger();
  Flip.util.Object.forEach(defs,function(def,name){mng.register(name,def)});
  return mng;
}]);