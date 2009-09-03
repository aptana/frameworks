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
