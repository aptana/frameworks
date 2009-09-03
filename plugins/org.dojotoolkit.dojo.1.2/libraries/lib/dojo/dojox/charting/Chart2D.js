/*
	Copyright (c) 2004-2008, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["dojox.charting.Chart2D"]){
dojo._hasResource["dojox.charting.Chart2D"]=true;
dojo.provide("dojox.charting.Chart2D");
dojo.require("dojox.gfx");
dojo.require("dojox.lang.functional");
dojo.require("dojox.lang.functional.fold");
dojo.require("dojox.lang.functional.reversed");
dojo.require("dojox.charting.Theme");
dojo.require("dojox.charting.Series");
dojo.require("dojox.charting.axis2d.Default");
dojo.require("dojox.charting.plot2d.Default");
dojo.require("dojox.charting.plot2d.Lines");
dojo.require("dojox.charting.plot2d.Areas");
dojo.require("dojox.charting.plot2d.Markers");
dojo.require("dojox.charting.plot2d.MarkersOnly");
dojo.require("dojox.charting.plot2d.Scatter");
dojo.require("dojox.charting.plot2d.Stacked");
dojo.require("dojox.charting.plot2d.StackedLines");
dojo.require("dojox.charting.plot2d.StackedAreas");
dojo.require("dojox.charting.plot2d.Columns");
dojo.require("dojox.charting.plot2d.StackedColumns");
dojo.require("dojox.charting.plot2d.ClusteredColumns");
dojo.require("dojox.charting.plot2d.Bars");
dojo.require("dojox.charting.plot2d.StackedBars");
dojo.require("dojox.charting.plot2d.ClusteredBars");
dojo.require("dojox.charting.plot2d.Grid");
dojo.require("dojox.charting.plot2d.Pie");
dojo.require("dojox.charting.plot2d.Bubble");
(function(){
var df=dojox.lang.functional,dc=dojox.charting,_3=df.lambda("item.clear()"),_4=df.lambda("item.purgeGroup()"),_5=df.lambda("item.destroy()"),_6=df.lambda("item.dirty = false"),_7=df.lambda("item.dirty = true");
dojo.declare("dojox.charting.Chart2D",null,{constructor:function(_8,_9){
if(!_9){
_9={};
}
this.margins=_9.margins?_9.margins:{l:10,t:10,r:10,b:10};
this.stroke=_9.stroke;
this.fill=_9.fill;
this.theme=null;
this.axes={};
this.stack=[];
this.plots={};
this.series=[];
this.runs={};
this.dirty=true;
this.coords=null;
this.node=dojo.byId(_8);
var _a=dojo.marginBox(_8);
this.surface=dojox.gfx.createSurface(this.node,_a.w,_a.h);
},destroy:function(){
dojo.forEach(this.series,_5);
dojo.forEach(this.stack,_5);
df.forIn(this.axes,_5);
},getCoords:function(){
if(!this.coords){
this.coords=dojo.coords(this.node,true);
}
return this.coords;
},setTheme:function(_b){
this.theme=_b._clone();
this.dirty=true;
return this;
},addAxis:function(_c,_d){
var _e;
if(!_d||!("type" in _d)){
_e=new dc.axis2d.Default(this,_d);
}else{
_e=typeof _d.type=="string"?new dc.axis2d[_d.type](this,_d):new _d.type(this,_d);
}
_e.name=_c;
_e.dirty=true;
if(_c in this.axes){
this.axes[_c].destroy();
}
this.axes[_c]=_e;
this.dirty=true;
return this;
},getAxis:function(_f){
return this.axes[_f];
},addPlot:function(_10,_11){
var _12;
if(!_11||!("type" in _11)){
_12=new dc.plot2d.Default(this,_11);
}else{
_12=typeof _11.type=="string"?new dc.plot2d[_11.type](this,_11):new _11.type(this,_11);
}
_12.name=_10;
_12.dirty=true;
if(_10 in this.plots){
this.stack[this.plots[_10]].destroy();
this.stack[this.plots[_10]]=_12;
}else{
this.plots[_10]=this.stack.length;
this.stack.push(_12);
}
this.dirty=true;
return this;
},addSeries:function(_13,_14,_15){
var run=new dc.Series(this,_14,_15);
if(_13 in this.runs){
this.series[this.runs[_13]].destroy();
this.series[this.runs[_13]]=run;
}else{
this.runs[_13]=this.series.length;
this.series.push(run);
}
run.name=_13;
this.dirty=true;
if(!("ymin" in run)&&"min" in run){
run.ymin=run.min;
}
if(!("ymax" in run)&&"max" in run){
run.ymax=run.max;
}
return this;
},updateSeries:function(_17,_18){
if(_17 in this.runs){
var run=this.series[this.runs[_17]],_1a=this.stack[this.plots[run.plot]],_1b;
run.data=_18;
run.dirty=true;
if(_1a.hAxis){
_1b=this.axes[_1a.hAxis];
if(_1b.dependOnData()){
_1b.dirty=true;
dojo.forEach(this.stack,function(p){
if(p.hAxis&&p.hAxis==_1a.hAxis){
p.dirty=true;
}
});
}
}else{
_1a.dirty=true;
}
if(_1a.vAxis){
_1b=this.axes[_1a.vAxis];
if(_1b.dependOnData()){
_1b.dirty=true;
dojo.forEach(this.stack,function(p){
if(p.vAxis&&p.vAxis==_1a.vAxis){
p.dirty=true;
}
});
}
}else{
_1a.dirty=true;
}
}
return this;
},resize:function(_1e,_1f){
var box;
switch(arguments.length){
case 0:
box=dojo.marginBox(this.node);
break;
case 1:
box=_1e;
break;
default:
box={w:_1e,h:_1f};
break;
}
dojo.marginBox(this.node,box);
this.surface.setDimensions(box.w,box.h);
this.dirty=true;
this.coords=null;
return this.render();
},getGeometry:function(){
var ret={};
df.forIn(this.axes,function(_22){
if(_22.initialized()){
ret[_22.name]={name:_22.name,vertical:_22.vertical,scaler:_22.scaler,ticks:_22.ticks};
}
});
return ret;
},setAxisWindow:function(_23,_24,_25){
var _26=this.axes[_23];
if(_26){
_26.setWindow(_24,_25);
}
return this;
},setWindow:function(sx,sy,dx,dy){
if(!("plotArea" in this)){
this.calculateGeometry();
}
df.forIn(this.axes,function(_2b){
var _2c,_2d,_2e=_2b.getScaler().bounds,s=_2e.span/(_2e.upper-_2e.lower);
if(_2b.vertical){
_2c=sy;
_2d=dy/s/_2c;
}else{
_2c=sx;
_2d=dx/s/_2c;
}
_2b.setWindow(_2c,_2d);
});
return this;
},calculateGeometry:function(){
if(this.dirty){
return this.fullGeometry();
}
dojo.forEach(this.stack,function(_30){
if(_30.dirty||(_30.hAxis&&this.axes[_30.hAxis].dirty)||(_30.vAxis&&this.axes[_30.vAxis].dirty)){
_30.calculateAxes(this.plotArea);
}
},this);
return this;
},fullGeometry:function(){
this._makeDirty();
dojo.forEach(this.stack,_3);
if(!this.theme){
this.setTheme(new dojox.charting.Theme(dojox.charting._def));
}
dojo.forEach(this.series,function(run){
if(!(run.plot in this.plots)){
var _32=new dc.plot2d.Default(this,{});
_32.name=run.plot;
this.plots[run.plot]=this.stack.length;
this.stack.push(_32);
}
this.stack[this.plots[run.plot]].addSeries(run);
},this);
dojo.forEach(this.stack,function(_33){
if(_33.hAxis){
_33.setAxis(this.axes[_33.hAxis]);
}
if(_33.vAxis){
_33.setAxis(this.axes[_33.vAxis]);
}
},this);
var dim=this.dim=this.surface.getDimensions();
dim.width=dojox.gfx.normalizedLength(dim.width);
dim.height=dojox.gfx.normalizedLength(dim.height);
df.forIn(this.axes,_3);
dojo.forEach(this.stack,function(_35){
_35.calculateAxes(dim);
});
var _36=this.offsets={l:0,r:0,t:0,b:0};
df.forIn(this.axes,function(_37){
df.forIn(_37.getOffsets(),function(o,i){
_36[i]+=o;
});
});
df.forIn(this.margins,function(o,i){
_36[i]+=o;
});
this.plotArea={width:dim.width-_36.l-_36.r,height:dim.height-_36.t-_36.b};
df.forIn(this.axes,_3);
dojo.forEach(this.stack,function(_3c){
_3c.calculateAxes(this.plotArea);
},this);
return this;
},render:function(){
if(this.theme){
this.theme.clear();
}
if(this.dirty){
return this.fullRender();
}
this.calculateGeometry();
df.forEachRev(this.stack,function(_3d){
_3d.render(this.dim,this.offsets);
},this);
df.forIn(this.axes,function(_3e){
_3e.render(this.dim,this.offsets);
},this);
this._makeClean();
if(this.surface.render){
this.surface.render();
}
return this;
},fullRender:function(){
this.fullGeometry();
var _3f=this.offsets,dim=this.dim;
var _41=df.foldl(this.stack,"z + plot.getRequiredColors()",0);
this.theme.defineColors({num:_41,cache:false});
dojo.forEach(this.series,_4);
df.forIn(this.axes,_4);
dojo.forEach(this.stack,_4);
this.surface.clear();
var t=this.theme,_43=t.plotarea&&t.plotarea.fill,_44=t.plotarea&&t.plotarea.stroke;
if(_43){
this.surface.createRect({x:_3f.l,y:_3f.t,width:dim.width-_3f.l-_3f.r,height:dim.height-_3f.t-_3f.b}).setFill(_43);
}
if(_44){
this.surface.createRect({x:_3f.l,y:_3f.t,width:dim.width-_3f.l-_3f.r-1,height:dim.height-_3f.t-_3f.b-1}).setStroke(_44);
}
df.foldr(this.stack,function(z,_46){
return _46.render(dim,_3f),0;
},0);
_43=this.fill?this.fill:(t.chart&&t.chart.fill);
_44=this.stroke?this.stroke:(t.chart&&t.chart.stroke);
if(_43=="inherit"){
var _47=this.node,_43=new dojo.Color(dojo.style(_47,"backgroundColor"));
while(_43.a==0&&_47!=document.documentElement){
_43=new dojo.Color(dojo.style(_47,"backgroundColor"));
_47=_47.parentNode;
}
}
if(_43){
if(_3f.l){
this.surface.createRect({width:_3f.l,height:dim.height+1}).setFill(_43);
}
if(_3f.r){
this.surface.createRect({x:dim.width-_3f.r,width:_3f.r+1,height:dim.height+1}).setFill(_43);
}
if(_3f.t){
this.surface.createRect({width:dim.width+1,height:_3f.t}).setFill(_43);
}
if(_3f.b){
this.surface.createRect({y:dim.height-_3f.b,width:dim.width+1,height:_3f.b+2}).setFill(_43);
}
}
if(_44){
this.surface.createRect({width:dim.width-1,height:dim.height-1}).setStroke(_44);
}
df.forIn(this.axes,function(_48){
_48.render(dim,_3f);
});
this._makeClean();
if(this.surface.render){
this.surface.render();
}
return this;
},connectToPlot:function(_49,_4a,_4b){
return _49 in this.plots?this.stack[this.plots[_49]].connect(_4a,_4b):null;
},_makeClean:function(){
dojo.forEach(this.axes,_6);
dojo.forEach(this.stack,_6);
dojo.forEach(this.series,_6);
this.dirty=false;
},_makeDirty:function(){
dojo.forEach(this.axes,_7);
dojo.forEach(this.stack,_7);
dojo.forEach(this.series,_7);
this.dirty=true;
}});
})();
}
