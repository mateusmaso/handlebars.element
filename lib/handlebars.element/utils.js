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

  if (typeof string !== 'string') {
    if (string && string.toHTML) {
      return string.toHTML();
    } else if (string == null) {
      return '';
    } else if (!string) {
      return string + '';
    }

    string = '' + string;
  }

  if (!possible.test(string)) {
    return string;
  }
  return string.replace(badChars, escapeChar);
}
