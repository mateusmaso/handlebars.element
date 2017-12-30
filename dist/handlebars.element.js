// handlebars.element
// ------------------
// v0.3.7
//
// Copyright (c) 2013-2017 Mateus Maso
// Distributed under MIT license
//
// 


(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseValue = exports.parseHTML = exports.registerAttribute = exports.registerElement = exports.attributes = exports.elements = exports.store = undefined;

var _store = require('./store');

var _store2 = _interopRequireDefault(_store);

var _parseHTML = require('./parseHTML');

var _parseHTML2 = _interopRequireDefault(_parseHTML);

var _parseValue = require('./parseValue');

var _parseValue2 = _interopRequireDefault(_parseValue);

var _registerElement = require('./registerElement');

var _registerElement2 = _interopRequireDefault(_registerElement);

var _registerAttribute = require('./registerAttribute');

var _registerAttribute2 = _interopRequireDefault(_registerAttribute);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var elements = {};
var attributes = {};

exports.store = _store2.default;
exports.elements = elements;
exports.attributes = attributes;
exports.registerElement = _registerElement2.default;
exports.registerAttribute = _registerAttribute2.default;
exports.parseHTML = _parseHTML2.default;
exports.parseValue = _parseValue2.default;

},{"./parseHTML":2,"./parseValue":3,"./registerAttribute":4,"./registerElement":5,"./store":6}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseHTML;
function parseHTML(html) {
  var _Utils = this.Utils,
      isString = _Utils.isString,
      flatten = _Utils.flatten,
      camelize = _Utils.camelize,
      replaceWith = _Utils.replaceWith;

  var bindings = [];

  if (html instanceof this.SafeString) {
    html = html.toString();
  }

  if (isString(html)) {
    var div = document.createElement('div');
    div.innerHTML = html.trim();
    var rootNodes = div.childNodes;
  } else {
    var rootNodes = html;
  }

  var nodes = flatten(rootNodes);

  while (nodes.length != 0) {
    var nextNodes = [];

    for (var index = 0; index < nodes.length; index++) {
      var binding = { owner: nodes[index], element: undefined, attributes: [] };
      var childNodes = flatten(nodes[index].childNodes);

      for (var bIndex = 0; bIndex < childNodes.length; bIndex++) {
        nextNodes.push(childNodes[bIndex]);
      }

      if (nodes[index].attributes) {
        for (var bIndex = 0; bIndex < nodes[index].attributes.length; bIndex++) {
          if (/hb-/i.test(nodes[index].attributes[bIndex].name)) {
            binding.attributes.push(nodes[index].attributes[bIndex]);
          }
        }
      }

      if (/^hb-/i.test(nodes[index].nodeName)) {
        binding.element = nodes[index];
      }

      if (binding.element || binding.attributes.length > 0) {
        bindings.unshift(binding);
      }
    }

    nodes = nextNodes;
  }

  for (var index = 0; index < bindings.length; index++) {
    var bindingOwner = bindings[index].owner;
    var bindingElement = bindings[index].element;
    var bindingAttributes = bindings[index].attributes;

    if (bindingAttributes.length > 0) {
      for (var bIndex = 0; bIndex < bindingAttributes.length; bIndex++) {
        var bindingAttribute = bindingAttributes[bIndex];
        var bindingAttributeName = bindingAttribute.name.replace("hb-", "");
        var bindingAttributeFn = this.attributes[bindingAttributeName];
        var newAttribute = bindingAttributeFn.apply(bindingAttribute, [bindingOwner]);

        if (newAttribute) {
          bindingOwner.setAttributeNode(newAttribute);
        }

        bindingOwner.removeAttributeNode(bindingAttribute);

        if (bindingAttributeFn.options.ready && !/hb-/i.test(bindingOwner.tagName.toLowerCase())) {
          bindingAttributeFn.options.ready.apply(bindingAttribute, [bindingOwner]);
        }
      }
    }

    if (bindingElement) {
      var bindingElementAttributes = {};
      var bindingElementName = bindingElement.tagName.toLowerCase().replace("hb-", "");
      var bindingElementFn = this.elements[bindingElementName];

      for (var bIndex = 0; bIndex < bindingElement.attributes.length; bIndex++) {
        var bindingAttribute = bindingElement.attributes.item(bIndex);
        var bindingAttributeName = camelize(bindingAttribute.nodeName);
        var bool = bindingElementFn.options.booleans && bindingElementFn.options.booleans.indexOf(bindingAttributeName) >= 0;

        bindingElementAttributes[bindingAttributeName] = this.parseValue(bindingAttribute.nodeValue, bool);
      }

      var newElement = bindingElementFn.apply(bindingElement, [bindingElementAttributes]);
      replaceWith(bindingElement, newElement);

      for (var bIndex = 0; bIndex < bindingAttributes.length; bIndex++) {
        var bindingAttribute = bindingAttributes[bIndex];
        var bindingAttributeName = bindingAttribute.name.replace("hb-", "");
        var bindingAttributeFn = this.attributes[bindingAttributeName];

        if (bindingAttributeFn.options.ready) {
          bindingAttributeFn.options.ready.apply(bindingAttribute, [newElement]);
        }
      }
    }
  }

  return flatten(rootNodes);
};

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseValue;
function parseValue(value, bool) {
  var object = this.store[value];

  if (object) {
    value = object;
  } else if (value == "true") {
    value = true;
  } else if (value == "false") {
    value = false;
  } else if (value == "null") {
    value = undefined;
  } else if (value == "undefined") {
    value = undefined;
  } else if (!isNaN(value) && value != "") {
    value = parseFloat(value);
  }

  return bool ? value || value === "" ? true : false : value === "" ? undefined : value;
}

},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = registerAttribute;
function registerAttribute(name, fn, options) {
  fn.options = options || {};
  this.attributes[name] = fn;
}

},{}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = registerElement;
function registerElement(name, fn, options) {
  fn.options = options || {};
  this.elements[name] = fn;
}

},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var store = {};

