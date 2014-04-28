handlebars.element
==================

This library is an extension for Handlebars which allows declaring custom elements and attributes without modern browser restrictions. The goal behind this project is to encourage the adoption of this new declarative syntax and support the spec as a proof of concept.

## Features

* Custom element like declarations
* Custom attribute like declarations

## Dependencies

* handlebars.js (>= 1.0)

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
  
  if (attributes.red) div.style.background = "red";
  if (attributes.green) div.style.background = "green";
  if (attributes.blue) div.style.background = "blue";
  
  div.innerText = "Hello World " + (attributes.title ? attributes.title : "guest");
  
  return div;
}, {booleans: ["red", "green", "blue"]});
```

### Registering a custom attribute

```javascript
Handlebars.registerAttribute("bar", function(element) {
  var style = document.createAttribute("style");
  style.background = "purple";
  
  return style;
});
```

### Declaring it using the hb-* syntax

```html
<div>
  <p hb-bar>Now you can have custom elements or attributes with Handlebars!</p>
  <hb-foo title="Vermelho" red></hb-foo>
  <hb-foo title="Verde" green></hb-foo>
  <hb-foo title="Azul" blue></hb-foo>
</div>
```

### Expected result after render

```html
<div>
  <p style="background: purple">Now you can have custom elements or attributes with Handlebars!</p>
  <div style="background: red">Hello World Vermelho</div>
  <div style="background: green">Hello World Verde</div>
  <div style="background: blue">Hello World Azul</div>
</div>
```

## License

Copyright (c) 2013-2014 Mateus Maso. Released under an MIT license.
