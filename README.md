handlebars.element [![Build Status](https://travis-ci.org/mateusmaso/handlebars.element.svg?branch=master)](https://travis-ci.org/mateusmaso/handlebars.element)
==================

This library is an extension for Handlebars which allows declaring custom elements and attributes without modern browser restrictions. The goal behind this project is to encourage the adoption of this new declarative syntax and support the spec as a proof of concept.

## Features

* New ```parseHTML``` method for parsing string templates into HTML nodes.
* ```registerElement``` and ```registerAttribute``` methods for defining custom elements and attributes.

## Dependencies

* handlebars.js (>= 1.1.0)

## Node

```javascript
var Handlebars = global.Handlebars = require("handlebars");
require("handlebars.element");
```

## Usage

```javascript
var context = {};
var template = Handlebars.templates["path/to/your/template"];
var nodes = Handlebars.parseHTML(template(context));
```

## Examples

### Registering a custom element

```javascript
Handlebars.registerElement("foo", function(attributes) {
  var div = document.createElement("div");
  div.innerText = "Hello World " + (attributes.title ? attributes.title : "guest");

  if (attributes.red) {
    div.className = "red;";
  } else if (attributes.green) {
    div.className = "green";
  } else if (attributes.blue) {
    div.className = "blue";
  }

  return div;
}, {
  booleans: ["red", "green", "blue"]
});
```

### Registering a custom attribute

```javascript
Handlebars.registerAttribute("bar", function(element) {
  var style = document.createAttribute("style");
  style.className = "purple";
  return style;
}, {
  ready: function(element) {
    // this callback ensures that the element is a valid HTML node. It is useful in cases that the attribute was declared inside a custom element scope.
  }
});
```

### Declaring using the hb-* syntax

```html
<div>
  <p hb-bar>Now you can have custom elements or attributes with Handlebars!</p>
  <hb-foo title="Red" red></hb-foo>
  <hb-foo title="Green" green></hb-foo>
  <hb-foo title="Blue" blue></hb-foo>
  <hb-foo title="Purple" hb-bar></hb-foo>
</div>
```

### Expected result after render

```html
<div>
  <p class="purple">Now you can have custom elements or attributes with Handlebars!</p>
  <div class="red">Hello World Red</div>
  <div class="green">Hello World Green</div>
  <div class="blue">Hello World Blue</div>
  <div class="purple">Hello World Purple</div>
</div>
```

## License

Copyright (c) 2013-2014 Mateus Maso. Released under an MIT license.
