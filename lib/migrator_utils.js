'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sortTiles = exports.getSectionIdForPageContentItemApiModel = exports.isHomeSubpage = exports.LABEL_PREFIX = undefined;

var _isBoolean = require('lodash/isBoolean');

var _isBoolean2 = _interopRequireDefault(_isBoolean);

var _sortBy = require('lodash/sortBy');

var _sortBy2 = _interopRequireDefault(_sortBy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LABEL_PREFIX = exports.LABEL_PREFIX = 'gridlens-page:';

var isHomeSubpage = exports.isHomeSubpage = function isHomeSubpage(page) {
  if (page.pageId === 'home' && !(0, _isBoolean2.default)(page.isHome)) {
    return true;
  } else if (page.isHome) {
    return true;
  }
  return false;
};

var getSectionIdForPageContentItemApiModel = exports.getSectionIdForPageContentItemApiModel = function getSectionIdForPageContentItemApiModel(item) {
  if (!item.label || item.label.indexOf(LABEL_PREFIX) !== 0) {
    return null;
  }
  return item.label.slice(LABEL_PREFIX.length);
};

var sortTiles = exports.sortTiles = function sortTiles(unsortedTiles) {
  return (0, _sortBy2.default)(unsortedTiles, function (_ref) {
    var row = _ref.row,
        col = _ref.col;

    return row * 100 + col; // row # always matters more than column for sorting
  });
};