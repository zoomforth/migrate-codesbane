'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toStructuredSection = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _map = require('lodash/map');

var _map2 = _interopRequireDefault(_map);

var _compact = require('lodash/compact');

var _compact2 = _interopRequireDefault(_compact);

var _migrator_utils = require('./migrator_utils.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var UUID_PREFIX = 'uuid-';
var ADD_TILE = 'add-tile';

var toStructuredGridPositionsFromV1 = function toStructuredGridPositionsFromV1(gridPositions) {
  return (0, _migrator_utils.sortTiles)((0, _compact2.default)((0, _map2.default)(gridPositions, function (_ref) {
    var uuid = _ref.uuid,
        rest = _objectWithoutProperties(_ref, ['uuid']);

    if (uuid === ADD_TILE) {
      return null;
    }
    return _extends({ uuid: parseInt(uuid.slice(UUID_PREFIX.length)), type: 'tile' }, rest);
  })));
};

var toStructuredSectionFromTilesV1 = function toStructuredSectionFromTilesV1(page, defaultColumnCount, legacyConfigData) {
  // legacyConfigData may have gridPositions and/or gridColumnCount 
  // and/or other keys we don't care about
  var result = {
    type: 'tiles',
    id: page.pageId,
    gridPositions: toStructuredGridPositionsFromV1(page.type === 'home' ?
    // this is some real legacy stuff here -- 'home' type pages
    // used to have their grid positions stored directly on the config element
    page.grid_positions || legacyConfigData.gridPositions : page.grid_positions || []),
    columnCount: page.type === 'home' ? page.column_count || legacyConfigData.gridColumnCount || defaultColumnCount : page.column_count || defaultColumnCount
  };
  return result;
};

var toStructuredSectionFromSingletonV1 = function toStructuredSectionFromSingletonV1(page, orderedPageContentUuids) {
  return {
    type: page.type,
    id: page.pageId,
    singletonContentUuid: orderedPageContentUuids.length > 0 ? orderedPageContentUuids[0] : null
  };
};

var toStructuredSectionFromGenericV1 = function toStructuredSectionFromGenericV1(page, orderedPageContentUuids) {
  return {
    type: page.type,
    id: page.pageId,
    orderedContentUuids: orderedPageContentUuids
  };
};

var toStructuredSection = exports.toStructuredSection = function toStructuredSection(page, orderedPageContentUuids, extraData, defaultColumnCount) {

  switch (page.type) {

    case 'tiles':
    case 'home':
      // 'home' sections are all grid sections
      return _extends({}, toStructuredSectionFromTilesV1(page, defaultColumnCount, extraData));

    case 'pdf':
    case 'text':
      return _extends({}, toStructuredSectionFromSingletonV1(page, orderedPageContentUuids));

    default:
      return _extends({}, toStructuredSectionFromGenericV1(page, orderedPageContentUuids));

  }
};