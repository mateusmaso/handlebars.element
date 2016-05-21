import store from "./store"

export function extend(object) {
  for (let i = 1; i < arguments.length; i++) {
    for (let key in arguments[i]) {
      if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
        object[key] = arguments[i][key];
      }
    }
  }

  return object;
}

export function isObject(object) {
  return object === Object(object);
}

export function isString(object) {
  return toString.call(object) == '[object String]';
}

export function uniqueId() {
  var generate = function(bool) {
    var random = (Math.random().toString(16) + "000000000").substr(2, 8);
    return bool ? "-" + random.substr(0, 4) + "-" + random.substr(4, 4) : random;
  }

  return generate() + generate(true) + generate(true) + generate();
}

export function flatten(array, flattenArray) {
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

export function camelize(string) {
  return string.trim().replace(/[-_\s]+(.)?/g, function(match, word) {
    return word ? word.toUpperCase() : "";
  });
}

export function replaceWith(node, nodes) {
  nodes = Handlebars.Utils.isArray(nodes) ? nodes : [nodes];

  for (var index = 0; index < nodes.length; index++) {
    if (index == 0) {
      node.parentNode.replaceChild(nodes[index], node);
    } else {
      insertAfter(nodes[index - 1], nodes[index]);
    }
  }
}

export function insertAfter(node, nodes) {
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

export function escapeExpression(value) {
  if (isObject(value) && !(value instanceof Handlebars.SafeString)) {
    var id = store.keyFor(value);

    if (id) {
      value = id;
    } else {
      id = uniqueId();
      store.hold(id, value);
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

  if (!possible.test(string)) { return string; }
  return string.replace(badChars, escapeChar);
}
