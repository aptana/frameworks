/*  Prototype JavaScript framework, version 1.4.0
 *  (c) 2005 Sam Stephenson <sam@conio.net>
 *
 *  Prototype is freely distributable under the terms of an MIT-style license.
 *  For details, see the Prototype web site: http://prototype.conio.net/
 *
/*--------------------------------------------------------------------------*/

/**
 * @classDescription Declares the version of the prototype library.
 */
var Prototype = {

/**
 * Version of the library.
 */
  Version: '1.4.0',

/**
 * RegExp used to identify scripts.
 */
  ScriptFragment: '(?:<script.*?>)((\n|\r|.)*?)(?:<\/script>)',

/**
 * Empty function object.
 */
  emptyFunction: function() {},

/**
 * Function to echo back the specified parameter.
 * @param {Object} x	Parameter to echo.
 * @return {Object} Returns the specified parameter.
 */
  K: function(x) {return x}
}

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
Object.extend(String.prototype, {

/**
 * Removes the HTML or XML tags from a string.
 * @name String.stripTags()
 * @return {String} Returns the string with any HTML or XML tags removed.
 * @extends {String}
 */
  stripTags: function() {
    return this.replace(/<\/?[^>]+>/gi, '');
  },

/**
 * Removes any <script></script> blocks from a string.
 * @name String.stripScripts()
 * @return {String} Returns the string with any <script></script> blocks removed.
 * @extends {String}
 */
  stripScripts: function() {
    return this.replace(new RegExp(Prototype.ScriptFragment, 'img'), '');
  },

 /**
  * Extracts any <script></script> blocks from a string and returns them as an array.
  * @name String.extractScripts()
  * @return	{Array} Returns an array of any <script></script> that the string contains.
  * @extends {String}
  */
  extractScripts: function() {
    var matchAll = new RegExp(Prototype.ScriptFragment, 'img');
    var matchOne = new RegExp(Prototype.ScriptFragment, 'im');
    return (this.match(matchAll) || []).map(function(scriptTag) {
      return (scriptTag.match(matchOne) || ['', ''])[1];
    });
  },

/**
 * Evaluates the <script></script> blocks found in a string.
 * @name String.evalScripts()
 * @return {String, Number, Object, Boolean, Array} Returns the result of the script.
 * @extends {String}
 */
  evalScripts: function() {
    return this.extractScripts().map(eval);
  },

/**
 * Escapes any HTML characters in a string.
 * @name String.escapeHTML()
 * @return {String} Returns the string with the HTML characters escaped.
 * @extends {String}
 */
  escapeHTML: function() {
    var div = document.createElement('div');
    var text = document.createTextNode(this);
    div.appendChild(text);
    return div.innerHTML;
  },

/**
 * Converts any escaped HTML characters in a string to real HTML characters.
 * @name String.unescapeHTML()
 * @return {String} Returns the string with HTML characters unescaped.
 * @extends {String}
 */
  unescapeHTML: function() {
    var div = document.createElement('div');
    div.innerHTML = this.stripTags();
    return div.childNodes[0] ? div.childNodes[0].nodeValue : '';
  },

/**
 * Creates an associative array (similar to a hash) from a string using parameter names as an index.
 * @name String.toQueryParams()
 * @return {Array} Returns an associative array from the string.
 * @extends {String}
 */
  toQueryParams: function() {
    var pairs = this.match(/^\??(.*)$/)[1].split('&');
    return pairs.inject({}, function(params, pairString) {
      var pair = pairString.split('=');
      params[pair[0]] = pair[1];
      return params;
    });
  },

/**
 * Creates an array from the characters of a string.
 * @name String.toArray()
 * @return {Array} Returns an array of all of the characters in a string.
 * @extends {String}
 */
  toArray: function() {
    return this.split('');
  },

/**
 * Converts  a hyphen-delimited string to camel case. (e.g. thisIsCamelCase)
 * @name String.camelize()
 * @return {String} Returns the string as camel case.
 * @extends {String}
 */
  camelize: function() {
    var oStringList = this.split('-');
    if (oStringList.length == 1) return oStringList[0];

    var camelizedString = this.indexOf('-') == 0
      ? oStringList[0].charAt(0).toUpperCase() + oStringList[0].substring(1)
      : oStringList[0];

    for (var i = 1, len = oStringList.length; i < len; i++) {
      var s = oStringList[i];
      camelizedString += s.charAt(0).toUpperCase() + s.substring(1);
    }

    return camelizedString;
  },

/**
 * Converts the string to human-readable characters.
 * @name String.inspect()
 * @return {String} Returns a version of the string that can easily be read by humans.
 * @extends {String}
 */
  inspect: function() {
    return "'" + this.replace('\\', '\\\\').replace("'", '\\\'') + "'";
  }
});

String.prototype.parseQuery = String.prototype.toQueryParams;

var $break    = new Object();
var $continue = new Object();

/**
 * @classDescription Allows you to easily iterate items in a list.
 */
