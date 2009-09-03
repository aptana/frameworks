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