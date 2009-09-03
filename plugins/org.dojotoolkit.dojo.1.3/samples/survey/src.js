dojo.registerModulePath("survey.src","../../src");
dojo.provide("survey.src");

dojo.require("survey.src.chart");
dojo.require("survey.src.form");

dojo.require("dojox.analytics.Urchin");
dojo.addOnLoad(function(){
	new dojox.analytics.Urchin({ 
		acct: "UA-3572741-1", 
		GAonLoad: function(){
			this.trackPageView("/samples/survey");
		}
	});	
});