var Enumerable = {

/**
 * Calls the specified iterator function.
 * @name Enumerable.each()
 * @param {Function} iterator	Iterator function to call. Takes the arguments elementValue, and elementIndex, respectively.
 */
  each: function(iterator) {
    var index = 0;
    try {
      this._each(function(value) {
        try {
          iterator(value, index++);
        } catch (e) {
          if (e != $continue) throw e;
        }
      });
    } catch (e) {
      if (e != $break) throw e;
    }
  },

/**
 * Calls an iterator function to test the values in a list to see if they are all true.
 * @name Enumerable.all()
 * @param {Function} iterator	Iterator function to call. Takes the arguments elementValue, and elementIndex, respectively.
 * @return {Boolean} Returns true if the iterator returns true for all elements.
 */
  all: function(iterator) {
    var result = true;
    this.each(function(value, index) {
      result = result && !!(iterator || Prototype.K)(value, index);
      if (!result) throw $break;
    });
    return result;
  },

/**
 * Calls an iterator function to test the values in a list to see if any are true.
 * @name Enumerable.any()
 * @param {Function} iterator	Iterator function to call. Takes the arguments elementValue, and elementIndex, respectively.
 * @return {Boolean} Returns true if any of the iterator returns true for any of the elements.
 */
  any: function(iterator) {
    var result = true;
    this.each(function(value, index) {
      if (result = !!(iterator || Prototype.K)(value, index))
        throw $break;
    });
    return result;
  },

/**
 * Calls an iterator function and returns the results in an Array.
 * @name Enumerable.collect()
 * @param {Function} iterator	Iterator function to call. Takes the arguments elementValue, and elementIndex, respectively.
 * @return {Array} Array of the results of calling the iterator on each element.
 */
  collect: function(iterator) {
    var results = [];
    this.each(function(value, index) {
      results.push(iterator(value, index));
    });
    return results;
  },

/**
 * Calls an iterator function on the elements in a list and returns the first element that causes the iterator to return true.
 * @name Enumerable.detect()
 * @param {Function} iterator	Iterator function to call. Takes the arguments elementValue, and elementIndex, respectively.
 * @return {Object} Returns the first element that causes the iterator function to return true.
 */
  detect: function (iterator) {
    var result;
    this.each(function(value, index) {
      if (iterator(value, index)) {
        result = value;
        throw $break;
      }
    });
    return result;
  },

/**
 * Calls an iterator function on the elements in a list and returns all of the elements that cause the iterator to return true.
 * @name Enumerable.findAll()
 * @param {Function} iterator	Iterator function to call. Takes the arguments elementValue, and elementIndex, respectively.
 * @return {Array} Returns the elements that the cause the iterator to return true.
 */
  findAll: function(iterator) {
    var results = [];
    this.each(function(value, index) {
      if (iterator(value, index))
        results.push(value);
    });
    return results;
  },

/**
 * Tests each element in a list to see if it contains the specified regular expression.
 * @name Enumerable.grep()
 * @param {RegExp} pattern	RegExp to match.
 * @param {Function} [iterator]	Iterator function to call. Takes the arguments elementValue, and elementIndex, respectively.
 * @return {Array} Returns an array of the elements with a match to the RegExp. If you specify an iterator, returns the result of calling the iterator on the match.
 */
  grep: function(pattern, iterator) {
    var results = [];
    this.each(function(value, index) {
      var stringValue = value.toString();
      if (stringValue.match(pattern))
        results.push((iterator || Prototype.K)(value, index));
    })
    return results;
  },

/**
 * Searches the list of elements for the specified object.
 * @name Enumerable.include()
 * @param {Object} object	Object to search for.
 * @return {Boolean} Returns true if the list of elements contains the object.
 */
  include: function(object) {
    var found = false;
    this.each(function(value) {
      if (value == object) {
        found = true;
        throw $break;
      }
    });
    return found;
  },

/**
 * Calls an iterator function on the elements in a list and accumulates their values into a single value.
 * @name Enumerable.inject()
 * @param {Object} memo	Initial value for the iterator.
 * @param {Function} iterator	Iterator function to call. Takes the arguments elementValue, and elementIndex, respectively.
 * @return {Object} Returns the final accumulated result.
 */
  inject: function(memo, iterator) {
    this.each(function(value, index) {
      memo = iterator(memo, value, index);
    });
    return memo;
  },

/**
 * Calls the specified method on each element in a list and returns an array of the results.
 * @name Enumerable.invoke()
 * @param {Function} method	Method to call.
 * @return {Array} Returns an array of the results.
 */
  invoke: function(method) {
    var args = $A(arguments).slice(1);
    return this.collect(function(value) {
      return value[method].apply(value, args);
    });
  },

/**
 * Returns the element in the list with the greatest value. If you specify an iterator, calls the iterator function and returns the result with the greatest value.
 * @name Enumerable.max()
 * @param {Function} [iterator]	Iterator function to call. Takes the arguments elementValue, and elementIndex, respectively.
 * @return {Object} Returns the element in the list with the greatest value. If you specify an iterator, calls the iterator function and returns the result with the greatest value.
 */
  max: function(iterator) {
    var result;
    this.each(function(value, index) {
      value = (iterator || Prototype.K)(value, index);
      if (value >= (result || value))
        result = value;
    });
    return result;
  },

/**
 * Returns the element in the list with the smallest value. If you specify an iterator, calls the iterator function and returns the result with the smallest value.
 * @name Enumerable.min()
 * @param {Function} [iterator]	Iterator function to call. Takes the arguments elementValue, and elementIndex, respectively.
 * @return {Object} Returns the element in the list with the smallest value. If you specify an iterator, calls the iterator function and returns the result with the smallest value.
 */
  min: function(iterator) {
    var result;
    this.each(function(value, index) {
      value = (iterator || Prototype.K)(value, index);
      if (value <= (result || value))
        result = value;
    });
    return result;
  },

/**
 * Partitions a list of elements into true elements or values and not-true elements or values.
 * @name Enumerable.partition()
 * @param {Object} [iterator]	Iterator function to call. Takes the arguments elementValue, and elementIndex, respectively.
 * @return {Array} Returns an array of two elements--both of which are arrays. The first array contains all true elements or values (if you specify an iterator) and the second array contains not-true elements or values.
 */
  partition: function(iterator) {
    var trues = [], falses = [];
    this.each(function(value, index) {
      ((iterator || Prototype.K)(value, index) ?
        trues : falses).push(value);
    });
    return [trues, falses];
  },

/**
 * Retrieves the value for the specified property for each element in an array.
 * @name Enumerable.pluck()
 * @param {String} property	Name of the property to get.
 * @return {Array} Returns an array of the property values.
 */
  pluck: function(property) {
    var results = [];
    this.each(function(value, index) {
      results.push(value[property]);
    });
    return results;
  },

/**
 * Calls an iterator function on the elements in a list and returns all of the elements that cause the iterator to return false.
 * @name Enumerable.reject()
 * @param {Function} iterator	Iterator function to call. Takes the arguments elementValue, and elementIndex, respectively.
 * @return {Array} Returns the elements that the cause the iterator to return false.
 */
  reject: function(iterator) {
    var results = [];
    this.each(function(value, index) {
      if (!iterator(value, index))
        results.push(value);
    });
    return results;
  },

/**
 * Sorts the elements in a list by their iterator results.
 * @name Enumerable.sortBy()
 * @param {Object} iterator	Iterator function to call. Takes the arguments elementValue, and elementIndex, respectively.
 * @return {Array} Returns an array of elements sorted by their iterator results.
 */
  sortBy: function(iterator) {
    return this.collect(function(value, index) {
      return {value: value, criteria: iterator(value, index)};
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return a < b ? -1 : a > b ? 1 : 0;
    }).pluck('value');
  },

/**
 * Creates an array of the elements in a list.
 * @name Enumerable.toArray()
 * @return {Array} Returns an Array of elements in the list.
 */
  toArray: function() {
    return this.collect(Prototype.K);
  },

/**
 * Merges elements from one or more lists into a single list.
 * @name Enumerable.zip()
 * @param {Array} ... One or more lists of elements to merge.
 * @return {Array} Returns a single array.
 */
  zip: function() {
    var iterator = Prototype.K, args = $A(arguments);
    if (typeof args.last() == 'function')
      iterator = args.pop();

    var collections = [this].concat(args).map($A);
    return this.map(function(value, index) {
      iterator(value = collections.pluck(index));
      return value;
    });
  },

/**
 * Returns a human-readable string version of the list of elements.
 * @name Enumerable.inspect()
 * @return {String} Returns a human-readable string version of the list of elements.
 */
  inspect: function() {
    return '#<Enumerable:' + this.toArray().inspect() + '>';
  }
}

Object.extend(Enumerable, {
  map:     Enumerable.collect,
  find:    Enumerable.detect,
  select:  Enumerable.findAll,
  member:  Enumerable.include,
  entries: Enumerable.toArray
});
/**
 * Converts the argument "iterable" into an Array object.
 * @name $A()
 * @param {Object} iterable	Object to be converted to an Array.
 * @return {Array} Returns an Array.
 */
var $A = Array.from = function(iterable) {
  if (!iterable) return [];
  if (iterable.toArray) {
    return iterable.toArray();
  } else {
    var results = [];
    for (var i = 0; i < iterable.length; i++)
      results.push(iterable[i]);
    return results;
  }
}

