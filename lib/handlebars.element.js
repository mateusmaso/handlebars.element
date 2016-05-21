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
