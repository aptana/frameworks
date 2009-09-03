;(function($) {
	
// initializer for all js/plugins
jQuery(function(){
	// modify body to mark js layout
	$(document.body).addClass("js");
	
	// general tooltips ( http://bassistance.de/jquery-plugins/jquery-plugin-accordion/ )
	$("#docs>li>span>span.tooltip").Tooltip({ delay: 150 });
	
	var m = location.search.match(/q=(.+)/);
	if(m)
		$("#mainQS input").val(m[1]).trigger("keydown");
	
	// chili is also used, but it initializes itself ( http://www.mondotondo.com/aercolino/noteslog/?cat=8 )
});

})(jQuery);