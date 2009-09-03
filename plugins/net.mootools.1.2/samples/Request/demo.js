window.addEvent('domready', function(){
	// You can skip the following line. We need it to make sure demos
	// are runnable on MooTools demos web page.
	var demo_path = window.demo_path || '';
	// --

	//We can use one Request object many times.
	var req = new Request({

		url: demo_path + 'data.txt',

		onSuccess: function(txt){
			$('result').set('text', txt);
		},

		// Our request will most likely succeed, but just in case, we'll add an
		// onFailure method which will let the user know what happened.
		onFailure: function(){
			$('result').set('text', 'The request failed.');
		}

	});

	$('makeRequest').addEvent('click', function(){
		req.send();
	});

	$('failedRequest').addEvent('click', function(e){
		//We can pass new options for our Request object to the send method.
		req.send({url:'/assets/not_here.txt'});
	});

});
