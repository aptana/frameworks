/*  Prototype JavaScript framework, version 1.5.1.1
 *  (c) 2005-2007 Sam Stephenson
 *
 *  Prototype is freely distributable under the terms of an MIT-style license.
 *  For details, see the Prototype web site: http://www.prototypejs.org/
 *
/*--------------------------------------------------------------------------*/

/**
* @classDescription Declares the version of the prototype library.
*/
var Prototype = {

 /**
 * Version of the library.
 */
  Version: '1.5.1.1',

  Browser: {
    IE:     !!(window.attachEvent && !window.opera),
    Opera:  !!window.opera,
    WebKit: navigator.userAgent.indexOf('AppleWebKit/') > -1,
    Gecko:  navigator.userAgent.indexOf('Gecko') > -1 && navigator.userAgent.indexOf('KHTML') == -1
  },

  BrowserFeatures: {
    XPath: !!document.evaluate,
    ElementExtensions: !!window.HTMLElement,
    SpecificElementExtensions:
      (document.createElement('div').__proto__ !==
       document.createElement('form').__proto__)
  },

 /**
 * RegExp used to identify scripts.
 */
  ScriptFragment: '<script[^>]*>([\\S\\s]*?)<\/script>',
  JSONFilter: /^\/\*-secure-([\s\S]*)\*\/\s*$/,

 /**
 * Empty function object.
 */
  emptyFunction: function() { },
  
 /**
 * Function to echo back the specified parameter.
 * @param {Object} x	Parameter to echo.
 * @return {Object} Returns the specified parameter.
 */
  K: function(x) { return x }
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
 * @alias Object.extend()
 * @param {Object} destination	Destination object to inherit the properties and methods.
 * @param {Object} source	Source object to inherit properties and methods from.
 * @return {Object} Returns the destination object with the properties and methods from the source object.
 * @extends {Object}
 */
Object.extend = function(destination, source) {
  for (var property in source) {
    destination[property] = source[property];
  }
  return destination;
}

Object.extend(Object, {
  inspect: function(object) {
    try {
      if (object === undefined) return 'undefined';
      if (object === null) return 'null';
      return object.inspect ? object.inspect() : object.toString();
    } catch (e) {
      if (e instanceof RangeError) return '...';
      throw e;
    }
  },

  toJSON: function(object) {
    var type = typeof object;
    switch(type) {
      case 'undefined':
      case 'function':
      case 'unknown': return;
      case 'boolean': return object.toString();
    }
    if (object === null) return 'null';
    if (object.toJSON) return object.toJSON();
    if (object.ownerDocument === document) return;
    var results = [];
    for (var property in object) {
      var value = Object.toJSON(object[property]);
      if (value !== undefined)
        results.push(property.toJSON() + ': ' + value);
    }
    return '{' + results.join(', ') + '}';
  },

  keys: function(object) {
    var keys = [];
    for (var property in object)
      keys.push(property);
    return keys;
  },

  values: function(object) {
    var values = [];
    for (var property in object)
      values.push(object[property]);
    return values;
  },

  clone: function(object) {
    return Object.extend({}, object);
  }
});

/**
 * Binds an instance of the function to the object that owns the function.
 * @alias Function.bind()
 * @param {Function} function	Function to bind to its owner object.
 * @param {Object, Array} ... Arguments to use when calling the function.
 * @return {Object} Returns the function pre-bound to its owner object with the specified arguments.
 * @extends {Function}
 */
Function.prototype.bind = function() {
  var __method = this, args = $A(arguments), object = args.shift();
  return function() {
    return __method.apply(object, args.concat($A(arguments)));
  }
}

/**
 * Binds an instance of a function to the object that owns the function as an event listener.
 * @alias Function.bindAsEventListener()
 * @param {Object} object	Function to bind to its owner object.
 * @return {Object} Returns the function pre-bound to its owner object with the current event object as its argument.
 * @extends {Function}
 */
Function.prototype.bindAsEventListener = function(object) {
  var __method = this, args = $A(arguments), object = args.shift();
  return function(event) {
    return __method.apply(object, [event || window.event].concat(args));
  }
}

Object.extend(Number.prototype, {
  toColorPart: function() {
    return this.toPaddedString(2, 16);
  },

/**
 * Returns the next number in an iteration.
 * @alias Number.succ()
 * @return {Number} Returns the next number in an iteration.
 * @extends {Number}
 */
  succ: function() {
    return this + 1;
  },

/**
 * Calls the iterator function, repeatedly passing the current index as the index argument.
 * @alias Number.times()
 * @param {Object} iterator	Iterator function to call.
 * @extends {Number}
 */
  times: function(iterator) {
    $R(0, this, true).each(iterator);
    return this;
  },

  toPaddedString: function(length, radix) {
    var string = this.toString(radix || 10);
    return '0'.times(length - string.length) + string;
  },

  toJSON: function() {
    return isFinite(this) ? this.toString() : 'null';
  }
});

Date.prototype.toJSON = function() {
  return '"' + this.getFullYear() + '-' +
    (this.getMonth() + 1).toPaddedString(2) + '-' +
    this.getDate().toPaddedString(2) + 'T' +
    this.getHours().toPaddedString(2) + ':' +
    this.getMinutes().toPaddedString(2) + ':' +
    this.getSeconds().toPaddedString(2) + '"';
};

/**
 * Tries the specified function calls until one of them is successful.
 * @alias Try.these()
 * @param {Function, Array}	Function call(s) to try.
 * @return {String, Number}	Returns the value of the first successful function call.
 */
var Try = {
  these: function() {
    var returnValue;

    for (var i = 0, length = arguments.length; i < length; i++) {
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
 * @alias PeriodicalExecutor.initialize()
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
 * @alias PeriodicalExecutor.registerCallback()
 */
  registerCallback: function() {
    this.timer = setInterval(this.onTimerEvent.bind(this), this.frequency * 1000);
  },

  /**
   * Stops execution of the timer event.
   * @alias PeriodicalExecutor.stop
   */
  stop: function() {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  },

  /**
 * Calls the function at on the timer event.
 * @alias PeriodicalExecutor.onTimerEvent
 */
  onTimerEvent: function() {
    if (!this.currentlyExecuting) {
      try {
        this.currentlyExecuting = true;
        this.callback(this);
      } finally {
        this.currentlyExecuting = false;
      }
    }
  }
}
Object.extend(String, {
  interpret: function(value) {
    return value == null ? '' : String(value);
  },
  specialChar: {
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '\\': '\\\\'
  }
});

Object.extend(String.prototype, {
	
  /**
   * Returns the string with every occurence of a given pattern replaced by either a regular string, the returned value of a function or a Template string. The pattern can be a string or a regular expression.
   * @alias String.gsub
   * @param {String} pattern	Pattern to replace.
   * @param {String} replacement	String to replace the pattern with.
   * @return {String}	Returns the string with every occurence of a given pattern replaced.
   * @extends {String}
   */
  gsub: function(pattern, replacement) {
    var result = '', source = this, match;
    replacement = arguments.callee.prepareReplacement(replacement);

    while (source.length > 0) {
      if (match = source.match(pattern)) {
        result += source.slice(0, match.index);
        result += String.interpret(replacement(match));
        source  = source.slice(match.index + match[0].length);
      } else {
        result += source, source = '';
      }
    }
    return result;
  },

  /**
   * Returns a string with the first count occurrences of pattern replaced by either a regular string, the returned value of a function or a Template string. pattern can be a string or a regular expression.
   * @alias String.sub
   * @param {String} pattern	Pattern to search for.
   * @param {String} replacement	Replacement string.
   * @param {Number} count	Number of occurrences to replace.
   * @return {String} Returns a string with the first count occurrences of pattern replaced by either a regular string, the returned value of a function or a Template string.
   * @extends {String}
   */
  sub: function(pattern, replacement, count) {
    replacement = this.gsub.prepareReplacement(replacement);
    count = count === undefined ? 1 : count;

    return this.gsub(pattern, function(match) {
      if (--count < 0) return match[0];
      return replacement(match);
    });
  },

  /**
   * Allows iterating over every occurrence of the given pattern (which can be a string or a regular expression).
   * @alias String.scan
   * @param {String} pattern	Pattern to search for.
   * @param {Iterator} iterator	Iterator to use.
   * @return {String} Returns the original string.
   * @extends {String}
   */
  scan: function(pattern, iterator) {
    this.gsub(pattern, iterator);
    return this;
  },

  /**
   * Truncates a string to the given length and appends a suffix to it (indicating that it is only an excerpt).
   * @alias String.truncate
   * @param {Object} length Length to truncate the string.
   * @param {Object} truncation Text to append to the string.
   * @return {String} Returns the truncated string.
   * @extends {String}
   */
  truncate: function(length, truncation) {
    length = length || 30;
    truncation = truncation === undefined ? '...' : truncation;
    return this.length > length ?
      this.slice(0, length - truncation.length) + truncation : this;
  },

  /**
   * Strips all leading and trailing whitespace from a string.
   * @alias String.strip
   * @return {String} Returns the string with the whitespace stripped.
   * @extends {String}
   */
  strip: function() {
    return this.replace(/^\s+/, '').replace(/\s+$/, '');
  },

  /**
 * Removes the HTML or XML tags from a string.
 * @alias String.stripTags
 * @return {String} Returns the string with any HTML or XML tags removed.
 * @extends {String}
 */
  stripTags: function() {
    return this.replace(/<\/?[^>]+>/gi, '');
  },

  /**
 * Removes any <script></script> blocks from a string.
 * @alias String.stripScripts()
 * @return {String} Returns the string with any <script></script> blocks removed.
 * @extends {String}
 */
  stripScripts: function() {
    return this.replace(new RegExp(Prototype.ScriptFragment, 'img'), '');
  },

  /**
  * Extracts any <script></script> blocks from a string and returns them as an array.
  * @alias String.extractScripts
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
 * @alias String.evalScripts
 * @return {String, Number, Object, Boolean, Array} Returns the result of the script.
 * @extends {String}
 */
  evalScripts: function() {
    return this.extractScripts().map(function(script) { return eval(script) });
  },

 /**
 * Escapes any HTML characters in a string.
 * @alias String.escapeHTML()
 * @return {String} Returns the string with the HTML characters escaped.
 * @extends {String}
 */
  escapeHTML: function() {
    var self = arguments.callee;
    self.text.data = this;
    return self.div.innerHTML;
  },

 /**
 * Converts any escaped HTML characters in a string to real HTML characters.
 * @alias String.unescapeHTML()
 * @return {String} Returns the string with HTML characters unescaped.
 * @extends {String}
 *
  unescapeHTML: function() {
    var div = document.createElement('div');
    div.innerHTML = this.stripTags();
    return div.childNodes[0] ? (div.childNodes.length > 1 ?
      $A(div.childNodes).inject('', function(memo, node) { return memo+node.nodeValue }) :
      div.childNodes[0].nodeValue) : '';
  },

 /**
 * Creates an associative array (similar to a hash) from a string using parameter names as an index.
 * @alias String.toQueryParams()
 * @return {Array} Returns an associative array from the string.
 * @extends {String}
 */
  toQueryParams: function(separator) {
    var match = this.strip().match(/([^?#]*)(#.*)?$/);
    if (!match) return {};

    return match[1].split(separator || '&').inject({}, function(hash, pair) {
      if ((pair = pair.split('='))[0]) {
        var key = decodeURIComponent(pair.shift());
        var value = pair.length > 1 ? pair.join('=') : pair[0];
        if (value != undefined) value = decodeURIComponent(value);

        if (key in hash) {
          if (hash[key].constructor != Array) hash[key] = [hash[key]];
          hash[key].push(value);
        }
        else hash[key] = value;
      }
      return hash;
    });
  },

  /**
 * Creates an array from the characters of a string.
 * @alias String.toArray()
 * @return {Array} Returns an array of all of the characters in a string.
 * @extends {String}
 */
  toArray: function() {
    return this.split('');
  },

  /**
   * Used internally by ObjectRange. Converts the last character of the string to the following character in the Unicode alphabet.
   * @alias String.succ
   * @return {String}	Returns the converted string.
   * @extends {String}
   */
  succ: function() {
    return this.slice(0, this.length - 1) +
      String.fromCharCode(this.charCodeAt(this.length - 1) + 1);
  },

  /**
   * Concatenates the string count times.
   * @alias String.times
   * @param {Number} count	Number of times to concatenate the string.
   * @return {String} Returns the concatenated string.
   * @extends {String}
   */
  times: function(count) {
    var result = '';
    for (var i = 0; i < count; i++) result += this;
    return result;
  },

 /**
 * Converts  a hyphen-delimited string to camel case. (e.g. thisIsCamelCase)
 * @alias String.camelize()
 * @return {String} Returns the string as camel case.
 * @extends {String}
 */
  camelize: function() {
    var parts = this.split('-'), len = parts.length;
    if (len == 1) return parts[0];

    var camelized = this.charAt(0) == '-'
      ? parts[0].charAt(0).toUpperCase() + parts[0].substring(1)
      : parts[0];

    for (var i = 1; i < len; i++)
      camelized += parts[i].charAt(0).toUpperCase() + parts[i].substring(1);

    return camelized;
  },

  /**
   * Capitalizes the first letter of a string and downcases all the others.
   * @alias	String.capitalize
   * @return {String} Returns the capitalized string.
   * @extends {String}
   */
  capitalize: function() {
    return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase();
  },

  /**
   * Converts a camelized string into a series of words separated by an underscore ("_").
   * @alias String.underscore
   * @return {String} Converts a camelized string into a series of words separated by an underscore ("_").
   * @extends {String}
   */
  underscore: function() {
    return this.gsub(/::/, '/').gsub(/([A-Z]+)([A-Z][a-z])/,'#{1}_#{2}').gsub(/([a-z\d])([A-Z])/,'#{1}_#{2}').gsub(/-/,'_').toLowerCase();
  },

  /**
   * Replaces every instance of the underscore character ("_") by a dash ("-").
   * @alias String.dasherize
   * @return {String}	Replaces every instance of the underscore character ("_") by a dash ("-").
   * @extends {String}
   */
  dasherize: function() {
    return this.gsub(/_/,'-');
  },

  /**
  * Converts the string to human-readable characters.
  * @alias String.inspect()
  * @return {String} Returns a version of the string that can easily be read by humans.
  * @extends {String}
  */
  inspect: function(useDoubleQuotes) {
    var escapedString = this.gsub(/[\x00-\x1f\\]/, function(match) {
      var character = String.specialChar[match[0]];
      return character ? character : '\\u00' + match[0].charCodeAt().toPaddedString(2, 16);
    });
    if (useDoubleQuotes) return '"' + escapedString.replace(/"/g, '\\"') + '"';
    return "'" + escapedString.replace(/'/g, '\\\'') + "'";
  },

  /**
   * Returns a JSON string.
   * @alias String.toJSON
   * @return {String}	Returns a JSON string.
   * @extends {String}
   */
  toJSON: function() {
    return this.inspect(true);
  },

  /**
   * Strips comment delimiters around Ajax JSON or JavaScript responses. This security method is called internally.
   * @alias String.unfilterJSON
   * @param {String} filter	Filter to use.
   * @return {String} Returns the unfiltered string.
   * @extends {String}
   */
  unfilterJSON: function(filter) {
    return this.sub(filter || Prototype.JSONFilter, '#{1}');
  },

  /**
   * Check if the string is valid JSON by the use of regular expressions. This security method is called internally.
   * @alias String.isJSON
   * @return {Boolean} Returns true if the string is a JSON string.
   * @extends {String}
   */
  isJSON: function() {
    var str = this.replace(/\\./g, '@').replace(/"[^"\\\n\r]*"/g, '');
    return (/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/).test(str);
  },

  /**
   * Evaluates the JSON in the string and returns the resulting object. If the optional sanitize parameter is set to true, the string is checked for possible malicious attempts and eval is not called if one is detected.
   * @alias String.evalJSON
   * @param {Object} sanitize	If true, checks for malicious syntax.	
   * @return {Object}	Returns the result of the evaluation.
   * @extends {String}
   */
  evalJSON: function(sanitize) {
    var json = this.unfilterJSON();
    try {
      if (!sanitize || json.isJSON()) return eval('(' + json + ')');
    } catch (e) { }
    throw new SyntaxError('Badly formed JSON string: ' + this.inspect());
  },

  /**
   * Check if the string contains a pattern.
   * @alias String.include
   * @param {String} pattern	Pattern to search for.
   * @return {Boolean}	Returns true if the string contains a pattern.
   * @extends {String}
   */
  include: function(pattern) {
    return this.indexOf(pattern) > -1;
  },

  /**
   * Checks if the string starts with pattern.
   * @alias String.startsWith
   * @param {String} pattern	Pattern to search for.
   * @return {Boolean}	Returns true if the string starts with a pattern.
   * @extends {String}
   */
  startsWith: function(pattern) {
    return this.indexOf(pattern) === 0;
  },

  /**
   * Checks if the string ends with pattern.
   * @alias String.startsWith
   * @param {String} pattern	Pattern to search for.
   * @return {Boolean}	Returns true if the string starts with a pattern.
   * @extends {String}
   */
  endsWith: function(pattern) {
    var d = this.length - pattern.length;
    return d >= 0 && this.lastIndexOf(pattern) === d;
  },

  /**
   * Checks if the string is empty.
   * @alias String.empty
   * @return {Boolean} Returns true if the string is empty.
   * @extends {String}
   */
  empty: function() {
    return this == '';
  },

  /**
   * Check if the string is 'blank', meaning either empty or containing only whitespace.
   * @alias String.blank
   * @return {Boolean} Returns true if the string is blank.
   * @extends {String}
   */
  blank: function() {
    return /^\s*$/.test(this);
  }
});

if (Prototype.Browser.WebKit || Prototype.Browser.IE) Object.extend(String.prototype, {
  escapeHTML: function() {
    return this.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  },
  unescapeHTML: function() {
    return this.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
  }
});

String.prototype.gsub.prepareReplacement = function(replacement) {
  if (typeof replacement == 'function') return replacement;
  var template = new Template(replacement);
  return function(match) { return template.evaluate(match) };
}

String.prototype.parseQuery = String.prototype.toQueryParams;

Object.extend(String.prototype.escapeHTML, {
  div:  document.createElement('div'),
  text: document.createTextNode('')
});

with (String.prototype.escapeHTML) div.appendChild(text);

/**
 * @classDescription Any time you have a group of similar objects and you need to produce formatted output for these objects, maybe inside a loop, you typically resort to concatenating string literals with the object's fields. There's nothing wrong with the above approach, except that it is hard to visualize the output immediately just by glancing at the concatenation expression. The Template class provides a much nicer and clearer way of achieving this formatting.
 */
var Template = Class.create();
Template.Pattern = /(^|.|\r|\n)(#\{(.*?)\})/;
Template.prototype = {
  initialize: function(template, pattern) {
    this.template = template.toString();
    this.pattern  = pattern || Template.Pattern;
  },

  /**
   * Applies the template to the given object's data, producing a formatted string with symbols replaced by corresponding object's properties.
   * @alias Template.evaluate
   * @param {Object} object	Object containing data.
   * @return {Object} Returns the formatted data.
   * @extends {Template}
   */
  evaluate: function(object) {
    return this.template.gsub(this.pattern, function(match) {
      var before = match[1];
      if (before == '\\') return match[2];
      return before + String.interpret(object[match[3]]);
    });
  }
}

var $break = {}, $continue = new Error('"throw $continue" is deprecated, use "return" instead');

/**
 * @classDescription Allows you to easily iterate items in a list.
 */
var Enumerable = {
  
 /**
 * Calls the specified iterator function.
 * @alias Enumerable.each
 * @param {Function} iterator	Iterator function to call. Takes the arguments elementValue, and elementIndex, respectively.
 */
  each: function(iterator) {
    var index = 0;
    try {
      this._each(function(value) {
        iterator(value, index++);
      });
    } catch (e) {
      if (e != $break) throw e;
    }
    return this;
  },

  /**
   * Groups items in chunks based on a given size, with last chunk being possibly smaller.
   * @alias Enumerable.eachSlice
   * @param {Number} number	Number in each slice
   * @param {Object} iterator	Iterator to use
   * @return {Object} Returns formatted items.
   */
  eachSlice: function(number, iterator) {
    var index = -number, slices = [], array = this.toArray();
    while ((index += number) < array.length)
      slices.push(array.slice(index, index+number));
    return slices.map(iterator);
  },

  /**
 * Calls an iterator function to test the values in a list to see if they are all true.
 * @alias Enumerable.all
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
 * @alias Enumerable.any
 * @param {Function} iterator	Iterator function to call. Takes the arguments elementValue, and elementIndex, respectively.
 * @return {Boolean} Returns true if any of the iterator returns true for any of the elements.
 */
  any: function(iterator) {
    var result = false;
    this.each(function(value, index) {
      if (result = !!(iterator || Prototype.K)(value, index))
        throw $break;
    });
    return result;
  },

 /**
 * Calls an iterator function and returns the results in an Array.
 * @alias Enumerable.collect
 * @param {Function} iterator	Iterator function to call. Takes the arguments elementValue, and elementIndex, respectively.
 * @return {Array} Array of the results of calling the iterator on each element.
 */
  collect: function(iterator) {
    var results = [];
    this.each(function(value, index) {
      results.push((iterator || Prototype.K)(value, index));
    });
    return results;
  },

 /**
 * Calls an iterator function on the elements in a list and returns the first element that causes the iterator to return true.
 * @alias Enumerable.detect
 * @param {Function} iterator	Iterator function to call. Takes the arguments elementValue, and elementIndex, respectively.
 * @return {Object} Returns the first element that causes the iterator function to return true.
 */
  detect: function(iterator) {
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
 * @alias Enumerable.findAll
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
 * @alias Enumerable.grep
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
 * @alias Enumerable.include
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
   * Groups items in fixed-size chunks, using a specific value to fill up the last chunk if necessary.
   * @alias Enumerable.inGroupsOf
   * @param {Number} number	Number in each group
   * @param {Object} fillWith	Value to fill with
   * @return {Object} Returns formatted data.
   */
  inGroupsOf: function(number, fillWith) {
    fillWith = fillWith === undefined ? null : fillWith;
    return this.eachSlice(number, function(slice) {
      while(slice.length < number) slice.push(fillWith);
      return slice;
    });
  },

 /**
 * Calls an iterator function on the elements in a list and accumulates their values into a single value.
 * @alias Enumerable.inject
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
 * @alias Enumerable.invoke
 * @param {Function} method	Method to call.
 * @return {Array} Returns an array of the results.
 */
  invoke: function(method) {
    var args = $A(arguments).slice(1);
    return this.map(function(value) {
      return value[method].apply(value, args);
    });
  },

 /**
 * Returns the element in the list with the greatest value. If you specify an iterator, calls the iterator function and returns the result with the greatest value.
 * @alias Enumerable.max
 * @param {Function} [iterator]	Iterator function to call. Takes the arguments elementValue, and elementIndex, respectively.
 * @return {Object} Returns the element in the list with the greatest value. If you specify an iterator, calls the iterator function and returns the result with the greatest value.
 */
  max: function(iterator) {
    var result;
    this.each(function(value, index) {
      value = (iterator || Prototype.K)(value, index);
      if (result == undefined || value >= result)
        result = value;
    });
    return result;
  },

 /**
 * Returns the element in the list with the smallest value. If you specify an iterator, calls the iterator function and returns the result with the smallest value.
 * @alias Enumerable.min
 * @param {Function} [iterator]	Iterator function to call. Takes the arguments elementValue, and elementIndex, respectively.
 * @return {Object} Returns the element in the list with the smallest value. If you specify an iterator, calls the iterator function and returns the result with the smallest value.
 */
  min: function(iterator) {
    var result;
    this.each(function(value, index) {
      value = (iterator || Prototype.K)(value, index);
      if (result == undefined || value < result)
        result = value;
    });
    return result;
  },

 /**
 * Partitions a list of elements into true elements or values and not-true elements or values.
 * @alias Enumerable.partition
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
 * @alias Enumerable.pluck
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
 * @alias Enumerable.reject
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
 * @alias Enumerable.sortBy
 * @param {Object} iterator	Iterator function to call. Takes the arguments elementValue, and elementIndex, respectively.
 * @return {Array} Returns an array of elements sorted by their iterator results.
 */
  sortBy: function(iterator) {
    return this.map(function(value, index) {
      return {value: value, criteria: iterator(value, index)};
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return a < b ? -1 : a > b ? 1 : 0;
    }).pluck('value');
  },

 /**
 * Creates an array of the elements in a list.
 * @alias Enumerable.toArray
 * @return {Array} Returns an Array of elements in the list.
 */
  toArray: function() {
    return this.map();
  },

 /**
 * Merges elements from one or more lists into a single list.
 * @alias Enumerable.zip()
 * @param {Array} ... One or more lists of elements to merge.
 * @return {Array} Returns a single array.
 */
  zip: function() {
    var iterator = Prototype.K, args = $A(arguments);
    if (typeof args.last() == 'function')
      iterator = args.pop();

    var collections = [this].concat(args).map($A);
    return this.map(function(value, index) {
      return iterator(collections.pluck(index));
    });
  },

  /**
   * Returns the size of the enumeration.
   * @alias Enumerable.size
   * @return {Number} Returns the size of the enumeration.
   */
  size: function() {
    return this.toArray().length;
  },

 /**
 * Returns a human-readable string version of the list of elements.
 * @alias Enumerable.inspect
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
 * @alias $A
 * @param {Object} iterable	Object to be converted to an Array.
 * @return {Array} Returns an Array.
 */
var $A = Array.from = function(iterable) {
  if (!iterable) return [];
  if (iterable.toArray) {
    return iterable.toArray();
  } else {
    var results = [];
    for (var i = 0, length = iterable.length; i < length; i++)
      results.push(iterable[i]);
    return results;
  }
}

if (Prototype.Browser.WebKit) {
  $A = Array.from = function(iterable) {
    if (!iterable) return [];
    if (!(typeof iterable == 'function' && iterable == '[object NodeList]') &&
      iterable.toArray) {
      return iterable.toArray();
    } else {
      var results = [];
      for (var i = 0, length = iterable.length; i < length; i++)
        results.push(iterable[i]);
      return results;
    }
  }
}

Object.extend(Array.prototype, Enumerable);

if (!Array.prototype._reverse)
  Array.prototype._reverse = Array.prototype.reverse;

Object.extend(Array.prototype, {
  _each: function(iterator) {
    for (var i = 0, length = this.length; i < length; i++)
      iterator(this[i]);
  },

 /**
 * Clears an array of all content.
 * @alias Array.clear
 * @return {Array} Returns an empty array.
 * @extends {Array}
 */
  clear: function() {
    this.length = 0;
    return this;
  },

 /**
 * Returns the first element of an array.
 * @alias Array.first
 * @return {Object, String, Number} Returns the first element of an array.
 * @extends {Array}
 */
  first: function() {
    return this[0];
  },

 /**
 * Returns the last element of an array.
 * @alias Array.last
 * @return {Object, String, Number} Returns the last element of an array.
 * @extends {Array}
 */
  last: function() {
    return this[this.length - 1];
  },

  /**
   * Returns a new version of the array, without any null/undefined values.
   * @alias Array.compact
   * @return {Array}	Returns a new version of the array, without any null/undefined values.
   * @extends {Array}
   */
  compact: function() {
    return this.select(function(value) {
      return value != null;
    });
  },

 /**
 * Flattens an array containing elements that are arrays into a single array.
 * @alias Array.flatten
 * @return {Array} Returns a one-dimensional array.
 * @extends {Array}
 */
  flatten: function() {
    return this.inject([], function(array, value) {
      return array.concat(value && value.constructor == Array ?
        value.flatten() : [value]);
    });
  },

  /**
  * Returns an array without the specified elements.
  * @alias Array.without
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
  * @alias Array.indexOf
  * @param {Object} object	Element to get the index position of.
  * @return {Number} Returns the index position of the element.
  * @extends {Array}
  */
  indexOf: function(object) {
    for (var i = 0, length = this.length; i < length; i++)
      if (this[i] == object) return i;
    return -1;
  },

  /**
  * Reverses the order of elements in an array.
  * @alias Array.reverse
  * @param {Boolean} inline	If true, indicates that the array itself should be reversed, instead of just creating a copy. Default is true.
  * @return {Array} Returns an array with the order of its elements reversed.
  * @extends {Array}
  */
  reverse: function(inline) {
    return (inline !== false ? this : this.toArray())._reverse();
  },

  /**
   * Reduces arrays: one-element arrays are turned into their unique element, while multiple-element arrays are returned untouched.
   * @alias Array.reduce
   * @return {Array} Returns the reduced array.
   * @extends {Array}
   */
  reduce: function() {
    return this.length > 1 ? this : this[0];
  },

  /**
   * Produces a duplicate-free version of an array. If no duplicates are found, the original array is returned.
   * @alias Array.uniq
   * @param {Object} sorted
   * @return {Array} Produces a duplicate-free version of an array. If no duplicates are found, the original array is returned.
   * @extends {Array}
   */
  uniq: function(sorted) {
    return this.inject([], function(array, value, index) {
      if (0 == index || (sorted ? array.last() != value : !array.include(value)))
        array.push(value);
      return array;
    });
  },

  /**
   * Returns a duplicate of the array, leaving the original array intact.
   * @alias Array.clone
   * @return {Array} Returns a duplicate of the array, leaving the original array intact.
   * @extends {Array}
   */
  clone: function() {
    return [].concat(this);
  },

  /**
   * Returns the size of the array.
   * @alias Array.size
   * @return {Array} Returns the size of the array.
   * @extends {Array}
   */
  size: function() {
    return this.length;
  },

  /**
  * Formats an array into a human-readable string.
  * @alias Array.inspect
  * @return {String} Returns a string version of the array.
  * @extends {Array}
  */
  inspect: function() {
    return '[' + this.map(Object.inspect).join(', ') + ']';
  },

  /**
   * Returns a JSON string.
   * @alias Array.toJSON
   * @return {Array}	Returns a JSON string.
   * @extends {Array}
   */
  toJSON: function() {
    var results = [];
    this.each(function(object) {
      var value = Object.toJSON(object);
      if (value !== undefined) results.push(value);
    });
    return '[' + results.join(', ') + ']';
  }
});

Array.prototype.toArray = Array.prototype.clone;

/**
 * Splits a string into an Array, treating all whitespace as delimiters. Equivalent to Ruby's %w{foo bar} or Perl's qw(foo bar).
 * @alias $w
 * @param {String} string	String to split into an array
 * @return {Array} Returns an array.
 */
function $w(string) {
  string = string.strip();
  return string ? string.split(/\s+/) : [];
}

if (Prototype.Browser.Opera){
  Array.prototype.concat = function() {
    var array = [];
    for (var i = 0, length = this.length; i < length; i++) array.push(this[i]);
    for (var i = 0, length = arguments.length; i < length; i++) {
      if (arguments[i].constructor == Array) {
        for (var j = 0, arrayLength = arguments[i].length; j < arrayLength; j++)
          array.push(arguments[i][j]);
      } else {
        array.push(arguments[i]);
      }
    }
    return array;
  }
}

/**
 * @classDescription Hash can be thought of as an associative array, binding unique keys to values (which are not necessarily unique), though it can not guarantee consistent order its elements when iterating. Because of the nature of JavaScript programming language, every object is in fact a hash; but Hash adds a number of methods that let you enumerate keys and values, iterate over key/value pairs, merge two hashes together, encode the hash into a query string representation, etc.
 */
var Hash = function(object) {
  if (object instanceof Hash) this.merge(object);
  else Object.extend(this, object || {});
};

Object.extend(Hash, {
  toQueryString: function(obj) {
    var parts = [];
    parts.add = arguments.callee.addPair;

    this.prototype._each.call(obj, function(pair) {
      if (!pair.key) return;
      var value = pair.value;

      if (value && typeof value == 'object') {
        if (value.constructor == Array) value.each(function(value) {
          parts.add(pair.key, value);
        });
        return;
      }
      parts.add(pair.key, value);
    });

    return parts.join('&');
  },

  /**
   * Returns a JSON string.
   * @alias Hash.toJSON
   * @param {Object} object	Object to convert to JSON string.
   * @return {Object} Returns a JSON string.
   */
  toJSON: function(object) {
    var results = [];
    this.prototype._each.call(object, function(pair) {
      var value = Object.toJSON(pair.value);
      if (value !== undefined) results.push(pair.key.toJSON() + ': ' + value);
    });
    return '{' + results.join(', ') + '}';
  }
});

Hash.toQueryString.addPair = function(key, value, prefix) {
  key = encodeURIComponent(key);
  if (value === undefined) this.push(key);
  else this.push(key + '=' + (value == null ? '' : encodeURIComponent(value)));
}

Object.extend(Hash.prototype, Enumerable);
Object.extend(Hash.prototype, {
  _each: function(iterator) {
    for (var key in this) {
      var value = this[key];
      if (value && value == Hash.prototype[key]) continue;

      var pair = [key, value];
      pair.key = key;
      pair.value = value;
      iterator(pair);
    }
  },

  /**
   Creates an array of the keys in a hash.
  * @alias Hash.keys
  * @return {Array} Returns an array of keys.
  */
  keys: function() {
    return this.pluck('key');
  },

  /**
  * Creates an array of the values in a hash.
  * @alias Hash.values
  * @return {Array} Returns an array of values.
  */
  values: function() {
    return this.pluck('value');
  },

  /**
  * Merges this hash with the specified hash.
  * @alias Hash.merge()
  * @param {Object} hash	Hash to merge with.
  * @return {Object} Returns the merged hash.
  */
  merge: function(hash) {
    return $H(hash).inject(this, function(mergedHash, pair) {
      mergedHash[pair.key] = pair.value;
      return mergedHash;
    });
  },

  /**
   * Removes keys from a hash and returns their values.
   * @alias Hash.remove
   * @return {Array} Returns an array of values.
   */
  remove: function() {
    var result;
    for(var i = 0, length = arguments.length; i < length; i++) {
      var value = this[arguments[i]];
      if (value !== undefined){
        if (result === undefined) result = value;
        else {
          if (result.constructor != Array) result = [result];
          result.push(value)
        }
      }
      delete this[arguments[i]];
    }
    return result;
  },

  /**
  * Returns the keys and values of a hash formatted into a query string. (e.g. 'key1=value1&key2=value2')
  * @alias Hash.toQueryString
  * @return {String} Returns a query string version of the hash.
  */
  toQueryString: function() {
    return Hash.toQueryString(this);
  },

  /**
  * Formats the hash into a human-readable string of key:value pairs.
  * @alias Hash.inspect
  * @return {String} Returns a string version of the key:value pairs of the hash.
  */
  inspect: function() {
    return '#<Hash:{' + this.map(function(pair) {
      return pair.map(Object.inspect).join(': ');
    }).join(', ') + '}>';
  },

  /**
   * Returns a JSON string.
   * @alias Hash.toJSON
   * @return {String} Returns a JSON string.
   */
  toJSON: function() {
    return Hash.toJSON(this);
  }
});

/**
 * Converts the argument "object" into a hash.
 * @alias $H
 * @param {Object} object	Object to be converted to a hash.
 * @return {Object} Returns a hash object.
 */
function $H(object) {
  if (object instanceof Hash) return object;
  return new Hash(object);
};

// Safari iterates over shadowed properties
if (function() {
  var i = 0, Test = function(value) { this.key = value };
  Test.prototype.key = 'foo';
  for (var property in new Test('bar')) i++;
  return i > 1;
}()) Hash.prototype._each = function(iterator) {
  var cache = [];
  for (var key in this) {
    var value = this[key];
    if ((value && value == Hash.prototype[key]) || cache.include(key)) continue;
    cache.push(key);
    var pair = [key, value];
    pair.key = key;
    pair.value = value;
    iterator(pair);
  }
};
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
    while (this.include(value)) {
      iterator(value);
      value = value.succ();
    }
  },

  /**
  * Checks if the specified value is included in the range.
  * @alias ObjectRange.include
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
 * @alias $R
 * @param {Object} start	Start point of the range.
 * @param {Object} end	End point of the range.
 * @param {Boolean} exclusive	If true, indicates that the start and end points should be excluded from the ObjectRange.
 * @constructor
 * @return {ObjectRange} Returns a new ObjectRange.
 */
var $R = function(start, end, exclusive) {
  return new ObjectRange(start, end, exclusive);
}

/**
 * @classDescription Prototype offers several objects to deal with AJAX communication. With Prototype, going Ajaxy is downright simple! All objects share a common set of options, which are discussed separately.
 */
var Ajax = {
  
 /**
 * Creates a new XMLHttpRequest object.
 * @alias Ajax.getTransport
 * @return {XMLHttpRequest} Returns a new XMLHttpRequest object.
 */
  getTransport: function() {
    return Try.these(
      function() {return new XMLHttpRequest()},
      function() {return new ActiveXObject('Msxml2.XMLHTTP')},
      function() {return new ActiveXObject('Microsoft.XMLHTTP')}
    ) || false;
  },

  activeRequestCount: 0
}

Ajax.Responders = {
  /**
  * Array of objects that are registered for AJAX event notifications.
  * @alias Ajax.responders
  */
  responders: [],

  _each: function(iterator) {
    this.responders._each(iterator);
  },

  /**
  * Calls the methods associated with the responderToAdd object when the corresponding event occurs.
  * @alias Ajax.Responders.register
  * @param {Object} responderToAdd	Object containing the methods to call. Should be named the same as the appropriate AJAX event.
  * @extends {Enumerable}
  */
  register: function(responder) {
    if (!this.include(responder))
      this.responders.push(responder);
  },

  /**
  * Removes the responderToRemove object from the list of registered objects.
  * @alias Ajax.Responders.unregister
  * @param {Object} responderToRemove
  * @extends {Enumerable}
  */
  unregister: function(responder) {
    this.responders = this.responders.without(responder);
  },

  /**
  * For each object in the list, calls the method specified in callback using request, transport, and json as arguments.
  * @alias Ajax.Responders.dispatch
  * @param {Object} callback	Name of the AJAX event.
  * @param {Object} request	Ajax.Request object responsible for the event.
  * @param {Object} transport	XMLHttpRequest object that carries the AJAX call.
  * @param {Object} json	X-JSON header of the response.
  * @extends {Enumerable}
  */
  dispatch: function(callback, request, transport, json) {
    this.each(function(responder) {
      if (typeof responder[callback] == 'function') {
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
  * @alias Ajax.Base.setOptions
  * @param {Object} options	Options to set for the operation.
  */
  setOptions: function(options) {
    this.options = {
      method:       'post',
      asynchronous: true,
      contentType:  'application/x-www-form-urlencoded',
      encoding:     'UTF-8',
      parameters:   ''
    }
    Object.extend(this.options, options || {});

    this.options.method = this.options.method.toLowerCase();
    if (typeof this.options.parameters == 'string')
      this.options.parameters = this.options.parameters.toQueryParams();
  }
}

/**
 * @classDescription Contains properties and methods to compose an AJAX request to send to the server.
 * @constructor
 * @alias Ajax.Request
 */
Ajax.Request = Class.create();

/**
 * List of possible events and statuses associated with an AJAX operation.
 * @extends {Ajax.Base}
 */
Ajax.Request.Events =
  ['Uninitialized', 'Loading', 'Loaded', 'Interactive', 'Complete'];


Ajax.Request.prototype = Object.extend(new Ajax.Base(), {
  _complete: false,

  /**
  * Inititializes a new Ajax request.
  * @alias Ajax.Request.initialize
  * @param {Object} url	URL target for the request.
  * @param {Object} options	Options to set.
  * @extends {Ajax.Base}
  */
  initialize: function(url, options) {
    this.transport = Ajax.getTransport();
    this.setOptions(options);
    this.request(url);
  },

  request: function(url) {
    this.url = url;
    this.method = this.options.method;
    var params = Object.clone(this.options.parameters);

    if (!['get', 'post'].include(this.method)) {
      // simulate other verbs over post
      params['_method'] = this.method;
      this.method = 'post';
    }

    this.parameters = params;

    if (params = Hash.toQueryString(params)) {
      // when GET, append parameters to URL
      if (this.method == 'get')
        this.url += (this.url.include('?') ? '&' : '?') + params;
      else if (/Konqueror|Safari|KHTML/.test(navigator.userAgent))
        params += '&_=';
    }

    try {
      if (this.options.onCreate) this.options.onCreate(this.transport);
      Ajax.Responders.dispatch('onCreate', this, this.transport);

      this.transport.open(this.method.toUpperCase(), this.url,
        this.options.asynchronous);

      if (this.options.asynchronous)
        setTimeout(function() { this.respondToReadyState(1) }.bind(this), 10);

      this.transport.onreadystatechange = this.onStateChange.bind(this);
      this.setRequestHeaders();

      this.body = this.method == 'post' ? (this.options.postBody || params) : null;
      this.transport.send(this.body);

      /* Force Firefox to handle ready state 4 for synchronous requests */
      if (!this.options.asynchronous && this.transport.overrideMimeType)
        this.onStateChange();

    }
    catch (e) {
      this.dispatchException(e);
    }
  },

  onStateChange: function() {
    var readyState = this.transport.readyState;
    if (readyState > 1 && !((readyState == 4) && this._complete))
      this.respondToReadyState(this.transport.readyState);
  },

  setRequestHeaders: function() {
    var headers = {
      'X-Requested-With': 'XMLHttpRequest',
      'X-Prototype-Version': Prototype.Version,
      'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
    };

    if (this.method == 'post') {
      headers['Content-type'] = this.options.contentType +
        (this.options.encoding ? '; charset=' + this.options.encoding : '');

      /* Force "Connection: close" for older Mozilla browsers to work
       * around a bug where XMLHttpRequest sends an incorrect
       * Content-length header. See Mozilla Bugzilla #246651.
       */
      if (this.transport.overrideMimeType &&
          (navigator.userAgent.match(/Gecko\/(\d{4})/) || [0,2005])[1] < 2005)
            headers['Connection'] = 'close';
    }

    // user-defined headers
    if (typeof this.options.requestHeaders == 'object') {
      var extras = this.options.requestHeaders;

      if (typeof extras.push == 'function')
        for (var i = 0, length = extras.length; i < length; i += 2)
          headers[extras[i]] = extras[i+1];
      else
        $H(extras).each(function(pair) { headers[pair.key] = pair.value });
    }

    for (var name in headers)
      this.transport.setRequestHeader(name, headers[name]);
  },

  success: function() {
    return !this.transport.status
        || (this.transport.status >= 200 && this.transport.status < 300);
  },

  respondToReadyState: function(readyState) {
    var state = Ajax.Request.Events[readyState];
    var transport = this.transport, json = this.evalJSON();

    if (state == 'Complete') {
      try {
        this._complete = true;
        (this.options['on' + this.transport.status]
         || this.options['on' + (this.success() ? 'Success' : 'Failure')]
         || Prototype.emptyFunction)(transport, json);
      } catch (e) {
        this.dispatchException(e);
      }

      var contentType = this.getHeader('Content-type');
      if (contentType && contentType.strip().
        match(/^(text|application)\/(x-)?(java|ecma)script(;.*)?$/i))
          this.evalResponse();
    }

    try {
      (this.options['on' + state] || Prototype.emptyFunction)(transport, json);
      Ajax.Responders.dispatch('on' + state, this, transport, json);
    } catch (e) {
      this.dispatchException(e);
    }

    if (state == 'Complete') {
      // avoid memory leak in MSIE: clean up
      this.transport.onreadystatechange = Prototype.emptyFunction;
    }
  },

  getHeader: function(name) {
    try {
      return this.transport.getResponseHeader(name);
    } catch (e) { return null }
  },

  evalJSON: function() {
    try {
      var json = this.getHeader('X-JSON');
      return json ? json.evalJSON() : null;
    } catch (e) { return null }
  },

  evalResponse: function() {
    try {
      return eval((this.transport.responseText || '').unfilterJSON());
    } catch (e) {
      this.dispatchException(e);
    }
  },

  dispatchException: function(exception) {
    (this.options.onException || Prototype.emptyFunction)(this, exception);
    Ajax.Responders.dispatch('onException', this, exception);
  }
});

/**
 * @classDescription	Contains properties and methods to update an HTML element with content from the server.
 * @constructor
 * @alias Ajax.Updater
 */
Ajax.Updater = Class.create();

Object.extend(Object.extend(Ajax.Updater.prototype, Ajax.Request.prototype), {
  initialize: function(container, url, options) {
    this.container = {
      success: (container.success || container),
      failure: (container.failure || (container.success ? null : container))
    }

    this.transport = Ajax.getTransport();
    this.setOptions(options);

    var onComplete = this.options.onComplete || Prototype.emptyFunction;
    this.options.onComplete = (function(transport, param) {
      this.updateContent();
      onComplete(transport, param);
    }).bind(this);

    this.request(url);
  },

  updateContent: function() {
    var receiver = this.container[this.success() ? 'success' : 'failure'];
    var response = this.transport.responseText;

    if (!this.options.evalScripts) response = response.stripScripts();

    if (receiver = $(receiver)) {
      if (this.options.insertion)
        new this.options.insertion(receiver, response);
      else
        receiver.update(response);
    }

    if (this.success()) {
      if (this.onComplete)
        setTimeout(this.onComplete.bind(this), 10);
    }
  }
});

/**
 * @classDescription Periodically performs an AJAX request and updates a container�s contents based on the response text. Offers a mechanism for �decay,� which lets it trigger at widening intervals while the response is unchanged.
 * @alias Ajax.PeriodicalUpdater
 */
Ajax.PeriodicalUpdater = Class.create();
Ajax.PeriodicalUpdater.prototype = Object.extend(new Ajax.Base(), {
  initialize: function(container, url, options) {
    this.setOptions(options);
    this.onComplete = this.options.onComplete;

    this.frequency = (this.options.frequency || 2);
    this.decay = (this.options.decay || 1);

    this.updater = {};
    this.container = container;
    this.url = url;

    this.start();
  },

  start: function() {
    this.options.onComplete = this.updateComplete.bind(this);
    this.onTimerEvent();
  },

  stop: function() {
    this.updater.options.onComplete = undefined;
    clearTimeout(this.timer);
    (this.onComplete || Prototype.emptyFunction).apply(this, arguments);
  },

  updateComplete: function(request) {
    if (this.options.decay) {
      this.decay = (request.responseText == this.lastText ?
        this.decay * this.options.decay : 1);

      this.lastText = request.responseText;
    }
    this.timer = setTimeout(this.onTimerEvent.bind(this),
      this.decay * this.frequency * 1000);
  },

  onTimerEvent: function() {
    this.updater = new Ajax.Updater(this.container, this.url, this.options);
  }
});

/**
 * If provided with a string, returns the element in the document with matching ID; otherwise returns the passed element. Takes in an arbitrary number of arguments. All elements returned by the function are extended with Prototype DOM extensions.
 * @alias $
 * @param {String} element	ID of the element to return
 * @return {HTMLElement} Returns the matching element.
 */
function $(element) {
  if (arguments.length > 1) {
    for (var i = 0, elements = [], length = arguments.length; i < length; i++)
      elements.push($(arguments[i]));
    return elements;
  }
  if (typeof element == 'string')
    element = document.getElementById(element);
  return Element.extend(element);
}

if (Prototype.BrowserFeatures.XPath) {
  document._getElementsByXPath = function(expression, parentElement) {
    var results = [];
    var query = document.evaluate(expression, $(parentElement) || document,
      null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (var i = 0, length = query.snapshotLength; i < length; i++)
      results.push(query.snapshotItem(i));
    return results;
  };

  /**
  * Returns any elements with the specified CSS class name.
  * @alias document.getElementsByClassName()
  * @param {String} className	CSS className corresponding to the elements to retrieve.
  * @param {String} parentElement	id of the parent element that contains the elements to retrieve.
  * @return {Array, Object}	Returns the elements matching the className.
  * @extends {document}
  */
  document.getElementsByClassName = function(className, parentElement) {
    var q = ".//*[contains(concat(' ', @class, ' '), ' " + className + " ')]";
    return document._getElementsByXPath(q, parentElement);
  }

} else document.getElementsByClassName = function(className, parentElement) {
  var children = ($(parentElement) || document.body).getElementsByTagName('*');
  var elements = [], child, pattern = new RegExp("(^|\\s)" + className + "(\\s|$)");
  for (var i = 0, length = children.length; i < length; i++) {
    child = children[i];
    var elementClassName = child.className;
    if (elementClassName.length == 0) continue;
    if (elementClassName == className || elementClassName.match(pattern))
      elements.push(Element.extend(child));
  }
  return elements;
};

/*--------------------------------------------------------------------------*/

if (!window.Element) var Element = {};

Element.extend = function(element) {
  var F = Prototype.BrowserFeatures;
  if (!element || !element.tagName || element.nodeType == 3 ||
   element._extended || F.SpecificElementExtensions || element == window)
    return element;

  var methods = {}, tagName = element.tagName, cache = Element.extend.cache,
   T = Element.Methods.ByTag;

  // extend methods for all tags (Safari doesn't need this)
  if (!F.ElementExtensions) {
    Object.extend(methods, Element.Methods),
    Object.extend(methods, Element.Methods.Simulated);
  }

  // extend methods for specific tags
  if (T[tagName]) Object.extend(methods, T[tagName]);

  for (var property in methods) {
    var value = methods[property];
    if (typeof value == 'function' && !(property in element))
      element[property] = cache.findOrStore(value);
  }

  element._extended = Prototype.emptyFunction;
  return element;
};

Element.extend.cache = {
  findOrStore: function(value) {
    return this[value] = this[value] || function() {
      return value.apply(null, [this].concat($A(arguments)));
    }
  }
};

Element.Methods = {
  
  /**
  * Returns true if the element is visible.
  * @alias Element.Methods.visible
  * @param {Object} element Element to check.
  * @return {Boolean}	Returns true if the element is visible.
  */
  visible: function(element) {
    return $(element).style.display != 'none';
  },

  /**
  * Toggles the visibility of the specified element(s).
  * @alias Element.Methods.toggle
  * @param {Object, String} One or more elements (or ids) to toggle the visibility of.
  */
  toggle: function(element) {
    element = $(element);
    Element[Element.visible(element) ? 'hide' : 'show'](element);
    return element;
  },

  /**
  * Hides the specified element(s) by setting the style.display attribute to "none".
  * @alias Element.hide
  * @param {Object} ... One or more elements to hide.
  */
  hide: function(element) {
    $(element).style.display = 'none';
    return element;
  },

  /**
  * Displays the specified element(s) by setting the style.display attribute to "".
  * @alias Element.show
  * @param {Object} ... One or more elements to display.
  */
  show: function(element) {
    $(element).style.display = '';
    return element;
  },

  /**
  * Removes the element from the document.
  * @alias Element.remove
  * @param {Object} element	Element to remove.
  */
  remove: function(element) {
    element = $(element);
    element.parentNode.removeChild(element);
    return element;
  },

  /**
  * Updates the inner HTML of the element with the specified HTML.
  * @alias Element.update
  * @param {Element} element	Element to update.
  * @param {String} html	HTML to replace the current inner HTMl with.
  */
  update: function(element, html) {
    html = typeof html == 'undefined' ? '' : html.toString();
    $(element).innerHTML = html.stripScripts();
    setTimeout(function() {html.evalScripts()}, 10);
    return element;
  },

  /**
   * Replaces element by the content of the html argument and returns the removed element.
   * @alias Element.replace
   * @param {Element} element	Element to replace
   * @param {String} html	HTML to replace the content with.
   * @return {Element} Returns the replaced element.
   */
  replace: function(element, html) {
    element = $(element);
    html = typeof html == 'undefined' ? '' : html.toString();
    if (element.outerHTML) {
      element.outerHTML = html.stripScripts();
    } else {
      var range = element.ownerDocument.createRange();
      range.selectNodeContents(element);
      element.parentNode.replaceChild(
        range.createContextualFragment(html.stripScripts()), element);
    }
    setTimeout(function() {html.evalScripts()}, 10);
    return element;
  },

  /**
   * Returns the debug-oriented string representation of element.
   * @alias Element.inspect
   * @param {Element} element Element to inspect.
   * @return {String} Returns the debug-oriented string representation of element.
   */
  inspect: function(element) {
    element = $(element);
    var result = '<' + element.tagName.toLowerCase();
    $H({'id': 'id', 'className': 'class'}).each(function(pair) {
      var property = pair.first(), attribute = pair.last();
      var value = (element[property] || '').toString();
      if (value) result += ' ' + attribute + '=' + value.inspect(true);
    });
    return result + '>';
  },

  /**
   * Recursively collects elements whose relationship is specified by property. property has to be a property (a method won't do!) of element that points to a single DOM node.
   * @alias Element.recursivelyCollect
   * @param {Element} element	Element containing the property
   * @param {String} property	Property to match
   * @return {Array}  Returns an array of extended elements.
   */
  recursivelyCollect: function(element, property) {
    element = $(element);
    var elements = [];
    while (element = element[property])
      if (element.nodeType == 1)
        elements.push(Element.extend(element));
    return elements;
  },

  /**
   * Collects all of element's ancestors and returns them as an array of extended elements.
   * @alias Element.ancestors
   * @param {Element} element Element to collect the ancestors of
   * @return {Array} Returns an array of ancestors
   */
  ancestors: function(element) {
    return $(element).recursivelyCollect('parentNode');
  },

  /**
   * Collects all of element's descendants and returns them as an array of extended elements.
   * @alias Element.descendants
   * @param {Element} element	Element to collect descendants of
   * @return {Array} Returns an array of descendants
   */
  descendants: function(element) {
    return $A($(element).getElementsByTagName('*')).each(Element.extend);
  },

  /**
   * Returns the first child that is an element. This is opposed to firstChild DOM property which will return any node (whitespace in most usual cases).
   * @alias Element.firstDescendant
   * @param {Element} element	Element to collect the first descendent of
   * @return {Element} Returns the first child that is an element.
   */
  firstDescendant: function(element) {
    element = $(element).firstChild;
    while (element && element.nodeType != 1) element = element.nextSibling;
    return $(element);
  },

  /**
   * Collects all of the element�s immediate descendants (i.e. children) and returns them as an array of extended elements.
   * @alias Element.immediateDescendants
   * @param {Element} element	Element to return the immediate descendants of
   * @return {Array} Returns an array of immediate descendants
   */
  immediateDescendants: function(element) {
    if (!(element = $(element).firstChild)) return [];
    while (element && element.nodeType != 1) element = element.nextSibling;
    if (element) return [element].concat($(element).nextSiblings());
    return [];
  },

  /**
   * Collects all of element's previous siblings and returns them as an array of extended elements.
   * @alias Element.previousSiblings
   * @param {Element} element Element to return the previous siblings of
   * @return {Array} Returns an array of previous siblings.
   */
  previousSiblings: function(element) {
    return $(element).recursivelyCollect('previousSibling');
  },

  /**
   * Collects all of element's next siblings and returns them as an array of extended elements.
   * @alias Element.nextSiblings
   * @param {Element} element Element to collect the next siblings of
   * @return {Array} Returns an array of next siblings.
   */
  nextSiblings: function(element) {
    return $(element).recursivelyCollect('nextSibling');
  },

  /**
   * Collects all of element's siblings and returns them as an array of extended elements.
   * @alias Element.siblings
   * @param {Element} element	Element to returns the siblings of
   * @return {Array} Returns an array of siblings
   */
  siblings: function(element) {
    element = $(element);
    return element.previousSiblings().reverse().concat(element.nextSiblings());
  },

  /**
   * Checks if the element matches the given CSS selector.
   * @alias Element.match
   * @param {Element} element	Element to match
   * @param {String} selector	CSS selector to match
   * @return {Boolean} Returns true if the element matches the given CSS selector.
   */
  match: function(element, selector) {
    if (typeof selector == 'string')
      selector = new Selector(selector);
    return selector.match($(element));
  },

  /**
   * Returns element's first ancestor (or the index'th ancestor, if index is specified) that matches cssRule. If no cssRule is provided, all ancestors are considered. If no ancestor matches these criteria, undefined is returned.
   * @alias Element.up
   * @param {Element} element	Element to match
   * @param {String} [expression]	cssRule to match
   * @param {Number} [index]	Index of the ancestor, instead of using the first ancestor.
   * @return {Element} Returns the first (or index'th) ancestor of the element.
   */
  up: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return $(element.parentNode);
    var ancestors = element.ancestors();
    return expression ? Selector.findElement(ancestors, expression, index) :
      ancestors[index || 0];
  },

  /**
   * Returns element�s first descendant (or the n-th descendant if index is specified) that matches cssRule. If no cssRule is provided, all descendants are considered. If no descendant matches these criteria, undefined is returned.
   * @alias Element.down
   * @param {Element} element	Element to match
   * @param {String} [expression]	cssRule to match
   * @param {Number} [index]	Index of the descendant, instead of using the first ancestor.
   * @return {Element} Returns the first (or index'th) descendant of the element.
   */
  down: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return element.firstDescendant();
    var descendants = element.descendants();
    return expression ? Selector.findElement(descendants, expression, index) :
      descendants[index || 0];
  },

  /**
   * Returns element's previous sibling (or the index'th one, if index is specified) that matches cssRule. If no cssRule is provided, all previous siblings are considered. If no previous sibling matches these criteria, undefined is returned.
   * @alias Element.previous
   * @param {Element} element	Element to return the previous sibling of
   * @param {String} [expression]	cssRule to match
   * @param {Number} [index]	If used, specifies the index of the previous sibling to use instead of the immediate one.
   * @return {Element} Returns the previous (or specified) sibling.
   */
  previous: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return $(Selector.handlers.previousElementSibling(element));
    var previousSiblings = element.previousSiblings();
    return expression ? Selector.findElement(previousSiblings, expression, index) :
      previousSiblings[index || 0];
  },

  /**
   * Returns element's next sibling (or the index'th one, if index is specified) that matches cssRule. If no cssRule is provided, all next siblings are considered. If no next sibling matches these criteria, undefined is returned.
   * @alias Element.next
   * @param {Element} element	Element to return the next sibling of
   * @param {String} [expression]	cssRule to match
   * @param {Number} [index]	If used, specifies the index of the next sibling to use instead of the immediate one.
   * @return {Element} Returns the next (or specified) sibling.
   */  
  next: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return $(Selector.handlers.nextElementSibling(element));
    var nextSiblings = element.nextSiblings();
    return expression ? Selector.findElement(nextSiblings, expression, index) :
      nextSiblings[index || 0];
  },

  /**
   * Takes an arbitrary number of CSS selectors (strings) and returns a document-order array of extended children of element that match any of them.
   * @alias Element.getElementsBySelector
   * @return {Array} Returns an array of children.
   */
  getElementsBySelector: function() {
    var args = $A(arguments), element = $(args.shift());
    return Selector.findChildElements(element, args);
  },

  /**
   * Fetches all of element's descendants which have a CSS class of className and returns them as an array of extended elements.
   * @alias Element.getElementsByClassName
   * @param {Element} element	Element to return the descendants of
   * @param {String} className	CSS class name
   * @return {Array} Returns an array of extended elements
   * 
   */
  getElementsByClassName: function(element, className) {
    return document.getElementsByClassName(className, element);
  },

  /**
   * Returns the value of element's attribute or null if attribute has not been specified.
   * @alias Element.readAttribute
   * @param {Element} element	Element to read the attribute for
   * @param {String} name		Attribute of the element
   * @return {String} Returns the value of the attribute
   */
  readAttribute: function(element, name) {
    element = $(element);
    if (Prototype.Browser.IE) {
      if (!element.attributes) return null;
      var t = Element._attributeTranslations;
      if (t.values[name]) return t.values[name](element, name);
      if (t.names[name])  name = t.names[name];
      var attribute = element.attributes[name];
      return attribute ? attribute.nodeValue : null;
    }
    return element.getAttribute(name);
  },

  /**
  * Gets the offsetHeight of an element.
  * @alias Element.getHeight
  * @param {Object} element	Element to get the offsetHeight for.
  * @return {Number} Returns the offsetHeight of the element (in pixels).
  */
  getHeight: function(element) {
    return $(element).getDimensions().height;
  },

  /**
   * Finds and returns the computed width of element.
   * @alias Element.getWidth
   * @param {Element} element Element to get the width of
   * @return {Number} Returns the width of the element.
   */
  getWidth: function(element) {
    return $(element).getDimensions().width;
  },

  /**
  * Gets the CSS class names associated with an element.
  * @alias Element.classNames
  * @param {Object} element	Element to get the associated class names for.
  * @return {Object} Returns an Element.ClassNames object representing the class names.
  */
  classNames: function(element) {
    return new Element.ClassNames(element);
  },

  /**
  * Returns true if the element has the specified CSS class name.
  * @alias Element.hasClassName()
  * @param {Object} element	Element to get the class name for.
  * @param {Object} className	Class name to check for.
  * @return {Boolean} Returns true if the element has the specified CSS class name.
  */
  hasClassName: function(element, className) {
    if (!(element = $(element))) return;
    var elementClassName = element.className;
    if (elementClassName.length == 0) return false;
    if (elementClassName == className ||
        elementClassName.match(new RegExp("(^|\\s)" + className + "(\\s|$)")))
      return true;
    return false;
  },

  /**
  * Adds the specified class to the list of class names for the element.
  * @alias Element.addClassName
  * @param {Object, String} element	Element or id to add the class name to.
  * @param {String} className	CSS class name to add.
  */
  addClassName: function(element, className) {
    if (!(element = $(element))) return;
    Element.classNames(element).add(className);
    return element;
  },

  /**
  * Removes the specified CSS class name from the element.
  * @alias Element.removeClassName
  * @param {Object} element	Element to remove the class name from.
  * @param {Object} className	Class name to remove.
  */
  removeClassName: function(element, className) {
    if (!(element = $(element))) return;
    Element.classNames(element).remove(className);
    return element;
  },

  /**
   * Toggles element's CSS className and returns element.
   * @alias Element.toggleClassName
   * @param {Element} element	Element to toggle
   * @param {String} className	CSS class name
   * @return {Element} Returns the element.
   */
  toggleClassName: function(element, className) {
    if (!(element = $(element))) return;
    Element.classNames(element)[element.hasClassName(className) ? 'remove' : 'add'](className);
    return element;
  },

  /**
   * Registers an event handler on element and returns element.
   * @alias Element.observe
   * @return {element} Returns the element.
   */
  observe: function() {
    Event.observe.apply(Event, arguments);
    return $A(arguments).first();
  },

  /**
   * Unregisters handler and returns element.
   * @alias Element.stopObserving
   * @return {Element} Returns the element.
   */
  stopObserving: function() {
    Event.stopObserving.apply(Event, arguments);
    return $A(arguments).first();
  },

  // removes whitespace-only text node children
  
  /**
  * Removes any whitespace from the text of the child nodes of the element.
  * @alias Element.cleanWhitespace
  * @param {Object} element Element to clean the whitespace for.
  * @return {Element} Returns the element.
  */
  cleanWhitespace: function(element) {
    element = $(element);
    var node = element.firstChild;
    while (node) {
      var nextNode = node.nextSibling;
      if (node.nodeType == 3 && !/\S/.test(node.nodeValue))
        element.removeChild(node);
      node = nextNode;
    }
    return element;
  },

 /**
 * Returns true if the element is empty or contains only whitespace.
 * @alias Element.empty
 * @param {Object} element	Element to check.
 * @return {Boolean} Returns true if the element is empty or contains only whitespace.
 */
  empty: function(element) {
    return $(element).innerHTML.blank();
  },

  /**
   * Checks if element is a descendant of ancestor.
   * @alias Element.descendantOf
   * @param {Element} element	Element to check
   * @param {Element} ancestor	Ancestor element to check
   * @return {Boolean} Returns true if element is a descendant of ancestor.
   */
  descendantOf: function(element, ancestor) {
    element = $(element), ancestor = $(ancestor);
    while (element = element.parentNode)
      if (element == ancestor) return true;
    return false;
  },

  /**
  * Scrolls the window to the position of the specified element.
  * @alias Element.scrollTo
  * @param {Object} element	Element to scroll to.
  */
  scrollTo: function(element) {
    element = $(element);
    var pos = Position.cumulativeOffset(element);
    window.scrollTo(pos[0], pos[1]);
    return element;
  },

  /**
  * Gets the value of the specified CSS style attribute for the element.
  * @alias Element.getStyle
  * @param {Object} element	Element to get the style for.
  * @param {String} style	Name of the CSS style.
  * @return {String, Number, Boolean, Array, Object} Returns the value of the CSS style attribute.
  */
  getStyle: function(element, style) {
    element = $(element);
    style = style == 'float' ? 'cssFloat' : style.camelize();
    var value = element.style[style];
    if (!value) {
      var css = document.defaultView.getComputedStyle(element, null);
      value = css ? css[style] : null;
    }
    if (style == 'opacity') return value ? parseFloat(value) : 1.0;
    return value == 'auto' ? null : value;
  },

  /**
   * Returns the value for the opacity of the element.
   * @alias Element.getOpacity
   * @param {Element} element	Element to find the opacity of
   * @return {Number} Returns the opacity value.
   */
  getOpacity: function(element) {
    return $(element).getStyle('opacity');
  },

  /**
  * Sets the value of the specified CSS element.
  * @alias Element.setStyle
  * @param {Object} element	Element to apply the style to.
  * @param {Object} style	Style to apply.
  */
  setStyle: function(element, styles, camelized) {
    element = $(element);
    var elementStyle = element.style;

    for (var property in styles)
      if (property == 'opacity') element.setOpacity(styles[property])
      else
        elementStyle[(property == 'float' || property == 'cssFloat') ?
          (elementStyle.styleFloat === undefined ? 'cssFloat' : 'styleFloat') :
          (camelized ? property : property.camelize())] = styles[property];

    return element;
  },

  /**
   * Sets the opacity value for the element.
   * @alias Element.setOpacity
   * @param {Element} element	Element to set
   * @param {Number} value	Opacity value
   * @return {Element} Returns the element with the new opacity value set.
   */
  setOpacity: function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1 || value === '') ? '' :
      (value < 0.00001) ? 0 : value;
    return element;
  },

  /**
  * Gets the width and height of an element.
  * @alias Element.getDimensions
  * @param {Object} element	Element to get the dimensions for.
  * @return {String} Returns the width and height of the element.
  */
  getDimensions: function(element) {
    element = $(element);
    var display = $(element).getStyle('display');
    if (display != 'none' && display != null) // Safari bug
      return {width: element.offsetWidth, height: element.offsetHeight};

    // All *Width and *Height properties give 0 on elements with display none,
    // so enable the element temporarily
    var els = element.style;
    var originalVisibility = els.visibility;
    var originalPosition = els.position;
    var originalDisplay = els.display;
    els.visibility = 'hidden';
    els.position = 'absolute';
    els.display = 'block';
    var originalWidth = element.clientWidth;
    var originalHeight = element.clientHeight;
    els.display = originalDisplay;
    els.position = originalPosition;
    els.visibility = originalVisibility;
    return {width: originalWidth, height: originalHeight};
  },

  /**
  * Sets the style.position attribute for the element to "relative".
  * @alias Element.makePositioned
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
    return element;
  },

  /**
  * Clears the style.position attribute for the element to "".
  * @alias Element.undoPositioned
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
    return element;
  },

  /**
  * Clips the overflow of the specified element so that it is not visible.
  * @alias Element.makeClipping
  * @param {Object} element	Element to clip the overflow for.
  */
  makeClipping: function(element) {
    element = $(element);
    if (element._overflow) return element;
    element._overflow = element.style.overflow || 'auto';
    if ((Element.getStyle(element, 'overflow') || 'visible') != 'hidden')
      element.style.overflow = 'hidden';
    return element;
  },

  /**
  * Undoes the overflow clipping of the specified element so that it is visible.
  * @alias Element.undoClipping
  * @param {Object} element	Element to display the overflow for.
  */
  undoClipping: function(element) {
    element = $(element);
    if (!element._overflow) return element;
    element.style.overflow = element._overflow == 'auto' ? '' : element._overflow;
    element._overflow = null;
    return element;
  }
};

Object.extend(Element.Methods, {
  childOf: Element.Methods.descendantOf,
  childElements: Element.Methods.immediateDescendants
});

if (Prototype.Browser.Opera) {
  Element.Methods._getStyle = Element.Methods.getStyle;
  Element.Methods.getStyle = function(element, style) {
    switch(style) {
      case 'left':
      case 'top':
      case 'right':
      case 'bottom':
        if (Element._getStyle(element, 'position') == 'static') return null;
      default: return Element._getStyle(element, style);
    }
  };
}
else if (Prototype.Browser.IE) {
  Element.Methods.getStyle = function(element, style) {
    element = $(element);
    style = (style == 'float' || style == 'cssFloat') ? 'styleFloat' : style.camelize();
    var value = element.style[style];
    if (!value && element.currentStyle) value = element.currentStyle[style];

    if (style == 'opacity') {
      if (value = (element.getStyle('filter') || '').match(/alpha\(opacity=(.*)\)/))
        if (value[1]) return parseFloat(value[1]) / 100;
      return 1.0;
    }

    if (value == 'auto') {
      if ((style == 'width' || style == 'height') && (element.getStyle('display') != 'none'))
        return element['offset'+style.capitalize()] + 'px';
      return null;
    }
    return value;
  };

  Element.Methods.setOpacity = function(element, value) {
    element = $(element);
    var filter = element.getStyle('filter'), style = element.style;
    if (value == 1 || value === '') {
      style.filter = filter.replace(/alpha\([^\)]*\)/gi,'');
      return element;
    } else if (value < 0.00001) value = 0;
    style.filter = filter.replace(/alpha\([^\)]*\)/gi, '') +
      'alpha(opacity=' + (value * 100) + ')';
    return element;
  };

  // IE is missing .innerHTML support for TABLE-related elements
  
  /**
   * Replaces the content of element with the provided newContent argument and returns element.
   * @alias Element.Methods.update
   * @param {Element} element	Element to update
   * @param {String} html	New HTML content
   * @return {Element} Returns the updated element.
   */
  Element.Methods.update = function(element, html) {
    element = $(element);
    html = typeof html == 'undefined' ? '' : html.toString();
    var tagName = element.tagName.toUpperCase();
    if (['THEAD','TBODY','TR','TD'].include(tagName)) {
      var div = document.createElement('div');
      switch (tagName) {
        case 'THEAD':
        case 'TBODY':
          div.innerHTML = '<table><tbody>' +  html.stripScripts() + '</tbody></table>';
          depth = 2;
          break;
        case 'TR':
          div.innerHTML = '<table><tbody><tr>' +  html.stripScripts() + '</tr></tbody></table>';
          depth = 3;
          break;
        case 'TD':
          div.innerHTML = '<table><tbody><tr><td>' +  html.stripScripts() + '</td></tr></tbody></table>';
          depth = 4;
      }
      $A(element.childNodes).each(function(node) { element.removeChild(node) });
      depth.times(function() { div = div.firstChild });
      $A(div.childNodes).each(function(node) { element.appendChild(node) });
    } else {
      element.innerHTML = html.stripScripts();
    }
    setTimeout(function() { html.evalScripts() }, 10);
    return element;
  }
}
else if (Prototype.Browser.Gecko) {
  Element.Methods.setOpacity = function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1) ? 0.999999 :
      (value === '') ? '' : (value < 0.00001) ? 0 : value;
    return element;
  };
}

Element._attributeTranslations = {
  names: {
    colspan:   "colSpan",
    rowspan:   "rowSpan",
    valign:    "vAlign",
    datetime:  "dateTime",
    accesskey: "accessKey",
    tabindex:  "tabIndex",
    enctype:   "encType",
    maxlength: "maxLength",
    readonly:  "readOnly",
    longdesc:  "longDesc"
  },
  values: {
    _getAttr: function(element, attribute) {
      return element.getAttribute(attribute, 2);
    },
    _flag: function(element, attribute) {
      return $(element).hasAttribute(attribute) ? attribute : null;
    },
    style: function(element) {
      return element.style.cssText.toLowerCase();
    },
    title: function(element) {
      var node = element.getAttributeNode('title');
      return node.specified ? node.nodeValue : null;
    }
  }
};

(function() {
  Object.extend(this, {
    href: this._getAttr,
    src:  this._getAttr,
    type: this._getAttr,
    disabled: this._flag,
    checked:  this._flag,
    readonly: this._flag,
    multiple: this._flag
  });
}).call(Element._attributeTranslations.values);

Element.Methods.Simulated = {
  hasAttribute: function(element, attribute) {
    var t = Element._attributeTranslations, node;
    attribute = t.names[attribute] || attribute;
    node = $(element).getAttributeNode(attribute);
    return node && node.specified;
  }
};

Element.Methods.ByTag = {};

Object.extend(Element, Element.Methods);

if (!Prototype.BrowserFeatures.ElementExtensions &&
 document.createElement('div').__proto__) {
  window.HTMLElement = {};
  window.HTMLElement.prototype = document.createElement('div').__proto__;
  Prototype.BrowserFeatures.ElementExtensions = true;
}

/**
 * Simulates the standard compliant DOM method hasAttribute for browsers missing it (Internet Explorer 6 and 7).
 * @alias Element.Methods.Simulated.hasAttribute
 * @param {Element} element	Element to check
 * @param {Attribute} attribute Attribute to check for
 * @return {Boolean} Returns true if the element has the specified attribute.
 */
Element.hasAttribute = function(element, attribute) {
  if (element.hasAttribute) return element.hasAttribute(attribute);
  return Element.Methods.Simulated.hasAttribute(element, attribute);
};

Element.addMethods = function(methods) {
  var F = Prototype.BrowserFeatures, T = Element.Methods.ByTag;

  if (!methods) {
    Object.extend(Form, Form.Methods);
    Object.extend(Form.Element, Form.Element.Methods);
    Object.extend(Element.Methods.ByTag, {
      "FORM":     Object.clone(Form.Methods),
      "INPUT":    Object.clone(Form.Element.Methods),
      "SELECT":   Object.clone(Form.Element.Methods),
      "TEXTAREA": Object.clone(Form.Element.Methods)
    });
  }

  if (arguments.length == 2) {
    var tagName = methods;
    methods = arguments[1];
  }

  if (!tagName) Object.extend(Element.Methods, methods || {});
  else {
    if (tagName.constructor == Array) tagName.each(extend);
    else extend(tagName);
  }

  function extend(tagName) {
    tagName = tagName.toUpperCase();
    if (!Element.Methods.ByTag[tagName])
      Element.Methods.ByTag[tagName] = {};
    Object.extend(Element.Methods.ByTag[tagName], methods);
  }

  function copy(methods, destination, onlyIfAbsent) {
    onlyIfAbsent = onlyIfAbsent || false;
    var cache = Element.extend.cache;
    for (var property in methods) {
      var value = methods[property];
      if (!onlyIfAbsent || !(property in destination))
        destination[property] = cache.findOrStore(value);
    }
  }

  function findDOMClass(tagName) {
    var klass;
    var trans = {
      "OPTGROUP": "OptGroup", "TEXTAREA": "TextArea", "P": "Paragraph",
      "FIELDSET": "FieldSet", "UL": "UList", "OL": "OList", "DL": "DList",
      "DIR": "Directory", "H1": "Heading", "H2": "Heading", "H3": "Heading",
      "H4": "Heading", "H5": "Heading", "H6": "Heading", "Q": "Quote",
      "INS": "Mod", "DEL": "Mod", "A": "Anchor", "IMG": "Image", "CAPTION":
      "TableCaption", "COL": "TableCol", "COLGROUP": "TableCol", "THEAD":
      "TableSection", "TFOOT": "TableSection", "TBODY": "TableSection", "TR":
      "TableRow", "TH": "TableCell", "TD": "TableCell", "FRAMESET":
      "FrameSet", "IFRAME": "IFrame"
    };
    if (trans[tagName]) klass = 'HTML' + trans[tagName] + 'Element';
    if (window[klass]) return window[klass];
    klass = 'HTML' + tagName + 'Element';
    if (window[klass]) return window[klass];
    klass = 'HTML' + tagName.capitalize() + 'Element';
    if (window[klass]) return window[klass];

    window[klass] = {};
    window[klass].prototype = document.createElement(tagName).__proto__;
    return window[klass];
  }

  if (F.ElementExtensions) {
    copy(Element.Methods, HTMLElement.prototype);
    copy(Element.Methods.Simulated, HTMLElement.prototype, true);
  }

  if (F.SpecificElementExtensions) {
    for (var tag in Element.Methods.ByTag) {
      var klass = findDOMClass(tag);
      if (typeof klass == "undefined") continue;
      copy(T[tag], klass.prototype);
    }
  }

  Object.extend(Element, Element.Methods);
  delete Element.ByTag;
};

var Toggle = { display: Element.toggle };

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
        var tagName = this.element.tagName.toUpperCase();
        if (['TBODY', 'TR'].include(tagName)) {
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
  * @alias Abstract.Insertion.contentFromAnonymousTable()
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
  * @alias Element.ClassNames.set
  * @param {Object} className	Class name to set.
  * @extends {Enumerable}
  */
  set: function(className) {
    this.element.className = className;
  },

  /**
  * Adds the specified CSS class name to the list of class names associated with the element.
  * @alias Element.ClassNames.add
  * @param {Object} classNameToAdd	Class name to add.
  * @extends {Enumerable}
  */
  add: function(classNameToAdd) {
    if (this.include(classNameToAdd)) return;
    this.set($A(this).concat(classNameToAdd).join(' '));
  },

  /**
  * Removes the specified CSS class name from the list of class names associated with the element.
  * @alias Element.ClassNames.remove
  * @param {Object} classNameToRemove	Class name to remove.
  * @extends {Enumerable}
  */
  remove: function(classNameToRemove) {
    if (!this.include(classNameToRemove)) return;
    this.set($A(this).without(classNameToRemove).join(' '));
  },

  toString: function() {
    return $A(this).join(' ');
  }
};

Object.extend(Element.ClassNames.prototype, Enumerable);
/* Portions of the Selector class are derived from Jack Slocum’s DomQuery,
 * part of YUI-Ext version 0.40, distributed under the terms of an MIT-style
 * license.  Please see http://www.yui-ext.com/ for more information. */

/**
 * @classDescription Class for working with CSS selectors.
 */
var Selector = Class.create();

Selector.prototype = {
  initialize: function(expression) {
    this.expression = expression.strip();
    this.compileMatcher();
  },

  compileMatcher: function() {
    // Selectors with namespaced attributes can't use the XPath version
    if (Prototype.BrowserFeatures.XPath && !(/\[[\w-]*?:/).test(this.expression))
      return this.compileXPathMatcher();

    var e = this.expression, ps = Selector.patterns, h = Selector.handlers,
        c = Selector.criteria, le, p, m;

    if (Selector._cache[e]) {
      this.matcher = Selector._cache[e]; return;
    }
    this.matcher = ["this.matcher = function(root) {",
                    "var r = root, h = Selector.handlers, c = false, n;"];

    while (e && le != e && (/\S/).test(e)) {
      le = e;
      for (var i in ps) {
        p = ps[i];
        if (m = e.match(p)) {
          this.matcher.push(typeof c[i] == 'function' ? c[i](m) :
    	      new Template(c[i]).evaluate(m));
          e = e.replace(m[0], '');
          break;
        }
      }
    }

    this.matcher.push("return h.unique(n);\n}");
    eval(this.matcher.join('\n'));
    Selector._cache[this.expression] = this.matcher;
  },

  compileXPathMatcher: function() {
    var e = this.expression, ps = Selector.patterns,
        x = Selector.xpath, le,  m;

    if (Selector._cache[e]) {
      this.xpath = Selector._cache[e]; return;
    }

    this.matcher = ['.//*'];
    while (e && le != e && (/\S/).test(e)) {
      le = e;
      for (var i in ps) {
        if (m = e.match(ps[i])) {
          this.matcher.push(typeof x[i] == 'function' ? x[i](m) :
            new Template(x[i]).evaluate(m));
          e = e.replace(m[0], '');
          break;
        }
      }
    }

    this.xpath = this.matcher.join('');
    Selector._cache[this.expression] = this.xpath;
  },

  findElements: function(root) {
    root = root || document;
    if (this.xpath) return document._getElementsByXPath(this.xpath, root);
    return this.matcher(root);
  },

  match: function(element) {
    return this.findElements(document).include(element);
  },

  toString: function() {
    return this.expression;
  },

  inspect: function() {
    return "#<Selector:" + this.expression.inspect() + ">";
  }
};

Object.extend(Selector, {
  _cache: {},

  xpath: {
    descendant:   "//*",
    child:        "/*",
    adjacent:     "/following-sibling::*[1]",
    laterSibling: '/following-sibling::*',
    tagName:      function(m) {
      if (m[1] == '*') return '';
      return "[local-name()='" + m[1].toLowerCase() +
             "' or local-name()='" + m[1].toUpperCase() + "']";
    },
    className:    "[contains(concat(' ', @class, ' '), ' #{1} ')]",
    id:           "[@id='#{1}']",
    attrPresence: "[@#{1}]",
    attr: function(m) {
      m[3] = m[5] || m[6];
      return new Template(Selector.xpath.operators[m[2]]).evaluate(m);
    },
    pseudo: function(m) {
      var h = Selector.xpath.pseudos[m[1]];
      if (!h) return '';
      if (typeof h === 'function') return h(m);
      return new Template(Selector.xpath.pseudos[m[1]]).evaluate(m);
    },
    operators: {
      '=':  "[@#{1}='#{3}']",
      '!=': "[@#{1}!='#{3}']",
      '^=': "[starts-with(@#{1}, '#{3}')]",
      '$=': "[substring(@#{1}, (string-length(@#{1}) - string-length('#{3}') + 1))='#{3}']",
      '*=': "[contains(@#{1}, '#{3}')]",
      '~=': "[contains(concat(' ', @#{1}, ' '), ' #{3} ')]",
      '|=': "[contains(concat('-', @#{1}, '-'), '-#{3}-')]"
    },
    pseudos: {
      'first-child': '[not(preceding-sibling::*)]',
      'last-child':  '[not(following-sibling::*)]',
      'only-child':  '[not(preceding-sibling::* or following-sibling::*)]',
      'empty':       "[count(*) = 0 and (count(text()) = 0 or translate(text(), ' \t\r\n', '') = '')]",
      'checked':     "[@checked]",
      'disabled':    "[@disabled]",
      'enabled':     "[not(@disabled)]",
      'not': function(m) {
        var e = m[6], p = Selector.patterns,
            x = Selector.xpath, le, m, v;

        var exclusion = [];
        while (e && le != e && (/\S/).test(e)) {
          le = e;
          for (var i in p) {
            if (m = e.match(p[i])) {
              v = typeof x[i] == 'function' ? x[i](m) : new Template(x[i]).evaluate(m);
              exclusion.push("(" + v.substring(1, v.length - 1) + ")");
              e = e.replace(m[0], '');
              break;
            }
          }
        }
        return "[not(" + exclusion.join(" and ") + ")]";
      },
      'nth-child':      function(m) {
        return Selector.xpath.pseudos.nth("(count(./preceding-sibling::*) + 1) ", m);
      },
      'nth-last-child': function(m) {
        return Selector.xpath.pseudos.nth("(count(./following-sibling::*) + 1) ", m);
      },
      'nth-of-type':    function(m) {
        return Selector.xpath.pseudos.nth("position() ", m);
      },
      'nth-last-of-type': function(m) {
        return Selector.xpath.pseudos.nth("(last() + 1 - position()) ", m);
      },
      'first-of-type':  function(m) {
        m[6] = "1"; return Selector.xpath.pseudos['nth-of-type'](m);
      },
      'last-of-type':   function(m) {
        m[6] = "1"; return Selector.xpath.pseudos['nth-last-of-type'](m);
      },
      'only-of-type':   function(m) {
        var p = Selector.xpath.pseudos; return p['first-of-type'](m) + p['last-of-type'](m);
      },
      nth: function(fragment, m) {
        var mm, formula = m[6], predicate;
        if (formula == 'even') formula = '2n+0';
        if (formula == 'odd')  formula = '2n+1';
        if (mm = formula.match(/^(\d+)$/)) // digit only
          return '[' + fragment + "= " + mm[1] + ']';
        if (mm = formula.match(/^(-?\d*)?n(([+-])(\d+))?/)) { // an+b
          if (mm[1] == "-") mm[1] = -1;
          var a = mm[1] ? Number(mm[1]) : 1;
          var b = mm[2] ? Number(mm[2]) : 0;
          predicate = "[((#{fragment} - #{b}) mod #{a} = 0) and " +
          "((#{fragment} - #{b}) div #{a} >= 0)]";
          return new Template(predicate).evaluate({
            fragment: fragment, a: a, b: b });
        }
      }
    }
  },

  criteria: {
    tagName:      'n = h.tagName(n, r, "#{1}", c);   c = false;',
    className:    'n = h.className(n, r, "#{1}", c); c = false;',
    id:           'n = h.id(n, r, "#{1}", c);        c = false;',
    attrPresence: 'n = h.attrPresence(n, r, "#{1}"); c = false;',
    attr: function(m) {
      m[3] = (m[5] || m[6]);
      return new Template('n = h.attr(n, r, "#{1}", "#{3}", "#{2}"); c = false;').evaluate(m);
    },
    pseudo:       function(m) {
      if (m[6]) m[6] = m[6].replace(/"/g, '\\"');
      return new Template('n = h.pseudo(n, "#{1}", "#{6}", r, c); c = false;').evaluate(m);
    },
    descendant:   'c = "descendant";',
    child:        'c = "child";',
    adjacent:     'c = "adjacent";',
    laterSibling: 'c = "laterSibling";'
  },

  patterns: {
    // combinators must be listed first
    // (and descendant needs to be last combinator)
    laterSibling: /^\s*~\s*/,
    child:        /^\s*>\s*/,
    adjacent:     /^\s*\+\s*/,
    descendant:   /^\s/,

    // selectors follow
    tagName:      /^\s*(\*|[\w\-]+)(\b|$)?/,
    id:           /^#([\w\-\*]+)(\b|$)/,
    className:    /^\.([\w\-\*]+)(\b|$)/,
    pseudo:       /^:((first|last|nth|nth-last|only)(-child|-of-type)|empty|checked|(en|dis)abled|not)(\((.*?)\))?(\b|$|\s|(?=:))/,
    attrPresence: /^\[([\w]+)\]/,
    attr:         /\[((?:[\w-]*:)?[\w-]+)\s*(?:([!^$*~|]?=)\s*((['"])([^\]]*?)\4|([^'"][^\]]*?)))?\]/
  },

  handlers: {
    // UTILITY FUNCTIONS
    // joins two collections
    concat: function(a, b) {
      for (var i = 0, node; node = b[i]; i++)
        a.push(node);
      return a;
    },

    // marks an array of nodes for counting
    mark: function(nodes) {
      for (var i = 0, node; node = nodes[i]; i++)
        node._counted = true;
      return nodes;
    },

    unmark: function(nodes) {
      for (var i = 0, node; node = nodes[i]; i++)
        node._counted = undefined;
      return nodes;
    },

    // mark each child node with its position (for nth calls)
    // "ofType" flag indicates whether we're indexing for nth-of-type
    // rather than nth-child
    index: function(parentNode, reverse, ofType) {
      parentNode._counted = true;
      if (reverse) {
        for (var nodes = parentNode.childNodes, i = nodes.length - 1, j = 1; i >= 0; i--) {
          node = nodes[i];
          if (node.nodeType == 1 && (!ofType || node._counted)) node.nodeIndex = j++;
        }
      } else {
        for (var i = 0, j = 1, nodes = parentNode.childNodes; node = nodes[i]; i++)
          if (node.nodeType == 1 && (!ofType || node._counted)) node.nodeIndex = j++;
      }
    },

    // filters out duplicates and extends all nodes
    unique: function(nodes) {
      if (nodes.length == 0) return nodes;
      var results = [], n;
      for (var i = 0, l = nodes.length; i < l; i++)
        if (!(n = nodes[i])._counted) {
          n._counted = true;
          results.push(Element.extend(n));
        }
      return Selector.handlers.unmark(results);
    },

    // COMBINATOR FUNCTIONS
    descendant: function(nodes) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        h.concat(results, node.getElementsByTagName('*'));
      return results;
    },

    child: function(nodes) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        for (var j = 0, children = [], child; child = node.childNodes[j]; j++)
          if (child.nodeType == 1 && child.tagName != '!') results.push(child);
      }
      return results;
    },

    adjacent: function(nodes) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        var next = this.nextElementSibling(node);
        if (next) results.push(next);
      }
      return results;
    },

    laterSibling: function(nodes) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        h.concat(results, Element.nextSiblings(node));
      return results;
    },

    nextElementSibling: function(node) {
      while (node = node.nextSibling)
	      if (node.nodeType == 1) return node;
      return null;
    },

    previousElementSibling: function(node) {
      while (node = node.previousSibling)
        if (node.nodeType == 1) return node;
      return null;
    },

    // TOKEN FUNCTIONS
    tagName: function(nodes, root, tagName, combinator) {
      tagName = tagName.toUpperCase();
      var results = [], h = Selector.handlers;
      if (nodes) {
        if (combinator) {
          // fastlane for ordinary descendant combinators
          if (combinator == "descendant") {
            for (var i = 0, node; node = nodes[i]; i++)
              h.concat(results, node.getElementsByTagName(tagName));
            return results;
          } else nodes = this[combinator](nodes);
          if (tagName == "*") return nodes;
        }
        for (var i = 0, node; node = nodes[i]; i++)
          if (node.tagName.toUpperCase() == tagName) results.push(node);
        return results;
      } else return root.getElementsByTagName(tagName);
    },

    id: function(nodes, root, id, combinator) {
      var targetNode = $(id), h = Selector.handlers;
      if (!nodes && root == document) return targetNode ? [targetNode] : [];
      if (nodes) {
        if (combinator) {
          if (combinator == 'child') {
            for (var i = 0, node; node = nodes[i]; i++)
              if (targetNode.parentNode == node) return [targetNode];
          } else if (combinator == 'descendant') {
            for (var i = 0, node; node = nodes[i]; i++)
              if (Element.descendantOf(targetNode, node)) return [targetNode];
          } else if (combinator == 'adjacent') {
            for (var i = 0, node; node = nodes[i]; i++)
              if (Selector.handlers.previousElementSibling(targetNode) == node)
                return [targetNode];
          } else nodes = h[combinator](nodes);
        }
        for (var i = 0, node; node = nodes[i]; i++)
          if (node == targetNode) return [targetNode];
        return [];
      }
      return (targetNode && Element.descendantOf(targetNode, root)) ? [targetNode] : [];
    },

    className: function(nodes, root, className, combinator) {
      if (nodes && combinator) nodes = this[combinator](nodes);
      return Selector.handlers.byClassName(nodes, root, className);
    },

    byClassName: function(nodes, root, className) {
      if (!nodes) nodes = Selector.handlers.descendant([root]);
      var needle = ' ' + className + ' ';
      for (var i = 0, results = [], node, nodeClassName; node = nodes[i]; i++) {
        nodeClassName = node.className;
        if (nodeClassName.length == 0) continue;
        if (nodeClassName == className || (' ' + nodeClassName + ' ').include(needle))
          results.push(node);
      }
      return results;
    },

    attrPresence: function(nodes, root, attr) {
      var results = [];
      for (var i = 0, node; node = nodes[i]; i++)
        if (Element.hasAttribute(node, attr)) results.push(node);
      return results;
    },

    attr: function(nodes, root, attr, value, operator) {
      if (!nodes) nodes = root.getElementsByTagName("*");
      var handler = Selector.operators[operator], results = [];
      for (var i = 0, node; node = nodes[i]; i++) {
        var nodeValue = Element.readAttribute(node, attr);
        if (nodeValue === null) continue;
        if (handler(nodeValue, value)) results.push(node);
      }
      return results;
    },

    pseudo: function(nodes, name, value, root, combinator) {
      if (nodes && combinator) nodes = this[combinator](nodes);
      if (!nodes) nodes = root.getElementsByTagName("*");
      return Selector.pseudos[name](nodes, value, root);
    }
  },

  pseudos: {
    'first-child': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        if (Selector.handlers.previousElementSibling(node)) continue;
          results.push(node);
      }
      return results;
    },
    'last-child': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        if (Selector.handlers.nextElementSibling(node)) continue;
          results.push(node);
      }
      return results;
    },
    'only-child': function(nodes, value, root) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (!h.previousElementSibling(node) && !h.nextElementSibling(node))
          results.push(node);
      return results;
    },
    'nth-child':        function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root);
    },
    'nth-last-child':   function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root, true);
    },
    'nth-of-type':      function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root, false, true);
    },
    'nth-last-of-type': function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root, true, true);
    },
    'first-of-type':    function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, "1", root, false, true);
    },
    'last-of-type':     function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, "1", root, true, true);
    },
    'only-of-type':     function(nodes, formula, root) {
      var p = Selector.pseudos;
      return p['last-of-type'](p['first-of-type'](nodes, formula, root), formula, root);
    },

    // handles the an+b logic
    getIndices: function(a, b, total) {
      if (a == 0) return b > 0 ? [b] : [];
      return $R(1, total).inject([], function(memo, i) {
        if (0 == (i - b) % a && (i - b) / a >= 0) memo.push(i);
        return memo;
      });
    },

    // handles nth(-last)-child, nth(-last)-of-type, and (first|last)-of-type
    nth: function(nodes, formula, root, reverse, ofType) {
      if (nodes.length == 0) return [];
      if (formula == 'even') formula = '2n+0';
      if (formula == 'odd')  formula = '2n+1';
      var h = Selector.handlers, results = [], indexed = [], m;
      h.mark(nodes);
      for (var i = 0, node; node = nodes[i]; i++) {
        if (!node.parentNode._counted) {
          h.index(node.parentNode, reverse, ofType);
          indexed.push(node.parentNode);
        }
      }
      if (formula.match(/^\d+$/)) { // just a number
        formula = Number(formula);
        for (var i = 0, node; node = nodes[i]; i++)
          if (node.nodeIndex == formula) results.push(node);
      } else if (m = formula.match(/^(-?\d*)?n(([+-])(\d+))?/)) { // an+b
        if (m[1] == "-") m[1] = -1;
        var a = m[1] ? Number(m[1]) : 1;
        var b = m[2] ? Number(m[2]) : 0;
        var indices = Selector.pseudos.getIndices(a, b, nodes.length);
        for (var i = 0, node, l = indices.length; node = nodes[i]; i++) {
          for (var j = 0; j < l; j++)
            if (node.nodeIndex == indices[j]) results.push(node);
        }
      }
      h.unmark(nodes);
      h.unmark(indexed);
      return results;
    },

    'empty': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        // IE treats comments as element nodes
        if (node.tagName == '!' || (node.firstChild && !node.innerHTML.match(/^\s*$/))) continue;
        results.push(node);
      }
      return results;
    },

    'not': function(nodes, selector, root) {
      var h = Selector.handlers, selectorType, m;
      var exclusions = new Selector(selector).findElements(root);
      h.mark(exclusions);
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (!node._counted) results.push(node);
      h.unmark(exclusions);
      return results;
    },

    'enabled': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (!node.disabled) results.push(node);
      return results;
    },

    'disabled': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (node.disabled) results.push(node);
      return results;
    },

    'checked': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (node.checked) results.push(node);
      return results;
    }
  },

  operators: {
    '=':  function(nv, v) { return nv == v; },
    '!=': function(nv, v) { return nv != v; },
    '^=': function(nv, v) { return nv.startsWith(v); },
    '$=': function(nv, v) { return nv.endsWith(v); },
    '*=': function(nv, v) { return nv.include(v); },
    '~=': function(nv, v) { return (' ' + nv + ' ').include(' ' + v + ' '); },
    '|=': function(nv, v) { return ('-' + nv.toUpperCase() + '-').include('-' + v.toUpperCase() + '-'); }
  },

  matchElements: function(elements, expression) {
    var matches = new Selector(expression).findElements(), h = Selector.handlers;
    h.mark(matches);
    for (var i = 0, results = [], element; element = elements[i]; i++)
      if (element._counted) results.push(element);
    h.unmark(matches);
    return results;
  },

  findElement: function(elements, expression, index) {
    if (typeof expression == 'number') {
      index = expression; expression = false;
    }
    return Selector.matchElements(elements, expression || '*')[index || 0];
  },

  findChildElements: function(element, expressions) {
    var exprs = expressions.join(','), expressions = [];
    exprs.scan(/(([\w#:.~>+()\s-]+|\*|\[.*?\])+)\s*(,|$)/, function(m) {
      expressions.push(m[1].strip());
    });
    var results = [], h = Selector.handlers;
    for (var i = 0, l = expressions.length, selector; i < l; i++) {
      selector = new Selector(expressions[i].strip());
      h.concat(results, selector.findElements(element));
    }
    return (l > 1) ? h.unique(results) : results;
  }
});

