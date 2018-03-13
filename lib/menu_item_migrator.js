'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toStructuredMenuItem = undefined;

var _migrator_utils = require('./migrator_utils.js');

var toStructuredMenuItem = exports.toStructuredMenuItem = function toStructuredMenuItem(page) {

  switch (page.type) {

    case 'intra':
      return {
        id: page.pageId,
        title: page.title,
        isSubmenuItem: !!page.is_sub_section,
        appAction: {
          type: 'internal',
          subpageId: page.parent_section_id,
          contentUuid: parseInt(page.target_content_uuid),
          shouldOpenOverlay: false
        }
      };

    case 'external_link':

      return {
        id: page.pageId,
        title: page.title,
        appAction: {
          type: 'external',
          url: page.external_link_url,
          target: '_parent'
        }
      };

    default:

      return {
        id: page.pageId,
        title: page.title ? page.title : (0, _migrator_utils.isHomeSubpage)(page) ? 'Home' : '',
        isPrimaryForSubpage: true,
        appAction: {
          type: 'internal',
          subpageId: page.pageId
        }
      };

  }
};