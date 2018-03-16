import each from 'lodash/each';
import map from 'lodash/map';
import filter from 'lodash/filter';
import union from 'lodash/union';
import compact from 'lodash/compact';

import { 
  getSectionIdForPageContentItemApiModel 
} from './migrator_utils.js';

import {
  toStructuredFromV1PageMeta
} from './page_meta_migrator.js';

import {
  toStructuredFromV1Pages
} from './page_migrator.js';


const SECTION_ID_FOR_ORPHAN_CONTENT = 'home';
const ADD_TILE_UUID = 'add-tile';

export const isConfig = (item)=>
  item.assetType == 'sections_style_configs' || item.contentType == 'sections_style_configs';



const calcContentOwnershipV1 = (pages, nonConfigPageContentItems)=> {

  if (!pages) {
    // Really old "Pages" (or "Lenses") don't have the "pages" key
    return {
      orderedPageContentUuidsBySectionId: {
        [SECTION_ID_FOR_ORPHAN_CONTENT]: map(nonConfigPageContentItems, 'uuid')
      }
    };
  }

  const UUID_LENGTH = 'uuid-'.length;

  const orderedPageContentUuidsBySectionId = {};

  each(nonConfigPageContentItems, item => {
    var sectionId = getSectionIdForPageContentItemApiModel(item);
    if (!sectionId) {
      sectionId = SECTION_ID_FOR_ORPHAN_CONTENT;
    }
    const uuid = parseInt(item.uuid);
    if (!orderedPageContentUuidsBySectionId[sectionId]) {
      orderedPageContentUuidsBySectionId[sectionId] = [];
    }
    orderedPageContentUuidsBySectionId[sectionId].push(uuid);
  });

  each(pages, page => {

    var contentUuids;
    if (page.contentUuids) {
      contentUuids = map(page.contentUuids, u => parseInt(u));

    } else if (page.grid_positions) {
      contentUuids = map(
        filter(compact(page.grid_positions), ({ uuid })=> uuid !== ADD_TILE_UUID), 
        ({ uuid })=> parseInt(uuid.slice(UUID_LENGTH))
      );
    }

    orderedPageContentUuidsBySectionId[page.pageId] =
      union(contentUuids, orderedPageContentUuidsBySectionId[page.pageId]);

  });

  return {
    orderedPageContentUuidsBySectionId
  };
};


export const getMigratedConfigData = (config, nonConfigPageContentItems)=> {

  const {
    isMobileRenderEnabled,
    shouldShowHeader,
    shouldShowTitle,
    shouldShowSocialLinks,
    socialLinks,
    defaultColumnCount
  } = toStructuredFromV1PageMeta(config);

  const {
    orderedPageContentUuidsBySectionId

  } = calcContentOwnershipV1(config.pages, nonConfigPageContentItems);

  const {
    menuItemsById,
    orderedMenuItemIds,
    subpagesById,
    sectionsById,
    homeSubpageId

  } = toStructuredFromV1Pages(config.pages, orderedPageContentUuidsBySectionId, config.extraData, defaultColumnCount);

  return {
    v2data: {
      isMobileRenderEnabled,
      shouldShowHeader,
      shouldShowTitle,
      shouldShowSocialLinks,
      socialLinks,
      menuItemsById,
      orderedMenuItemIds,
      subpagesById,
      sectionsById,
      homeSubpageId
    }
  };

};
