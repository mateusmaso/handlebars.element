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
} from './utils';

import {
  elements,
  attributes,
  registerElement,
  registerAttribute,
  parseValue,
  parseHTML
} from './core';

import store from "./store";
import deps from "./deps";

export default function HandlebarsElement(Handlebars) {
  extend(deps, {Handlebars});

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

if (typeof window !== "undefined" && window.Handlebars) {
  HandlebarsElement(window.Handlebars);
}
