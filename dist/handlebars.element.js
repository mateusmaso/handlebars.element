// handlebars.element
// ------------------
// v0.1.3
//
// Copyright (c) 2013-2014 Mateus Maso
// Distributed under MIT license
//
// http://github.com/mateusmaso/handlebars.element

(function(root, factory) {

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports)
      module.exports = factory(global.Handlebars);
    exports = factory(global.Handlebars);
  } else {
    factory(root.Handlebars);
  }

}(this, function(Handlebars) {

  var Utils = Handlebars.Utils;
  var extend = Handlebars.Utils.extend;
  var escapeExpression = Handlebars.Utils.escapeExpression;

  Handlebars.store = {};
  Handlebars.elements = {};
  Handlebars.attributes = {};

  Handlebars.store.hold = function(key, value) {
    return Handlebars.store[key] = value;
  };

  Handlebars.store.release = function(key) {
    var value = Handlebars.store[key];
    delete Handlebars.store[key];
    return value;
  };

  Handlebars.store.keyFor = function(value) {
    for (var key in Handlebars.store) {
      if (Handlebars.store[key] == value) {
        return key;
      }
    }
  };

  Handlebars.Utils.extend = function(object, value) {
    extend.apply(this, [object, value]);
    return object;
  };

  Handlebars.Utils.isObject = function(object) {
    return object === Object(object);
  };

  Handlebars.Utils.isString = function(object) {
    return toString.call(object) == '[object String]';
  };

  Handlebars.Utils.uniqueId = function() {
    var generate = function(bool) {
      var random = (Math.random().toString(16) + "000000000").substr(2, 8);
      return bool ? "-" + random.substr(0, 4) + "-" + random.substr(4, 4) : random;
    }

    return generate() + generate(true) + generate(true) + generate();
  };

  Handlebars.Utils.flatten = function(array, flattenArray) {
    flattenArray = flattenArray || [];

    for (var index = 0; index < array.length; index++) {
      if (Utils.isArray(array[index])) {
        Utils.flatten(array[index], flattenArray);
      } else {
        flattenArray.push(array[index]);
      }
    };

    return flattenArray;
  };

  Handlebars.Utils.camelize = function(string) {
    return string.trim().replace(/[-_\s]+(.)?/g, function(match, word) {
      return word ? word.toUpperCase() : "";
    });
  };

  Handlebars.Utils.replaceWith = function(node, nodes) {
    nodes = Utils.isArray(nodes) ? nodes : [nodes];

    for (var index = 0; index < nodes.length; index++) {
      if (index == 0) {
        node.parentNode.replaceChild(nodes[index], node);
      } else {
        Utils.insertAfter(nodes[index - 1], nodes[index]);
      }
    }
  };

  Handlebars.Utils.insertAfter = function(node, nodes) {
    nodes = Utils.isArray(nodes) ? nodes.slice() : [nodes];
    nodes.unshift(node);

    for (var index = 1; index < nodes.length; index++) {
      if (nodes[index - 1].nextSibling) {
        nodes[index - 1].parentNode.insertBefore(nodes[index], nodes[index - 1].nextSibling);
      } else {
        nodes[index - 1].parentNode.appendChild(nodes[index]);
      }
    }
  };

  Handlebars.Utils.escapeExpression = function(value) {
    if (Utils.isObject(value) && !(value instanceof Handlebars.SafeString)) {
      var id = Handlebars.store.keyFor(value);

      if (id) {
        value = id;
      } else {
        id = Utils.uniqueId();
        Handlebars.store.hold(id, value);
        value = id;
      }
    } else if (value === false) {
      value = value.toString()
    }

    return escapeExpression.apply(this, [value]);
  };

  Handlebars.registerElement = function(name, fn, options) {
    fn.options = options || {};
    this.elements[name] = fn;
  };

  Handlebars.registerAttribute = function(name, fn, options) {
    fn.options = options || {};
    this.attributes[name] = fn;
  };

  Handlebars.parseValue = function(value, bool) {
    var object = Handlebars.store[value];

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

    return bool ? (value || value === "" ? true : false) : (value === "" ? undefined : value);
  };

  Handlebars.parseHTML = function(html) {
    var bindings = [];

    if (html instanceof Handlebars.SafeString) {
      html = html.toString();
    }

    if (Utils.isString(html)) {
      var div = document.createElement('div');
      div.innerHTML = html.trim();
      var rootNodes = div.childNodes;
    } else {
      var rootNodes = html;
    }

    var nodes = Utils.flatten(rootNodes);

    while (nodes.length != 0) {
      var nextNodes = [];

      for (var index = 0; index < nodes.length; index++) {
        var binding = {owner: nodes[index], element: undefined, attributes: []};
        var childNodes = Utils.flatten(nodes[index].childNodes);

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
      var owner = bindings[index].owner;
      var element = bindings[index].element;
      var attributes = bindings[index].attributes;

      if (attributes.length > 0) {
        for (var bIndex = 0; bIndex < attributes.length; bIndex++) {
          var attribute = attributes[bIndex];
          var attributeName = attribute.name.replace("hb-", "");
          var attributeFn = Handlebars.attributes[attributeName];
          var newAttribute = attributeFn.apply(attribute, [owner]);

          if (newAttribute) {
            owner.setAttributeNode(newAttribute);
          }

          owner.removeAttributeNode(attribute);

          if (attributeFn.options.ready && !(/hb-/i.test(owner.tagName.toLowerCase()))) {
            attributeFn.options.ready.apply(attribute, [owner]);
          }
        }
      }

      if (element) {
        var elementAttributes = {};
        var elementName = element.tagName.toLowerCase().replace("hb-", "");
        var elementFn = Handlebars.elements[elementName];

        for (var bIndex = 0; bIndex < element.attributes.length; bIndex++) {
          var attribute = element.attributes.item(bIndex);
          var attributeName = Utils.camelize(attribute.nodeName);
          var bool = elementFn.options.booleans && elementFn.options.booleans.indexOf(attributeName) >= 0;

          elementAttributes[attributeName] = Handlebars.parseValue(attribute.nodeValue, bool);
        }

        var newElement = elementFn.apply(element, [elementAttributes]);
        Utils.replaceWith(element, newElement);

        for (var bIndex = 0; bIndex < attributes.length; bIndex++) {
          var attribute = attributes[bIndex];
          var attributeName = attribute.name.replace("hb-", "");
          var attributeFn = Handlebars.attributes[attributeName];

          if (attributeFn.options.ready) {
            attributeFn.options.ready.apply(attribute, [newElement]);
          }
        }
      }
    }

    return Utils.flatten(rootNodes);
  };

}));