/**
 * Takes an arbitrary number of CSS selectors (strings) and returns a document-order array of extended DOM elements that match any of them.
 * @alias $$
 * @return {Array} Returns an array of extended DOM elements.
 */
function $$() {
  return Selector.findChildElements(document, $A(arguments));
}

/**
 * @classDescription Form is a namespace and a module for all things form-related, packed with form manipulation and serialization goodness. While it holds methods dealing with forms as whole, its submodule Form.Element deals with specific form controls.
 */
var Form = {
  reset: function(form) {
    $(form).reset();
    return form;
  },

  /**
   * Serialize an array of form elements to a string suitable for Ajax requests (default behavior) or, if optional getHash evaluates to true, an object hash where keys are form control names and values are data.
   * @alias form.serializeElements
   * @param {Object} elements	Elements to serialize
   * @param {Object} getHash	If true, returns a hash of keys and values
   * @return {Object} Returns the serialized data.
   */
  serializeElements: function(elements, getHash) {
    var data = elements.inject({}, function(result, element) {
      if (!element.disabled && element.name) {
        var key = element.name, value = $(element).getValue();
        if (value != null) {
         	if (key in result) {
            if (result[key].constructor != Array) result[key] = [result[key]];
            result[key].push(value);
          }
          else result[key] = value;
        }
      }
      return result;
    });

    return getHash ? data : Hash.toQueryString(data);
  }
};

