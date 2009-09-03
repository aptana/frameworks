
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

