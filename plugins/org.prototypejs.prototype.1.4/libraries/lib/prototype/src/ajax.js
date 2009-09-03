var Ajax = {

/**
 * Creates a new XMLHttpRequest object.
 * @name Ajax.getTransport()
 * @return {XMLHttpRequest} Returns a new XMLHttpRequest object.
 */  
  getTransport: function() {
    return Try.these(
      function() {return new ActiveXObject('Msxml2.XMLHTTP')},
      function() {return new ActiveXObject('Microsoft.XMLHTTP')},
      function() {return new XMLHttpRequest()}
    ) || false;
  },

/**
 * Current number of AJAX requests.
 */  
  activeRequestCount: 0
}

Ajax.Responders = {
  
/**
 * Array of objects that are registered for AJAX event notifications.
 * @name Ajax.responders[]
 */  
  responders: [],
  
  _each: function(iterator) {
    this.responders._each(iterator);
  },

/**
 * Calls the methods associated with the responderToAdd object when the corresponding event occurs.
 * @name Ajax.Responders.register
 * @param {Object} responderToAdd	Object containing the methods to call. Should be named the same as the appropriate AJAX event.
 * @extends {Enumerable}
 */
  register: function(responderToAdd) {
    if (!this.include(responderToAdd))
      this.responders.push(responderToAdd);
  },

/**
 * Removes the responderToRemove object from the list of registered objects.
 * @name Ajax.Responders.unregister
 * @param {Object} responderToRemove
 * @extends {Enumerable}
 */  
  unregister: function(responderToRemove) {
    this.responders = this.responders.without(responderToRemove);
  },

/**
 * For each object in the list, calls the method specified in callback using request, transport, and json as arguments.
 * @name Ajax.Responders.dispatch
 * @param {Object} callback	Name of the AJAX event.	
 * @param {Object} request	Ajax.Request object responsible for the event.
 * @param {Object} transport	XMLHttpRequest object that carries the AJAX call.
 * @param {Object} json	X-JSON header of the response.
 * @extends {Enumerable}
 */  
  dispatch: function(callback, request, transport, json) {
    this.each(function(responder) {
      if (responder[callback] && typeof responder[callback] == 'function') {
        try {
          responder[callback].apply(responder, [request, transport, json]);
        } catch (e) {}
      }
    });
  }
};

Object.extend(Ajax.Responders, Enumerable);

Ajax.Responders.register({
  onCreate: function() {
    Ajax.activeRequestCount++;
  },
  
  onComplete: function() {
    Ajax.activeRequestCount--;
  }
});

/**
 * @classDescription Base class for most other classes defined by the Ajax object.
 * @constructor
 */
Ajax.Base = function() {};
Ajax.Base.prototype = {

/**
 * Sets the options for an AJAX operation.
 * @name Ajax.Base.setOptions()
 * @param {Object} options	Options to set for the operation.
 */  
  setOptions: function(options) {
    this.options = {
      method:       'post',
      asynchronous: true,
      parameters:   ''
    }
    Object.extend(this.options, options || {});
  },

/**
 * Returns true if the AJAX operation is a success.
 * @name Ajax.Base.responseIsSuccess()
 * @return {Boolean}	Returns true if the AJAX operation is a success. 
 */
  responseIsSuccess: function() {
    return this.transport.status == undefined
        || this.transport.status == 0 
        || (this.transport.status >= 200 && this.transport.status < 300);
  },

/**
 * Returns true if the AJAX operation is a failure.
 * @name Ajax.Base.responseIsFailure()
 * @return {Boolean}	Returns true if the AJAX operation is a failure. 
 */
  responseIsFailure: function() {
    return !this.responseIsSuccess();
  }
}

/**
 * @classDescription Contains properties and methods to compose an AJAX request to send to the server.
 * @constructor
 * @name Ajax.Request
 */
Ajax.Request = Class.create();

/**
 * List of possible events and statuses associated with an AJAX operation.
 * @extends {Ajax.Base}
 */
Ajax.Request.Events = 
  ['Uninitialized', 'Loading', 'Loaded', 'Interactive', 'Complete'];

/**
 * Inititializes a new Ajax request.
 * @name Ajax.Request.initialize()
 * @param {Object} url	URL target for the request.
 * @param {Object} options	Options to set.
 * @extends {Ajax.Base}
 */