Object.extend(Array.prototype, Enumerable);

Array.prototype._reverse = Array.prototype.reverse;

Object.extend(Array.prototype, {
  _each: function(iterator) {
    for (var i = 0; i < this.length; i++)
      iterator(this[i]);
  },

/**
 * Clears an array of all content.
 * @name Array.clear()
 * @return {Array} Returns an empty array.
 * @extends {Array}
 */
  clear: function() {
    this.length = 0;
    return this;
  },

/**
 * Returns the first element of an array.
 * @name Array.first()
 * @return {Object, String, Number} Returns the first element of an array.
 * @extends {Array}
 */
  first: function() {
    return this[0];
  },

/**
 * Returns the last element of an array.
 * @name Array.last()
 * @return {Object, String, Number} Returns the last element of an array.
 * @extends {Array}
 */
  last: function() {
    return this[this.length - 1];
  },

  compact: function() {
    return this.select(function(value) {
      return value != undefined || value != null;
    });
  },

/**
 * Flattens an array containing elements that are arrays into a single array.
 * @name Array.flatten()
 * @return {Array} Returns a one-dimensional array.
 * @extends {Array}
 */
  flatten: function() {
    return this.inject([], function(array, value) {
      return array.concat(value.constructor == Array ?
        value.flatten() : [value]);
    });
  },

/**
 * Returns an array without the specified elements.
 * @name Array.without()
 * @param {Array, String, Number} ... One or more elements to exclude from the array.
 * @return {Array} Returns an array without the specified elements.
 * @extends {Array}
 */
  without: function() {
    var values = $A(arguments);
    return this.select(function(value) {
      return !values.include(value);
    });
  },

/**
 * Gets the zero-based index position of the specified element in an array.
 * @name Array.indexOf()
 * @param {Object} object	Element to get the index position of.
 * @return {Number} Returns the index position of the element.
 * @extends {Array}
 */
  indexOf: function(object) {
    for (var i = 0; i < this.length; i++)
      if (this[i] == object) return i;
    return -1;
  },

/**
 * Reverses the order of elements in an array.
 * @name Array.reverse()
 * @param {Boolean} inline	If true, indicates that the array itself should be reversed, instead of just creating a copy. Default is true.
 * @return {Array} Returns an array with the order of its elements reversed.
 * @extends {Array}
 */
  reverse: function(inline) {
    return (inline !== false ? this : this.toArray())._reverse();
  },

/**
 * Removes the first element of an array and returns that element.
 * @name Array.shift()
 * @return {Object, Number, String} Returns the first element of an array.
 * @extends {Array}
 */
  shift: function() {
    var result = this[0];
    for (var i = 0; i < this.length - 1; i++)
      this[i] = this[i + 1];
    this.length--;
    return result;
  },

/**
 * Formats an array into a human-readable string.
 * @name Array.inspect()
 * @return {String} Returns a string version of the array.
 * @extends {Array}
 */
  inspect: function() {
    return '[' + this.map(Object.inspect).join(', ') + ']';
  }
});
var Hash = {
  _each: function(iterator) {
    for (key in this) {
      var value = this[key];
      if (typeof value == 'function') continue;

      var pair = [key, value];
      pair.key = key;
      pair.value = value;
      iterator(pair);
    }
  },

/**
 * Creates an array of the keys in a hash.
 * @name Hash.keys()
 * @return {Array} Returns an array of keys.
 */
  keys: function() {
    return this.pluck('key');
  },

/**
 * Creates an array of the values in a hash.
 * @name Hash.values()
 * @return {Array} Returns an array of values.
 */
  values: function() {
    return this.pluck('value');
  },

/**
 * Merges this hash with the specified hash.
 * @name Hash.merge()
 * @param {Object} hash	Hash to merge with.
 * @return {Object} Returns the merged hash.
 */
  merge: function(hash) {
    return $H(hash).inject($H(this), function(mergedHash, pair) {
      mergedHash[pair.key] = pair.value;
      return mergedHash;
    });
  },

/**
 * Returns the keys and values of a hash formatted into a query string. (e.g. 'key1=value1&key2=value2')
 * @name Hash.toQueryString()
 * @return {String} Returns a query string version of the hash.
 */
  toQueryString: function() {
    return this.map(function(pair) {
      return pair.map(encodeURIComponent).join('=');
    }).join('&');
  },

/**
 * Formats the hash into a human-readable string of key:value pairs.
 * @name Hash.inspect()
 * @return {String} Returns a string version of the key:value pairs of the hash.
 */
  inspect: function() {
    return '#<Hash:{' + this.map(function(pair) {
      return pair.map(Object.inspect).join(': ');
    }).join(', ') + '}>';
  }
}

/**
 * Converts the argument "object" into a hash.
 * @name $H()
 * @param {Object} object	Object to be converted to a hash.
 * @return {Object} Returns a hash object.
 */
function $H(object) {
  var hash = Object.extend({}, object || {});
  Object.extend(hash, Enumerable);
  Object.extend(hash, Hash);
  return hash;
}
ObjectRange = Class.create();
Object.extend(ObjectRange.prototype, Enumerable);
Object.extend(ObjectRange.prototype, {
  initialize: function(start, end, exclusive) {
    this.start = start;
    this.end = end;
    this.exclusive = exclusive;
  },

  _each: function(iterator) {
    var value = this.start;
    do {
      iterator(value);
      value = value.succ();
    } while (this.include(value));
  },

/**
 * Checks if the specified value is included in the range.
 * @name ObjectRange.include()
 * @param {Object} value	Value to search for.
 * @return {Boolean} Returns true if the value is included in the range.
 */
  include: function(value) {
    if (value < this.start)
      return false;
    if (this.exclusive)
      return value < this.end;
    return value <= this.end;
  }
});

/**
 * Creates a new ObjectRange using the specified bounds.
 * @name $R()
 * @param {Object} start	Start point of the range.
 * @param {Object} end	End point of the range.
 * @param {Boolean} exclusive	If true, indicates that the start and end points should be excluded from the ObjectRange.
 * @constructor
 * @return {ObjectRange} Returns a new ObjectRange.
 */
var $R = function(start, end, exclusive) {
  return new ObjectRange(start, end, exclusive);
}

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

/**
 * Returns any elements with the specified CSS class name.
 * @name document.getElementsByClassName()
 * @param {String} className	CSS className corresponding to the elements to retrieve.
 * @param {String} parentElement	id of the parent element that contains the elements to retrieve.
 * @return {Array, Object}	Returns the elements matching the className.
 * @extends {document}
 */
document.getElementsByClassName = function(className, parentElement) {
  var children = ($(parentElement) || document.body).getElementsByTagName('*');
  return $A(children).inject([], function(elements, child) {
    if (child.className.match(new RegExp("(^|\\s)" + className + "(\\s|$)")))
      elements.push(child);
    return elements;
  });
}

/*--------------------------------------------------------------------------*/

if (!window.Element) {
  var Element = new Object();
}

