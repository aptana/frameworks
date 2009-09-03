/*
	Copyright (c) 2004-2008, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["dojox.charting.plot2d.Grid"]){
dojo._hasResource["dojox.charting.plot2d.Grid"]=true;
dojo.provide("dojox.charting.plot2d.Grid");
dojo.require("dojox.charting.Element");
dojo.require("dojox.charting.plot2d.common");
dojo.require("dojox.lang.functional");
(function(){
var du=dojox.lang.utils;
dojo.declare("dojox.charting.plot2d.Grid",dojox.charting.Element,{defaultParams:{hAxis:"x",vAxis:"y",hMajorLines:true,hMinorLines:false,vMajorLines:true,vMinorLines:false,hStripes:"none",vStripes:"none"},optionalParams:{},constructor:function(_2,_3){
this.opt=dojo.clone(this.defaultParams);
du.updateWithObject(this.opt,_3);
this.hAxis=this.opt.hAxis;
this.vAxis=this.opt.vAxis;
this.dirty=true;
},clear:function(){
this._hAxis=null;
this._vAxis=null;
this.dirty=true;
return this;
},setAxis:function(_4){
if(_4){
this[_4.vertical?"_vAxis":"_hAxis"]=_4;
}
return this;
},addSeries:function(_5){
return this;
},calculateAxes:function(_6){
return this;
},isDirty:function(){
return this.dirty||this._hAxis&&this._hAxis.dirty||this._vAxis&&this._vAxis.dirty;
},getRequiredColors:function(){
return 0;
},render:function(_7,_8){
this.dirty=this.isDirty();
if(!this.dirty){
return this;
}
this.cleanGroup();
var s=this.group,ta=this.chart.theme.axis,_b=this._vAxis.getTicks(),_c=this._hAxis.getScaler(),_d=this._vAxis.getScaler(),ht=_c.scaler.getTransformerFromModel(_c),vt=_d.scaler.getTransformerFromModel(_d);
if(this.opt.hMinorLines){
dojo.forEach(_b.minor,function(_10){
var y=_7.height-_8.b-vt(_10.value);
s.createLine({x1:_8.l,y1:y,x2:_7.width-_8.r,y2:y}).setStroke(ta.minorTick);
});
}
if(this.opt.hMajorLines){
dojo.forEach(_b.major,function(_12){
var y=_7.height-_8.b-vt(_12.value);
s.createLine({x1:_8.l,y1:y,x2:_7.width-_8.r,y2:y}).setStroke(ta.majorTick);
});
}
_b=this._hAxis.getTicks();
if(this.opt.vMinorLines){
dojo.forEach(_b.minor,function(_14){
var x=_8.l+ht(_14.value);
s.createLine({x1:x,y1:_8.t,x2:x,y2:_7.height-_8.b}).setStroke(ta.minorTick);
});
}
if(this.opt.vMajorLines){
dojo.forEach(_b.major,function(_16){
var x=_8.l+ht(_16.value);
s.createLine({x1:x,y1:_8.t,x2:x,y2:_7.height-_8.b}).setStroke(ta.majorTick);
});
}
this.dirty=false;
return this;
}});
})();
}