Ajax.Request.prototype = Object.extend(new Ajax.Base(), {
  initialize: function(url, options) {
    this.transport = Ajax.getTransport();
    this.setOptions(options);
    this.request(url);
  },

//private
  request: function(url) {
    var parameters = this.options.parameters || '';
    if (parameters.length > 0) parameters += '&_=';

    try {
      this.url = url;
      if (this.options.method == 'get' && parameters.length > 0)
        this.url += (this.url.match(/\?/) ? '&' : '?') + parameters;
      
      Ajax.Responders.dispatch('onCreate', this, this.transport);
      
      this.transport.open(this.options.method, this.url, 
        this.options.asynchronous);

      if (this.options.asynchronous) {
        this.transport.onreadystatechange = this.onStateChange.bind(this);
        setTimeout((function() {this.respondToReadyState(1)}).bind(this), 10);
      }

      this.setRequestHeaders();

      var body = this.options.postBody ? this.options.postBody : parameters;
      this.transport.send(this.options.method == 'post' ? body : null);

    } catch (e) {
      this.dispatchException(e);
    }
  },

//private
  setRequestHeaders: function() {
    var requestHeaders = 
      ['X-Requested-With', 'XMLHttpRequest',
       'X-Prototype-Version', Prototype.Version];

    if (this.options.method == 'post') {
      requestHeaders.push('Content-type', 
        'application/x-www-form-urlencoded');

      /* Force "Connection: close" for Mozilla browsers to work around
       * a bug where XMLHttpReqeuest sends an incorrect Content-length
       * header. See Mozilla Bugzilla #246651. 
       */
      if (this.transport.overrideMimeType)
        requestHeaders.push('Connection', 'close');
    }

    if (this.options.requestHeaders)
      requestHeaders.push.apply(requestHeaders, this.options.requestHeaders);

    for (var i = 0; i < requestHeaders.length; i += 2)
      this.transport.setRequestHeader(requestHeaders[i], requestHeaders[i+1]);
  },

//private
  onStateChange: function() {
    var readyState = this.transport.readyState;
    if (readyState != 1)
      this.respondToReadyState(this.transport.readyState);
  },
  
/**
 * Retrieves the contents of an HTTP header for an AJAX response. Call after the AJAX call completes.
 * @param {String} name	Name of the HTTP header.
 */
  header: function(name) {
    try {
      return this.transport.getResponseHeader(name);
    } catch (e) {}
  },

//private  
  evalJSON: function() {
    try {
      return eval(this.header('X-JSON'));
    } catch (e) {}
  },

//private  
  evalResponse: function() {
    try {
      return eval(this.transport.responseText);
    } catch (e) {
      this.dispatchException(e);
    }
  },

//private
  respondToReadyState: function(readyState) {
    var event = Ajax.Request.Events[readyState];
    var transport = this.transport, json = this.evalJSON();

    if (event == 'Complete') {
      try {
        (this.options['on' + this.transport.status]
         || this.options['on' + (this.responseIsSuccess() ? 'Success' : 'Failure')]
         || Prototype.emptyFunction)(transport, json);
      } catch (e) {
        this.dispatchException(e);
      }
      
      if ((this.header('Content-type') || '').match(/^text\/javascript/i))
        this.evalResponse();
    }
    
    try {
      (this.options['on' + event] || Prototype.emptyFunction)(transport, json);
      Ajax.Responders.dispatch('on' + event, this, transport, json);
    } catch (e) {
      this.dispatchException(e);
    }
    
    /* Avoid memory leak in MSIE: clean up the oncomplete event handler */
    if (event == 'Complete')
      this.transport.onreadystatechange = Prototype.emptyFunction;
  },
  
  dispatchException: function(exception) {
    (this.options.onException || Prototype.emptyFunction)(this, exception);
    Ajax.Responders.dispatch('onException', this, exception);
  }
});

/**
 * @classDescription	Contains properties and methods to update an HTML element with content from the server.
 * @constructor
 * @name Ajax.Updater
 */
Ajax.Updater = Class.create();

Object.extend(Object.extend(Ajax.Updater.prototype, Ajax.Request.prototype), {
  initialize: function(container, url, options) {

/**
 * Set to containers.success when a call succeeds.
 * Set to containers.failure when a call fails.
 */    
	this.containers = {
      success: container.success ? $(container.success) : $(container),
      failure: container.failure ? $(container.failure) :
        (container.success ? null : $(container))
    }

    this.transport = Ajax.getTransport();
    this.setOptions(options);

    var onComplete = this.options.onComplete || Prototype.emptyFunction;
    this.options.onComplete = (function(transport, object) {
      this.updateContent();
      onComplete(transport, object);
    }).bind(this);

    this.request(url);
  },

//private
  updateContent: function() {
    var receiver = this.responseIsSuccess() ?
      this.containers.success : this.containers.failure;
    var response = this.transport.responseText;
    
    if (!this.options.evalScripts)
      response = response.stripScripts();

    if (receiver) {
      if (this.options.insertion) {
        new this.options.insertion(receiver, response);
      } else {
        Element.update(receiver, response);
      }
    }

    if (this.responseIsSuccess()) {
      if (this.onComplete)
        setTimeout(this.onComplete.bind(this), 10);
    }
  }
});

Ajax.PeriodicalUpdater = Class.create();
Ajax.PeriodicalUpdater.prototype = Object.extend(new Ajax.Base(), {
  initialize: function(container, url, options) {
    this.setOptions(options);
    this.onComplete = this.options.onComplete;

/**
 * Inerval (in seconds) between refreshes. Default is 2.
 */
    this.frequency = (this.options.frequency || 2);

/**
 * Indicates that the current decay level should be applied while re-executing the task.
 */	
    this.decay = (this.options.decay || 1);

/**
 * Most recently used Ajax.Updater object.
 */    
    this.updater = {};

/**
 * Value to be passed to the constructor for Ajax.Updater.
 */	
    this.container = container;

/**
 * Value to be passed to the constructor for Ajax.Updater.
 */
    this.url = url;

    this.start();
  },

//private
  start: function() {
    this.options.onComplete = this.updateComplete.bind(this);
    this.onTimerEvent();
  },

/**
 * Stops the object from performing its periodical tasks. Calls the callback on onComplete.
 */
  stop: function() {
    this.updater.onComplete = undefined;
    clearTimeout(this.timer);
    (this.onComplete || Prototype.emptyFunction).apply(this, arguments);
  },

//private
  updateComplete: function(request) {
    if (this.options.decay) {
      this.decay = (request.responseText == this.lastText ? 
        this.decay * this.options.decay : 1);

      this.lastText = request.responseText;
    }
    this.timer = setTimeout(this.onTimerEvent.bind(this), 
      this.decay * this.frequency * 1000);
  },

//private
  onTimerEvent: function() {
    this.updater = new Ajax.Updater(this.container, this.url, this.options);
  }
});
