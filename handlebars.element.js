(function(Handlebars) {

  var store = {};
  var increment = 0;
  var escapeExpression = Handlebars.Utils.escapeExpression;

  var isObject = function(object) {
    return object === Object(object);
  };

  var isArray = function(object) {
    return toString.call(object) == '[object Array]';
  };

  var flatten = function(array, flattenArray) {
    flattenArray = flattenArray || [];

    for (var index = 0; index < array.length; index++) {
      if (isArray(array[index])) {
        flatten(array[index], flattenArray);
      } else {
        flattenArray.push(array[index]);
      }
    };

    return flattenArray;
  };

  var camelize = function(string){
    return string.trim().replace(/[-_\s]+(.)?/g, function(match, word) { 
      return word ? word.toUpperCase() : ""; 
    });
  };

  var parse = function(value) {
    try {
      return JSON.parse(value);
    } catch (error) {
      return value;
    }
  };

  var replaceWith = function(node, nodes) {
    nodes = isArray(nodes) ? nodes : [nodes];

    for (var index = 0; index < nodes.length; index++) {
      if (index == 0) {
        node.parentNode.replaceChild(nodes[index], node);
      } else {
        insertAfter(nodes[index - 1], nodes[index]);
      }
    }
  };

  var insertAfter = function(node, nodes) {
    nodes = isArray(nodes) ? nodes.slice() : [nodes];
    nodes.unshift(node);

    for (var index = 1; index < nodes.length; index++) {
      if (nodes[index - 1].nextSibling) {
        nodes[index - 1].parentNode.insertBefore(nodes[index], nodes[index - 1].nextSibling);
      } else {
        nodes[index - 1].parentNode.appendChild(nodes[index]);
      }
    }
  };

  Handlebars.elements = {};

  Handlebars.Utils.escapeExpression = function(value) {
    if (isObject(value) && !(value instanceof Handlebars.SafeString)) {
      var id = ++increment + "c";
      store[id] = value;
      value = id;
    } else if (value === false) {
      value = value.toString()
    }

    return escapeExpression.apply(this, [value]);
  };

  Handlebars.registerElement = function(name, fn, options) {
    fn.options = options || {};
    this.elements[name] = fn;
  };

  Handlebars.parseHTML = function(html) {
    var div = document.createElement('div');
    div.innerHTML = html.trim();

    var nodes = flatten(div.childNodes);
    var elements = [];

    while (nodes.length != 0) {
      var nextNodes = [];

      for (var index = 0; index < nodes.length; index++) {
        var childNodes = flatten(nodes[index].childNodes);

        for (var bIndex = 0; bIndex < childNodes.length; bIndex++) {
          nextNodes.push(childNodes[bIndex]);
        }

        if (/^hb-/i.test(nodes[index].nodeName)) {
          elements.unshift(nodes[index]);
        }
      }

      nodes = nextNodes;
    }

    for (var index = 0; index < elements.length; index++) {
      var attributes = {};
      var element = elements[index];
      var elementName = element.tagName.toLowerCase().replace("hb-", "");
      var fn = Handlebars.elements[elementName];

      for (var bIndex = 0; bIndex < element.attributes.length; bIndex++) {
        var attribute = element.attributes.item(bIndex);
        var name = camelize(attribute.nodeName);
        var value = store[attribute.nodeValue] || parse(attribute.nodeValue);
        var bool = fn.options.booleans && fn.options.booleans.indexOf(name) >= 0;
        delete store[attribute.nodeValue];

        attributes[name] = bool ? value !== false : (value === "" ? undefined : value);
      }

      replaceWith(element, fn.apply(element, [attributes]));
    }

    return flatten(div.childNodes);
  };

})(Handlebars);
