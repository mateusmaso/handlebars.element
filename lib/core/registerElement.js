"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = registerElement;
function registerElement(name, fn, options) {
  fn.options = options || {};
  this.elements[name] = fn;
}
