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
