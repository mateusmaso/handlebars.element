handlebars.element
==================

### Register your custom element or attribute

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

```javascript
Handlebars.registerAttribute("bar", function(element) {
  var style = document.createAttribute("style");
  style.background = "purple";
  
  return style;
});
```

### Declare using the hb-* syntax

```html
<div>
  <p hb-bar>Now you can have custom elements or attributes with Handlebars!</p>
  <hb-foo title="Vermelho" red></hb-foo>
  <hb-foo title="Verde" green></hb-foo>
  <hb-foo title="Azul" blue></hb-foo>
</div>
```

### Parse the template HTML string after render

```javascript
var html = Handlebars.templates["path/to/template"]();
var nodes = Handlebars.parseHTML(html);
```

### HTML result

```html
<div>
  <p style="background: purple">Now you can have custom elements or attributes with Handlebars!</p>
  <div style="background: red">Hello World Vermelho</div>
  <div style="background: green">Hello World Verde</div>
  <div style="background: blue">Hello World Azul</div>
</div>
```
