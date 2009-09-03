/*
	Copyright (c) 2004-2008, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["dojox.charting.plot2d.common"]){
dojo._hasResource["dojox.charting.plot2d.common"]=true;
dojo.provide("dojox.charting.plot2d.common");
dojo.require("dojo.colors");
dojo.require("dojox.gfx");
dojo.require("dojox.lang.functional");
(function(){
var df=dojox.lang.functional,dc=dojox.charting.plot2d.common;
dojo.mixin(dojox.charting.plot2d.common,{makeStroke:function(_3){
if(!_3){
return _3;
}
if(typeof _3=="string"||_3 instanceof dojo.Color){
_3={color:_3};
}
return dojox.gfx.makeParameters(dojox.gfx.defaultStroke,_3);
},augmentColor:function(_4,_5){
var t=new dojo.Color(_4),c=new dojo.Color(_5);
c.a=t.a;
return c;
},augmentStroke:function(_8,_9){
var s=dc.makeStroke(_8);
if(s){
s.color=dc.augmentColor(s.color,_9);
}
return s;
},augmentFill:function(_b,_c){
var fc,c=new dojo.Color(_c);
if(typeof _b=="string"||_b instanceof dojo.Color){
return dc.augmentColor(_b,_c);
}
return _b;
},defaultStats:{hmin:Number.POSITIVE_INFINITY,hmax:Number.NEGATIVE_INFINITY,vmin:Number.POSITIVE_INFINITY,vmax:Number.NEGATIVE_INFINITY},collectSimpleStats:function(_f){
var _10=dojo.clone(dc.defaultStats);
for(var i=0;i<_f.length;++i){
var run=_f[i];
if(!run.data.length){
continue;
}
if(typeof run.data[0]=="number"){
var _13=_10.vmin,_14=_10.vmax;
if(!("ymin" in run)||!("ymax" in run)){
dojo.forEach(run.data,function(val,i){
var x=i+1,y=val;
if(isNaN(y)){
y=0;
}
_10.hmin=Math.min(_10.hmin,x);
_10.hmax=Math.max(_10.hmax,x);
_10.vmin=Math.min(_10.vmin,y);
_10.vmax=Math.max(_10.vmax,y);
});
}
if("ymin" in run){
_10.vmin=Math.min(_13,run.ymin);
}
if("ymax" in run){
_10.vmax=Math.max(_14,run.ymax);
}
}else{
var _19=_10.hmin,_1a=_10.hmax,_13=_10.vmin,_14=_10.vmax;
if(!("xmin" in run)||!("xmax" in run)||!("ymin" in run)||!("ymax" in run)){
dojo.forEach(run.data,function(val,i){
var x=val.x,y=val.y;
if(isNaN(x)){
x=0;
}
if(isNaN(y)){
y=0;
}
_10.hmin=Math.min(_10.hmin,x);
_10.hmax=Math.max(_10.hmax,x);
_10.vmin=Math.min(_10.vmin,y);
_10.vmax=Math.max(_10.vmax,y);
});
}
if("xmin" in run){
_10.hmin=Math.min(_19,run.xmin);
}
if("xmax" in run){
_10.hmax=Math.max(_1a,run.xmax);
}
if("ymin" in run){
_10.vmin=Math.min(_13,run.ymin);
}
if("ymax" in run){
_10.vmax=Math.max(_14,run.ymax);
}
}
}
return _10;
},collectStackedStats:function(_1f){
var _20=dojo.clone(dc.defaultStats);
if(_1f.length){
_20.hmin=Math.min(_20.hmin,1);
_20.hmax=df.foldl(_1f,"seed, run -> Math.max(seed, run.data.length)",_20.hmax);
for(var i=0;i<_20.hmax;++i){
var v=_1f[0].data[i];
if(isNaN(v)){
v=0;
}
_20.vmin=Math.min(_20.vmin,v);
for(var j=1;j<_1f.length;++j){
var t=_1f[j].data[i];
if(isNaN(t)){
t=0;
}
v+=t;
}
_20.vmax=Math.max(_20.vmax,v);
}
}
return _20;
},curve:function(a,_26){
var arr=a.slice(0);
if(_26=="x"){
arr[arr.length]=arr[0];
}
var p=dojo.map(arr,function(_29,i){
if(i==0){
return "M"+_29.x+","+_29.y;
}
if(!isNaN(_26)){
var dx=_29.x-arr[i-1].x,dy=arr[i-1].y;
return "C"+(_29.x-(_26-1)*(dx/_26))+","+dy+" "+(_29.x-(dx/_26))+","+_29.y+" "+_29.x+","+_29.y;
}else{
if(_26=="X"||_26=="x"||_26=="S"){
var p0,p1=arr[i-1],p2=arr[i],p3;
var _31,_32,_33,_34;
var f=1/6;
if(i==1){
if(_26=="x"){
p0=arr[arr.length-2];
}else{
p0=p1;
}
f=1/3;
}else{
p0=arr[i-2];
}
if(i==(arr.length-1)){
if(_26=="x"){
p3=arr[1];
}else{
p3=p2;
}
f=1/3;
}else{
p3=arr[i+1];
}
var _36=Math.sqrt((p2.x-p1.x)*(p2.x-p1.x)+(p2.y-p1.y)*(p2.y-p1.y));
var _37=Math.sqrt((p2.x-p0.x)*(p2.x-p0.x)+(p2.y-p0.y)*(p2.y-p0.y));
var _38=Math.sqrt((p3.x-p1.x)*(p3.x-p1.x)+(p3.y-p1.y)*(p3.y-p1.y));
var _39=_37*f;
var _3a=_38*f;
if(_39>_36/2&&_3a>_36/2){
_39=_36/2;
_3a=_36/2;
}else{
if(_39>_36/2){
_39=_36/2;
_3a=_36/2*_38/_37;
}else{
if(_3a>_36/2){
_3a=_36/2;
_39=_36/2*_37/_38;
}
}
}
if(_26=="S"){
if(p0==p1){
_39=0;
}
if(p2==p3){
_3a=0;
}
}
_31=p1.x+_39*(p2.x-p0.x)/_37;
_32=p1.y+_39*(p2.y-p0.y)/_37;
_33=p2.x-_3a*(p3.x-p1.x)/_38;
_34=p2.y-_3a*(p3.y-p1.y)/_38;
}
}
return "C"+(_31+","+_32+" "+_33+","+_34+" "+p2.x+","+p2.y);
});
return p.join(" ");
}});
})();
}
