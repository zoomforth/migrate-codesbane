import filter from 'lodash/filter';
import reject from 'lodash/reject';
import map from 'lodash/map';
import includes from 'lodash/includes';
import keyBy from 'lodash/keyBy';
import find from 'lodash/find';
import isEmpty from 'lodash/isEmpty';

import {
  toStructuredSection
} from './section_migrator.js';

import {
  toStructuredMenuItem
} from './menu_item_migrator.js';

import { isHomeSubpage } from './migrator_utils.js';

const HOME_PAGEID = 'home';

const DEFAULT_HOME_LEGACY = {
  isHome: true,
  pageId: HOME_PAGEID,
  title: 'Home',
  type: HOME_PAGEID
};

const DEFAULT_HOME_NEW = {
  isHome: true,
  pageId: HOME_PAGEID,
  title: 'Home'
};



export const toStructuredSubpage = (page)=> {

  return {
    type: 'multisection',
    id: page.pageId,
    orderedSectionIds: [
      page.pageId
    ]
  };

};


export const toStructuredFromV1Pages = (pages, orderedPageContentUuidsBySectionId, extraData, defaultColumnCount)=>{
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
  pages = filter(pages, (page)=> {
    let content = orderedPageContentUuidsBySectionId[page.pageId];
    return (
      isHomeSubpage(page) ||
      page.type === 'intra' || 
      ( 
        page.type === 'external_link' && 
        page.external_link_url 
      ) || 
      (
        page.type !== 'tiles' &&
        !isEmpty(content)
      ) ||
      !isEmpty(page.grid_positions) ||
      page.is_sub_section
    );
    // ideally, we would also not allow text sections with empty content,
    // but it is a huge pain to do a content lookup from here,
    // and I belive it is OK if existing pages which 
    // have a text section with nothing written in them start showing up
  });
  
  const _toplevelPages = reject(pages, 'is_sub_section');
  const orderedMenuItemIds = map(_toplevelPages, 'pageId');
  
  // get rid of any subpages that belonged to a page that has been filtered away
  pages = reject(pages, (page)=> {
    return page.is_sub_section && !includes(orderedMenuItemIds, page.parent_section_id);
  });
  
  if (pages.length === 0) {
    // We're in an odd situation here and were gonna need to use defaults
    pages = [DEFAULT_HOME_LEGACY];
  }

  const _menuItems = map(pages, (page)=> toStructuredMenuItem(page));
  const menuItemsById = keyBy(_menuItems, 'id');

  const realSubpagePages = filter(
    pages, 
    (page) => (
      !page.is_sub_section && 
      page.type !== 'intra' &&
      page.type !== 'external_link'
    )
  );

  // The ordering of "sections" doesn't matter (only the ordering of menu items)
  const _subpages = map(realSubpagePages, page => toStructuredSubpage(page));
  const subpagesById = keyBy(_subpages, 'id');
  const _homepage = find(pages, isHomeSubpage);
  const homeSubpageId = _homepage ? _homepage.pageId : pages[0].pageId; // If homepage is not marked use first page in pages list

  // @TODO: we REALLY don't want to be putting new blank pages through the migrator.

  // New pages do not have any sections in it. Therefore we overwrite the
  // menu item to section conversion that happens and manually set them to empty
  if (isNewPage) {
    return {
      homeSubpageId,
      menuItemsById,
      orderedMenuItemIds,
      subpagesById: {
        [HOME_PAGEID]: {
          ...subpagesById[HOME_PAGEID],
          orderedSectionIds: []
        }
      },
      sectionsById: {}
    };
  }

  const _sections = map(realSubpagePages, (page)=> toStructuredSection(
    page, 
    orderedPageContentUuidsBySectionId[page.pageId], 
    extraData,
    defaultColumnCount
  ));

  const sectionsById = keyBy(_sections, 'id');

  return {
    homeSubpageId,
    menuItemsById,
    orderedMenuItemIds,
    subpagesById,
    sectionsById
  };
};

