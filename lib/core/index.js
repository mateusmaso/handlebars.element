'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseValue = exports.parseHTML = exports.registerAttribute = exports.registerElement = exports.attributes = exports.elements = exports.store = undefined;

var _store = require('./store');

var _store2 = _interopRequireDefault(_store);

var _parseHTML = require('./parseHTML');

var _parseHTML2 = _interopRequireDefault(_parseHTML);

var _parseValue = require('./parseValue');

var _parseValue2 = _interopRequireDefault(_parseValue);

var _registerElement = require('./registerElement');

var _registerElement2 = _interopRequireDefault(_registerElement);

var _registerAttribute = require('./registerAttribute');

var _registerAttribute2 = _interopRequireDefault(_registerAttribute);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var elements = {};
var attributes = {};

exports.store = _store2.default;
exports.elements = elements;
exports.attributes = attributes;
exports.registerElement = _registerElement2.default;
exports.registerAttribute = _registerAttribute2.default;
exports.parseHTML = _parseHTML2.default;
exports.parseValue = _parseValue2.default;
