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
