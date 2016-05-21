handlebars.element [![Build Status](https://travis-ci.org/mateusmaso/handlebars.element.svg?branch=master)](https://travis-ci.org/mateusmaso/handlebars.element)
==================

This is a Handlebars plugin which allows using a similar W3C syntax for declaring custom elements and attributes inside templates.

## Install

```
$ npm install --save handlebars.element
```

## Usage

```javascript
var Handlebars = require("handlebars");
require("handlebars.element").default(Handlebars);

var context = {};
var template = Handlebars.templates["path/to/template"];
var nodes = Handlebars.parseHTML(template(context));
```

## Examples

### Declaring custom elements and attributes

```html
<div>
  <p hb-bar>Now you can write custom elements and attributes with Handlebars!</p>
  <hb-foo title="Red" red></hb-foo>
  <hb-foo title="Green" green></hb-foo>
  <hb-foo title="Blue" blue></hb-foo>
  <hb-foo title="Purple" hb-bar></hb-foo>
</div>
```

### Registering a custom element

```javascript
Handlebars.registerElement("foo", function(attributes) {
  var div = document.createElement("div");
  div.innerText = "Hello World " + (attributes.title ? attributes.title : "guest");

  if (attributes.red) {
    div.className = "red";
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
    // Use this callback for listening to element events.
  }
});
```

### After ```parseHTML```

```html
<div>
  <p class="purple">Now you can write custom elements and attributes with Handlebars!</p>
  <div class="red">Hello World Red</div>
  <div class="green">Hello World Green</div>
  <div class="blue">Hello World Blue</div>
  <div class="purple">Hello World Purple</div>
</div>
```

## License

MIT © [Mateus Maso](http://www.mateusmaso.com)
