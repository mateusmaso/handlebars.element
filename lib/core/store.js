"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var store = {};

function hold(key, value) {
  return this[key] = value;
}

function release(key) {
  var value = this[key];
  delete this[key];
  return value;
}

function keyFor(value) {
  for (var key in this) {
    if (this[key] == value) {
      return key;
    }
  }
}

_extends(store, { hold: hold, release: release, keyFor: keyFor });

exports.default = store;
