// handlebars.element
// ------------------
// v0.2.2
//
// Copyright (c) 2013-2016 Mateus Maso
// Distributed under MIT license
//
// http://github.com/mateusmaso/handlebars.element


(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = require('./handlebars.element/utils');

var _core = require('./handlebars.element/core');

var _store = require('./handlebars.element/store');

var _store2 = _interopRequireDefault(_store);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function HandlebarsElement(Handlebars) {
  (0, _utils.extend)(Handlebars, {
    store: _store2.default,
    elements: _core.elements,
    attributes: _core.attributes,
    registerElement: _core.registerElement,
    registerAttribute: _core.registerAttribute,
    parseValue: _core.parseValue,
    parseHTML: _core.parseHTML
  });

  (0, _utils.extend)(Handlebars.Utils, {
    extend: _utils.extend,
    isObject: _utils.isObject,
    isString: _utils.isString,
    uniqueId: _utils.uniqueId,
    flatten: _utils.flatten,
    camelize: _utils.camelize,
    replaceWith: _utils.replaceWith,
    insertAfter: _utils.insertAfter,
    escapeExpression: _utils.escapeExpression,
    _escapeExpression: Handlebars.Utils.escapeExpression
  });

  return Handlebars;
}

if (typeof window !== "undefined") {
  HandlebarsElement = HandlebarsElement(window.Handlebars);
}

exports.default = HandlebarsElement;

},{"./handlebars.element/core":2,"./handlebars.element/store":3,"./handlebars.element/utils":4}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.attributes = exports.elements = undefined;
exports.registerElement = registerElement;
exports.registerAttribute = registerAttribute;
exports.parseValue = parseValue;
exports.parseHTML = parseHTML;

var _utils = require("./utils");

var _store = require("./store");

var _store2 = _interopRequireDefault(_store);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var elements = exports.elements = {};
var attributes = exports.attributes = {};

function registerElement(name, fn, options) {
  fn.options = options || {};
  elements[name] = fn;
}

function registerAttribute(name, fn, options) {
  fn.options = options || {};
  attributes[name] = fn;
}

function parseValue(value, bool) {
  var object = _store2.default[value];

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

function parseHTML(html) {
  var bindings = [];

  if (html instanceof Handlebars.SafeString) {
    html = html.toString();
  }

  if ((0, _utils.isString)(html)) {
    var div = document.createElement('div');
    div.innerHTML = html.trim();
    var rootNodes = div.childNodes;
  } else {
    var rootNodes = html;
  }

  var nodes = (0, _utils.flatten)(rootNodes);

  while (nodes.length != 0) {
    var nextNodes = [];

    for (var index = 0; index < nodes.length; index++) {
      var binding = { owner: nodes[index], element: undefined, attributes: [] };
      var childNodes = (0, _utils.flatten)(nodes[index].childNodes);

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
        var bindingAttributeFn = attributes[bindingAttributeName];
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
      var bindingElementFn = elements[bindingElementName];

      for (var bIndex = 0; bIndex < bindingElement.attributes.length; bIndex++) {
        var bindingAttribute = bindingElement.attributes.item(bIndex);
        var bindingAttributeName = (0, _utils.camelize)(bindingAttribute.nodeName);
        var bool = bindingElementFn.options.booleans && bindingElementFn.options.booleans.indexOf(bindingAttributeName) >= 0;

        bindingElementAttributes[bindingAttributeName] = parseValue(bindingAttribute.nodeValue, bool);
      }

      var newElement = bindingElementFn.apply(bindingElement, [bindingElementAttributes]);
      (0, _utils.replaceWith)(bindingElement, newElement);

      for (var bIndex = 0; bIndex < bindingAttributes.length; bIndex++) {
        var bindingAttribute = bindingAttributes[bIndex];
        var bindingAttributeName = bindingAttribute.name.replace("hb-", "");
        var bindingAttributeFn = attributes[bindingAttributeName];

        if (bindingAttributeFn.options.ready) {
          bindingAttributeFn.options.ready.apply(bindingAttribute, [newElement]);
        }
      }
    }
  }

  return (0, _utils.flatten)(rootNodes);
};

},{"./store":3,"./utils":4}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hold = hold;
exports.release = release;
exports.keyFor = keyFor;

var _utils = require("./utils");

var store = {};

function hold(key, value) {
  return store[key] = value;
}

function release(key) {
  var value = store[key];
  delete store[key];
  return value;
}

function keyFor(value) {
  for (var key in store) {
    if (store[key] == value) {
      return key;
    }
  }
}

(0, _utils.extend)(store, { hold: hold, release: release, keyFor: keyFor });

exports.default = store;

},{"./utils":4}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extend = extend;
exports.isObject = isObject;
exports.isString = isString;
exports.uniqueId = uniqueId;
exports.flatten = flatten;
exports.camelize = camelize;
exports.replaceWith = replaceWith;
exports.insertAfter = insertAfter;
exports.escapeExpression = escapeExpression;

var _store = require("./store");

var _store2 = _interopRequireDefault(_store);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function extend(object) {
  for (var i = 1; i < arguments.length; i++) {
    for (var key in arguments[i]) {
      if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
        object[key] = arguments[i][key];
      }
    }
  }

  return object;
}

function isObject(object) {
  return object === Object(object);
}

function isString(object) {
  return toString.call(object) == '[object String]';
}

function uniqueId() {
  var generate = function generate(bool) {
    var random = (Math.random().toString(16) + "000000000").substr(2, 8);
    return bool ? "-" + random.substr(0, 4) + "-" + random.substr(4, 4) : random;
  };

  return generate() + generate(true) + generate(true) + generate();
}

function flatten(array, flattenArray) {
  flattenArray = flattenArray || [];

  for (var index = 0; index < array.length; index++) {
    if (Handlebars.Utils.isArray(array[index])) {
      flatten(array[index], flattenArray);
    } else {
      flattenArray.push(array[index]);
    }
  };

  return flattenArray;
}

function camelize(string) {
  return string.trim().replace(/[-_\s]+(.)?/g, function (match, word) {
    return word ? word.toUpperCase() : "";
  });
}

function replaceWith(node, nodes) {
  nodes = Handlebars.Utils.isArray(nodes) ? nodes : [nodes];

  for (var index = 0; index < nodes.length; index++) {
    if (index == 0) {
      node.parentNode.replaceChild(nodes[index], node);
    } else {
      insertAfter(nodes[index - 1], nodes[index]);
    }
  }
}

function insertAfter(node, nodes) {
  nodes = Handlebars.Utils.isArray(nodes) ? nodes.slice() : [nodes];
  nodes.unshift(node);

  for (var index = 1; index < nodes.length; index++) {
    if (nodes[index - 1].nextSibling) {
      nodes[index - 1].parentNode.insertBefore(nodes[index], nodes[index - 1].nextSibling);
    } else {
      nodes[index - 1].parentNode.appendChild(nodes[index]);
    }
  }
}

function escapeExpression(value) {
  if (isObject(value) && !(value instanceof Handlebars.SafeString)) {
    var id = _store2.default.keyFor(value);

    if (id) {
      value = id;
    } else {
      id = uniqueId();
      _store2.default.hold(id, value);
      value = id;
    }
  } else if (value === false) {
    value = value.toString();
  }

  return Handlebars.Utils._escapeExpression(value);
}

},{"./store":3}]},{},[1,2,3,4]);