Form.Methods = {
  
  /**
   * Form is a namespace and a module for all things form-related, packed with form manipulation and serialization goodness. While it holds methods dealing with forms as whole, its submodule Form.Element deals with specific form controls.
   * @alias Form.Methods.serialize
   * @param {Object} form
   * @param {Object} getHash
   */
  serialize: function(form, getHash) {
    return Form.serializeElements(Form.getElements(form), getHash);
  },

  /**
  * Returns an array of all of the elements in a form.
  * @alias Form.getElements
  * @param {Object} form	Form to return the elements for.
  * @return {Array} Returns an array of all of the elements in a form.
  */
  getElements: function(form) {
    return $A($(form).getElementsByTagName('*')).inject([],
      function(elements, child) {
        if (Form.Element.Serializers[child.tagName.toLowerCase()])
          elements.push(Element.extend(child));
        return elements;
      }
    );
  },

  /**
  * Returns an array of all of the input elements in a form. typeName and name filters are optional.
  * @alias Form.getInput
  * @param {Object} form	Form to return the input elements for.
  * @param {Object} [typeName]	Type of input elements to get.
  * @param {Object} [name]	Name of the input elements to get.
  * @return {Array} Returns an array of all of the input elements in a form.
  */
  getInputs: function(form, typeName, name) {
    form = $(form);
    var inputs = form.getElementsByTagName('input');

    if (!typeName && !name) return $A(inputs).map(Element.extend);

    for (var i = 0, matchingInputs = [], length = inputs.length; i < length; i++) {
      var input = inputs[i];
      if ((typeName && input.type != typeName) || (name && input.name != name))
        continue;
      matchingInputs.push(Element.extend(input));
    }

    return matchingInputs;
  },

  /**
  * Disables all of the input elements on a form.
  * @alias Form.disable
  * @param {Object} form	Form to disable.
  */
  disable: function(form) {
    form = $(form);
    Form.getElements(form).invoke('disable');
    return form;
  },

  /**
  * Enables all of the input elements on a form.
  * @alias Form.enable
  * @param {Object} form	Form to enable.
  */
  enable: function(form) {
    form = $(form);
    Form.getElements(form).invoke('enable');
    return form;
  },

  /**
  * Returns the first enabled field element on a form.
  * @alias Form.findFirstElement
  * @param {Object, String} form	Form to search.
  * @return {HTMLInputElement} Returns the first enabled field element on a form.
  */
  findFirstElement: function(form) {
    return $(form).getElements().find(function(element) {
      return element.type != 'hidden' && !element.disabled &&
        ['input', 'select', 'textarea'].include(element.tagName.toLowerCase());
    });
  },

  /**
  * Activates the first enabled input field on the form.
  * @alias Form.focusFirstElement
  * @param {Object} form	Form to focus on the first element for.
  */
  focusFirstElement: function(form) {
    form = $(form);
    form.findFirstElement().activate();
    return form;
  },

  /**
   * A convenience method for serializing and submitting the form via an Ajax.Request to the URL of the form�s action attribute. The options parameter is passed to the Ajax.Request instance, allowing to override the HTTP method and to specify additional parameters.
   * @alias Form.request
   * @param {Form} form	Form to serialize
   * @param {Object} options	Form options
   * @return {Ajax.Request} Returns the Ajax.Request.
   */
  request: function(form, options) {
    form = $(form), options = Object.clone(options || {});

    var params = options.parameters;
    options.parameters = form.serialize(true);

    if (params) {
      if (typeof params == 'string') params = params.toQueryParams();
      Object.extend(options.parameters, params);
    }

    if (form.hasAttribute('method') && !options.method)
      options.method = form.method;

    return new Ajax.Request(form.readAttribute('action'), options);
  }
}

