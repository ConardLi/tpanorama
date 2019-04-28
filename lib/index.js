'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _tpanorama = require('./component/tpanorama');

Object.defineProperty(exports, 'tpanorama', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_tpanorama).default;
  }
});

var _tpanoramaSetting = require('./component/tpanoramaSetting');

Object.defineProperty(exports, 'tpanoramaSetting', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_tpanoramaSetting).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }