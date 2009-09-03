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