Object.extend(Element, {

/**
 * Returns true if the element is visible.
 * @name Element.visible()
 * @param {Object} element Element to check.
 * @return {Boolean}	Returns true if the element is visible.
 */
  visible: function(element) {
    return $(element).style.display != 'none';
  },

/**
 * Toggles the visibility of the specified element(s).
 * @name Element.toggle()
 * @param {Object, String} One or more elements (or ids) to toggle the visibility of.
 */
  toggle: function() {
    for (var i = 0; i < arguments.length; i++) {
      var element = $(arguments[i]);
      Element[Element.visible(element) ? 'hide' : 'show'](element);
    }
  },

/**
 * Hides the specified element(s) by setting the style.display attribute to "none".
 * @name Element.hide()
 * @param {Object} ... One or more elements to hide.
 */
  hide: function() {
    for (var i = 0; i < arguments.length; i++) {
      var element = $(arguments[i]);
      element.style.display = 'none';
    }
  },

 /**
 * Displays the specified element(s) by setting the style.display attribute to "".
 * @name Element.show()
 * @param {Object} ... One or more elements to display.
 */
  show: function() {
    for (var i = 0; i < arguments.length; i++) {
      var element = $(arguments[i]);
      element.style.display = '';
    }
  },

/**
 * Removes the element from the document.
 * @name Element.remove()
 * @param {Object} element	Element to remove.
 */
  remove: function(element) {
    element = $(element);
    element.parentNode.removeChild(element);
  },

/**
 * Updates the inner HTML of the element with the specified HTML.
 * @name Element.update()
 * @param {Object} element	Element to update.
 * @param {Object} html	HTML to replace the current inner HTMl with.
 */
  update: function(element, html) {
    $(element).innerHTML = html.stripScripts();
    setTimeout(function() {html.evalScripts()}, 10);
  },

/**
 * Gets the offsetHeight of an element.
 * @name Element.getHeight()
 * @param {Object} element	Element to get the offsetHeight for.
 * @return {Number} Returns the offsetHeight of the element (in pixels).
 */
  getHeight: function(element) {
    element = $(element);
    return element.offsetHeight;
  },

/**
 * Gets the CSS class names associated with an element.
 * @name Element.classNames()
 * @param {Object} element	Element to get the associated class names for.
 * @return {Object} Returns an Element.ClassNames object representing the class names.
 */
  classNames: function(element) {
    return new Element.ClassNames(element);
  },

/**
 * Returns true if the element has the specified CSS class name.
 * @name Element.hasClassName()
 * @param {Object} element	Element to get the class name for.
 * @param {Object} className	Class name to check for.
 * @return {Boolean} Returns true if the element has the specified CSS class name.
 */
  hasClassName: function(element, className) {
    if (!(element = $(element))) return;
    return Element.classNames(element).include(className);
  },

/**
 * Adds the specified class to the list of class names for the element.
 * @name Element.addClassName()
 * @param {Object, String} element	Element or id to add the class name to.
 * @param {String} className	CSS class name to add.
 */
  addClassName: function(element, className) {
    if (!(element = $(element))) return;
    return Element.classNames(element).add(className);
  },

/**
 * Removes the specified CSS class name from the element.
 * @name Element.removeClassName()
 * @param {Object} element	Element to remove the class name from.
 * @param {Object} className	Class name to remove.
 */
  removeClassName: function(element, className) {
    if (!(element = $(element))) return;
    return Element.classNames(element).remove(className);
  },

  // removes whitespace-only text node children

 /**
  * Removes any whitespace from the text of the child nodes of the element.
  * @name Element.cleanWhitespace()
  * @param {Object} element Element to clean the whitespace for.
  */
  cleanWhitespace: function(element) {
    element = $(element);
    for (var i = 0; i < element.childNodes.length; i++) {
      var node = element.childNodes[i];
      if (node.nodeType == 3 && !/\S/.test(node.nodeValue))
        Element.remove(node);
    }
  },

/**
 * Returns true if the element is empty or contains only whitespace.
 * @name Element.empty()
 * @param {Object} element	Element to check.
 * @return {Boolean} Returns true if the element is empty or contains only whitespace.
 */
  empty: function(element) {
    return $(element).innerHTML.match(/^\s*$/);
  },

/**
 * Scrolls the window to the position of the specified element.
 * @name Element.scrollTo()
 * @param {Object} element	Element to scroll to.
 */
  scrollTo: function(element) {
    element = $(element);
    var x = element.x ? element.x : element.offsetLeft,
        y = element.y ? element.y : element.offsetTop;
    window.scrollTo(x, y);
  },

/**
 * Gets the value of the specified CSS style attribute for the element.
 * @name Element.getStyle()
 * @param {Object} element	Element to get the style for.
 * @param {String} style	Name of the CSS style.
 * @return {String, Number, Boolean, Array, Object} Returns the value of the CSS style attribute.
 */
  getStyle: function(element, style) {
    element = $(element);
    var value = element.style[style.camelize()];
    if (!value) {
      if (document.defaultView && document.defaultView.getComputedStyle) {
        var css = document.defaultView.getComputedStyle(element, null);
        value = css ? css.getPropertyValue(style) : null;
      } else if (element.currentStyle) {
        value = element.currentStyle[style.camelize()];
      }
    }

    if (window.opera && ['left', 'top', 'right', 'bottom'].include(style))
      if (Element.getStyle(element, 'position') == 'static') value = 'auto';

    return value == 'auto' ? null : value;
  },

/**
 * Sets the value of the specified CSS element.
 * @name Element.setStyle()
 * @param {Object} element	Element to apply the style to.
 * @param {Object} style	Style to apply.
 */
  setStyle: function(element, style) {
    element = $(element);
    for (name in style)
      element.style[name.camelize()] = style[name];
  },

/**
 * Gets the width and height of an element.
 * @name Element.getDimensions()
 * @param {Object} element	Element to get the dimensions for.
 * @return {String} Returns the width and height of the element.
 */
  getDimensions: function(element) {
    element = $(element);
    if (Element.getStyle(element, 'display') != 'none')
      return {width: element.offsetWidth, height: element.offsetHeight};

    // All *Width and *Height properties give 0 on elements with display none,
    // so enable the element temporarily
    var els = element.style;
    var originalVisibility = els.visibility;
    var originalPosition = els.position;
    els.visibility = 'hidden';
    els.position = 'absolute';
    els.display = '';
    var originalWidth = element.clientWidth;
    var originalHeight = element.clientHeight;
    els.display = 'none';
    els.position = originalPosition;
    els.visibility = originalVisibility;
    return {width: originalWidth, height: originalHeight};
  },

/**
 * Sets the style.position attribute for the element to "relative".
 * @name Element.makePositioned()
 * @param {Object} element	Element to set the position attribute for.
 */
  makePositioned: function(element) {
    element = $(element);
    var pos = Element.getStyle(element, 'position');
    if (pos == 'static' || !pos) {
      element._madePositioned = true;
      element.style.position = 'relative';
      // Opera returns the offset relative to the positioning context, when an
      // element is position relative but top and left have not been defined
      if (window.opera) {
        element.style.top = 0;
        element.style.left = 0;
      }
    }
  },

/**
 * Clears the style.position attribute for the element to "".
 * @name Element.makePositioned()
 * @param {Object} element	Element to set the position attribute for.
 */
  undoPositioned: function(element) {
    element = $(element);
    if (element._madePositioned) {
      element._madePositioned = undefined;
      element.style.position =
        element.style.top =
        element.style.left =
        element.style.bottom =
        element.style.right = '';
    }
  },

/**
 * Clips the overflow of the specified element so that it is not visible.
 * @name Element.makeClipping()
 * @param {Object} element	Element to clip the overflow for.
 */
  makeClipping: function(element) {
    element = $(element);
    if (element._overflow) return;
    element._overflow = element.style.overflow;
    if ((Element.getStyle(element, 'overflow') || 'visible') != 'hidden')
      element.style.overflow = 'hidden';
  },

/**
 * Undoes the overflow clipping of the specified element so that it is visible.
 * @name Element.undoClipping()
 * @param {Object} element	Element to display the overflow for.
 */
  undoClipping: function(element) {
    element = $(element);
    if (element._overflow) return;
    element.style.overflow = element._overflow;
    element._overflow = undefined;
  }
});

var Toggle = new Object();
Toggle.display = Element.toggle;

/*--------------------------------------------------------------------------*/


Abstract.Insertion = function(adjacency) {
  this.adjacency = adjacency;
}

/**
 * @classDescription Base class for other classes that provide dynamic content insertion.
 * @constructor
 */
Abstract.Insertion.prototype = {
  initialize: function(element, content) {
    this.element = $(element);
    this.content = content.stripScripts();

    if (this.adjacency && this.element.insertAdjacentHTML) {
      try {
        this.element.insertAdjacentHTML(this.adjacency, this.content);
      } catch (e) {
        if (this.element.tagName.toLowerCase() == 'tbody') {
          this.insertContent(this.contentFromAnonymousTable());
        } else {
          throw e;
        }
      }
    } else {
      this.range = this.element.ownerDocument.createRange();
      if (this.initializeRange) this.initializeRange();
      this.insertContent([this.range.createContextualFragment(this.content)]);
    }

    setTimeout(function() {content.evalScripts()}, 10);
  },

/**
 * Creates a table around the content of the element.
 * @name Abstract.Insertion.contentFromAnonymousTable()
 */
  contentFromAnonymousTable: function() {
    var div = document.createElement('div');
    div.innerHTML = '<table><tbody>' + this.content + '</tbody></table>';
    return $A(div.childNodes[0].childNodes[0].childNodes);
  }
}

/**
 * @classDescription Inserts HTML before an element.
 * @constructor
 * @extends {Abstract.Insertion}
 */
var Insertion = new Object();

Insertion.Before = Class.create();
Insertion.Before.prototype = Object.extend(new Abstract.Insertion('beforeBegin'), {
  initializeRange: function() {
    this.range.setStartBefore(this.element);
  },

  insertContent: function(fragments) {
    fragments.each((function(fragment) {
      this.element.parentNode.insertBefore(fragment, this.element);
    }).bind(this));
  }
});

/**
 * @classDescription Inserts HTML as the first child under an element.
 * @constructor
 * @extends {Abstract.Insertion}
 */
Insertion.Top = Class.create();
Insertion.Top.prototype = Object.extend(new Abstract.Insertion('afterBegin'), {
  initializeRange: function() {
    this.range.selectNodeContents(this.element);
    this.range.collapse(true);
  },

  insertContent: function(fragments) {
    fragments.reverse(false).each((function(fragment) {
      this.element.insertBefore(fragment, this.element.firstChild);
    }).bind(this));
  }
});

/**
 * @classDescription Inserts HTML as the last child under an element.
 * @constructor
 * @extends {Abstract.Insertion}
 */
Insertion.Bottom = Class.create();
Insertion.Bottom.prototype = Object.extend(new Abstract.Insertion('beforeEnd'), {
  initializeRange: function() {
    this.range.selectNodeContents(this.element);
    this.range.collapse(this.element);
  },

  insertContent: function(fragments) {
    fragments.each((function(fragment) {
      this.element.appendChild(fragment);
    }).bind(this));
  }
});

/**
 * @classDescription Inserts HTML right after the closing tag of an element.
 * @constructor
 * @extends {Abstract.Insertion}
 */
Insertion.After = Class.create();
Insertion.After.prototype = Object.extend(new Abstract.Insertion('afterEnd'), {
  initializeRange: function() {
    this.range.setStartAfter(this.element);
  },

  insertContent: function(fragments) {
    fragments.each((function(fragment) {
      this.element.parentNode.insertBefore(fragment,
        this.element.nextSibling);
    }).bind(this));
  }
});

/*--------------------------------------------------------------------------*/

/**
 * @classDescription Represents the CSS class names that are associated with an element.
 * @constructor
 * @extends {Enumerable}
 */
Element.ClassNames = Class.create();
Element.ClassNames.prototype = {
  initialize: function(element) {
    this.element = $(element);
  },

  _each: function(iterator) {
    this.element.className.split(/\s+/).select(function(name) {
      return name.length > 0;
    })._each(iterator);
  },

/**
 * Sets the specified CSS class name on the element and removes any other class names.
 * @name Element.ClassNames.set()
 * @param {Object} className	Class name to set.
 * @extends {Enumerable}
 */
  set: function(className) {
    this.element.className = className;
  },

 /**
  * Adds the specified CSS class name to the list of class names associated with the element.
  * @name Element.ClassNames.add()
  * @param {Object} classNameToAdd	Class name to add.
  * @extends {Enumerable}
  */
  add: function(classNameToAdd) {
    if (this.include(classNameToAdd)) return;
    this.set(this.toArray().concat(classNameToAdd).join(' '));
  },

/**
 * Removes the specified CSS class name from the list of class names associated with the element.
 * @name Element.ClassNames.remove()
 * @param {Object} classNameToRemove	Class name to remove.
 * @extends {Enumerable}
 */
  remove: function(classNameToRemove) {
    if (!this.include(classNameToRemove)) return;
    this.set(this.select(function(className) {
      return className != classNameToRemove;
    }).join(' '));
  },

  toString: function() {
    return this.toArray().join(' ');
  }
}

Object.extend(Element.ClassNames.prototype, Enumerable);

/**
 * @classDescription Contains methods for working with input fields in forms.
 */
var Field = {

/**
 * Clears the value(s) of the specified form field(s).
 * @name Field.clear()
 * @param {Object} ... One or more form fields to clear.
 */
  clear: function() {
    for (var i = 0; i < arguments.length; i++)
      $(arguments[i]).value = '';
  },

  focus: function(element) {
    $(element).focus();
  },

/**
 * Returns true if none of the specified fields have empty values.
 * @name Field.present()
 * @param {Object} ... One or more form fields to test.
 * @return {Boolean}	Returns true if none of the specified fields have empty values.
 */
  present: function() {
    for (var i = 0; i < arguments.length; i++)
      if ($(arguments[i]).value == '') return false;
    return true;
  },

/**
 * Selects the value (text) of the field.
 * @name Field.select()
 * @param {Object} element	Form field to select the value of.
 */
  select: function(element) {
    $(element).select();
  },

/**
 * Moves the focus to the field and selects the value (text) of the field.
 * @name Field.activate()
 * @param {Object} element	Form field to activate.
 */
  activate: function(element) {
    element = $(element);
    element.focus();
    if (element.select)
      element.select();
  }
}