/*--------------------------------------------------------------------------*/

/**
 * @classDescription Provides methods for working with form elements.
 * @constructor
 */
Form.Element = {
  
  /**
   * Gives keyboard focus to an element.
   * @alias Form.Element.focus
   * @param {Element} element	Element to focus
   * @return {Element} Returns the element
   */
  focus: function(element) {
    $(element).focus();
    return element;
  },

  /**
   * Selects the current text in a text input.
   * @alias Form.Element.select
   * @param {Element} element	Element to select
   * @return {Element} Returns the element
   */
  select: function(element) {
    $(element).select();
    return element;
  }
}

Form.Element.Methods = {
  
  /**
   * Creates an URL-encoded string representation of a form control in the name=value format.
   * @alias Form.Element.serialize
   * @param {Element} element	Element to serialize
   * @return {Object} Returns the serialized data
   */
  serialize: function(element) {
    element = $(element);
    if (!element.disabled && element.name) {
      var value = element.getValue();
      if (value != undefined) {
        var pair = {};
        pair[element.name] = value;
        return Hash.toQueryString(pair);
      }
    }
    return '';
  },

  /**
   * Returns the current value of a form control. A string is returned for most controls; only multiple select boxes return an array of values. The global shortcut for this method is $F().
   * @alias Form.Element.getValue
   * @param {Element} element	Form control to get the value of
   * @return {String, Array} Returns a string or array containing the value(s)
   */
  getValue: function(element) {
    element = $(element);
    var method = element.tagName.toLowerCase();
    return Form.Element.Serializers[method](element);
  },

  /**
   * Clears the contents of a text input.
   * @alias Form.Element.clear
   * @param {Element} element	Element to clear
   * @return {Element} Returns the cleared element.
   */
  clear: function(element) {
    $(element).value = '';
    return element;
  },

  
  /**
   * Returns true if a text input has contents, false otherwise.
   * @alias Form.Element.present
   * @param {Element} element	Element to check
   * @return {Boolean} Returns true if a text input has contents, false otherwise.
   */
   present: function(element) {
    return $(element).value != '';
  },

  /**
   * Gives focus to a form control and selects its contents if it is a text input.
   * @alias Form.Element.activate
   * @param {Element} element	Element to activate
   * @return {Element} Returns the activated element.
   */
  activate: function(element) {
    element = $(element);
    try {
      element.focus();
      if (element.select && (element.tagName.toLowerCase() != 'input' ||
        !['button', 'reset', 'submit'].include(element.type)))
        element.select();
    } catch (e) {}
    return element;
  },

  /**
   * Disables a form control, effectively preventing its value to be changed until it is enabled again.
   * @alias Form.Element.disable
   * @param {Element} element	Element to disable
   * @return {Element} Returns the disbled element.
   */
  disable: function(element) {
    element = $(element);
    element.blur();
    element.disabled = true;
    return element;
  },

  /**
   * Enables a previously disabled form control.
   * @alias Form.Element.enable
   * @param {Object} element
   * @return {Element} Returns the enabled element.
   */
  enable: function(element) {
    element = $(element);
    element.disabled = false;
    return element;
  }
}

