if (!window.Event) {
  var Event = new Object();
}

Object.extend(Event, {

/**
 * Code for the Backspace key. Constant.
 * @memberOf {Event}
 */  
  KEY_BACKSPACE: 8,
  
/**
 * Code for the Tab key. Constant.
 * @memberOf {Event}
 */
  KEY_TAB:       9,
  
/**
 * Code for the Return key. Constant.
 * @memberOf {Event}
 */  
  KEY_RETURN:   13,

/**
 * Code for the Esc key. Constant.
 * @memberOf {Event}
 */  
  KEY_ESC:      27,

/**
 * Code for the Left arrow key. Constant.
 * @memberOf {Event}
 */  
  KEY_LEFT:     37,

/**
 * Code for the Up arrow key. Constant.
 * @memberOf {Event}
 */  
  KEY_UP:       38,

/**
 * Code for the Right arrow key. Constant.
 * @memberOf {Event}
 */
  KEY_RIGHT:    39,

/**
 * Code for the Down arrow key. Constant.
 * @memberOf {Event}
 */  
  KEY_DOWN:     40,

/**
 * Code for the Delete key. Constant.
 * @memberOf {Event}
 */  
  KEY_DELETE:   46,

/**
 * Gets the element that the event originated with.
 * @name Event.element()
 * @param {Event} event	Event associated with the element.
 * @return {Object} Returns the element that originated the event.
 * @extends {Event}
 */
  element: function(event) {
    return event.target || event.srcElement;
  },

/**
 * Returns true if the event was a left mouse click.
 * @name Event.isLeftClick()
 * @param {Object} event	Event to get.
 * @return {Boolean} Returns true if the event was a mouse left click.
 * @extends {Event}
 */
  isLeftClick: function(event) {
    return (((event.which) && (event.which == 1)) ||
            ((event.button) && (event.button == 1)));
  },

/**
 * Gets the x-coordinate of the cursor when the specified event occurs.
 * @name Event.pointerX()
 * @param {Object} event	Event to get.
 * @return {Number} Returns the x-coordinate of the cursor.
 * @extends {Event}
 */
  pointerX: function(event) {
    return event.pageX || (event.clientX + 
      (document.documentElement.scrollLeft || document.body.scrollLeft));
  },

/**
 * Gets the y-coordinate of the cursor when the specified event occurs.
 * @name Event.pointerY()
 * @param {Object} event	Event to get.
 * @return {Number} Returns the y-coordinate of the cursor.
 * @extends {Event}
 */
  pointerY: function(event) {
    return event.pageY || (event.clientY + 
      (document.documentElement.scrollTop || document.body.scrollTop));
  },

/**
 * Stops the behavior of an event and stops its propagation.
 * @name Event.stop()
 * @param {Object} event Event to stop.
 * @extends {Event}
 */
  stop: function(event) {
    if (event.preventDefault) { 
      event.preventDefault(); 
      event.stopPropagation(); 
    } else {
      event.returnValue = false;
      event.cancelBubble = true;
    }
  },

  // find the first node with the given tagName, starting from the
  // node the event was triggered on; traverses the DOM upwards

/**
 * Searches for the specified tagName by traversing the DOM tree upwards from the node that triggered the event.
 * @name Event.findElement()
 * @param {Object} event	Event that triggers the search.
 * @param {String} tagName	Element tag name to search for.
 * @return {HTMLElement} Returns the element with the specified tag name.
 * @extends {Event}
 */  
  findElement: function(event, tagName) {
    var element = Event.element(event);
    while (element.parentNode && (!element.tagName ||
        (element.tagName.toUpperCase() != tagName.toUpperCase())))
      element = element.parentNode;
    return element;
  },

  observers: false,

//Private method  
  _observeAndCache: function(element, name, observer, useCapture) {
    if (!this.observers) this.observers = [];
    if (element.addEventListener) {
      this.observers.push([element, name, observer, useCapture]);
      element.addEventListener(name, observer, useCapture);
    } else if (element.attachEvent) {
      this.observers.push([element, name, observer, useCapture]);
      element.attachEvent('on' + name, observer);
    }
  },

//Private method. 
  unloadCache: function() {
    if (!Event.observers) return;
    for (var i = 0; i < Event.observers.length; i++) {
      Event.stopObserving.apply(this, Event.observers[i]);
      Event.observers[i][0] = null;
    }
    Event.observers = false;
  },

/**
 * Adds an event handler function to an event.
 * @name Event.observe()
 * @param {Object} element	Element object or id to associate with the event handler.
 * @param {String} name	Name of the event.
 * @param {Function} observer	Function to handle the event.
 * @param {Boolean} useCapture	If true, specifies that the handler should handle the event in the capture phase. If false, handles the event in the bubbling phase.
 * @extends {Event}
 */
  observe: function(element, name, observer, useCapture) {
    var element = $(element);
    useCapture = useCapture || false;
    
    if (name == 'keypress' &&
        (navigator.appVersion.match(/Konqueror|Safari|KHTML/)
        || element.attachEvent))
      name = 'keydown';
    
    this._observeAndCache(element, name, observer, useCapture);
  },

/**
 * Removes an event handler function from an event.
 * @name Event.observe()
 * @param {Object} element	Element object or id to associate with the event handler.
 * @param {String} name	Name of the event.
 * @param {Function} observer	Function to handle the event.
 * @param {Boolean} useCapture	If true, specifies that the handler should handle the event in the capture phase. If false, handles the event in the bubbling phase.
 * @extends {Event}
 */
  stopObserving: function(element, name, observer, useCapture) {
    var element = $(element);
    useCapture = useCapture || false;
    
    if (name == 'keypress' &&
        (navigator.appVersion.match(/Konqueror|Safari|KHTML/)
        || element.detachEvent))
      name = 'keydown';
    
    if (element.removeEventListener) {
      element.removeEventListener(name, observer, useCapture);
    } else if (element.detachEvent) {
      element.detachEvent('on' + name, observer);
    }
  }
});

/* prevent memory leaks in IE */
Event.observe(window, 'unload', Event.unloadCache, false);
