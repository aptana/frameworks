window.addEvent('domready', function() {

	//This is the function that will run every time a new item is added or the 
	//list is sorted.
	var showNewOrder = function() {
		//This function means we get serialize() to tell us the text of each 
		//element, instead of its ID, which is the default return.
		var serializeFunction = function(el) { return el.get('text'); };
		//We pass our custom function to serialize();
		var orderTxt = sort.serialize(serializeFunction);
		//And then we add that text to our page so everyone can see it.
		$('data').set('text', orderTxt.join(' '));
	};
	
	//This code initalizes the sortable list.
	var sort = new Sortables('.todo', {
		handle: '.drag-handle',
		//This will constrain the list items to the list.
		constrain: true,
		//We'll get to see a nice cloned element when we drag.
		clone: true,
		//This function will happen when the user 'drops' an item in a new place.
		onComplete: showNewOrder
	});

	//This is the code that makes the text input add list items to the <ul>,
	//which we then make sortable.
	var i = 1;
	$('addTask').addEvent('submit', function(e) {
		e.stop();
		//Get the value of the text input.
		var val = $('newTask').get('value');
		//The code here will execute if the input is empty.
		if (!val) {
			$('newTask').highlight('#f00').focus();	
			return; //Return will skip the rest of the code in the function. 
		}
		//Create a new <li> to hold all our content.
		var li = new Element('li', {id: 'item-'+i, text:val});
		//This handle element will serve as the point where the user 'picks up'
		//the draggable element.
		var handle = new Element('div', {id:'handle-'+i, 'class':'drag-handle'});
		handle.inject(li, 'top');
		//Set the value of the form to '', since we've added its value to the <li>.
		$('newTask').set('value', '');
		//Add the <li> to our list.
		$('todo').adopt(li);
		//Do a fancy effect on the <li>.
		li.highlight();
		//We have to add the list item to our Sortable object so it's sortable.
		sort.addItems(li);
		//We put the new order inside of the data div.
		showNewOrder();
		i++;
	});
	
});