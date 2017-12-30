"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = escapeExpression;
function escapeExpression(value, store, SafeString) {
  if (this.isObject(value) && !(value instanceof SafeString)) {
    var id = store.keyFor(value);

    if (id) {
      value = id;
    } else {
      id = this.uniqueId();
      store.hold(id, value);
      value = id;
    }
  } else if (value === false) {
    value = value.toString();
  }

  return this._escapeExpression(value);
}
