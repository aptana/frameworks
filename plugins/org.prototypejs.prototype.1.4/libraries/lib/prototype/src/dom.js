
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
