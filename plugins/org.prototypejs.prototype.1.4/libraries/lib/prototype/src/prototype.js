<%= include 'HEADER' %>

/**
 * @classDescription Declares the version of the prototype library.
 */
var Prototype = {

/**
 * Version of the library.
 */  
  Version: '<%= PROTOTYPE_VERSION %>',

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

<%= include 'base.js', 'string.js' %>

<%= include 'enumerable.js', 'array.js', 'hash.js', 'range.js' %>

<%= include 'ajax.js', 'dom.js', 'form.js', 'event.js', 'position.js' %>