"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = camelize;
function camelize(string) {
  return string.trim().replace(/[-_\s]+(.)?/g, function (match, word) {
    return word ? word.toUpperCase() : "";
  });
}
