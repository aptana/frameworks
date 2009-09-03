/*
	Copyright (c) 2004-2008, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["dojox.charting.widget.Legend"]){
dojo._hasResource["dojox.charting.widget.Legend"]=true;
dojo.provide("dojox.charting.widget.Legend");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dojox.lang.functional.array");
dojo.require("dojox.lang.functional.fold");
dojo.declare("dojox.charting.widget.Legend",[dijit._Widget,dijit._Templated],{chartRef:"",horizontal:true,templateString:"<table dojoAttachPoint='legendNode' class='dojoxLegendNode'><tbody dojoAttachPoint='legendBody'></tbody></table>",legendNode:null,legendBody:null,postCreate:function(){
var s,df=dojox.lang.functional;
if(!this.chart){
if(!this.chartRef){
return;
}
this.chart=dijit.byId(this.chartRef);
if(!this.chart){
var _3=dojo.byId(this.chartRef);
if(_3){
this.chart=dijit.byNode(_3);
}else{

return;
}
}
s=this.chart.chart.series;
}else{
s=this.chart.series;
}
if(this.horizontal){
dojo.addClass(this.legendNode,"dojoxLegendHorizontal");
this._tr=dojo.doc.createElement("tr");
this.legendBody.appendChild(this._tr);
}
if(s.length==1&&s[0].chart.stack[0].declaredClass=="dojox.charting.plot2d.Pie"){
var t=s[0].chart.stack[0];
if(typeof s[0].data[0]=="number"){
var _5=df.map(s[0].data,"/ this",df.foldl1(s[0].data,"+"));
dojo.forEach(_5,function(x,i){
this._addLabel(t.dyn[i],t._getLabel(x*100)+"%");
},this);
}else{
dojo.forEach(s[0].data,function(x,i){
this._addLabel(t.dyn[i],x.legend||x.text||x.y);
},this);
}
}else{
dojo.forEach(s,function(x){
this._addLabel(x.dyn,x.legend||x.name);
},this);
}
},_addLabel:function(_b,_c){
var _d=dojo.doc.createElement("td"),_e=dojo.doc.createElement("td"),_f=dojo.doc.createElement("div");
dojo.addClass(_d,"dojoxLegendIcon");
dojo.addClass(_e,"dojoxLegendText");
_f.style.width="20px";
_f.style.height="20px";
_d.appendChild(_f);
if(this._tr){
this._tr.appendChild(_d);
this._tr.appendChild(_e);
}else{
var tr=dojo.doc.createElement("tr");
this.legendBody.appendChild(tr);
tr.appendChild(_d);
tr.appendChild(_e);
}
this._makeIcon(_f,_b);
_e.innerHTML=String(_c);
},_makeIcon:function(div,dyn){
var mb={h:14,w:14};
var _14=dojox.gfx.createSurface(div,mb.w,mb.h);
if(dyn.fill){
_14.createRect({x:2,y:2,width:mb.w-4,height:mb.h-4}).setFill(dyn.fill).setStroke(dyn.stroke);
}else{
var _15={x1:0,y1:mb.h/2,x2:mb.w,y2:mb.h/2};
if(dyn.stroke){
_14.createLine(_15).setStroke(dyn.stroke);
}
if(dyn.marker){
var c={x:mb.w/2,y:mb.h/2};
if(dyn.stroke){
_14.createPath({path:"M"+c.x+" "+c.y+" "+dyn.marker}).setFill(dyn.stroke.color).setStroke(dyn.stroke);
}else{
_14.createPath({path:"M"+c.x+" "+c.y+" "+dyn.marker}).setFill(dyn.color).setStroke(dyn.color);
}
}
}
}});
}
