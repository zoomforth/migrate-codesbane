'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toStructuredFromV1PageMeta = undefined;

var _reduce = require('lodash/reduce');

var _reduce2 = _interopRequireDefault(_reduce);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var DEFAULT_GRID_COLUMN_COUNT = 3;

var toStructuredFromV1PageMeta = exports.toStructuredFromV1PageMeta = function toStructuredFromV1PageMeta(config) {

  var structured = {
    isMobileRenderEnabled: config.enable_mobile_render,
    shouldShowSocialLinks: config.social_icons_enabled || false,
    socialLinks: (0, _reduce2.default)(config.social_link_settings, function (accumulator, _ref, key) {
      var link = _ref.link,
          enabled = _ref.enabled;

      return [].concat(_toConsumableArray(accumulator), [{ link: link, enabled: enabled, serviceName: key, target: '_blank' // Drop references to `icon`, those dont belong persisted in DB
      }]);
    }, []),
    shouldShowHeader: config.should_show_header,
    shouldShowTitle: config.should_show_title,
    defaultColumnCount: parseInt(config.extraData && config.extraData.gridColumnCount || DEFAULT_GRID_COLUMN_COUNT)
  };

  return structured;
};