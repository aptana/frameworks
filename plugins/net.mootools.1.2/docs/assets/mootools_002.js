//MooTools More, <http://mootools.net/more>. Copyright (c) 2006-2008 Valerio Proietti, <http://mad4milk.net>, MIT Style License.

Hash.Cookie=new Class({Extends:Cookie,options:{autoSave:true},initialize:function(B,A){this.parent(B,A);this.load();},save:function(){var A=JSON.encode(this.hash);
if(!A||A.length>4096){return false;}if(A=="{}"){this.dispose();}else{this.write(A);}return true;},load:function(){this.hash=new Hash(JSON.decode(this.read(),true));
return this;}});Hash.Cookie.implement((function(){var A={};Hash.each(Hash.prototype,function(C,B){A[B]=function(){var D=C.apply(this.hash,arguments);if(this.options.autoSave){this.save();
}return D;};});return A;})());