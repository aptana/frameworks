window.addEvent('domready', function() {
	// You can skip the following two lines of code. We need them to make sure demos
	// are runnable on MooTools demos web page.
	if (!window.demo_path) window.demo_path = '';
	var demo_path = window.demo_path;
	// --
	$('myForm').addEvent('submit', function(e) {
		//Prevents the default submit event from loading a new page.
		e.stop();
		//Empty the log and show the spinning indicator.
		var log = $('log_res').empty().addClass('ajax-loading');
		//Set the options of the form's Request handler. 
		//("this" refers to the $('myForm') element).
		this.set('send', {onComplete: function(response) { 
			log.removeClass('ajax-loading');
			log.set('html', response);
		}});
		//Send the form.
		this.send();
	});
});