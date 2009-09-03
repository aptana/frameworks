dojo.provide("dojo.profile.ProfileHelper");

dojo.require("dojo.lang.*");
dojo.require("dojo.profile");



// add some methods to the original profile object
//	TODO: merge this code later
dojo.profile.getItemTotal = function(name) {
	// summary
	//	return the total time taken for one particular entry
	if (this._profiles[name]) return this._profiles[name].total;	/* Number in milliseconds */
	return null;
}

dojo.profile.clearItem = function(name) {
	// summary:	clear the profile times for a particular entry
	return (this._profiles[name] = {iters: 0, total: 0});
}

dojo.profile.debugItem = function(name) {
	// summary:	write profile information for a particular entry to the debug console
	var profile = this._profiles[name];
	if (profile == null) return null;
	
	if (profile.iters == 0) {
		return [name, " not profiled."].join("");
	}
	var output = [name, " took ", profile.total, " msec for ", profile.iters, " iteration"];
	if (profile.iters > 1) {
		output.push("s (", (Math.round(profile.total/profile.iters*100)/100), " msec each)");
	}

	// summary: print profile information for a single item out to the debug log
	dojo.debug(output.join(""));
}



/* interface you can mix in to your class for convenient profiling functions */
dojo.profile.ProfileHelper = {
	// summary
	//	Mix-in to add profiling help to another class.
	// description
	//	For an instance, install as:
	//		dojo.lang.mixin(yourObject, dojo.profile.ProfileHelper);
	//	For a class, install as:
	//		dojo.lang.extend(constructor, dojo.profile.ProfileHelper);
	//
	//	In your class's methods, call
	//		this.startProfile("name")
	//		...
	//		this.endProfile("name");
	//	
	//	Set yourObject._profile  to false to skip all profiling
	//	Set yourObject._autoDebugProfile to true to write profile information on debug log on endProfile()
	//
									//  note: you must set these AFTER mixing in the ProfileHelper

	_profile : true,				// if true, we do profiling in this class
	_autoDebugProfile : false,		// if true, we output debug information on this.endProfile()
	_profileMinTime : 1,			// if > 0, we only output if debug total time is > minTime
	
	startProfile : function(name) {
		if (!this._profile) return;
		dojo.profile.start(name);
	},
	
	endProfile : function(name, debug, clear) {
		if (!this._profile) return;
		dojo.profile.end(name);
		if (debug != false && this._autoDebugProfile) {
			if (dojo.profile.getItemTotal(name) > this._profileMinTime) {
				dojo.profile.debugItem(name);
			}
		}
		if (clear) dojo.profile.clearItem(name);
	},
	clearProfile : function(name) {
		if (!this._profile) return;
		dojo.profile.clearItem(name);
	}
}