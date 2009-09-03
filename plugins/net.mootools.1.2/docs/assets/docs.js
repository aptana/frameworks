var Search = new Class({
	
	Implements: [Events, Options],
	
	options: {
		label: null,
		restrict: null
	},
	
	initialize: function(options){
		this.setOptions(options);
		
		this.search = new google.search.WebSearch();
		if (this.options.label) this.search.setUserDefinedLabel(this.options.label);
		if (this.options.restrict) this.search.setSiteRestriction(this.options.restrict);
		this.search.setNoHtmlGeneration();
		this.search.setSearchCompleteCallback(this, this.complete);
	},
	
	complete: function(){
		this.fireEvent('onComplete', [this.search.results]);
	},
	
	query: function(value){
		this.search.execute(value);
		return this;
	}
	
});

Search.Results = new Class({
	
	toElement: function(){
		return this.container;
	},
	
	initialize: function(){
		this.container = new Element('ul', {'class': 'results'});
	},
	
	fill: function(results){
		this.container.empty();
		
		for (var i = 0, l = results.length; i < l; i++){
			
			var li = this.parseResult(results[i]);
			
			this.container.adopt(li);
			
			if (i == results.length - 1) li.addClass('last');
		}
		
		if (results.length == 0){
			var empty = new Element('li', {'class': 'result-item first last'});
			var content = new Element('div', {'class': 'result-content', html: 'no results'});
			empty.adopt(content);
			this.container.adopt(empty);
		}
	},
	
	parseResult: function(result){
		var li = new Element('li', {'class': 'result-item'});
		var title = new Element('a', {'class': 'result-title', html: result.title, href: result.url});
		var content = new Element('div', {'class': 'result-content', html: result.content});
		li.adopt(title, content);
		return li;
	}
	
});

Search.Input = new Class({
	
	Implements: [Events, Options],
	
	options: {
		results: 4,
		placeHolder: null,
		id: null,
		className: null
	},
	
	toElement: function(){
		return this.input;
	},
	
	initialize: function(options){
		
		this.setOptions(options);
		
		this.input = new Element('input', {type: Browser.Engine.webkit ? 'search' : 'text'});
		
		if (Browser.Engine.webkit) this.input.set('results', this.options.results);
		
		if (this.options.id) this.input.set('id', this.options.id);
		
		var placeHolder = this.options.placeHolder;
		
		if (placeHolder){
			
			if (Browser.Engine.webkit){
				this.input.set('placeholder', placeHolder);
			} else {
				this.input.addEvents({
					
					focus: function(){
						if (this.value == placeHolder) this.value = '';
						this.removeClass('place-holder');
					},
					
					blur: function(){
						if (!this.value.length){
							this.value = placeHolder;
							this.addClass('place-holder');
						}
					}
				});
				
				this.input.fireEvent('blur');
			}

		}
		
		this.input.addEvent('keydown', function(event){
			this.value = this.input.value;
			if (event.key == 'enter' && this.value.length) this.fireEvent('onSubmit');
		}.bind(this));
	}
	
});

google.load('search', '1', {nocss: true});

window.addEvent('domready', function(){
	
	var webSearch = new Search({restrict: '014530154148894981769:elre3sjkses', label: 'MooTools Docs'});
	
	var input = new Search.Input({id: "google-input", placeHolder: 'Google custom search'});
	
	var list = new Search.Results();
	
	li = $(list);
	
	li.inject('google-search-results');
	
	li.setStyle('visibility', 'hidden');
	
	input.addEvent('onSubmit', function(){
		li.setStyles({
			top: $('wrapper').getTop(),
			left: $(input).getLeft(),
			width: $(input).getWidth() -2
		});
		li.setStyle('visibility', 'visible').set('html', '<li class="first last">Loading...</li>');
		webSearch.query(this.value);
	});
	
	webSearch.addEvent('onComplete', function(results){
		$(input).blur();
		list.fill(results);
		li.grabTop(new Element('li', {'class': 'first', id: 'powered-by-google', html: 'powered by <a href="http://google.com">Google</a>'}));
	});
	
	document.addEvent('click', function(e){
		if (e.target != li && !li.hasChild(e.target)) li.setStyle('visibility', 'hidden');
	});
	
	$(input).inject('google-search');
	
});