function hold(key, value) {
  return this[key] = value;
}

function release(key) {
  var value = this[key];
  delete this[key];
  return value;
}

function keyFor(value) {
  for (var key in this) {
    if (this[key] == value) {
      return key;
    }
  }
}

_extends(store, { hold: hold, release: release, keyFor: keyFor });

exports.default = store;

},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = HandlebarsElement;

var _utils = require('./utils');

var _core = require('./core');

function bindAll(object, parent) {
  Object.keys(object).forEach(function (key) {
    if (typeof object[key] === "function") {
      object[key] = object[key].bind(parent);
    }
  });

  return object;
};

function wrapEscapeExpression(Handlebars) {
  return {
    _escapeExpression: Handlebars.Utils.escapeExpression,
    escapeExpression: function escapeExpression(value) {
      return _utils.escapeExpression.apply(Handlebars.Utils, [value, _core.store, Handlebars.SafeString]);
    }
  };
};

function HandlebarsElement(Handlebars) {
  _extends(Handlebars, bindAll({
    store: _core.store,
    elements: _core.elements,
    attributes: _core.attributes,
    registerElement: _core.registerElement,
    registerAttribute: _core.registerAttribute,
    parseValue: _core.parseValue,
    parseHTML: _core.parseHTML
  }, Handlebars));

  _extends(Handlebars.Utils, bindAll(_extends({
    isObject: _utils.isObject,
    isString: _utils.isString,
    uniqueId: _utils.uniqueId,
    flatten: _utils.flatten,
    camelize: _utils.camelize,
    replaceWith: _utils.replaceWith,
    insertAfter: _utils.insertAfter
  }, wrapEscapeExpression(Handlebars)), Handlebars.Utils));

  return Handlebars;
}