/*--------------------------------------------------------------------------*/

var Form = {

/**
 * Creates a serialized string of form fields and their values (e.g. "field1=value1&field2=value2").
 * Form.serialize()
 * @param {Object, String} form	Form object or id to serialize.
 * @return {String} Returns a serialized string.
 */
  serialize: function(form) {
    var elements = Form.getElements($(form));
    var queryComponents = new Array();

    for (var i = 0; i < elements.length; i++) {
      var queryComponent = Form.Element.serialize(elements[i]);
      if (queryComponent)
        queryComponents.push(queryComponent);
    }

    return queryComponents.join('&');
  },

/**
 * Returns an array of all of the elements in a form.
 * @name Form.getElements()
 * @param {Object} form	Form to return the elements for.
 * @return {Array} Returns an array of all of the elements in a form.
 */
  getElements: function(form) {
    form = $(form);
    var elements = new Array();

    for (tagName in Form.Element.Serializers) {
      var tagElements = form.getElementsByTagName(tagName);
      for (var j = 0; j < tagElements.length; j++)
        elements.push(tagElements[j]);
    }
    return elements;
  },

/**
 * Returns an array of all of the input elements in a form. typeName and name filters are optional.
 * @name Form.getInput()
 * @param {Object} form	Form to return the input elements for.
 * @param {Object} [typeName]	Type of input elements to get.
 * @param {Object} [name]	Name of the input elements to get.
 * @return {Array} Returns an array of all of the input elements in a form.
 */
  getInputs: function(form, typeName, name) {
    form = $(form);
    var inputs = form.getElementsByTagName('input');

    if (!typeName && !name)
      return inputs;

    var matchingInputs = new Array();
    for (var i = 0; i < inputs.length; i++) {
      var input = inputs[i];
      if ((typeName && input.type != typeName) ||
          (name && input.name != name))
        continue;
      matchingInputs.push(input);
    }

    return matchingInputs;
  },

/**
 * Disables all of the input elements on a form.
 * @name Form.disable()
 * @param {Object} form	Form to disable.
 */
  disable: function(form) {
    var elements = Form.getElements(form);
    for (var i = 0; i < elements.length; i++) {
      var element = elements[i];
      element.blur();
      element.disabled = 'true';
    }
  },

/**
 * Enables all of the input elements on a form.
 * @name Form.enable()
 * @param {Object} form	Form to enable.
 */
  enable: function(form) {
    var elements = Form.getElements(form);
    for (var i = 0; i < elements.length; i++) {
      var element = elements[i];
      element.disabled = '';
    }
  },

/**
 * Returns the first enabled field element on a form.
 * @name Form.findFirstElement()
 * @param {Object, String} form	Form to search.
 * @return {HTMLInputElement} Returns the first enabled field element on a form.
 */
  findFirstElement: function(form) {
    return Form.getElements(form).find(function(element) {
      return element.type != 'hidden' && !element.disabled &&
        ['input', 'select', 'textarea'].include(element.tagName.toLowerCase());
    });
  },

/**
 * Activates the first enabled input field on the form.
 * @name Form.focusFirstElement()
 * @param {Object} form	Form to focus on the first element for.
 */
  focusFirstElement: function(form) {
    Field.activate(Form.findFirstElement(form));
  },

/**
 * Resets all fields on a form.
 * @name Form.reset()
 * @param {Object} form	Form to reset.
 */
  reset: function(form) {
    $(form).reset();
  }
}

/**
 * @classDescription Provides methods for working with form elements.
 * @constructor
 */
Form.Element = {

/**
 * Returns the name/value pair of an element as a serialized string (e.g. "elementName=elementValue").
 * @name Form.Element.serialize()
 * @param {Object, String} element	Element object or id to get.
 * @return {String} Returns the name/value pair of an element as a serialized string (e.g. "elementName=elementValue").
 */
  serialize: function(element) {
    element = $(element);
    var method = element.tagName.toLowerCase();
    var parameter = Form.Element.Serializers[method](element);

    if (parameter) {
      var key = encodeURIComponent(parameter[0]);
      if (key.length == 0) return;

      if (parameter[1].constructor != Array)
        parameter[1] = [parameter[1]];

      return parameter[1].map(function(value) {
        return key + '=' + encodeURIComponent(value);
      }).join('&');
    }
  },

/**
 * Gets the value of an element.
 * @name Form.Element.getValue()
 * @param {Object, String} element Element object or id to get.
 * @return {String, Number} Returns the value of the element.
 */
  getValue: function(element) {
    element = $(element);
    var method = element.tagName.toLowerCase();
    var parameter = Form.Element.Serializers[method](element);

    if (parameter)
      return parameter[1];
  }
}

/**
 * @classDescription	Provides methods to extract the current value from a form element.
 * @constructor
 */
Form.Element.Serializers = {

/**
 * Returns an array of the text value or checked status of a form element as appropriate to the element type.
 * @name Form.Element.Serializers.input()
 * @param {Object} element	Element object or id to get the value of.
 * @return {Array} Returns the value of the element as an array (e.g. ['elementName', 'elementValue']).
 */
  input: function(element) {
    switch (element.type.toLowerCase()) {
      case 'submit':
      case 'hidden':
      case 'password':
      case 'text':
        return Form.Element.Serializers.textarea(element);
      case 'checkbox':
      case 'radio':
        return Form.Element.Serializers.inputSelector(element);
    }
    return false;
  },

/**
 * Returns an array of the name and value of the element (e.g. ['elementName', 'elementValue']).
 * @name Form.Element.Serializers.inputSelector()
 * @param {Object} element	Element object or id to get.
 * @return {Array} Returns an array of the name and value of the element (e.g. ['elementName', 'elementValue']).
 */
  inputSelector: function(element) {
    if (element.checked)
      return [element.name, element.value];
  },

/**
 * Returns an array of the name and value of a textarea element (e.g. ['elementName', 'elementValue']).
 * @name Form.Element.Serializers.textarea()
 * @param {Object} element	Element object or id to get.
 * @return {Array} Returns an array of the name and value of the element (e.g. ['elementName', 'elementValue']).
 */
  textarea: function(element) {
    return [element.name, element.value];
  },

 /**
 * Returns an array of the names and values of all selected elements (e.g. ['elementName', 'selectedValue1', 'selectedValue2']).
 * @name Form.Element.Serializers.select()
 * @param {Object} element	Element object or id to get.
 * @return {Array} Returns an array of the names and values of all selected elements (e.g. ['elementName', 'selectedValue1', 'selectedValue2']).
 */
  select: function(element) {
    return Form.Element.Serializers[element.type == 'select-one' ?
      'selectOne' : 'selectMany'](element);
  },

 /**
 * Returns an array of the name and value of a single select element (e.g. ['elementName', 'selectedValue']).
 * @name Form.Element.Serializers.selectOne()
 * @param {Object} element	Element object or id to get.
 * @return {Array} Returns an array of the name and value of a single select element (e.g. ['elementName', 'selectedValue']).
 */
  selectOne: function(element) {
    var value = '', opt, index = element.selectedIndex;
    if (index >= 0) {
      opt = element.options[index];
      value = opt.value;
      if (!value && !('value' in opt))
        value = opt.text;
    }
    return [element.name, value];
  },

/**
 * Returns an array of the names and values of all selected elements (e.g. ['elementName', 'selectedValue1', 'selectedValue2']).
 * @name Form.Element.Serializers.selectMany()
 * @param {Object} element	Element object or id to get.
 * @return {Array} Returns an array of the names and values of all selected elements (e.g. ['elementName', 'selectedValue1', 'selectedValue2']).
 */
  selectMany: function(element) {
    var value = new Array();
    for (var i = 0; i < element.length; i++) {
      var opt = element.options[i];
      if (opt.selected) {
        var optValue = opt.value;
        if (!optValue && !('value' in opt))
          optValue = opt.text;
        value.push(optValue);
      }
    }
    return [element.name, value];
  }
}