/*--------------------------------------------------------------------------*/

/**
 * @classDescription Contains methods for working with input fields in forms.
 */
var Field = Form.Element;

/**
 * Returns the value of a form control. This is a convenience alias of Form.Element.getValue. Refer to it for full details.
 * @alias $F
 * @return {String} Returns the value of the form control.
 */
var $F = Form.Element.Methods.getValue;

/*--------------------------------------------------------------------------*/

/**
 * @classDescription	Provides methods to extract the current value from a form element.
 * @constructor
 */
Form.Element.Serializers = {
  
  /**
  * Returns an array of the text value or checked status of a form element as appropriate to the element type.
  * @alias Form.Element.Serializers.input
  * @param {Object} element	Element object or id to get the value of.
  * @return {Array} Returns the value of the element as an array (e.g. ['elementName', 'elementValue']).
  */
  input: function(element) {
    switch (element.type.toLowerCase()) {
      case 'checkbox':
      case 'radio':
        return Form.Element.Serializers.inputSelector(element);
      default:
        return Form.Element.Serializers.textarea(element);
    }
  },

  /**
  * Returns an array of the name and value of the element (e.g. ['elementName', 'elementValue']).
  * @alias Form.Element.Serializers.inputSelector
  * @param {Object} element	Element object or id to get.
  * @return {Array} Returns an array of the name and value of the element (e.g. ['elementName', 'elementValue']).
  */
  inputSelector: function(element) {
    return element.checked ? element.value : null;
  },

 
  /**
  * Returns an array of the name and value of a textarea element (e.g. ['elementName', 'elementValue']).
  * @alias Form.Element.Serializers.textarea
  * @param {Object} element	Element object or id to get.
  * @return {Array} Returns an array of the name and value of the element (e.g. ['elementName', 'elementValue']).
  */
  textarea: function(element) {
    return element.value;
  },

  /**
  * Returns an array of the names and values of all selected elements (e.g. ['elementName', 'selectedValue1', 'selectedValue2']).
  * @alias Form.Element.Serializers.select
  * @param {Object} element	Element object or id to get.
  * @return {Array} Returns an array of the names and values of all selected elements (e.g. ['elementName', 'selectedValue1', 'selectedValue2']).
  */
  select: function(element) {
    return this[element.type == 'select-one' ?
      'selectOne' : 'selectMany'](element);
  },

  /**
  * Returns an array of the name and value of a single select element (e.g. ['elementName', 'selectedValue']).
  * @alias Form.Element.Serializers.selectOne
  * @param {Object} element	Element object or id to get.
  * @return {Array} Returns an array of the name and value of a single select element (e.g. ['elementName', 'selectedValue']).
  */
  selectOne: function(element) {
    var index = element.selectedIndex;
    return index >= 0 ? this.optionValue(element.options[index]) : null;
  },

  /**
  * Returns an array of the names and values of all selected elements (e.g. ['elementName', 'selectedValue1', 'selectedValue2']).
  * @alias Form.Element.Serializers.selectMany
  * @param {Object} element	Element object or id to get.
  * @return {Array} Returns an array of the names and values of all selected elements (e.g. ['elementName', 'selectedValue1', 'selectedValue2']).
  */
  selectMany: function(element) {
    var values, length = element.length;
    if (!length) return null;

    for (var i = 0, values = []; i < length; i++) {
      var opt = element.options[i];
      if (opt.selected) values.push(this.optionValue(opt));
    }
    return values;
  },

  optionValue: function(opt) {
    // extend element because hasAttribute may not be native
    return Element.extend(opt).hasAttribute('value') ? opt.value : opt.text;
  }
}

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

  registerCallback: function() {
    setInterval(this.onTimerEvent.bind(this), this.frequency * 1000);
  },

  onTimerEvent: function() {
    var value = this.getValue();
    var changed = ('string' == typeof this.lastValue && 'string' == typeof value
      ? this.lastValue != value : String(this.lastValue) != String(value));
    if (changed) {
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

  onElementEvent: function() {
    var value = this.getValue();
    if (this.lastValue != value) {
      this.callback(this.element, value);
      this.lastValue = value;
    }
  },

  registerFormCallbacks: function() {
    Form.getElements(this.element).each(this.registerCallback.bind(this));
  },

  registerCallback: function(element) {
    if (element.type) {
      switch (element.type.toLowerCase()) {
        case 'checkbox':
        case 'radio':
          Event.observe(element, 'click', this.onElementEvent.bind(this));
          break;
        default:
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
  
  /**
  * Gets the value of the element.
  * @return {String, Number} Returns the value of the element.
  */
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
   * Code for the Home key. Constant.
   * @memberOf {Event}
   */
  KEY_HOME:     36,
  
  /**
   * Code for the End key. Constant.
   * @memberOf {Event}
   */
  KEY_END:      35,
  
  /**
   * Code for the Page Up key. Constant.
   * @memberOf {Event}
   */
  KEY_PAGEUP:   33,
  
  /**
   * Code for the Page Down key. Constant.
   * @memberOf {Event}
   */
  KEY_PAGEDOWN: 34,

  /**
  * Gets the element that the event originated with.
  * @alias Event.element
  * @param {Event} event	Event associated with the element.
  * @return {Object} Returns the element that originated the event.
  * @extends {Event}
  */
  element: function(event) {
    return $(event.target || event.srcElement);
  },

  /**
  * Returns true if the event was a left mouse click.
  * @alias Event.isLeftClick
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
  * @alias Event.pointerX
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
  * @alias Event.pointerY
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
  * @alias Event.stop
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
  * @alias Event.findElement
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

  unloadCache: function() {
    if (!Event.observers) return;
    for (var i = 0, length = Event.observers.length; i < length; i++) {
      Event.stopObserving.apply(this, Event.observers[i]);
      Event.observers[i][0] = null;
    }
    Event.observers = false;
  },

  /**
  * Adds an event handler function to an event.
  * @alias Event.observe
  * @param {Object} element	Element object or id to associate with the event handler.
  * @param {String} name	Name of the event.
  * @param {Function} observer	Function to handle the event.
  * @param {Boolean} useCapture	If true, specifies that the handler should handle the event in the capture phase. If false, handles the event in the bubbling phase.
  * @extends {Event}
  */
  observe: function(element, name, observer, useCapture) {
    element = $(element);
    useCapture = useCapture || false;

    if (name == 'keypress' &&
      (Prototype.Browser.WebKit || element.attachEvent))
      name = 'keydown';

    Event._observeAndCache(element, name, observer, useCapture);
  },

  /**
  * Removes an event handler function from an event.
  * @alias Event.observe
  * @param {Object} element	Element object or id to associate with the event handler.
  * @param {String} name	Name of the event.
  * @param {Function} observer	Function to handle the event.
  * @param {Boolean} useCapture	If true, specifies that the handler should handle the event in the capture phase. If false, handles the event in the bubbling phase.
  * @extends {Event}
  */
  stopObserving: function(element, name, observer, useCapture) {
    element = $(element);
    useCapture = useCapture || false;

    if (name == 'keypress' &&
        (Prototype.Browser.WebKit || element.attachEvent))
      name = 'keydown';

    if (element.removeEventListener) {
      element.removeEventListener(name, observer, useCapture);
    } else if (element.detachEvent) {
      try {
        element.detachEvent('on' + name, observer);
      } catch (e) {}
    }
  }
});

/* prevent memory leaks in IE */
if (Prototype.Browser.IE)
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
  * @alias Position.prepare
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
  * @alias Position.realOffset
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
  * @alias Position.cumulativeOffset
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
  * @alias Position.positionedOffset
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
        if(element.tagName=='BODY') break;
        var p = Element.getStyle(element, 'position');
        if (p == 'relative' || p == 'absolute') break;
      }
    } while (element);
    return [valueL, valueT];
  },

  /**
  * Gets the offset of the parent of the element.
  * @alias Position.offsetParent
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
  * @alias Position.within
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
  * @alias Position.within()
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
  * @alias Position.overlap
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

  page: function(forElement) {
    var valueT = 0, valueL = 0;

    var element = forElement;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;

      // Safari fix
      if (element.offsetParent == document.body)
        if (Element.getStyle(element,'position')=='absolute') break;

    } while (element = element.offsetParent);

    element = forElement;
    do {
      if (!window.opera || element.tagName=='BODY') {
        valueT -= element.scrollTop  || 0;
        valueL -= element.scrollLeft || 0;
      }
    } while (element = element.parentNode);

    return [valueL, valueT];
  },

  /**
  * Clones the size and position of the target element to match the source element.
  * @alias Position.clone
  * @param {Object} source
  * @param {Object} target
  */
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
  * @alias Position.absolutize
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
    element.style.top    = top + 'px';
    element.style.left   = left + 'px';
    element.style.width  = width + 'px';
    element.style.height = height + 'px';
  },

  /**
  * Converts the position of an absolutely positioned element to a relatively positioned element.
  * @alias Position.relativize
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
if (Prototype.Browser.WebKit) {
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

Element.addMethods();
