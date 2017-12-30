export default function registerElement(name, fn, options) {
  fn.options = options || {};
  this.elements[name] = fn;
}