/*--------------------------------------------------------------------------*/

/**
 * Returns the value of the specified form field.
 * @name $F()
 * @param {String, Object}	Either the form element id or the actual element object.
 * @return {String, Number} Returns the value of the specified field.
 */
var $F = Form.Element.getValue;

/*--------------------------------------------------------------------------*/


Abstract.TimedObserver = function() {}

/**
 * @classDescription Base class for classes that watch an element until its value changes. Used like an abstract class.
 * @constructor
 * @param {Object} element	Element object or id to check.
 * @param {Object} frequency	Frequency (in seconds) to check.
 * @param {Object} callback	Function to call when the element value changes.
 */
Abstract.TimedObserver.prototype = {
  initialize: function(element, frequency, callback) {
    this.frequency = frequency;
    this.element   = $(element);
    this.callback  = callback;

    this.lastValue = this.getValue();
    this.registerCallback();
  },

//private
  registerCallback: function() {
    setInterval(this.onTimerEvent.bind(this), this.frequency * 1000);
  },

 //private
  onTimerEvent: function() {
    var value = this.getValue();
    if (this.lastValue != value) {
      this.callback(this.element, value);
      this.lastValue = value;
    }
  }
}

Form.Element.Observer = Class.create();

/**
 * @classDescription Monitors the value of form input elements.
 * @constructor
 * @extends {Abstract.TimedObserver}
 */
Form.Element.Observer.prototype = Object.extend(new Abstract.TimedObserver(), {

/**
 * Returns a serialized string of all of the element values of a form.
 * @return {String} Returns a serialized string of all of the element values of a form.
 */
  getValue: function() {
    return Form.Element.getValue(this.element);
  }
});

Form.Observer = Class.create();
Form.Observer.prototype = Object.extend(new Abstract.TimedObserver(), {
  getValue: function() {
    return Form.serialize(this.element);
  }
});

/*--------------------------------------------------------------------------*/

Abstract.EventObserver = function() {}

/**
 * @classDescription Executes a callback function when the value of an element changes (e.g. onclick for checked elements or onchange for other elements).
 * @param {Object} element	Element to observe.
 * @param {Object} callback	Callback function to execute.
 */
Abstract.EventObserver.prototype = {
  initialize: function(element, callback) {
    this.element  = $(element);
    this.callback = callback;

    this.lastValue = this.getValue();
    if (this.element.tagName.toLowerCase() == 'form')
      this.registerFormCallbacks();
    else
      this.registerCallback(this.element);
  },

//private
  onElementEvent: function() {
    var value = this.getValue();
    if (this.lastValue != value) {
      this.callback(this.element, value);
      this.lastValue = value;
    }
  },

//private
  registerFormCallbacks: function() {
    var elements = Form.getElements(this.element);
    for (var i = 0; i < elements.length; i++)
      this.registerCallback(elements[i]);
  },

//private
  registerCallback: function(element) {
    if (element.type) {
      switch (element.type.toLowerCase()) {
        case 'checkbox':
        case 'radio':
          Event.observe(element, 'click', this.onElementEvent.bind(this));
          break;
        case 'password':
        case 'text':
        case 'textarea':
        case 'select-one':
        case 'select-multiple':
          Event.observe(element, 'change', this.onElementEvent.bind(this));
          break;
      }
    }
  }
}

Form.Element.EventObserver = Class.create();

/**
 * @classDescription Executes a callback function on the appropriate value-changing event associated with the element.
 * @constructor
 * @extends {Abstract.EventObserver}
 */
Form.Element.EventObserver.prototype = Object.extend(new Abstract.EventObserver(), {

/**
 * Gets the value of the element.
 * @return {String, Number} Returns the value of the element.
 */
  getValue: function() {
    return Form.Element.getValue(this.element);
  }
});

Form.EventObserver = Class.create();

/**
 * @classDescription Executes a callback function on the appropriate value-changing event associated with the element.
 * @constructor
 * @extends {Abstract.EventObserver}
 */
Form.EventObserver.prototype = Object.extend(new Abstract.EventObserver(), {
  getValue: function() {
    return Form.serialize(this.element);
  }
});
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
var Position = {
  // set to true if needed, warning: firefox performance problems
  // NOT neeeded for page scrolling, only if draggable contained in
  // scrollable elements
  includeScrollOffsets: false,

  // must be called before calling withinIncludingScrolloffset, every time the
  // page is scrolled

/**
 * Adjusts the deltaX and deltaY values for scrolling. Do not call withinIncludingScrolloffsets before calling the prepare method.
 * @name Position.prepare()
 */
  prepare: function() {
    this.deltaX =  window.pageXOffset
                || document.documentElement.scrollLeft
                || document.body.scrollLeft
                || 0;
    this.deltaY =  window.pageYOffset
                || document.documentElement.scrollTop
                || document.body.scrollTop
                || 0;
  },

/**
 * Returns an Array of the correct offsets of an element (e.g. [total_scroll_left, total_scroll_top]).
 * @name Position.realOffset()
 * @param {Object} element	Element to get the offsets for.
 * @return {Array} Returns an Array of the correct offsets of an element (e.g. [total_scroll_left, total_scroll_top]).
 */
  realOffset: function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.scrollTop  || 0;
      valueL += element.scrollLeft || 0;
      element = element.parentNode;
    } while (element);
    return [valueL, valueT];
  },

/**
 * Returns an Array of the correct cumulative offsets of an element (e.g. [total_scroll_left, total_scroll_top]).
 * @name Position.cumulativeOffset()
 * @param {Object} element Element to get the offsets for.
 * @return {Array} Returns an Array of the correct cumulative offsets of an element (e.g. [total_scroll_left, total_scroll_top]).
 */
  cumulativeOffset: function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      element = element.offsetParent;
    } while (element);
    return [valueL, valueT];
  },

/**
 * Returns an Array of relative or absolute offsets for an element (e.g. [total_scroll_left, total_scroll_top]).
 * @name Positiion.positionedOffset()
 * @param {Object} element	Element to get the offsets for.
 * @return {Array} Returns an Array of relative or absolute offsets for an element (e.g. [total_scroll_left, total_scroll_top]).
 */
  positionedOffset: function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      element = element.offsetParent;
      if (element) {
        p = Element.getStyle(element, 'position');
        if (p == 'relative' || p == 'absolute') break;
      }
    } while (element);
    return [valueL, valueT];
  },

