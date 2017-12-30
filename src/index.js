import {
  isObject,
  isString,
  uniqueId,
  flatten,
  camelize,
  replaceWith,
  insertAfter,
  escapeExpression
} from './utils';

import {
  store,
  elements,
  attributes,
  registerElement,
  registerAttribute,
  parseValue,
  parseHTML
} from './core';

function bindAll(object, parent) {
  Object.keys(object).forEach((key) => {
    if (typeof object[key] === "function") {
      object[key] = object[key].bind(parent)
    }
  })

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
    _escapeExpression,
    escapeExpression: (value) => {
      return escapeExpression.apply(Handlebars.Utils, [value, Handlebars.store])
    }
  };
};

export default function HandlebarsElement(Handlebars) {
  Object.assign(Handlebars, bindAll({
    store,
    elements,
    attributes,
    registerElement,
    registerAttribute,
    parseValue,
    parseHTML
  }, Handlebars));

  Object.assign(Handlebars.Utils, bindAll({
    isObject,
    isString,
    uniqueId,
    flatten,
    camelize,
    replaceWith,
    insertAfter,
    ...extendEscapeExpression(Handlebars)
  }, Handlebars.Utils));

  return Handlebars;
}

if (typeof window !== "undefined" && window.Handlebars) {
  HandlebarsElement(window.Handlebars);
}
