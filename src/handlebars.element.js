import {
  extend,
  isObject,
  isString,
  uniqueId,
  flatten,
  camelize,
  replaceWith,
  insertAfter,
  escapeExpression
} from './handlebars.element/utils';

import {
  elements,
  attributes,
  registerElement,
  registerAttribute,
  parseValue,
  parseHTML
} from './handlebars.element/core';

import store from "./handlebars.element/store";

function HandlebarsElement(Handlebars) {
  extend(Handlebars, {
    store,
    elements,
    attributes,
    registerElement,
    registerAttribute,
    parseValue,
    parseHTML
  });

  extend(Handlebars.Utils, {
    extend,
    isObject,
    isString,
    uniqueId,
    flatten,
    camelize,
    replaceWith,
    insertAfter,
    escapeExpression,
    _escapeExpression: Handlebars.Utils.escapeExpression
  });

  return Handlebars;
}

if (typeof window !== "undefined") {
  HandlebarsElement = HandlebarsElement(window.Handlebars);
}

export default HandlebarsElement;
