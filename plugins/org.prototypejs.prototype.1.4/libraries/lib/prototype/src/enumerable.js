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
