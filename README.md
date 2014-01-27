handlebars.element
==================

## Register your custom element

```javascript
Handlebars.registerElement("foo", function(element, attributes) {
  var div = document.createElement("div");
  
  if (attributes.red) div.style.background = "red";
  if (attributes.green) div.style.background = "green";
  if (attributes.blue) div.style.background = "blue";
  
  div.innerText = "Hello World " + (attributes.title ? attributes.title : "guest");
  
  return div;
}, {booleans: ["red", "green", "blue"]});
```

## Declare using the hb-* syntax

```html
<div>
  <p>Now you can have custom elements with Handlebars!</p>
  <hb-foo title="Vermelho" red></hb-foo>
  <hb-foo title="Verde" green></hb-foo>
  <hb-foo title="Azul" blue></hb-foo>
</div>
```

## Parse the template html string after render

```javascript
var html = Handlebars.templates["path/to/template"]();
var nodes = Handlebars.parseHTML(html);
```
