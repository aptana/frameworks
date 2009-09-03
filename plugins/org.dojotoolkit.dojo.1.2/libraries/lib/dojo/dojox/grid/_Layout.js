/*
	Copyright (c) 2004-2008, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["dojox.grid._Layout"]){
dojo._hasResource["dojox.grid._Layout"]=true;
dojo.provide("dojox.grid._Layout");
dojo.require("dojox.grid.cells");
dojo.require("dojox.grid._RowSelector");
dojo.declare("dojox.grid._Layout",null,{constructor:function(_1){
this.grid=_1;
},cells:[],structure:null,defaultWidth:"6em",moveColumn:function(_2,_3,_4,_5,_6){
var _7=this.structure[_2].cells[0];
var _8=this.structure[_3].cells[0];
var _9=null;
var _a=0;
var _b=0;
for(var i=0,c;c=_7[i];i++){
if(c.index==_4){
_a=i;
break;
}
}
_9=_7.splice(_a,1)[0];
_9.view=this.grid.views.views[_3];
for(i=0,c=null;c=_8[i];i++){
if(c.index==_5){
_b=i;
break;
}
}
if(!_6){
_b+=1;
}
_8.splice(_b,0,_9);
this.cells=[];
var _4=0;
for(var i=0,v;v=this.structure[i];i++){
for(var j=0,cs;cs=v.cells[j];j++){
for(var k=0,c;c=cs[k];k++){
c.index=_4;
this.cells.push(c);
_4++;
}
}
}
this.grid.setupHeaderMenu();
},setColumnVisibility:function(_12,_13){
var _14=this.cells[_12];
if(_14.hidden==_13){
_14.hidden=!_13;
var v=_14.view,w=v.viewWidth;
v.convertColPctToFixed();
if(w&&w!="auto"){
v._togglingColumn=dojo.marginBox(_14.getHeaderNode()).w||0;
}
v.update();
return true;
}else{
return false;
}
},addCellDef:function(_17,_18,_19){
var _1a=this;
var _1b=function(_1c){
var w=0;
if(_1c.colSpan>1){
w=0;
}else{
if(!isNaN(_1c.width)){
w=_1c.width+"em";
}else{
w=_1c.width||_1a.defaultWidth;
}
}
return w;
};
var _1e={grid:this.grid,subrow:_17,layoutIndex:_18,index:this.cells.length};
if(_19&&_19 instanceof dojox.grid.cells._Base){
var _1f=dojo.clone(_19);
_1e.unitWidth=_1b(_1f._props);
_1f=dojo.mixin(_1f,this._defaultCellProps,_19._props,_1e);
return _1f;
}
var _20=_19.type||this._defaultCellProps.type||dojox.grid.cells.Cell;
_1e.unitWidth=_1b(_19);
return new _20(dojo.mixin({},this._defaultCellProps,_19,_1e));
},addRowDef:function(_21,_22){
var _23=[];
var _24=0,_25=0,_26=true;
for(var i=0,def,_29;(def=_22[i]);i++){
_29=this.addCellDef(_21,i,def);
_23.push(_29);
this.cells.push(_29);
if(_26&&_29.relWidth){
_24+=_29.relWidth;
}else{
if(_29.width){
var w=_29.width;
if(typeof w=="string"&&w.slice(-1)=="%"){
_25+=window.parseInt(w,10);
}else{
if(w=="auto"){
_26=false;
}
}
}
}
}
if(_24&&_26){
dojo.forEach(_23,function(_2b){
if(_2b.relWidth){
_2b.width=_2b.unitWidth=((_2b.relWidth/_24)*(100-_25))+"%";
}
});
}
return _23;
},addRowsDef:function(_2c){
var _2d=[];
if(dojo.isArray(_2c)){
if(dojo.isArray(_2c[0])){
for(var i=0,row;_2c&&(row=_2c[i]);i++){
_2d.push(this.addRowDef(i,row));
}
}else{
_2d.push(this.addRowDef(0,_2c));
}
}
return _2d;
},addViewDef:function(_30){
this._defaultCellProps=_30.defaultCell||{};
return dojo.mixin({},_30,{cells:this.addRowsDef(_30.rows||_30.cells)});
},setStructure:function(_31){
this.fieldIndex=0;
this.cells=[];
var s=this.structure=[];
if(this.grid.rowSelector){
var sel={type:dojox._scopeName+".grid._RowSelector"};
if(dojo.isString(this.grid.rowSelector)){
var _34=this.grid.rowSelector;
if(_34=="false"){
sel=null;
}else{
if(_34!="true"){
sel["width"]=_34;
}
}
}else{
if(!this.grid.rowSelector){
sel=null;
}
}
if(sel){
s.push(this.addViewDef(sel));
}
}
var _35=function(def){
return ("name" in def||"field" in def||"get" in def);
};
var _37=function(def){
if(dojo.isArray(def)){
if(dojo.isArray(def[0])||_35(def[0])){
return true;
}
}
return false;
};
var _39=function(def){
return (def!=null&&dojo.isObject(def)&&("cells" in def||"rows" in def||("type" in def&&!_35(def))));
};
if(dojo.isArray(_31)){
var _3b=false;
for(var i=0,st;(st=_31[i]);i++){
if(_39(st)){
_3b=true;
break;
}
}
if(!_3b){
s.push(this.addViewDef({cells:_31}));
}else{
for(var i=0,st;(st=_31[i]);i++){
if(_37(st)){
s.push(this.addViewDef({cells:st}));
}else{
if(_39(st)){
s.push(this.addViewDef(st));
}
}
}
}
}else{
if(_39(_31)){
s.push(this.addViewDef(_31));
}
}
this.cellCount=this.cells.length;
this.grid.setupHeaderMenu();
}});
}