/**
 * Gets the offset of the parent of the element.
 * @name Position.offsetParent()
 * @param {Object} element Element to get the parent offset for.
 */
  offsetParent: function(element) {
    if (element.offsetParent) return element.offsetParent;
    if (element == document.body) return element;

    while ((element = element.parentNode) && element != document.body)
      if (Element.getStyle(element, 'position') != 'static')
        return element;

    return document.body;
  },

  // caches x/y coordinate pair to use with overlap

/**
 * Checks if the specified point is within the coordinates of the element.
 * @name Position.within()
 * @param {Object} element	Element to test against.
 * @param {Object} x	X-coordinate of the point.
 * @param {Object} y	y-coordinate of the point.
 * @return {Boolean} Returns true if the point is within the element coordinates.
 */
  within: function(element, x, y) {
    if (this.includeScrollOffsets)
      return this.withinIncludingScrolloffsets(element, x, y);
    this.xcomp = x;
    this.ycomp = y;
    this.offset = this.cumulativeOffset(element);

    return (y >= this.offset[1] &&
            y <  this.offset[1] + element.offsetHeight &&
            x >= this.offset[0] &&
            x <  this.offset[0] + element.offsetWidth);
  },

/**
 * Checks if the specified point is within the coordinates of the element (including its offsets). Call the prepare method before calling this method.
 * @name Position.within()
 * @param {Object} element	Element to test against.
 * @param {Object} x	X-coordinate of the point.
 * @param {Object} y	y-coordinate of the point.
 * @return {Boolean} Returns true if the point is within the element coordinates.
 */
  withinIncludingScrolloffsets: function(element, x, y) {
    var offsetcache = this.realOffset(element);

    this.xcomp = x + offsetcache[0] - this.deltaX;
    this.ycomp = y + offsetcache[1] - this.deltaY;
    this.offset = this.cumulativeOffset(element);

    return (this.ycomp >= this.offset[1] &&
            this.ycomp <  this.offset[1] + element.offsetHeight &&
            this.xcomp >= this.offset[0] &&
            this.xcomp <  this.offset[0] + element.offsetWidth);
  },

  // within must be called directly before

/**
 * Returns the percentage of overlap (as a number between 0-1) between the coordinate and the element. Call within before calling this method.
 * @name Position.overlap()
 * @param {Object} mode	Specify "vertical" or "horizontal" mode.
 * @param {Object} element	Element to check for overlap.
 */
  overlap: function(mode, element) {
    if (!mode) return 0;
    if (mode == 'vertical')
      return ((this.offset[1] + element.offsetHeight) - this.ycomp) /
        element.offsetHeight;
    if (mode == 'horizontal')
      return ((this.offset[0] + element.offsetWidth) - this.xcomp) /
        element.offsetWidth;
  },

/**
 * Clones the size and position of the target element to match the source element.
 * @name Position.clone()
 * @param {Object} source
 * @param {Object} target
 */
  clone: function(source, target) {
    source = $(source);
    target = $(target);
    target.style.position = 'absolute';
    var offsets = this.cumulativeOffset(source);
    target.style.top    = offsets[1] + 'px';
    target.style.left   = offsets[0] + 'px';
    target.style.width  = source.offsetWidth + 'px';
    target.style.height = source.offsetHeight + 'px';
  },

/**
 * Returns an Array of the page position of the element (e.g. [total_scroll_left, total_scroll_top]).
 * @name Position.page()
 * @param {Object} forElement	Element to get the page position for.
 * Returns an Array of the page position of the element (e.g. [total_scroll_left, total_scroll_top]).
 */
  page: function(forElement) {
    var valueT = 0, valueL = 0;

    var element = forElement;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;

      // Safari fix
      if (element.offsetParent==document.body)
        if (Element.getStyle(element,'position')=='absolute') break;

    } while (element = element.offsetParent);

    element = forElement;
    do {
      valueT -= element.scrollTop  || 0;
      valueL -= element.scrollLeft || 0;
    } while (element = element.parentNode);

    return [valueL, valueT];
  },

  clone: function(source, target) {
    var options = Object.extend({
      setLeft:    true,
      setTop:     true,
      setWidth:   true,
      setHeight:  true,
      offsetTop:  0,
      offsetLeft: 0
    }, arguments[2] || {})

    // find page position of source
    source = $(source);
    var p = Position.page(source);

    // find coordinate system to use
    target = $(target);
    var delta = [0, 0];
    var parent = null;
    // delta [0,0] will do fine with position: fixed elements,
    // position:absolute needs offsetParent deltas
    if (Element.getStyle(target,'position') == 'absolute') {
      parent = Position.offsetParent(target);
      delta = Position.page(parent);
    }

    // correct by body offsets (fixes Safari)
    if (parent == document.body) {
      delta[0] -= document.body.offsetLeft;
      delta[1] -= document.body.offsetTop;
    }

    // set position
    if(options.setLeft)   target.style.left  = (p[0] - delta[0] + options.offsetLeft) + 'px';
    if(options.setTop)    target.style.top   = (p[1] - delta[1] + options.offsetTop) + 'px';
    if(options.setWidth)  target.style.width = source.offsetWidth + 'px';
    if(options.setHeight) target.style.height = source.offsetHeight + 'px';
  },

/**
 * Converts the position of a relatively positioned element to an absolutely positioned element.
 * @name Position.absolutize()
 * @param {Object} element	Element to position absolutely.
 */
  absolutize: function(element) {
    element = $(element);
    if (element.style.position == 'absolute') return;
    Position.prepare();

    var offsets = Position.positionedOffset(element);
    var top     = offsets[1];
    var left    = offsets[0];
    var width   = element.clientWidth;
    var height  = element.clientHeight;

    element._originalLeft   = left - parseFloat(element.style.left  || 0);
    element._originalTop    = top  - parseFloat(element.style.top || 0);
    element._originalWidth  = element.style.width;
    element._originalHeight = element.style.height;

    element.style.position = 'absolute';
    element.style.top    = top + 'px';;
    element.style.left   = left + 'px';;
    element.style.width  = width + 'px';;
    element.style.height = height + 'px';;
  },

/**
 * Converts the position of an absolutely positioned element to a relatively positioned element.
 * @name Position.relativize()
 * @param {Object} element Element to position relatively.
 */
  relativize: function(element) {
    element = $(element);
    if (element.style.position == 'relative') return;
    Position.prepare();

    element.style.position = 'relative';
    var top  = parseFloat(element.style.top  || 0) - (element._originalTop || 0);
    var left = parseFloat(element.style.left || 0) - (element._originalLeft || 0);

    element.style.top    = top + 'px';
    element.style.left   = left + 'px';
    element.style.height = element._originalHeight;
    element.style.width  = element._originalWidth;
  }
}

// Safari returns margins on body which is incorrect if the child is absolutely
// positioned.  For performance reasons, redefine Position.cumulativeOffset for
// KHTML/WebKit only.
if (/Konqueror|Safari|KHTML/.test(navigator.userAgent)) {
  Position.cumulativeOffset = function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      if (element.offsetParent == document.body)
        if (Element.getStyle(element, 'position') == 'absolute') break;

      element = element.offsetParent;
    } while (element);

    return [valueL, valueT];
  }
}