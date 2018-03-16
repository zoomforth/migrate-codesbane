'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMigratedConfigData = exports.isConfig = undefined;

var _each = require('lodash/each');

var _each2 = _interopRequireDefault(_each);

var _map = require('lodash/map');

var _map2 = _interopRequireDefault(_map);

var _filter = require('lodash/filter');

var _filter2 = _interopRequireDefault(_filter);

var _union = require('lodash/union');

var _union2 = _interopRequireDefault(_union);

var _compact = require('lodash/compact');

var _compact2 = _interopRequireDefault(_compact);

var _migrator_utils = require('./migrator_utils.js');

var _page_meta_migrator = require('./page_meta_migrator.js');

var _page_migrator = require('./page_migrator.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var SECTION_ID_FOR_ORPHAN_CONTENT = 'home';
var ADD_TILE_UUID = 'add-tile';

var isConfig = exports.isConfig = function isConfig(item) {
  return item.assetType == 'sections_style_configs' || item.contentType == 'sections_style_configs';
};

var calcContentOwnershipV1 = function calcContentOwnershipV1(pages, nonConfigPageContentItems) {

  if (!pages) {
    // Really old "Pages" (or "Lenses") don't have the "pages" key
    return {
      orderedPageContentUuidsBySectionId: _defineProperty({}, SECTION_ID_FOR_ORPHAN_CONTENT, (0, _map2.default)(nonConfigPageContentItems, 'uuid'))
    };
  }

  var UUID_LENGTH = 'uuid-'.length;

  var orderedPageContentUuidsBySectionId = {};

  (0, _each2.default)(nonConfigPageContentItems, function (item) {
    var sectionId = (0, _migrator_utils.getSectionIdForPageContentItemApiModel)(item);
    if (!sectionId) {
      sectionId = SECTION_ID_FOR_ORPHAN_CONTENT;
    }
    var uuid = parseInt(item.uuid);
    if (!orderedPageContentUuidsBySectionId[sectionId]) {
      orderedPageContentUuidsBySectionId[sectionId] = [];
    }
    orderedPageContentUuidsBySectionId[sectionId].push(uuid);
  });

  (0, _each2.default)(pages, function (page) {

    var contentUuids;
    if (page.contentUuids) {
      contentUuids = (0, _map2.default)(page.contentUuids, function (u) {
        return parseInt(u);
      });
    } else if (page.grid_positions) {
      contentUuids = (0, _map2.default)((0, _filter2.default)((0, _compact2.default)(page.grid_positions), function (_ref) {
        var uuid = _ref.uuid;
        return uuid !== ADD_TILE_UUID;
      }), function (_ref2) {
        var uuid = _ref2.uuid;
        return parseInt(uuid.slice(UUID_LENGTH));
      });
    }

    orderedPageContentUuidsBySectionId[page.pageId] = (0, _union2.default)(contentUuids, orderedPageContentUuidsBySectionId[page.pageId]);
  });

  return {
    orderedPageContentUuidsBySectionId: orderedPageContentUuidsBySectionId
  };
};

var getMigratedConfigData = exports.getMigratedConfigData = function getMigratedConfigData(config, nonConfigPageContentItems) {
  var _toStructuredFromV1Pa = (0, _page_meta_migrator.toStructuredFromV1PageMeta)(config),
      isMobileRenderEnabled = _toStructuredFromV1Pa.isMobileRenderEnabled,
      shouldShowHeader = _toStructuredFromV1Pa.shouldShowHeader,
      shouldShowTitle = _toStructuredFromV1Pa.shouldShowTitle,
      shouldShowSocialLinks = _toStructuredFromV1Pa.shouldShowSocialLinks,
      socialLinks = _toStructuredFromV1Pa.socialLinks,
      defaultColumnCount = _toStructuredFromV1Pa.defaultColumnCount;

  var _calcContentOwnership = calcContentOwnershipV1(config.pages, nonConfigPageContentItems),
      orderedPageContentUuidsBySectionId = _calcContentOwnership.orderedPageContentUuidsBySectionId;

  var _toStructuredFromV1Pa2 = (0, _page_migrator.toStructuredFromV1Pages)(config.pages, orderedPageContentUuidsBySectionId, config.extraData, defaultColumnCount),
      menuItemsById = _toStructuredFromV1Pa2.menuItemsById,
      orderedMenuItemIds = _toStructuredFromV1Pa2.orderedMenuItemIds,
      subpagesById = _toStructuredFromV1Pa2.subpagesById,
      sectionsById = _toStructuredFromV1Pa2.sectionsById,
      homeSubpageId = _toStructuredFromV1Pa2.homeSubpageId;

  return {
    v2data: {
      isMobileRenderEnabled: isMobileRenderEnabled,
      shouldShowHeader: shouldShowHeader,
      shouldShowTitle: shouldShowTitle,
      shouldShowSocialLinks: shouldShowSocialLinks,
      socialLinks: socialLinks,
      menuItemsById: menuItemsById,
      orderedMenuItemIds: orderedMenuItemIds,
      subpagesById: subpagesById,
      sectionsById: sectionsById,
      homeSubpageId: homeSubpageId
    }
  };
};