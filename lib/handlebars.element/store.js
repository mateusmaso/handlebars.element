"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hold = hold;
exports.release = release;
exports.keyFor = keyFor;

var _utils = require("./utils");

var store = {};

function hold(key, value) {
  return store[key] = value;
}

function release(key) {
  var value = store[key];
  delete store[key];
  return value;
}

function keyFor(value) {
  for (var key in store) {
    if (store[key] == value) {
      return key;
    }
  }
}

(0, _utils.extend)(store, { hold: hold, release: release, keyFor: keyFor });

exports.default = store;