if (typeof window !== "undefined" && window.Handlebars) {
  HandlebarsElement(window.Handlebars);
}

},{"./core":1,"./utils":11}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = camelize;
function camelize(string) {
  return string.trim().replace(/[-_\s]+(.)?/g, function (match, word) {
    return word ? word.toUpperCase() : "";
  });
}

},{}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = escapeExpression;
function escapeExpression(value, store, SafeString) {
  if (this.isObject(value) && !(value instanceof SafeString)) {
    var id = store.keyFor(value);

    if (id) {
      value = id;
    } else {
      id = this.uniqueId();
      store.hold(id, value);
      value = id;
    }
  } else if (value === false) {
    value = value.toString();
  }

  return this._escapeExpression(value);
}

},{}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = flatten;
function flatten(array, flattenArray) {
  flattenArray = flattenArray || [];

  for (var index = 0; index < array.length; index++) {
    if (this.isArray(array[index])) {
      this.flatten(array[index], flattenArray);
    } else {
      flattenArray.push(array[index]);
    }
  };

  return flattenArray;
}

},{}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.escapeExpression = exports.insertAfter = exports.replaceWith = exports.camelize = exports.flatten = exports.uniqueId = exports.isString = exports.isObject = undefined;

var _isObject = require('./isObject');

var _isObject2 = _interopRequireDefault(_isObject);

var _isString = require('./isString');

var _isString2 = _interopRequireDefault(_isString);

var _uniqueId = require('./uniqueId');

var _uniqueId2 = _interopRequireDefault(_uniqueId);

var _flatten = require('./flatten');

var _flatten2 = _interopRequireDefault(_flatten);

var _camelize = require('./camelize');

var _camelize2 = _interopRequireDefault(_camelize);

var _replaceWith = require('./replaceWith');

var _replaceWith2 = _interopRequireDefault(_replaceWith);

var _insertAfter = require('./insertAfter');

var _insertAfter2 = _interopRequireDefault(_insertAfter);

var _escapeExpression = require('./escapeExpression');

var _escapeExpression2 = _interopRequireDefault(_escapeExpression);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.isObject = _isObject2.default;
exports.isString = _isString2.default;
exports.uniqueId = _uniqueId2.default;
exports.flatten = _flatten2.default;
exports.camelize = _camelize2.default;
exports.replaceWith = _replaceWith2.default;
exports.insertAfter = _insertAfter2.default;
exports.escapeExpression = _escapeExpression2.default;

},{"./camelize":8,"./escapeExpression":9,"./flatten":10,"./insertAfter":12,"./isObject":13,"./isString":14,"./replaceWith":15,"./uniqueId":16}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = insertAfter;
function insertAfter(node, nodes) {
  nodes = this.isArray(nodes) ? nodes.slice() : [nodes];
  nodes.unshift(node);

  for (var index = 1; index < nodes.length; index++) {
    if (nodes[index - 1].nextSibling) {
      nodes[index - 1].parentNode.insertBefore(nodes[index], nodes[index - 1].nextSibling);
    } else {
      nodes[index - 1].parentNode.appendChild(nodes[index]);
    }
  }
}

},{}],13:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = isObject;
function isObject(object) {
  return object === Object(object);
}

},{}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = isString;
function isString(object) {
  return typeof object === 'string' || object instanceof String;
}

},{}],15:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = replaceWith;
function replaceWith(node, nodes) {
  nodes = this.isArray(nodes) ? nodes : [nodes];

  for (var index = 0; index < nodes.length; index++) {
    if (index == 0) {
      node.parentNode.replaceChild(nodes[index], node);
    } else {
      this.insertAfter(nodes[index - 1], nodes[index]);
    }
  }
}

},{}],16:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = uniqueId;
function uniqueId() {
  var generate = function generate(bool) {
    var random = (Math.random().toString(16) + "000000000").substr(2, 8);
    return bool ? "-" + random.substr(0, 4) + "-" + random.substr(4, 4) : random;
  };

  return generate() + generate(true) + generate(true) + generate();
}

},{}]},{},[7]);
