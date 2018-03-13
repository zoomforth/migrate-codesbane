
import reduce from 'lodash/reduce';

const DEFAULT_GRID_COLUMN_COUNT = 3;

export const toStructuredFromV1PageMeta = (config)=> {

  const structured = {
    isMobileRenderEnabled: config.enable_mobile_render,
    shouldShowSocialLinks: config.social_icons_enabled || false,
    socialLinks: reduce(
      config.social_link_settings, 
      (accumulator, { link, enabled }, key) => {
        return [
          ...accumulator,
          { link, enabled, serviceName: key, target:'_blank' } // Drop references to `icon`, those dont belong persisted in DB
        ];
      }, 
      []
    ),
    shouldShowHeader: config.should_show_header,
    shouldShowTitle: config.should_show_title,
    defaultColumnCount: parseInt((config.extraData && config.extraData.gridColumnCount) || DEFAULT_GRID_COLUMN_COUNT)
  };

  return structured;
};