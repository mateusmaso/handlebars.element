// handlebars.element
// ------------------
// v0.4.0
//
// Copyright (c) 2013-2018 Mateus Maso
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
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseHTML;

var _simpleDom = require('simple-dom');

var _simpleHtmlTokenizer = require('simple-html-tokenizer');

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
    var parser = new _simpleDom.HTMLParser(_simpleHtmlTokenizer.tokenize, document, _simpleDom.voidMap);
    var fragment = parser.parse(html.trim());
    var rootNodes = fragment.childNodes;
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

},{"simple-dom":17,"simple-html-tokenizer":18}],3:[function(require,module,exports){
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

function extendEscapeExpression(Handlebars) {
  var _escapeExpression;

  if (Handlebars.Utils._escapeExpression) {
    _escapeExpression = Handlebars.Utils._escapeExpression;
  } else {
    _escapeExpression = Handlebars.Utils.escapeExpression;
  }

  return {
    _escapeExpression: _escapeExpression,
    escapeExpression: function escapeExpression(value) {
      return _utils.escapeExpression.apply(Handlebars.Utils, [value, Handlebars.store]);
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
  }, extendEscapeExpression(Handlebars)), Handlebars.Utils));

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
function escapeExpression(value, store) {
  if (this.isObject(value) && !value.toHTML) {
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

},{}],17:[function(require,module,exports){
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.SimpleDOM = {})));
}(this, (function (exports) { 'use strict';

var Node = function Node(nodeType, nodeName, nodeValue) {
    this.nodeType = nodeType;
    this.nodeName = nodeName;
    this.nodeValue = nodeValue;
    this.parentNode = null;
    this.previousSibling = null;
    this.nextSibling = null;
    this.firstChild = null;
    this.lastChild = null;
    this._childNodes = undefined;
};

var prototypeAccessors = { childNodes: { configurable: true } };
prototypeAccessors.childNodes.get = function () {
    var children = this._childNodes;
    if (children === undefined) {
        children = this._childNodes = new ChildNodes(this);
    }
    return children;
};
Node.prototype.cloneNode = function cloneNode (deep) {
    var node = this._cloneNode();
    if (deep === true) {
        var child = this.firstChild;
        var nextChild = child;
        while (child !== null) {
            nextChild = child.nextSibling;
            node.appendChild(child.cloneNode(true));
            child = nextChild;
        }
    }
    return node;
};
Node.prototype.appendChild = function appendChild (newChild) {
    if (newChild.nodeType === 11 /* DOCUMENT_FRAGMENT_NODE */) {
        insertFragment(newChild, this, this.lastChild, null);
        return newChild;
    }
    if (newChild.parentNode) {
        newChild.parentNode.removeChild(newChild);
    }
    newChild.parentNode = this;
    var refNode = this.lastChild;
    if (refNode === null) {
        this.firstChild = newChild;
        this.lastChild = newChild;
    }
    else {
        newChild.previousSibling = refNode;
        refNode.nextSibling = newChild;
        this.lastChild = newChild;
    }
    return newChild;
};
Node.prototype.insertBefore = function insertBefore (newChild, refChild) {
    if (refChild == null) {
        return this.appendChild(newChild);
    }
    if (newChild.nodeType === 11 /* DOCUMENT_FRAGMENT_NODE */) {
        insertFragment(newChild, this, refChild ? refChild.previousSibling : null, refChild);
        return newChild;
    }
    if (newChild.parentNode) {
        newChild.parentNode.removeChild(newChild);
    }
    newChild.parentNode = this;
    var previousSibling = refChild.previousSibling;
    if (previousSibling) {
        previousSibling.nextSibling = newChild;
        newChild.previousSibling = previousSibling;
    }
    else {
        newChild.previousSibling = null;
    }
    refChild.previousSibling = newChild;
    newChild.nextSibling = refChild;
    if (this.firstChild === refChild) {
        this.firstChild = newChild;
    }
    return newChild;
};
Node.prototype.removeChild = function removeChild (oldChild) {
    if (this.firstChild === oldChild) {
        this.firstChild = oldChild.nextSibling;
    }
    if (this.lastChild === oldChild) {
        this.lastChild = oldChild.previousSibling;
    }
    if (oldChild.previousSibling) {
        oldChild.previousSibling.nextSibling = oldChild.nextSibling;
    }
    if (oldChild.nextSibling) {
        oldChild.nextSibling.previousSibling = oldChild.previousSibling;
    }
    oldChild.parentNode = null;
    oldChild.nextSibling = null;
    oldChild.previousSibling = null;
    return oldChild;
};
Node.prototype._cloneNode = function _cloneNode () {
    return new Node(this.nodeType, this.nodeName, this.nodeValue);
};

Object.defineProperties( Node.prototype, prototypeAccessors );

Node.ELEMENT_NODE = 1 /* ELEMENT_NODE */;
Node.TEXT_NODE = 3 /* TEXT_NODE */;
Node.COMMENT_NODE = 8 /* COMMENT_NODE */;
Node.DOCUMENT_NODE = 9 /* DOCUMENT_NODE */;
Node.DOCUMENT_FRAGMENT_NODE = 11 /* DOCUMENT_FRAGMENT_NODE */;
function insertFragment(fragment, newParent, before, after) {
    if (!fragment.firstChild) {
        return;
    }
    var firstChild = fragment.firstChild;
    var lastChild = firstChild;
    var node = firstChild;
    firstChild.previousSibling = before;
    if (before) {
        before.nextSibling = firstChild;
    }
    else {
        newParent.firstChild = firstChild;
    }
    while (node) {
        node.parentNode = newParent;
        lastChild = node;
        node = node.nextSibling;
    }
    lastChild.nextSibling = after;
    if (after) {
        after.previousSibling = lastChild;
    }
    else {
        newParent.lastChild = lastChild;
    }
}
var ChildNodes = function ChildNodes(node) {
    this.node = node;
};
ChildNodes.prototype.item = function item (index) {
    var child = this.node.firstChild;
    for (var i = 0; child && index !== i; i++) {
        child = child.nextSibling;
    }
    return child;
};

var Element = (function (Node$$1) {
    function Element(tagName) {
        Node$$1.call(this, 1 /* ELEMENT_NODE */, tagName.toUpperCase(), null);
        this.attributes = [];
    }

    if ( Node$$1 ) Element.__proto__ = Node$$1;
    Element.prototype = Object.create( Node$$1 && Node$$1.prototype );
    Element.prototype.constructor = Element;

    var prototypeAccessors = { tagName: { configurable: true } };
    prototypeAccessors.tagName.get = function () {
        return this.nodeName;
    };
    Element.prototype.getAttribute = function getAttribute (name) {
        var attributes = this.attributes;
        var n = name.toLowerCase();
        var attr;
        for (var i = 0, l = attributes.length; i < l; i++) {
            attr = attributes[i];
            if (attr.name === n) {
                return attr.value;
            }
        }
        return null;
    };
    Element.prototype.setAttribute = function setAttribute (name, value) {
        var attributes = this.attributes;
        var n = name.toLowerCase();
        var v;
        if (typeof value === 'string') {
            v = value;
        }
        else {
            v = '' + value;
        }
        var attr;
        for (var i = 0, l = attributes.length; i < l; i++) {
            attr = attributes[i];
            if (attr.name === n) {
                attr.value = v;
                return;
            }
        }
        attributes.push({
            name: n,
            specified: true,
            value: v,
        });
    };
    Element.prototype.removeAttribute = function removeAttribute (name) {
        var n = name.toLowerCase();
        var attributes = this.attributes;
        for (var i = 0, l = attributes.length; i < l; i++) {
            var attr = attributes[i];
            if (attr.name === n) {
                attributes.splice(i, 1);
                return;
            }
        }
    };
    Element.prototype._cloneNode = function _cloneNode () {
        var this$1 = this;

        var node = new Element(this.tagName);
        var attrs = node.attributes = [];
        for (var i = 0, list = this$1.attributes; i < list.length; i += 1) {
            var attr = list[i];

            attrs.push({ name: attr.name, specified: attr.specified, value: attr.value });
        }
        return node;
    };

    Object.defineProperties( Element.prototype, prototypeAccessors );

    return Element;
}(Node));

var DocumentFragment = (function (Node$$1) {
    function DocumentFragment() {
        Node$$1.call(this, 11 /* DOCUMENT_FRAGMENT_NODE */, '#document-fragment', null);
    }

    if ( Node$$1 ) DocumentFragment.__proto__ = Node$$1;
    DocumentFragment.prototype = Object.create( Node$$1 && Node$$1.prototype );
    DocumentFragment.prototype.constructor = DocumentFragment;
    DocumentFragment.prototype._cloneNode = function _cloneNode () {
        return new DocumentFragment();
    };

    return DocumentFragment;
}(Node));

var Comment = (function (Node$$1) {
    function Comment(text) {
        Node$$1.call(this, 8 /* COMMENT_NODE */, '#comment', text);
    }

    if ( Node$$1 ) Comment.__proto__ = Node$$1;
    Comment.prototype = Object.create( Node$$1 && Node$$1.prototype );
    Comment.prototype.constructor = Comment;
    Comment.prototype._cloneNode = function _cloneNode () {
        return new Comment(this.nodeValue);
    };

    return Comment;
}(Node));

var RawHTMLSection = (function (Node$$1) {
    function RawHTMLSection(text) {
        Node$$1.call(this, -1 /* RAW */, '#raw-html-section', text);
    }

    if ( Node$$1 ) RawHTMLSection.__proto__ = Node$$1;
    RawHTMLSection.prototype = Object.create( Node$$1 && Node$$1.prototype );
    RawHTMLSection.prototype.constructor = RawHTMLSection;

    return RawHTMLSection;
}(Node));

var Text = (function (Node$$1) {
    function Text(text) {
        Node$$1.call(this, 3 /* TEXT_NODE */, '#text', text);
    }

    if ( Node$$1 ) Text.__proto__ = Node$$1;
    Text.prototype = Object.create( Node$$1 && Node$$1.prototype );
    Text.prototype.constructor = Text;
    Text.prototype._cloneNode = function _cloneNode () {
        return new Text(this.nodeValue);
    };

    return Text;
}(Node));

var Document = (function (Node$$1) {
    function Document() {
        Node$$1.call(this, 9 /* DOCUMENT_NODE */, '#document', null);
        this.documentElement = new Element('html');
        this.head = new Element('head');
        this.body = new Element('body');
        this.documentElement.appendChild(this.head);
        this.documentElement.appendChild(this.body);
        this.appendChild(this.documentElement);
    }

    if ( Node$$1 ) Document.__proto__ = Node$$1;
    Document.prototype = Object.create( Node$$1 && Node$$1.prototype );
    Document.prototype.constructor = Document;
    Document.prototype.createElement = function createElement (tagName) {
        return new Element(tagName);
    };
    Document.prototype.createTextNode = function createTextNode (text) {
        return new Text(text);
    };
    Document.prototype.createComment = function createComment (text) {
        return new Comment(text);
    };
    Document.prototype.createRawHTMLSection = function createRawHTMLSection (text) {
        return new RawHTMLSection(text);
    };
    Document.prototype.createDocumentFragment = function createDocumentFragment () {
        return new DocumentFragment();
    };

    return Document;
}(Node));

var HTMLParser = function HTMLParser(tokenize, document, voidMap) {
    this.tokenize = tokenize;
    this.document = document;
    this.voidMap = voidMap;
    this.tokenize = tokenize;
    this.document = document;
    this.voidMap = voidMap;
    this.parentStack = [];
};
HTMLParser.prototype.isVoid = function isVoid (element) {
    return this.voidMap[element.nodeName] === true;
};
HTMLParser.prototype.pushElement = function pushElement (token) {
    var el = this.document.createElement(token.tagName);
    for (var i = 0, list = token.attributes; i < list.length; i += 1) {
        var attr = list[i];

            el.setAttribute(attr[0], attr[1]);
    }
    if (this.isVoid(el)) {
        return this.appendChild(el);
    }
    this.parentStack.push(el);
};
HTMLParser.prototype.popElement = function popElement (token) {
    var el = this.parentStack.pop();
    if (el.nodeName !== token.tagName.toUpperCase()) {
        throw new Error('unbalanced tag');
    }
    this.appendChild(el);
};
HTMLParser.prototype.appendText = function appendText (token) {
    this.appendChild(this.document.createTextNode(token.chars));
};
HTMLParser.prototype.appendComment = function appendComment (token) {
    this.appendChild(this.document.createComment(token.chars));
};
HTMLParser.prototype.appendChild = function appendChild (node) {
    var parentNode = this.parentStack[this.parentStack.length - 1];
    parentNode.appendChild(node);
};
HTMLParser.prototype.parse = function parse (html) {
        var this$1 = this;

    var fragment = this.document.createDocumentFragment();
    this.parentStack.push(fragment);
    var tokens = this.tokenize(html);
    for (var i = 0, l = tokens.length; i < l; i++) {
        var token = tokens[i];
        switch (token.type) {
            case 'StartTag':
                this$1.pushElement(token);
                break;
            case 'EndTag':
                this$1.popElement(token);
                break;
            case 'Chars':
                this$1.appendText(token);
                break;
            case 'Comment':
                this$1.appendComment(token);
                break;
        }
    }
    return this.parentStack.pop();
};

var ESC = {
    '"': '&quot;',
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
};
function matcher(char) {
    if (ESC[char] === undefined) {
        return char;
    }
    return ESC[char];
}
var HTMLSerializer = function HTMLSerializer(voidMap) {
    this.voidMap = voidMap;
};
HTMLSerializer.prototype.openTag = function openTag (element) {
    return '<' + element.nodeName.toLowerCase() + this.attributes(element.attributes) + '>';
};
HTMLSerializer.prototype.closeTag = function closeTag (element) {
    return '</' + element.nodeName.toLowerCase() + '>';
};
HTMLSerializer.prototype.isVoid = function isVoid (element) {
    return this.voidMap[element.nodeName] === true;
};
HTMLSerializer.prototype.attributes = function attributes (namedNodeMap) {
        var this$1 = this;

    var buffer = '';
    for (var i = 0, l = namedNodeMap.length; i < l; i++) {
        buffer += this$1.attr(namedNodeMap[i]);
    }
    return buffer;
};
HTMLSerializer.prototype.escapeAttrValue = function escapeAttrValue (attrValue) {
    if (attrValue.indexOf('&') > -1 || attrValue.indexOf('"') > -1) {
        return attrValue.replace(/[&"]/g, matcher);
    }
    return attrValue;
};
HTMLSerializer.prototype.attr = function attr (attr$1) {
    if (!attr$1.specified) {
        return '';
    }
    if (attr$1.value) {
        return ' ' + attr$1.name + '="' + this.escapeAttrValue(attr$1.value) + '"';
    }
    return ' ' + attr$1.name;
};
HTMLSerializer.prototype.escapeText = function escapeText (textNodeValue) {
    if (textNodeValue.indexOf('>') > -1 ||
        textNodeValue.indexOf('<') > -1 ||
        textNodeValue.indexOf('&') > -1) {
        return textNodeValue.replace(/[&<>]/g, matcher);
    }
    return textNodeValue;
};
HTMLSerializer.prototype.text = function text (text$1) {
    return this.escapeText(text$1.nodeValue);
};
HTMLSerializer.prototype.rawHTMLSection = function rawHTMLSection (text) {
    return text.nodeValue;
};
HTMLSerializer.prototype.comment = function comment (comment$1) {
    return '<!--' + comment$1.nodeValue + '-->';
};
HTMLSerializer.prototype.serializeChildren = function serializeChildren (node) {
        var this$1 = this;

    var buffer = '';
    var next = node.firstChild;
    while (next !== null) {
        buffer += this$1.serialize(next);
        next = next.nextSibling;
    }
    return buffer;
};
HTMLSerializer.prototype.serialize = function serialize (node) {
    var buffer = '';
    // open
    switch (node.nodeType) {
        case 1:
            buffer += this.openTag(node);
            break;
        case 3:
            buffer += this.text(node);
            break;
        case -1:
            buffer += this.rawHTMLSection(node);
            break;
        case 8:
            buffer += this.comment(node);
            break;
        default:
            break;
    }
    buffer += this.serializeChildren(node);
    if (node.nodeType === 1 && !this.isVoid(node)) {
        buffer += this.closeTag(node);
    }
    return buffer;
};

var voidMap = {
    AREA: true,
    BASE: true,
    BR: true,
    COL: true,
    COMMAND: true,
    EMBED: true,
    HR: true,
    IMG: true,
    INPUT: true,
    KEYGEN: true,
    LINK: true,
    META: true,
    PARAM: true,
    SOURCE: true,
    TRACK: true,
    WBR: true,
};

exports.Node = Node;
exports.Element = Element;
exports.DocumentFragment = DocumentFragment;
exports.Document = Document;
exports.HTMLParser = HTMLParser;
exports.HTMLSerializer = HTMLSerializer;
exports.voidMap = voidMap;

Object.defineProperty(exports, '__esModule', { value: true });

})));


},{}],18:[function(require,module,exports){
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.HTML5Tokenizer = global.HTML5Tokenizer || {})));
}(this, (function (exports) { 'use strict';

var namedCharRefs = {
    Aacute: "Á", aacute: "á", Abreve: "Ă", abreve: "ă", ac: "∾", acd: "∿", acE: "∾̳", Acirc: "Â", acirc: "â", acute: "´", Acy: "А", acy: "а", AElig: "Æ", aelig: "æ", af: "\u2061", Afr: "𝔄", afr: "𝔞", Agrave: "À", agrave: "à", alefsym: "ℵ", aleph: "ℵ", Alpha: "Α", alpha: "α", Amacr: "Ā", amacr: "ā", amalg: "⨿", AMP: "&", amp: "&", And: "⩓", and: "∧", andand: "⩕", andd: "⩜", andslope: "⩘", andv: "⩚", ang: "∠", ange: "⦤", angle: "∠", angmsd: "∡", angmsdaa: "⦨", angmsdab: "⦩", angmsdac: "⦪", angmsdad: "⦫", angmsdae: "⦬", angmsdaf: "⦭", angmsdag: "⦮", angmsdah: "⦯", angrt: "∟", angrtvb: "⊾", angrtvbd: "⦝", angsph: "∢", angst: "Å", angzarr: "⍼", Aogon: "Ą", aogon: "ą", Aopf: "𝔸", aopf: "𝕒", ap: "≈", apacir: "⩯", apE: "⩰", ape: "≊", apid: "≋", apos: "'", ApplyFunction: "\u2061", approx: "≈", approxeq: "≊", Aring: "Å", aring: "å", Ascr: "𝒜", ascr: "𝒶", Assign: "≔", ast: "*", asymp: "≈", asympeq: "≍", Atilde: "Ã", atilde: "ã", Auml: "Ä", auml: "ä", awconint: "∳", awint: "⨑", backcong: "≌", backepsilon: "϶", backprime: "‵", backsim: "∽", backsimeq: "⋍", Backslash: "∖", Barv: "⫧", barvee: "⊽", Barwed: "⌆", barwed: "⌅", barwedge: "⌅", bbrk: "⎵", bbrktbrk: "⎶", bcong: "≌", Bcy: "Б", bcy: "б", bdquo: "„", becaus: "∵", Because: "∵", because: "∵", bemptyv: "⦰", bepsi: "϶", bernou: "ℬ", Bernoullis: "ℬ", Beta: "Β", beta: "β", beth: "ℶ", between: "≬", Bfr: "𝔅", bfr: "𝔟", bigcap: "⋂", bigcirc: "◯", bigcup: "⋃", bigodot: "⨀", bigoplus: "⨁", bigotimes: "⨂", bigsqcup: "⨆", bigstar: "★", bigtriangledown: "▽", bigtriangleup: "△", biguplus: "⨄", bigvee: "⋁", bigwedge: "⋀", bkarow: "⤍", blacklozenge: "⧫", blacksquare: "▪", blacktriangle: "▴", blacktriangledown: "▾", blacktriangleleft: "◂", blacktriangleright: "▸", blank: "␣", blk12: "▒", blk14: "░", blk34: "▓", block: "█", bne: "=⃥", bnequiv: "≡⃥", bNot: "⫭", bnot: "⌐", Bopf: "𝔹", bopf: "𝕓", bot: "⊥", bottom: "⊥", bowtie: "⋈", boxbox: "⧉", boxDL: "╗", boxDl: "╖", boxdL: "╕", boxdl: "┐", boxDR: "╔", boxDr: "╓", boxdR: "╒", boxdr: "┌", boxH: "═", boxh: "─", boxHD: "╦", boxHd: "╤", boxhD: "╥", boxhd: "┬", boxHU: "╩", boxHu: "╧", boxhU: "╨", boxhu: "┴", boxminus: "⊟", boxplus: "⊞", boxtimes: "⊠", boxUL: "╝", boxUl: "╜", boxuL: "╛", boxul: "┘", boxUR: "╚", boxUr: "╙", boxuR: "╘", boxur: "└", boxV: "║", boxv: "│", boxVH: "╬", boxVh: "╫", boxvH: "╪", boxvh: "┼", boxVL: "╣", boxVl: "╢", boxvL: "╡", boxvl: "┤", boxVR: "╠", boxVr: "╟", boxvR: "╞", boxvr: "├", bprime: "‵", Breve: "˘", breve: "˘", brvbar: "¦", Bscr: "ℬ", bscr: "𝒷", bsemi: "⁏", bsim: "∽", bsime: "⋍", bsol: "\\", bsolb: "⧅", bsolhsub: "⟈", bull: "•", bullet: "•", bump: "≎", bumpE: "⪮", bumpe: "≏", Bumpeq: "≎", bumpeq: "≏", Cacute: "Ć", cacute: "ć", Cap: "⋒", cap: "∩", capand: "⩄", capbrcup: "⩉", capcap: "⩋", capcup: "⩇", capdot: "⩀", CapitalDifferentialD: "ⅅ", caps: "∩︀", caret: "⁁", caron: "ˇ", Cayleys: "ℭ", ccaps: "⩍", Ccaron: "Č", ccaron: "č", Ccedil: "Ç", ccedil: "ç", Ccirc: "Ĉ", ccirc: "ĉ", Cconint: "∰", ccups: "⩌", ccupssm: "⩐", Cdot: "Ċ", cdot: "ċ", cedil: "¸", Cedilla: "¸", cemptyv: "⦲", cent: "¢", CenterDot: "·", centerdot: "·", Cfr: "ℭ", cfr: "𝔠", CHcy: "Ч", chcy: "ч", check: "✓", checkmark: "✓", Chi: "Χ", chi: "χ", cir: "○", circ: "ˆ", circeq: "≗", circlearrowleft: "↺", circlearrowright: "↻", circledast: "⊛", circledcirc: "⊚", circleddash: "⊝", CircleDot: "⊙", circledR: "®", circledS: "Ⓢ", CircleMinus: "⊖", CirclePlus: "⊕", CircleTimes: "⊗", cirE: "⧃", cire: "≗", cirfnint: "⨐", cirmid: "⫯", cirscir: "⧂", ClockwiseContourIntegral: "∲", CloseCurlyDoubleQuote: "”", CloseCurlyQuote: "’", clubs: "♣", clubsuit: "♣", Colon: "∷", colon: ":", Colone: "⩴", colone: "≔", coloneq: "≔", comma: ",", commat: "@", comp: "∁", compfn: "∘", complement: "∁", complexes: "ℂ", cong: "≅", congdot: "⩭", Congruent: "≡", Conint: "∯", conint: "∮", ContourIntegral: "∮", Copf: "ℂ", copf: "𝕔", coprod: "∐", Coproduct: "∐", COPY: "©", copy: "©", copysr: "℗", CounterClockwiseContourIntegral: "∳", crarr: "↵", Cross: "⨯", cross: "✗", Cscr: "𝒞", cscr: "𝒸", csub: "⫏", csube: "⫑", csup: "⫐", csupe: "⫒", ctdot: "⋯", cudarrl: "⤸", cudarrr: "⤵", cuepr: "⋞", cuesc: "⋟", cularr: "↶", cularrp: "⤽", Cup: "⋓", cup: "∪", cupbrcap: "⩈", CupCap: "≍", cupcap: "⩆", cupcup: "⩊", cupdot: "⊍", cupor: "⩅", cups: "∪︀", curarr: "↷", curarrm: "⤼", curlyeqprec: "⋞", curlyeqsucc: "⋟", curlyvee: "⋎", curlywedge: "⋏", curren: "¤", curvearrowleft: "↶", curvearrowright: "↷", cuvee: "⋎", cuwed: "⋏", cwconint: "∲", cwint: "∱", cylcty: "⌭", Dagger: "‡", dagger: "†", daleth: "ℸ", Darr: "↡", dArr: "⇓", darr: "↓", dash: "‐", Dashv: "⫤", dashv: "⊣", dbkarow: "⤏", dblac: "˝", Dcaron: "Ď", dcaron: "ď", Dcy: "Д", dcy: "д", DD: "ⅅ", dd: "ⅆ", ddagger: "‡", ddarr: "⇊", DDotrahd: "⤑", ddotseq: "⩷", deg: "°", Del: "∇", Delta: "Δ", delta: "δ", demptyv: "⦱", dfisht: "⥿", Dfr: "𝔇", dfr: "𝔡", dHar: "⥥", dharl: "⇃", dharr: "⇂", DiacriticalAcute: "´", DiacriticalDot: "˙", DiacriticalDoubleAcute: "˝", DiacriticalGrave: "`", DiacriticalTilde: "˜", diam: "⋄", Diamond: "⋄", diamond: "⋄", diamondsuit: "♦", diams: "♦", die: "¨", DifferentialD: "ⅆ", digamma: "ϝ", disin: "⋲", div: "÷", divide: "÷", divideontimes: "⋇", divonx: "⋇", DJcy: "Ђ", djcy: "ђ", dlcorn: "⌞", dlcrop: "⌍", dollar: "$", Dopf: "𝔻", dopf: "𝕕", Dot: "¨", dot: "˙", DotDot: "⃜", doteq: "≐", doteqdot: "≑", DotEqual: "≐", dotminus: "∸", dotplus: "∔", dotsquare: "⊡", doublebarwedge: "⌆", DoubleContourIntegral: "∯", DoubleDot: "¨", DoubleDownArrow: "⇓", DoubleLeftArrow: "⇐", DoubleLeftRightArrow: "⇔", DoubleLeftTee: "⫤", DoubleLongLeftArrow: "⟸", DoubleLongLeftRightArrow: "⟺", DoubleLongRightArrow: "⟹", DoubleRightArrow: "⇒", DoubleRightTee: "⊨", DoubleUpArrow: "⇑", DoubleUpDownArrow: "⇕", DoubleVerticalBar: "∥", DownArrow: "↓", Downarrow: "⇓", downarrow: "↓", DownArrowBar: "⤓", DownArrowUpArrow: "⇵", DownBreve: "̑", downdownarrows: "⇊", downharpoonleft: "⇃", downharpoonright: "⇂", DownLeftRightVector: "⥐", DownLeftTeeVector: "⥞", DownLeftVector: "↽", DownLeftVectorBar: "⥖", DownRightTeeVector: "⥟", DownRightVector: "⇁", DownRightVectorBar: "⥗", DownTee: "⊤", DownTeeArrow: "↧", drbkarow: "⤐", drcorn: "⌟", drcrop: "⌌", Dscr: "𝒟", dscr: "𝒹", DScy: "Ѕ", dscy: "ѕ", dsol: "⧶", Dstrok: "Đ", dstrok: "đ", dtdot: "⋱", dtri: "▿", dtrif: "▾", duarr: "⇵", duhar: "⥯", dwangle: "⦦", DZcy: "Џ", dzcy: "џ", dzigrarr: "⟿", Eacute: "É", eacute: "é", easter: "⩮", Ecaron: "Ě", ecaron: "ě", ecir: "≖", Ecirc: "Ê", ecirc: "ê", ecolon: "≕", Ecy: "Э", ecy: "э", eDDot: "⩷", Edot: "Ė", eDot: "≑", edot: "ė", ee: "ⅇ", efDot: "≒", Efr: "𝔈", efr: "𝔢", eg: "⪚", Egrave: "È", egrave: "è", egs: "⪖", egsdot: "⪘", el: "⪙", Element: "∈", elinters: "⏧", ell: "ℓ", els: "⪕", elsdot: "⪗", Emacr: "Ē", emacr: "ē", empty: "∅", emptyset: "∅", EmptySmallSquare: "◻", emptyv: "∅", EmptyVerySmallSquare: "▫", emsp: " ", emsp13: " ", emsp14: " ", ENG: "Ŋ", eng: "ŋ", ensp: " ", Eogon: "Ę", eogon: "ę", Eopf: "𝔼", eopf: "𝕖", epar: "⋕", eparsl: "⧣", eplus: "⩱", epsi: "ε", Epsilon: "Ε", epsilon: "ε", epsiv: "ϵ", eqcirc: "≖", eqcolon: "≕", eqsim: "≂", eqslantgtr: "⪖", eqslantless: "⪕", Equal: "⩵", equals: "=", EqualTilde: "≂", equest: "≟", Equilibrium: "⇌", equiv: "≡", equivDD: "⩸", eqvparsl: "⧥", erarr: "⥱", erDot: "≓", Escr: "ℰ", escr: "ℯ", esdot: "≐", Esim: "⩳", esim: "≂", Eta: "Η", eta: "η", ETH: "Ð", eth: "ð", Euml: "Ë", euml: "ë", euro: "€", excl: "!", exist: "∃", Exists: "∃", expectation: "ℰ", ExponentialE: "ⅇ", exponentiale: "ⅇ", fallingdotseq: "≒", Fcy: "Ф", fcy: "ф", female: "♀", ffilig: "ﬃ", fflig: "ﬀ", ffllig: "ﬄ", Ffr: "𝔉", ffr: "𝔣", filig: "ﬁ", FilledSmallSquare: "◼", FilledVerySmallSquare: "▪", fjlig: "fj", flat: "♭", fllig: "ﬂ", fltns: "▱", fnof: "ƒ", Fopf: "𝔽", fopf: "𝕗", ForAll: "∀", forall: "∀", fork: "⋔", forkv: "⫙", Fouriertrf: "ℱ", fpartint: "⨍", frac12: "½", frac13: "⅓", frac14: "¼", frac15: "⅕", frac16: "⅙", frac18: "⅛", frac23: "⅔", frac25: "⅖", frac34: "¾", frac35: "⅗", frac38: "⅜", frac45: "⅘", frac56: "⅚", frac58: "⅝", frac78: "⅞", frasl: "⁄", frown: "⌢", Fscr: "ℱ", fscr: "𝒻", gacute: "ǵ", Gamma: "Γ", gamma: "γ", Gammad: "Ϝ", gammad: "ϝ", gap: "⪆", Gbreve: "Ğ", gbreve: "ğ", Gcedil: "Ģ", Gcirc: "Ĝ", gcirc: "ĝ", Gcy: "Г", gcy: "г", Gdot: "Ġ", gdot: "ġ", gE: "≧", ge: "≥", gEl: "⪌", gel: "⋛", geq: "≥", geqq: "≧", geqslant: "⩾", ges: "⩾", gescc: "⪩", gesdot: "⪀", gesdoto: "⪂", gesdotol: "⪄", gesl: "⋛︀", gesles: "⪔", Gfr: "𝔊", gfr: "𝔤", Gg: "⋙", gg: "≫", ggg: "⋙", gimel: "ℷ", GJcy: "Ѓ", gjcy: "ѓ", gl: "≷", gla: "⪥", glE: "⪒", glj: "⪤", gnap: "⪊", gnapprox: "⪊", gnE: "≩", gne: "⪈", gneq: "⪈", gneqq: "≩", gnsim: "⋧", Gopf: "𝔾", gopf: "𝕘", grave: "`", GreaterEqual: "≥", GreaterEqualLess: "⋛", GreaterFullEqual: "≧", GreaterGreater: "⪢", GreaterLess: "≷", GreaterSlantEqual: "⩾", GreaterTilde: "≳", Gscr: "𝒢", gscr: "ℊ", gsim: "≳", gsime: "⪎", gsiml: "⪐", GT: ">", Gt: "≫", gt: ">", gtcc: "⪧", gtcir: "⩺", gtdot: "⋗", gtlPar: "⦕", gtquest: "⩼", gtrapprox: "⪆", gtrarr: "⥸", gtrdot: "⋗", gtreqless: "⋛", gtreqqless: "⪌", gtrless: "≷", gtrsim: "≳", gvertneqq: "≩︀", gvnE: "≩︀", Hacek: "ˇ", hairsp: " ", half: "½", hamilt: "ℋ", HARDcy: "Ъ", hardcy: "ъ", hArr: "⇔", harr: "↔", harrcir: "⥈", harrw: "↭", Hat: "^", hbar: "ℏ", Hcirc: "Ĥ", hcirc: "ĥ", hearts: "♥", heartsuit: "♥", hellip: "…", hercon: "⊹", Hfr: "ℌ", hfr: "𝔥", HilbertSpace: "ℋ", hksearow: "⤥", hkswarow: "⤦", hoarr: "⇿", homtht: "∻", hookleftarrow: "↩", hookrightarrow: "↪", Hopf: "ℍ", hopf: "𝕙", horbar: "―", HorizontalLine: "─", Hscr: "ℋ", hscr: "𝒽", hslash: "ℏ", Hstrok: "Ħ", hstrok: "ħ", HumpDownHump: "≎", HumpEqual: "≏", hybull: "⁃", hyphen: "‐", Iacute: "Í", iacute: "í", ic: "\u2063", Icirc: "Î", icirc: "î", Icy: "И", icy: "и", Idot: "İ", IEcy: "Е", iecy: "е", iexcl: "¡", iff: "⇔", Ifr: "ℑ", ifr: "𝔦", Igrave: "Ì", igrave: "ì", ii: "ⅈ", iiiint: "⨌", iiint: "∭", iinfin: "⧜", iiota: "℩", IJlig: "Ĳ", ijlig: "ĳ", Im: "ℑ", Imacr: "Ī", imacr: "ī", image: "ℑ", ImaginaryI: "ⅈ", imagline: "ℐ", imagpart: "ℑ", imath: "ı", imof: "⊷", imped: "Ƶ", Implies: "⇒", in: "∈", incare: "℅", infin: "∞", infintie: "⧝", inodot: "ı", Int: "∬", int: "∫", intcal: "⊺", integers: "ℤ", Integral: "∫", intercal: "⊺", Intersection: "⋂", intlarhk: "⨗", intprod: "⨼", InvisibleComma: "\u2063", InvisibleTimes: "\u2062", IOcy: "Ё", iocy: "ё", Iogon: "Į", iogon: "į", Iopf: "𝕀", iopf: "𝕚", Iota: "Ι", iota: "ι", iprod: "⨼", iquest: "¿", Iscr: "ℐ", iscr: "𝒾", isin: "∈", isindot: "⋵", isinE: "⋹", isins: "⋴", isinsv: "⋳", isinv: "∈", it: "\u2062", Itilde: "Ĩ", itilde: "ĩ", Iukcy: "І", iukcy: "і", Iuml: "Ï", iuml: "ï", Jcirc: "Ĵ", jcirc: "ĵ", Jcy: "Й", jcy: "й", Jfr: "𝔍", jfr: "𝔧", jmath: "ȷ", Jopf: "𝕁", jopf: "𝕛", Jscr: "𝒥", jscr: "𝒿", Jsercy: "Ј", jsercy: "ј", Jukcy: "Є", jukcy: "є", Kappa: "Κ", kappa: "κ", kappav: "ϰ", Kcedil: "Ķ", kcedil: "ķ", Kcy: "К", kcy: "к", Kfr: "𝔎", kfr: "𝔨", kgreen: "ĸ", KHcy: "Х", khcy: "х", KJcy: "Ќ", kjcy: "ќ", Kopf: "𝕂", kopf: "𝕜", Kscr: "𝒦", kscr: "𝓀", lAarr: "⇚", Lacute: "Ĺ", lacute: "ĺ", laemptyv: "⦴", lagran: "ℒ", Lambda: "Λ", lambda: "λ", Lang: "⟪", lang: "⟨", langd: "⦑", langle: "⟨", lap: "⪅", Laplacetrf: "ℒ", laquo: "«", Larr: "↞", lArr: "⇐", larr: "←", larrb: "⇤", larrbfs: "⤟", larrfs: "⤝", larrhk: "↩", larrlp: "↫", larrpl: "⤹", larrsim: "⥳", larrtl: "↢", lat: "⪫", lAtail: "⤛", latail: "⤙", late: "⪭", lates: "⪭︀", lBarr: "⤎", lbarr: "⤌", lbbrk: "❲", lbrace: "{", lbrack: "[", lbrke: "⦋", lbrksld: "⦏", lbrkslu: "⦍", Lcaron: "Ľ", lcaron: "ľ", Lcedil: "Ļ", lcedil: "ļ", lceil: "⌈", lcub: "{", Lcy: "Л", lcy: "л", ldca: "⤶", ldquo: "“", ldquor: "„", ldrdhar: "⥧", ldrushar: "⥋", ldsh: "↲", lE: "≦", le: "≤", LeftAngleBracket: "⟨", LeftArrow: "←", Leftarrow: "⇐", leftarrow: "←", LeftArrowBar: "⇤", LeftArrowRightArrow: "⇆", leftarrowtail: "↢", LeftCeiling: "⌈", LeftDoubleBracket: "⟦", LeftDownTeeVector: "⥡", LeftDownVector: "⇃", LeftDownVectorBar: "⥙", LeftFloor: "⌊", leftharpoondown: "↽", leftharpoonup: "↼", leftleftarrows: "⇇", LeftRightArrow: "↔", Leftrightarrow: "⇔", leftrightarrow: "↔", leftrightarrows: "⇆", leftrightharpoons: "⇋", leftrightsquigarrow: "↭", LeftRightVector: "⥎", LeftTee: "⊣", LeftTeeArrow: "↤", LeftTeeVector: "⥚", leftthreetimes: "⋋", LeftTriangle: "⊲", LeftTriangleBar: "⧏", LeftTriangleEqual: "⊴", LeftUpDownVector: "⥑", LeftUpTeeVector: "⥠", LeftUpVector: "↿", LeftUpVectorBar: "⥘", LeftVector: "↼", LeftVectorBar: "⥒", lEg: "⪋", leg: "⋚", leq: "≤", leqq: "≦", leqslant: "⩽", les: "⩽", lescc: "⪨", lesdot: "⩿", lesdoto: "⪁", lesdotor: "⪃", lesg: "⋚︀", lesges: "⪓", lessapprox: "⪅", lessdot: "⋖", lesseqgtr: "⋚", lesseqqgtr: "⪋", LessEqualGreater: "⋚", LessFullEqual: "≦", LessGreater: "≶", lessgtr: "≶", LessLess: "⪡", lesssim: "≲", LessSlantEqual: "⩽", LessTilde: "≲", lfisht: "⥼", lfloor: "⌊", Lfr: "𝔏", lfr: "𝔩", lg: "≶", lgE: "⪑", lHar: "⥢", lhard: "↽", lharu: "↼", lharul: "⥪", lhblk: "▄", LJcy: "Љ", ljcy: "љ", Ll: "⋘", ll: "≪", llarr: "⇇", llcorner: "⌞", Lleftarrow: "⇚", llhard: "⥫", lltri: "◺", Lmidot: "Ŀ", lmidot: "ŀ", lmoust: "⎰", lmoustache: "⎰", lnap: "⪉", lnapprox: "⪉", lnE: "≨", lne: "⪇", lneq: "⪇", lneqq: "≨", lnsim: "⋦", loang: "⟬", loarr: "⇽", lobrk: "⟦", LongLeftArrow: "⟵", Longleftarrow: "⟸", longleftarrow: "⟵", LongLeftRightArrow: "⟷", Longleftrightarrow: "⟺", longleftrightarrow: "⟷", longmapsto: "⟼", LongRightArrow: "⟶", Longrightarrow: "⟹", longrightarrow: "⟶", looparrowleft: "↫", looparrowright: "↬", lopar: "⦅", Lopf: "𝕃", lopf: "𝕝", loplus: "⨭", lotimes: "⨴", lowast: "∗", lowbar: "_", LowerLeftArrow: "↙", LowerRightArrow: "↘", loz: "◊", lozenge: "◊", lozf: "⧫", lpar: "(", lparlt: "⦓", lrarr: "⇆", lrcorner: "⌟", lrhar: "⇋", lrhard: "⥭", lrm: "\u200e", lrtri: "⊿", lsaquo: "‹", Lscr: "ℒ", lscr: "𝓁", Lsh: "↰", lsh: "↰", lsim: "≲", lsime: "⪍", lsimg: "⪏", lsqb: "[", lsquo: "‘", lsquor: "‚", Lstrok: "Ł", lstrok: "ł", LT: "<", Lt: "≪", lt: "<", ltcc: "⪦", ltcir: "⩹", ltdot: "⋖", lthree: "⋋", ltimes: "⋉", ltlarr: "⥶", ltquest: "⩻", ltri: "◃", ltrie: "⊴", ltrif: "◂", ltrPar: "⦖", lurdshar: "⥊", luruhar: "⥦", lvertneqq: "≨︀", lvnE: "≨︀", macr: "¯", male: "♂", malt: "✠", maltese: "✠", Map: "⤅", map: "↦", mapsto: "↦", mapstodown: "↧", mapstoleft: "↤", mapstoup: "↥", marker: "▮", mcomma: "⨩", Mcy: "М", mcy: "м", mdash: "—", mDDot: "∺", measuredangle: "∡", MediumSpace: " ", Mellintrf: "ℳ", Mfr: "𝔐", mfr: "𝔪", mho: "℧", micro: "µ", mid: "∣", midast: "*", midcir: "⫰", middot: "·", minus: "−", minusb: "⊟", minusd: "∸", minusdu: "⨪", MinusPlus: "∓", mlcp: "⫛", mldr: "…", mnplus: "∓", models: "⊧", Mopf: "𝕄", mopf: "𝕞", mp: "∓", Mscr: "ℳ", mscr: "𝓂", mstpos: "∾", Mu: "Μ", mu: "μ", multimap: "⊸", mumap: "⊸", nabla: "∇", Nacute: "Ń", nacute: "ń", nang: "∠⃒", nap: "≉", napE: "⩰̸", napid: "≋̸", napos: "ŉ", napprox: "≉", natur: "♮", natural: "♮", naturals: "ℕ", nbsp: " ", nbump: "≎̸", nbumpe: "≏̸", ncap: "⩃", Ncaron: "Ň", ncaron: "ň", Ncedil: "Ņ", ncedil: "ņ", ncong: "≇", ncongdot: "⩭̸", ncup: "⩂", Ncy: "Н", ncy: "н", ndash: "–", ne: "≠", nearhk: "⤤", neArr: "⇗", nearr: "↗", nearrow: "↗", nedot: "≐̸", NegativeMediumSpace: "​", NegativeThickSpace: "​", NegativeThinSpace: "​", NegativeVeryThinSpace: "​", nequiv: "≢", nesear: "⤨", nesim: "≂̸", NestedGreaterGreater: "≫", NestedLessLess: "≪", NewLine: "\u000a", nexist: "∄", nexists: "∄", Nfr: "𝔑", nfr: "𝔫", ngE: "≧̸", nge: "≱", ngeq: "≱", ngeqq: "≧̸", ngeqslant: "⩾̸", nges: "⩾̸", nGg: "⋙̸", ngsim: "≵", nGt: "≫⃒", ngt: "≯", ngtr: "≯", nGtv: "≫̸", nhArr: "⇎", nharr: "↮", nhpar: "⫲", ni: "∋", nis: "⋼", nisd: "⋺", niv: "∋", NJcy: "Њ", njcy: "њ", nlArr: "⇍", nlarr: "↚", nldr: "‥", nlE: "≦̸", nle: "≰", nLeftarrow: "⇍", nleftarrow: "↚", nLeftrightarrow: "⇎", nleftrightarrow: "↮", nleq: "≰", nleqq: "≦̸", nleqslant: "⩽̸", nles: "⩽̸", nless: "≮", nLl: "⋘̸", nlsim: "≴", nLt: "≪⃒", nlt: "≮", nltri: "⋪", nltrie: "⋬", nLtv: "≪̸", nmid: "∤", NoBreak: "\u2060", NonBreakingSpace: " ", Nopf: "ℕ", nopf: "𝕟", Not: "⫬", not: "¬", NotCongruent: "≢", NotCupCap: "≭", NotDoubleVerticalBar: "∦", NotElement: "∉", NotEqual: "≠", NotEqualTilde: "≂̸", NotExists: "∄", NotGreater: "≯", NotGreaterEqual: "≱", NotGreaterFullEqual: "≧̸", NotGreaterGreater: "≫̸", NotGreaterLess: "≹", NotGreaterSlantEqual: "⩾̸", NotGreaterTilde: "≵", NotHumpDownHump: "≎̸", NotHumpEqual: "≏̸", notin: "∉", notindot: "⋵̸", notinE: "⋹̸", notinva: "∉", notinvb: "⋷", notinvc: "⋶", NotLeftTriangle: "⋪", NotLeftTriangleBar: "⧏̸", NotLeftTriangleEqual: "⋬", NotLess: "≮", NotLessEqual: "≰", NotLessGreater: "≸", NotLessLess: "≪̸", NotLessSlantEqual: "⩽̸", NotLessTilde: "≴", NotNestedGreaterGreater: "⪢̸", NotNestedLessLess: "⪡̸", notni: "∌", notniva: "∌", notnivb: "⋾", notnivc: "⋽", NotPrecedes: "⊀", NotPrecedesEqual: "⪯̸", NotPrecedesSlantEqual: "⋠", NotReverseElement: "∌", NotRightTriangle: "⋫", NotRightTriangleBar: "⧐̸", NotRightTriangleEqual: "⋭", NotSquareSubset: "⊏̸", NotSquareSubsetEqual: "⋢", NotSquareSuperset: "⊐̸", NotSquareSupersetEqual: "⋣", NotSubset: "⊂⃒", NotSubsetEqual: "⊈", NotSucceeds: "⊁", NotSucceedsEqual: "⪰̸", NotSucceedsSlantEqual: "⋡", NotSucceedsTilde: "≿̸", NotSuperset: "⊃⃒", NotSupersetEqual: "⊉", NotTilde: "≁", NotTildeEqual: "≄", NotTildeFullEqual: "≇", NotTildeTilde: "≉", NotVerticalBar: "∤", npar: "∦", nparallel: "∦", nparsl: "⫽⃥", npart: "∂̸", npolint: "⨔", npr: "⊀", nprcue: "⋠", npre: "⪯̸", nprec: "⊀", npreceq: "⪯̸", nrArr: "⇏", nrarr: "↛", nrarrc: "⤳̸", nrarrw: "↝̸", nRightarrow: "⇏", nrightarrow: "↛", nrtri: "⋫", nrtrie: "⋭", nsc: "⊁", nsccue: "⋡", nsce: "⪰̸", Nscr: "𝒩", nscr: "𝓃", nshortmid: "∤", nshortparallel: "∦", nsim: "≁", nsime: "≄", nsimeq: "≄", nsmid: "∤", nspar: "∦", nsqsube: "⋢", nsqsupe: "⋣", nsub: "⊄", nsubE: "⫅̸", nsube: "⊈", nsubset: "⊂⃒", nsubseteq: "⊈", nsubseteqq: "⫅̸", nsucc: "⊁", nsucceq: "⪰̸", nsup: "⊅", nsupE: "⫆̸", nsupe: "⊉", nsupset: "⊃⃒", nsupseteq: "⊉", nsupseteqq: "⫆̸", ntgl: "≹", Ntilde: "Ñ", ntilde: "ñ", ntlg: "≸", ntriangleleft: "⋪", ntrianglelefteq: "⋬", ntriangleright: "⋫", ntrianglerighteq: "⋭", Nu: "Ν", nu: "ν", num: "#", numero: "№", numsp: " ", nvap: "≍⃒", nVDash: "⊯", nVdash: "⊮", nvDash: "⊭", nvdash: "⊬", nvge: "≥⃒", nvgt: ">⃒", nvHarr: "⤄", nvinfin: "⧞", nvlArr: "⤂", nvle: "≤⃒", nvlt: "<⃒", nvltrie: "⊴⃒", nvrArr: "⤃", nvrtrie: "⊵⃒", nvsim: "∼⃒", nwarhk: "⤣", nwArr: "⇖", nwarr: "↖", nwarrow: "↖", nwnear: "⤧", Oacute: "Ó", oacute: "ó", oast: "⊛", ocir: "⊚", Ocirc: "Ô", ocirc: "ô", Ocy: "О", ocy: "о", odash: "⊝", Odblac: "Ő", odblac: "ő", odiv: "⨸", odot: "⊙", odsold: "⦼", OElig: "Œ", oelig: "œ", ofcir: "⦿", Ofr: "𝔒", ofr: "𝔬", ogon: "˛", Ograve: "Ò", ograve: "ò", ogt: "⧁", ohbar: "⦵", ohm: "Ω", oint: "∮", olarr: "↺", olcir: "⦾", olcross: "⦻", oline: "‾", olt: "⧀", Omacr: "Ō", omacr: "ō", Omega: "Ω", omega: "ω", Omicron: "Ο", omicron: "ο", omid: "⦶", ominus: "⊖", Oopf: "𝕆", oopf: "𝕠", opar: "⦷", OpenCurlyDoubleQuote: "“", OpenCurlyQuote: "‘", operp: "⦹", oplus: "⊕", Or: "⩔", or: "∨", orarr: "↻", ord: "⩝", order: "ℴ", orderof: "ℴ", ordf: "ª", ordm: "º", origof: "⊶", oror: "⩖", orslope: "⩗", orv: "⩛", oS: "Ⓢ", Oscr: "𝒪", oscr: "ℴ", Oslash: "Ø", oslash: "ø", osol: "⊘", Otilde: "Õ", otilde: "õ", Otimes: "⨷", otimes: "⊗", otimesas: "⨶", Ouml: "Ö", ouml: "ö", ovbar: "⌽", OverBar: "‾", OverBrace: "⏞", OverBracket: "⎴", OverParenthesis: "⏜", par: "∥", para: "¶", parallel: "∥", parsim: "⫳", parsl: "⫽", part: "∂", PartialD: "∂", Pcy: "П", pcy: "п", percnt: "%", period: ".", permil: "‰", perp: "⊥", pertenk: "‱", Pfr: "𝔓", pfr: "𝔭", Phi: "Φ", phi: "φ", phiv: "ϕ", phmmat: "ℳ", phone: "☎", Pi: "Π", pi: "π", pitchfork: "⋔", piv: "ϖ", planck: "ℏ", planckh: "ℎ", plankv: "ℏ", plus: "+", plusacir: "⨣", plusb: "⊞", pluscir: "⨢", plusdo: "∔", plusdu: "⨥", pluse: "⩲", PlusMinus: "±", plusmn: "±", plussim: "⨦", plustwo: "⨧", pm: "±", Poincareplane: "ℌ", pointint: "⨕", Popf: "ℙ", popf: "𝕡", pound: "£", Pr: "⪻", pr: "≺", prap: "⪷", prcue: "≼", prE: "⪳", pre: "⪯", prec: "≺", precapprox: "⪷", preccurlyeq: "≼", Precedes: "≺", PrecedesEqual: "⪯", PrecedesSlantEqual: "≼", PrecedesTilde: "≾", preceq: "⪯", precnapprox: "⪹", precneqq: "⪵", precnsim: "⋨", precsim: "≾", Prime: "″", prime: "′", primes: "ℙ", prnap: "⪹", prnE: "⪵", prnsim: "⋨", prod: "∏", Product: "∏", profalar: "⌮", profline: "⌒", profsurf: "⌓", prop: "∝", Proportion: "∷", Proportional: "∝", propto: "∝", prsim: "≾", prurel: "⊰", Pscr: "𝒫", pscr: "𝓅", Psi: "Ψ", psi: "ψ", puncsp: " ", Qfr: "𝔔", qfr: "𝔮", qint: "⨌", Qopf: "ℚ", qopf: "𝕢", qprime: "⁗", Qscr: "𝒬", qscr: "𝓆", quaternions: "ℍ", quatint: "⨖", quest: "?", questeq: "≟", QUOT: "\"", quot: "\"", rAarr: "⇛", race: "∽̱", Racute: "Ŕ", racute: "ŕ", radic: "√", raemptyv: "⦳", Rang: "⟫", rang: "⟩", rangd: "⦒", range: "⦥", rangle: "⟩", raquo: "»", Rarr: "↠", rArr: "⇒", rarr: "→", rarrap: "⥵", rarrb: "⇥", rarrbfs: "⤠", rarrc: "⤳", rarrfs: "⤞", rarrhk: "↪", rarrlp: "↬", rarrpl: "⥅", rarrsim: "⥴", Rarrtl: "⤖", rarrtl: "↣", rarrw: "↝", rAtail: "⤜", ratail: "⤚", ratio: "∶", rationals: "ℚ", RBarr: "⤐", rBarr: "⤏", rbarr: "⤍", rbbrk: "❳", rbrace: "}", rbrack: "]", rbrke: "⦌", rbrksld: "⦎", rbrkslu: "⦐", Rcaron: "Ř", rcaron: "ř", Rcedil: "Ŗ", rcedil: "ŗ", rceil: "⌉", rcub: "}", Rcy: "Р", rcy: "р", rdca: "⤷", rdldhar: "⥩", rdquo: "”", rdquor: "”", rdsh: "↳", Re: "ℜ", real: "ℜ", realine: "ℛ", realpart: "ℜ", reals: "ℝ", rect: "▭", REG: "®", reg: "®", ReverseElement: "∋", ReverseEquilibrium: "⇋", ReverseUpEquilibrium: "⥯", rfisht: "⥽", rfloor: "⌋", Rfr: "ℜ", rfr: "𝔯", rHar: "⥤", rhard: "⇁", rharu: "⇀", rharul: "⥬", Rho: "Ρ", rho: "ρ", rhov: "ϱ", RightAngleBracket: "⟩", RightArrow: "→", Rightarrow: "⇒", rightarrow: "→", RightArrowBar: "⇥", RightArrowLeftArrow: "⇄", rightarrowtail: "↣", RightCeiling: "⌉", RightDoubleBracket: "⟧", RightDownTeeVector: "⥝", RightDownVector: "⇂", RightDownVectorBar: "⥕", RightFloor: "⌋", rightharpoondown: "⇁", rightharpoonup: "⇀", rightleftarrows: "⇄", rightleftharpoons: "⇌", rightrightarrows: "⇉", rightsquigarrow: "↝", RightTee: "⊢", RightTeeArrow: "↦", RightTeeVector: "⥛", rightthreetimes: "⋌", RightTriangle: "⊳", RightTriangleBar: "⧐", RightTriangleEqual: "⊵", RightUpDownVector: "⥏", RightUpTeeVector: "⥜", RightUpVector: "↾", RightUpVectorBar: "⥔", RightVector: "⇀", RightVectorBar: "⥓", ring: "˚", risingdotseq: "≓", rlarr: "⇄", rlhar: "⇌", rlm: "\u200f", rmoust: "⎱", rmoustache: "⎱", rnmid: "⫮", roang: "⟭", roarr: "⇾", robrk: "⟧", ropar: "⦆", Ropf: "ℝ", ropf: "𝕣", roplus: "⨮", rotimes: "⨵", RoundImplies: "⥰", rpar: ")", rpargt: "⦔", rppolint: "⨒", rrarr: "⇉", Rrightarrow: "⇛", rsaquo: "›", Rscr: "ℛ", rscr: "𝓇", Rsh: "↱", rsh: "↱", rsqb: "]", rsquo: "’", rsquor: "’", rthree: "⋌", rtimes: "⋊", rtri: "▹", rtrie: "⊵", rtrif: "▸", rtriltri: "⧎", RuleDelayed: "⧴", ruluhar: "⥨", rx: "℞", Sacute: "Ś", sacute: "ś", sbquo: "‚", Sc: "⪼", sc: "≻", scap: "⪸", Scaron: "Š", scaron: "š", sccue: "≽", scE: "⪴", sce: "⪰", Scedil: "Ş", scedil: "ş", Scirc: "Ŝ", scirc: "ŝ", scnap: "⪺", scnE: "⪶", scnsim: "⋩", scpolint: "⨓", scsim: "≿", Scy: "С", scy: "с", sdot: "⋅", sdotb: "⊡", sdote: "⩦", searhk: "⤥", seArr: "⇘", searr: "↘", searrow: "↘", sect: "§", semi: ";", seswar: "⤩", setminus: "∖", setmn: "∖", sext: "✶", Sfr: "𝔖", sfr: "𝔰", sfrown: "⌢", sharp: "♯", SHCHcy: "Щ", shchcy: "щ", SHcy: "Ш", shcy: "ш", ShortDownArrow: "↓", ShortLeftArrow: "←", shortmid: "∣", shortparallel: "∥", ShortRightArrow: "→", ShortUpArrow: "↑", shy: "\u00ad", Sigma: "Σ", sigma: "σ", sigmaf: "ς", sigmav: "ς", sim: "∼", simdot: "⩪", sime: "≃", simeq: "≃", simg: "⪞", simgE: "⪠", siml: "⪝", simlE: "⪟", simne: "≆", simplus: "⨤", simrarr: "⥲", slarr: "←", SmallCircle: "∘", smallsetminus: "∖", smashp: "⨳", smeparsl: "⧤", smid: "∣", smile: "⌣", smt: "⪪", smte: "⪬", smtes: "⪬︀", SOFTcy: "Ь", softcy: "ь", sol: "/", solb: "⧄", solbar: "⌿", Sopf: "𝕊", sopf: "𝕤", spades: "♠", spadesuit: "♠", spar: "∥", sqcap: "⊓", sqcaps: "⊓︀", sqcup: "⊔", sqcups: "⊔︀", Sqrt: "√", sqsub: "⊏", sqsube: "⊑", sqsubset: "⊏", sqsubseteq: "⊑", sqsup: "⊐", sqsupe: "⊒", sqsupset: "⊐", sqsupseteq: "⊒", squ: "□", Square: "□", square: "□", SquareIntersection: "⊓", SquareSubset: "⊏", SquareSubsetEqual: "⊑", SquareSuperset: "⊐", SquareSupersetEqual: "⊒", SquareUnion: "⊔", squarf: "▪", squf: "▪", srarr: "→", Sscr: "𝒮", sscr: "𝓈", ssetmn: "∖", ssmile: "⌣", sstarf: "⋆", Star: "⋆", star: "☆", starf: "★", straightepsilon: "ϵ", straightphi: "ϕ", strns: "¯", Sub: "⋐", sub: "⊂", subdot: "⪽", subE: "⫅", sube: "⊆", subedot: "⫃", submult: "⫁", subnE: "⫋", subne: "⊊", subplus: "⪿", subrarr: "⥹", Subset: "⋐", subset: "⊂", subseteq: "⊆", subseteqq: "⫅", SubsetEqual: "⊆", subsetneq: "⊊", subsetneqq: "⫋", subsim: "⫇", subsub: "⫕", subsup: "⫓", succ: "≻", succapprox: "⪸", succcurlyeq: "≽", Succeeds: "≻", SucceedsEqual: "⪰", SucceedsSlantEqual: "≽", SucceedsTilde: "≿", succeq: "⪰", succnapprox: "⪺", succneqq: "⪶", succnsim: "⋩", succsim: "≿", SuchThat: "∋", Sum: "∑", sum: "∑", sung: "♪", Sup: "⋑", sup: "⊃", sup1: "¹", sup2: "²", sup3: "³", supdot: "⪾", supdsub: "⫘", supE: "⫆", supe: "⊇", supedot: "⫄", Superset: "⊃", SupersetEqual: "⊇", suphsol: "⟉", suphsub: "⫗", suplarr: "⥻", supmult: "⫂", supnE: "⫌", supne: "⊋", supplus: "⫀", Supset: "⋑", supset: "⊃", supseteq: "⊇", supseteqq: "⫆", supsetneq: "⊋", supsetneqq: "⫌", supsim: "⫈", supsub: "⫔", supsup: "⫖", swarhk: "⤦", swArr: "⇙", swarr: "↙", swarrow: "↙", swnwar: "⤪", szlig: "ß", Tab: "\u0009", target: "⌖", Tau: "Τ", tau: "τ", tbrk: "⎴", Tcaron: "Ť", tcaron: "ť", Tcedil: "Ţ", tcedil: "ţ", Tcy: "Т", tcy: "т", tdot: "⃛", telrec: "⌕", Tfr: "𝔗", tfr: "𝔱", there4: "∴", Therefore: "∴", therefore: "∴", Theta: "Θ", theta: "θ", thetasym: "ϑ", thetav: "ϑ", thickapprox: "≈", thicksim: "∼", ThickSpace: "  ", thinsp: " ", ThinSpace: " ", thkap: "≈", thksim: "∼", THORN: "Þ", thorn: "þ", Tilde: "∼", tilde: "˜", TildeEqual: "≃", TildeFullEqual: "≅", TildeTilde: "≈", times: "×", timesb: "⊠", timesbar: "⨱", timesd: "⨰", tint: "∭", toea: "⤨", top: "⊤", topbot: "⌶", topcir: "⫱", Topf: "𝕋", topf: "𝕥", topfork: "⫚", tosa: "⤩", tprime: "‴", TRADE: "™", trade: "™", triangle: "▵", triangledown: "▿", triangleleft: "◃", trianglelefteq: "⊴", triangleq: "≜", triangleright: "▹", trianglerighteq: "⊵", tridot: "◬", trie: "≜", triminus: "⨺", TripleDot: "⃛", triplus: "⨹", trisb: "⧍", tritime: "⨻", trpezium: "⏢", Tscr: "𝒯", tscr: "𝓉", TScy: "Ц", tscy: "ц", TSHcy: "Ћ", tshcy: "ћ", Tstrok: "Ŧ", tstrok: "ŧ", twixt: "≬", twoheadleftarrow: "↞", twoheadrightarrow: "↠", Uacute: "Ú", uacute: "ú", Uarr: "↟", uArr: "⇑", uarr: "↑", Uarrocir: "⥉", Ubrcy: "Ў", ubrcy: "ў", Ubreve: "Ŭ", ubreve: "ŭ", Ucirc: "Û", ucirc: "û", Ucy: "У", ucy: "у", udarr: "⇅", Udblac: "Ű", udblac: "ű", udhar: "⥮", ufisht: "⥾", Ufr: "𝔘", ufr: "𝔲", Ugrave: "Ù", ugrave: "ù", uHar: "⥣", uharl: "↿", uharr: "↾", uhblk: "▀", ulcorn: "⌜", ulcorner: "⌜", ulcrop: "⌏", ultri: "◸", Umacr: "Ū", umacr: "ū", uml: "¨", UnderBar: "_", UnderBrace: "⏟", UnderBracket: "⎵", UnderParenthesis: "⏝", Union: "⋃", UnionPlus: "⊎", Uogon: "Ų", uogon: "ų", Uopf: "𝕌", uopf: "𝕦", UpArrow: "↑", Uparrow: "⇑", uparrow: "↑", UpArrowBar: "⤒", UpArrowDownArrow: "⇅", UpDownArrow: "↕", Updownarrow: "⇕", updownarrow: "↕", UpEquilibrium: "⥮", upharpoonleft: "↿", upharpoonright: "↾", uplus: "⊎", UpperLeftArrow: "↖", UpperRightArrow: "↗", Upsi: "ϒ", upsi: "υ", upsih: "ϒ", Upsilon: "Υ", upsilon: "υ", UpTee: "⊥", UpTeeArrow: "↥", upuparrows: "⇈", urcorn: "⌝", urcorner: "⌝", urcrop: "⌎", Uring: "Ů", uring: "ů", urtri: "◹", Uscr: "𝒰", uscr: "𝓊", utdot: "⋰", Utilde: "Ũ", utilde: "ũ", utri: "▵", utrif: "▴", uuarr: "⇈", Uuml: "Ü", uuml: "ü", uwangle: "⦧", vangrt: "⦜", varepsilon: "ϵ", varkappa: "ϰ", varnothing: "∅", varphi: "ϕ", varpi: "ϖ", varpropto: "∝", vArr: "⇕", varr: "↕", varrho: "ϱ", varsigma: "ς", varsubsetneq: "⊊︀", varsubsetneqq: "⫋︀", varsupsetneq: "⊋︀", varsupsetneqq: "⫌︀", vartheta: "ϑ", vartriangleleft: "⊲", vartriangleright: "⊳", Vbar: "⫫", vBar: "⫨", vBarv: "⫩", Vcy: "В", vcy: "в", VDash: "⊫", Vdash: "⊩", vDash: "⊨", vdash: "⊢", Vdashl: "⫦", Vee: "⋁", vee: "∨", veebar: "⊻", veeeq: "≚", vellip: "⋮", Verbar: "‖", verbar: "|", Vert: "‖", vert: "|", VerticalBar: "∣", VerticalLine: "|", VerticalSeparator: "❘", VerticalTilde: "≀", VeryThinSpace: " ", Vfr: "𝔙", vfr: "𝔳", vltri: "⊲", vnsub: "⊂⃒", vnsup: "⊃⃒", Vopf: "𝕍", vopf: "𝕧", vprop: "∝", vrtri: "⊳", Vscr: "𝒱", vscr: "𝓋", vsubnE: "⫋︀", vsubne: "⊊︀", vsupnE: "⫌︀", vsupne: "⊋︀", Vvdash: "⊪", vzigzag: "⦚", Wcirc: "Ŵ", wcirc: "ŵ", wedbar: "⩟", Wedge: "⋀", wedge: "∧", wedgeq: "≙", weierp: "℘", Wfr: "𝔚", wfr: "𝔴", Wopf: "𝕎", wopf: "𝕨", wp: "℘", wr: "≀", wreath: "≀", Wscr: "𝒲", wscr: "𝓌", xcap: "⋂", xcirc: "◯", xcup: "⋃", xdtri: "▽", Xfr: "𝔛", xfr: "𝔵", xhArr: "⟺", xharr: "⟷", Xi: "Ξ", xi: "ξ", xlArr: "⟸", xlarr: "⟵", xmap: "⟼", xnis: "⋻", xodot: "⨀", Xopf: "𝕏", xopf: "𝕩", xoplus: "⨁", xotime: "⨂", xrArr: "⟹", xrarr: "⟶", Xscr: "𝒳", xscr: "𝓍", xsqcup: "⨆", xuplus: "⨄", xutri: "△", xvee: "⋁", xwedge: "⋀", Yacute: "Ý", yacute: "ý", YAcy: "Я", yacy: "я", Ycirc: "Ŷ", ycirc: "ŷ", Ycy: "Ы", ycy: "ы", yen: "¥", Yfr: "𝔜", yfr: "𝔶", YIcy: "Ї", yicy: "ї", Yopf: "𝕐", yopf: "𝕪", Yscr: "𝒴", yscr: "𝓎", YUcy: "Ю", yucy: "ю", Yuml: "Ÿ", yuml: "ÿ", Zacute: "Ź", zacute: "ź", Zcaron: "Ž", zcaron: "ž", Zcy: "З", zcy: "з", Zdot: "Ż", zdot: "ż", zeetrf: "ℨ", ZeroWidthSpace: "​", Zeta: "Ζ", zeta: "ζ", Zfr: "ℨ", zfr: "𝔷", ZHcy: "Ж", zhcy: "ж", zigrarr: "⇝", Zopf: "ℤ", zopf: "𝕫", Zscr: "𝒵", zscr: "𝓏", zwj: "\u200d", zwnj: "\u200c"
};

var HEXCHARCODE = /^#[xX]([A-Fa-f0-9]+)$/;
var CHARCODE = /^#([0-9]+)$/;
var NAMED = /^([A-Za-z0-9]+)$/;
var EntityParser = /** @class */ (function () {
    function EntityParser(named) {
        this.named = named;
    }
    EntityParser.prototype.parse = function (entity) {
        if (!entity) {
            return;
        }
        var matches = entity.match(HEXCHARCODE);
        if (matches) {
            return String.fromCharCode(parseInt(matches[1], 16));
        }
        matches = entity.match(CHARCODE);
        if (matches) {
            return String.fromCharCode(parseInt(matches[1], 10));
        }
        matches = entity.match(NAMED);
        if (matches) {
            return this.named[matches[1]];
        }
    };
    return EntityParser;
}());

var WSP = /[\t\n\f ]/;
var ALPHA = /[A-Za-z]/;
var CRLF = /\r\n?/g;
function isSpace(char) {
    return WSP.test(char);
}
function isAlpha(char) {
    return ALPHA.test(char);
}
function preprocessInput(input) {
    return input.replace(CRLF, "\n");
}
function unwrap(maybe, msg) {
    if (!maybe)
        throw new Error((msg || 'value') + " was null");
    return maybe;
}

var EventedTokenizer = /** @class */ (function () {
    function EventedTokenizer(delegate, entityParser) {
        this.delegate = delegate;
        this.entityParser = entityParser;
        this.state = null;
        this.input = null;
        this.index = -1;
        this.tagLine = -1;
        this.tagColumn = -1;
        this.line = -1;
        this.column = -1;
        this.states = {
            beforeData: function () {
                var char = this.peek();
                if (char === "<") {
                    this.state = 'tagOpen';
                    this.markTagStart();
                    this.consume();
                }
                else {
                    this.state = 'data';
                    this.delegate.beginData();
                }
            },
            data: function () {
                var char = this.peek();
                if (char === "<") {
                    this.delegate.finishData();
                    this.state = 'tagOpen';
                    this.markTagStart();
                    this.consume();
                }
                else if (char === "&") {
                    this.consume();
                    this.delegate.appendToData(this.consumeCharRef() || "&");
                }
                else {
                    this.consume();
                    this.delegate.appendToData(char);
                }
            },
            tagOpen: function () {
                var char = this.consume();
                if (char === "!") {
                    this.state = 'markupDeclaration';
                }
                else if (char === "/") {
                    this.state = 'endTagOpen';
                }
                else if (isAlpha(char)) {
                    this.state = 'tagName';
                    this.delegate.beginStartTag();
                    this.delegate.appendToTagName(char.toLowerCase());
                }
            },
            markupDeclaration: function () {
                var char = this.consume();
                if (char === "-" && this.input.charAt(this.index) === "-") {
                    this.consume();
                    this.state = 'commentStart';
                    this.delegate.beginComment();
                }
            },
            commentStart: function () {
                var char = this.consume();
                if (char === "-") {
                    this.state = 'commentStartDash';
                }
                else if (char === ">") {
                    this.delegate.finishComment();
                    this.state = 'beforeData';
                }
                else {
                    this.delegate.appendToCommentData(char);
                    this.state = 'comment';
                }
            },
            commentStartDash: function () {
                var char = this.consume();
                if (char === "-") {
                    this.state = 'commentEnd';
                }
                else if (char === ">") {
                    this.delegate.finishComment();
                    this.state = 'beforeData';
                }
                else {
                    this.delegate.appendToCommentData("-");
                    this.state = 'comment';
                }
            },
            comment: function () {
                var char = this.consume();
                if (char === "-") {
                    this.state = 'commentEndDash';
                }
                else {
                    this.delegate.appendToCommentData(char);
                }
            },
            commentEndDash: function () {
                var char = this.consume();
                if (char === "-") {
                    this.state = 'commentEnd';
                }
                else {
                    this.delegate.appendToCommentData("-" + char);
                    this.state = 'comment';
                }
            },
            commentEnd: function () {
                var char = this.consume();
                if (char === ">") {
                    this.delegate.finishComment();
                    this.state = 'beforeData';
                }
                else {
                    this.delegate.appendToCommentData("--" + char);
                    this.state = 'comment';
                }
            },
            tagName: function () {
                var char = this.consume();
                if (isSpace(char)) {
                    this.state = 'beforeAttributeName';
                }
                else if (char === "/") {
                    this.state = 'selfClosingStartTag';
                }
                else if (char === ">") {
                    this.delegate.finishTag();
                    this.state = 'beforeData';
                }
                else {
                    this.delegate.appendToTagName(char);
                }
            },
            beforeAttributeName: function () {
                var char = this.peek();
                if (isSpace(char)) {
                    this.consume();
                    return;
                }
                else if (char === "/") {
                    this.state = 'selfClosingStartTag';
                    this.consume();
                }
                else if (char === ">") {
                    this.consume();
                    this.delegate.finishTag();
                    this.state = 'beforeData';
                }
                else if (char === '=') {
                    this.delegate.reportSyntaxError("attribute name cannot start with equals sign");
                    this.state = 'attributeName';
                    this.delegate.beginAttribute();
                    this.consume();
                    this.delegate.appendToAttributeName(char);
                }
                else {
                    this.state = 'attributeName';
                    this.delegate.beginAttribute();
                }
            },
            attributeName: function () {
                var char = this.peek();
                if (isSpace(char)) {
                    this.state = 'afterAttributeName';
                    this.consume();
                }
                else if (char === "/") {
                    this.delegate.beginAttributeValue(false);
                    this.delegate.finishAttributeValue();
                    this.consume();
                    this.state = 'selfClosingStartTag';
                }
                else if (char === "=") {
                    this.state = 'beforeAttributeValue';
                    this.consume();
                }
                else if (char === ">") {
                    this.delegate.beginAttributeValue(false);
                    this.delegate.finishAttributeValue();
                    this.consume();
                    this.delegate.finishTag();
                    this.state = 'beforeData';
                }
                else if (char === '"' || char === "'" || char === '<') {
                    this.delegate.reportSyntaxError(char + " is not a valid character within attribute names");
                    this.consume();
                    this.delegate.appendToAttributeName(char);
                }
                else {
                    this.consume();
                    this.delegate.appendToAttributeName(char);
                }
            },
            afterAttributeName: function () {
                var char = this.peek();
                if (isSpace(char)) {
                    this.consume();
                    return;
                }
                else if (char === "/") {
                    this.delegate.beginAttributeValue(false);
                    this.delegate.finishAttributeValue();
                    this.consume();
                    this.state = 'selfClosingStartTag';
                }
                else if (char === "=") {
                    this.consume();
                    this.state = 'beforeAttributeValue';
                }
                else if (char === ">") {
                    this.delegate.beginAttributeValue(false);
                    this.delegate.finishAttributeValue();
                    this.consume();
                    this.delegate.finishTag();
                    this.state = 'beforeData';
                }
                else {
                    this.delegate.beginAttributeValue(false);
                    this.delegate.finishAttributeValue();
                    this.consume();
                    this.state = 'attributeName';
                    this.delegate.beginAttribute();
                    this.delegate.appendToAttributeName(char);
                }
            },
            beforeAttributeValue: function () {
                var char = this.peek();
                if (isSpace(char)) {
                    this.consume();
                }
                else if (char === '"') {
                    this.state = 'attributeValueDoubleQuoted';
                    this.delegate.beginAttributeValue(true);
                    this.consume();
                }
                else if (char === "'") {
                    this.state = 'attributeValueSingleQuoted';
                    this.delegate.beginAttributeValue(true);
                    this.consume();
                }
                else if (char === ">") {
                    this.delegate.beginAttributeValue(false);
                    this.delegate.finishAttributeValue();
                    this.consume();
                    this.delegate.finishTag();
                    this.state = 'beforeData';
                }
                else {
                    this.state = 'attributeValueUnquoted';
                    this.delegate.beginAttributeValue(false);
                    this.consume();
                    this.delegate.appendToAttributeValue(char);
                }
            },
            attributeValueDoubleQuoted: function () {
                var char = this.consume();
                if (char === '"') {
                    this.delegate.finishAttributeValue();
                    this.state = 'afterAttributeValueQuoted';
                }
                else if (char === "&") {
                    this.delegate.appendToAttributeValue(this.consumeCharRef('"') || "&");
                }
                else {
                    this.delegate.appendToAttributeValue(char);
                }
            },
            attributeValueSingleQuoted: function () {
                var char = this.consume();
                if (char === "'") {
                    this.delegate.finishAttributeValue();
                    this.state = 'afterAttributeValueQuoted';
                }
                else if (char === "&") {
                    this.delegate.appendToAttributeValue(this.consumeCharRef("'") || "&");
                }
                else {
                    this.delegate.appendToAttributeValue(char);
                }
            },
            attributeValueUnquoted: function () {
                var char = this.peek();
                if (isSpace(char)) {
                    this.delegate.finishAttributeValue();
                    this.consume();
                    this.state = 'beforeAttributeName';
                }
                else if (char === "&") {
                    this.consume();
                    this.delegate.appendToAttributeValue(this.consumeCharRef(">") || "&");
                }
                else if (char === ">") {
                    this.delegate.finishAttributeValue();
                    this.consume();
                    this.delegate.finishTag();
                    this.state = 'beforeData';
                }
                else {
                    this.consume();
                    this.delegate.appendToAttributeValue(char);
                }
            },
            afterAttributeValueQuoted: function () {
                var char = this.peek();
                if (isSpace(char)) {
                    this.consume();
                    this.state = 'beforeAttributeName';
                }
                else if (char === "/") {
                    this.consume();
                    this.state = 'selfClosingStartTag';
                }
                else if (char === ">") {
                    this.consume();
                    this.delegate.finishTag();
                    this.state = 'beforeData';
                }
                else {
                    this.state = 'beforeAttributeName';
                }
            },
            selfClosingStartTag: function () {
                var char = this.peek();
                if (char === ">") {
                    this.consume();
                    this.delegate.markTagAsSelfClosing();
                    this.delegate.finishTag();
                    this.state = 'beforeData';
                }
                else {
                    this.state = 'beforeAttributeName';
                }
            },
            endTagOpen: function () {
                var char = this.consume();
                if (isAlpha(char)) {
                    this.state = 'tagName';
                    this.delegate.beginEndTag();
                    this.delegate.appendToTagName(char.toLowerCase());
                }
            }
        };
        this.reset();
    }
    EventedTokenizer.prototype.reset = function () {
        this.state = 'beforeData';
        this.input = '';
        this.index = 0;
        this.line = 1;
        this.column = 0;
        this.tagLine = -1;
        this.tagColumn = -1;
        this.delegate.reset();
    };
    EventedTokenizer.prototype.tokenize = function (input) {
        this.reset();
        this.tokenizePart(input);
        this.tokenizeEOF();
    };
    EventedTokenizer.prototype.tokenizePart = function (input) {
        this.input += preprocessInput(input);
        while (this.index < this.input.length) {
            this.states[this.state].call(this);
        }
    };
    EventedTokenizer.prototype.tokenizeEOF = function () {
        this.flushData();
    };
    EventedTokenizer.prototype.flushData = function () {
        if (this.state === 'data') {
            this.delegate.finishData();
            this.state = 'beforeData';
        }
    };
    EventedTokenizer.prototype.peek = function () {
        return this.input.charAt(this.index);
    };
    EventedTokenizer.prototype.consume = function () {
        var char = this.peek();
        this.index++;
        if (char === "\n") {
            this.line++;
            this.column = 0;
        }
        else {
            this.column++;
        }
        return char;
    };
    EventedTokenizer.prototype.consumeCharRef = function () {
        var endIndex = this.input.indexOf(';', this.index);
        if (endIndex === -1) {
            return;
        }
        var entity = this.input.slice(this.index, endIndex);
        var chars = this.entityParser.parse(entity);
        if (chars) {
            var count = entity.length;
            // consume the entity chars
            while (count) {
                this.consume();
                count--;
            }
            // consume the `;`
            this.consume();
            return chars;
        }
    };
    EventedTokenizer.prototype.markTagStart = function () {
        // these properties to be removed in next major bump
        this.tagLine = this.line;
        this.tagColumn = this.column;
        if (this.delegate.tagOpen) {
            this.delegate.tagOpen();
        }
    };
    return EventedTokenizer;
}());

var Tokenizer = /** @class */ (function () {
    function Tokenizer(entityParser, options) {
        if (options === void 0) { options = {}; }
        this.options = options;
        this._token = null;
        this.startLine = 1;
        this.startColumn = 0;
        this.tokens = [];
        this.currentAttribute = null;
        this.tokenizer = new EventedTokenizer(this, entityParser);
    }
    Object.defineProperty(Tokenizer.prototype, "token", {
        get: function () {
            return unwrap(this._token);
        },
        set: function (value) {
            this._token = value;
        },
        enumerable: true,
        configurable: true
    });
    Tokenizer.prototype.tokenize = function (input) {
        this.tokens = [];
        this.tokenizer.tokenize(input);
        return this.tokens;
    };
    Tokenizer.prototype.tokenizePart = function (input) {
        this.tokens = [];
        this.tokenizer.tokenizePart(input);
        return this.tokens;
    };
    Tokenizer.prototype.tokenizeEOF = function () {
        this.tokens = [];
        this.tokenizer.tokenizeEOF();
        return this.tokens[0];
    };
    Tokenizer.prototype.reset = function () {
        this._token = null;
        this.startLine = 1;
        this.startColumn = 0;
    };
    Tokenizer.prototype.addLocInfo = function () {
        if (this.options.loc) {
            this.token.loc = {
                start: {
                    line: this.startLine,
                    column: this.startColumn
                },
                end: {
                    line: this.tokenizer.line,
                    column: this.tokenizer.column
                }
            };
        }
        this.startLine = this.tokenizer.line;
        this.startColumn = this.tokenizer.column;
    };
    // Data
    Tokenizer.prototype.beginData = function () {
        this.token = {
            type: 'Chars',
            chars: ''
        };
        this.tokens.push(this.token);
    };
    Tokenizer.prototype.appendToData = function (char) {
        this.token.chars += char;
    };
    Tokenizer.prototype.finishData = function () {
        this.addLocInfo();
    };
    // Comment
    Tokenizer.prototype.beginComment = function () {
        this.token = {
            type: 'Comment',
            chars: ''
        };
        this.tokens.push(this.token);
    };
    Tokenizer.prototype.appendToCommentData = function (char) {
        this.token.chars += char;
    };
    Tokenizer.prototype.finishComment = function () {
        this.addLocInfo();
    };
    // Tags - basic
    Tokenizer.prototype.beginStartTag = function () {
        this.token = {
            type: 'StartTag',
            tagName: '',
            attributes: [],
            selfClosing: false
        };
        this.tokens.push(this.token);
    };
    Tokenizer.prototype.beginEndTag = function () {
        this.token = {
            type: 'EndTag',
            tagName: ''
        };
        this.tokens.push(this.token);
    };
    Tokenizer.prototype.finishTag = function () {
        this.addLocInfo();
    };
    Tokenizer.prototype.markTagAsSelfClosing = function () {
        this.token.selfClosing = true;
    };
    // Tags - name
    Tokenizer.prototype.appendToTagName = function (char) {
        this.token.tagName += char;
    };
    // Tags - attributes
    Tokenizer.prototype.beginAttribute = function () {
        var attributes = unwrap(this.token.attributes, "current token's attributs");
        this.currentAttribute = ["", "", false];
        attributes.push(this.currentAttribute);
    };
    Tokenizer.prototype.appendToAttributeName = function (char) {
        var currentAttribute = unwrap(this.currentAttribute);
        currentAttribute[0] += char;
    };
    Tokenizer.prototype.beginAttributeValue = function (isQuoted) {
        var currentAttribute = unwrap(this.currentAttribute);
        currentAttribute[2] = isQuoted;
    };
    Tokenizer.prototype.appendToAttributeValue = function (char) {
        var currentAttribute = unwrap(this.currentAttribute);
        currentAttribute[1] = currentAttribute[1] || "";
        currentAttribute[1] += char;
    };
    Tokenizer.prototype.finishAttributeValue = function () {
    };
    Tokenizer.prototype.reportSyntaxError = function (message) {
        this.token.syntaxError = message;
    };
    return Tokenizer;
}());

function tokenize(input, options) {
    var tokenizer = new Tokenizer(new EntityParser(namedCharRefs), options);
    return tokenizer.tokenize(input);
}

exports.HTML5NamedCharRefs = namedCharRefs;
exports.EntityParser = EntityParser;
exports.EventedTokenizer = EventedTokenizer;
exports.Tokenizer = Tokenizer;
exports.tokenize = tokenize;

Object.defineProperty(exports, '__esModule', { value: true });

})));



},{}]},{},[7]);
