export default function registerAttribute(name, fn, options) {
  fn.options = options || {};
  this.attributes[name] = fn;
}
