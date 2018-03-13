import isBoolean from 'lodash/isBoolean';
import sortBy from 'lodash/sortBy';

export const LABEL_PREFIX = 'gridlens-page:';

export const isHomeSubpage = (page)=> {
  if (page.pageId === 'home' && !isBoolean(page.isHome)) {
    return true;
  } else if (page.isHome) {
    return true;
  }
  return false;
};


export const getSectionIdForPageContentItemApiModel= (item)=> {
  if (!item.label || item.label.indexOf(LABEL_PREFIX) !== 0) {
    return null;
  }
  return item.label.slice(LABEL_PREFIX.length);
};


export const sortTiles = (unsortedTiles)=>
  sortBy(unsortedTiles, ({ row, col })=> {
    return (row * 100) + col; // row # always matters more than column for sorting
  });