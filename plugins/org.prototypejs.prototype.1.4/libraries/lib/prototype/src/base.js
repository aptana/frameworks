/**
 * @classDescription Declares a class.
 * @constructor
 */
var Class = {
  create: function() {
    return function() { 
      this.initialize.apply(this, arguments);
    }
  }
}

var Abstract = new Object();

/**
 * Implements inheritance by copying the properties and methods from one element to another.
 * @name Object.extend()
 * @param {Object} destination	Destination object to inherit the properties and methods.
 * @param {Object} source	Source object to inherit properties and methods from.
 * @return {Object} Returns the destination object with the properties and methods from the source object.
 * @extends {Object}
 */
Object.extend = function(destination, source) {
  for (property in source) {
    destination[property] = source[property];
  }
  return destination;
}

/**
 * Returns a string version of the specified object that you can read.
 * @name Object.inspect()
 * @param {Object} object	Object to return a string version of.
 * @return {String} Returns a string version of the object.
 * @extends {Object}
 */
Object.inspect = function(object) {
  try {
    if (object == undefined) return 'undefined';
    if (object == null) return 'null';
    return object.inspect ? object.inspect() : object.toString();
  } catch (e) {
    if (e instanceof RangeError) return '...';
    throw e;
  }
}

/**
 * Binds an instance of the function to the object that owns the function.
 * @name Function.bind()
 * @param {Function} function	Function to bind to its owner object. 
 * @param {Object, Array} ... Arguments to use when calling the function.
 * @return {Object} Returns the function pre-bound to its owner object with the specified arguments.
 * @extends {Function}
 */
Function.prototype.bind = function() {
  var __method = this, 
  	args = $A(arguments), 
	object = args.shift();
  return function() {
    return __method.apply(object, args.concat($A(arguments)));
  }
}

/**
 * Binds an instance of a function to the object that owns the function as an event listener.
 * @name Function.bindAsEventListener()
 * @param {Object} object	Function to bind to its owner object.
 * @return {Object} Returns the function pre-bound to its owner object with the current event object as its argument.
 * @extends {Function}
 */
Function.prototype.bindAsEventListener = function(object) {
  var __method = this;
  return function(event) {
    return __method.call(object, event || window.event);
  }
}


Object.extend(Number.prototype, {
  
/**
 * Calculates the hexadecimal color representation for a number.
 * @name Number.toColorPart()
 * @return {Number} Returns the hexidecimal version of the number.
 * @extends {Number}
 */  
  toColorPart: function() {
    var digits = this.toString(16);
    if (this < 16) return '0' + digits;
    return digits;
  },

/**
 * Returns the next number in an iteration.
 * @name Number.succ()
 * @return {Number} Returns the next number in an iteration.
 * @extends {Number}
 */
  succ: function() {
    return this + 1;
  },
  
/**
 * Calls the iterator function, repeatedly passing the current index as the index argument.
 * @name Number.times()
 * @param {Object} iterator	Iterator function to call.
 * @extends {Number}
 */  
  times: function(iterator) {
    $R(0, this, true).each(iterator);
    return this;
  }
});

/**
 * Tries the specified function calls until one of them is successful.
 * @name Try.these()
 * @param {Function, Array}	Function call(s) to try.
 * @return {String, Number}	Returns the value of the first successful function call.
 */
var Try = {
  these: function() {
    var returnValue;

    for (var i = 0; i < arguments.length; i++) {
      var lambda = arguments[i];
      try {
        returnValue = lambda();
        break;
      } catch (e) {}
    }

    return returnValue;
  }
}

/*--------------------------------------------------------------------------*/

/**
 * @classDescription Creates a PeriodicalExecuter object to call a function repeatedly at the specified interval.
 */
var PeriodicalExecuter = Class.create();
PeriodicalExecuter.prototype = {

/**
 * Initializes the PeriodicalExecutor object.
 * @name PeriodicalExecutor.initialize()
 * @param {Function} callback	Function to be called.
 * @param {Object} frequency	Interval (in seconds) to call the function at.
 */
  initialize: function(callback, frequency) {
    this.callback = callback;
    this.frequency = frequency;
    this.currentlyExecuting = false;

    this.registerCallback();
  },

/**
 * Registers a callback function.
 * @name PeriodicalExecutor.registerCallback()
 */
  registerCallback: function() {
    setInterval(this.onTimerEvent.bind(this), this.frequency * 1000);
  },

/**
 * Calls the function at on the timer event.
 * @name PeriodicalExecutor.onTimerEvent
 */
  onTimerEvent: function() {
    if (!this.currentlyExecuting) {
      try { 
        this.currentlyExecuting = true;
        this.callback(); 
      } finally { 
        this.currentlyExecuting = false;
      }
    }
  }
}

/*--------------------------------------------------------------------------*/

/**
 * Shortcut function for document.getElementById().
 * @name $()
 * @param {String, Array} ...	One or more id arguments.
 * @return {Array} Returns an array of the element(s) corresponding to the specified id's.
 */
function $() {
  var elements = new Array();

  for (var i = 0; i < arguments.length; i++) {
    var element = arguments[i];
    if (typeof element == 'string')
      element = document.getElementById(element);

    if (arguments.length == 1) 
      return element;

    elements.push(element);
  }

  return elements;
}
