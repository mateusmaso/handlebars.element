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

function HandlebarsElement(Handlebars) {
  extend(Handlebars, {
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
    escapeExpression
  });

  return Handlebars;
}

if (typeof window !== "undefined") {
  HandlebarsElement = HandlebarsElement(window.Handlebars);
}

export default HandlebarsElement;
