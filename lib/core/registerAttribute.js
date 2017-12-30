"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = registerAttribute;
function registerAttribute(name, fn, options) {
  fn.options = options || {};
  this.attributes[name] = fn;
}
