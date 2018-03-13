'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toStructuredFromV1Pages = exports.toStructuredSubpage = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _filter = require('lodash/filter');

var _filter2 = _interopRequireDefault(_filter);

var _reject = require('lodash/reject');

var _reject2 = _interopRequireDefault(_reject);

var _map = require('lodash/map');

var _map2 = _interopRequireDefault(_map);

var _includes = require('lodash/includes');

var _includes2 = _interopRequireDefault(_includes);

var _keyBy = require('lodash/keyBy');

var _keyBy2 = _interopRequireDefault(_keyBy);

var _find = require('lodash/find');

var _find2 = _interopRequireDefault(_find);

var _isEmpty = require('lodash/isEmpty');

var _isEmpty2 = _interopRequireDefault(_isEmpty);

var _section_migrator = require('./section_migrator.js');

var _menu_item_migrator = require('./menu_item_migrator.js');

var _migrator_utils = require('./migrator_utils.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var HOME_PAGEID = 'home';

var DEFAULT_HOME_LEGACY = {
  isHome: true,
  pageId: HOME_PAGEID,
  title: 'Home',
  type: HOME_PAGEID
};

var DEFAULT_HOME_NEW = {
  isHome: true,
  pageId: HOME_PAGEID,
  title: 'Home'
};

var toStructuredSubpage = exports.toStructuredSubpage = function toStructuredSubpage(page) {

  return {
    type: 'multisection',
    id: page.pageId,
    orderedSectionIds: [page.pageId]
  };
};

var toStructuredFromV1Pages = exports.toStructuredFromV1Pages = function toStructuredFromV1Pages(pages, orderedPageContentUuidsBySectionId, extraData, defaultColumnCount) {
  var isNewPage = false;

  if (!pages) {
    // @TODO: we should not let newly created blank pages ever hit this migrator

    if (extraData.gridColumnCount) {
      // Legacy Pages may be missing a pages object, but have an extraData object
      pages = [DEFAULT_HOME_LEGACY];
    } else {
      // Newly created Pages will be missing a pages object AND an extraData object
      pages = [DEFAULT_HOME_NEW];
      isNewPage = true;
    }
  }

  // if there are pages, then we remove all the pages that have no visible content.
  // this used to be handled in the view code, now it is handled here at the data layer.
  // this will allow all pages that used to not show empty pages to continue to not show them,
  // with no change to the database. Future empty pages _will_ be shown.
  pages = (0, _filter2.default)(pages, function (page) {
    var content = orderedPageContentUuidsBySectionId[page.pageId];
    return (0, _migrator_utils.isHomeSubpage)(page) || page.type === 'intra' || page.type === 'external_link' && page.external_link_url || page.type !== 'tiles' && !(0, _isEmpty2.default)(content) || !(0, _isEmpty2.default)(page.grid_positions) || page.is_sub_section;
    // ideally, we would also not allow text sections with empty content,
    // but it is a huge pain to do a content lookup from here,
    // and I belive it is OK if existing pages which 
    // have a text section with nothing written in them start showing up
  });

  var _toplevelPages = (0, _reject2.default)(pages, 'is_sub_section');
  var orderedMenuItemIds = (0, _map2.default)(_toplevelPages, 'pageId');

  // get rid of any subpages that belonged to a page that has been filtered away
  pages = (0, _reject2.default)(pages, function (page) {
    return page.is_sub_section && !(0, _includes2.default)(orderedMenuItemIds, page.parent_section_id);
  });

  if (pages.length === 0) {
    // We're in an odd situation here and were gonna need to use defaults
    pages = [DEFAULT_HOME_LEGACY];
  }

  var _menuItems = (0, _map2.default)(pages, function (page) {
    return (0, _menu_item_migrator.toStructuredMenuItem)(page);
  });
  var menuItemsById = (0, _keyBy2.default)(_menuItems, 'id');

  var realSubpagePages = (0, _filter2.default)(pages, function (page) {
    return !page.is_sub_section && page.type !== 'intra' && page.type !== 'external_link';
  });

  // The ordering of "sections" doesn't matter (only the ordering of menu items)
  var _subpages = (0, _map2.default)(realSubpagePages, function (page) {
    return toStructuredSubpage(page);
  });
  var subpagesById = (0, _keyBy2.default)(_subpages, 'id');
  var _homepage = (0, _find2.default)(pages, _migrator_utils.isHomeSubpage);
  var homeSubpageId = _homepage ? _homepage.pageId : pages[0].pageId; // If homepage is not marked use first page in pages list

  // @TODO: we REALLY don't want to be putting new blank pages through the migrator.

  // New pages do not have any sections in it. Therefore we overwrite the
  // menu item to section conversion that happens and manually set them to empty
  if (isNewPage) {
    return {
      homeSubpageId: homeSubpageId,
      menuItemsById: menuItemsById,
      orderedMenuItemIds: orderedMenuItemIds,
      subpagesById: _defineProperty({}, HOME_PAGEID, _extends({}, subpagesById[HOME_PAGEID], {
        orderedSectionIds: []
      })),
      sectionsById: {}
    };
  }

  var _sections = (0, _map2.default)(realSubpagePages, function (page) {
    return (0, _section_migrator.toStructuredSection)(page, orderedPageContentUuidsBySectionId[page.pageId], extraData, defaultColumnCount);
  });

  var sectionsById = (0, _keyBy2.default)(_sections, 'id');

  return {
    homeSubpageId: homeSubpageId,
    menuItemsById: menuItemsById,
    orderedMenuItemIds: orderedMenuItemIds,
    subpagesById: subpagesById,
    sectionsById: sectionsById
  };
};