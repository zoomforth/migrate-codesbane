import map from 'lodash/map';
import compact from 'lodash/compact';

import { sortTiles } from './migrator_utils.js';

const UUID_PREFIX = 'uuid-';
const ADD_TILE = 'add-tile';


const toStructuredGridPositionsFromV1 = (gridPositions)=>
  sortTiles(compact(map(
    gridPositions, 
    (gpos)=> {
      if (!gpos) {
        return null;
      }
      const uuid = gpos.uuid;
      if (!uuid || uuid === ADD_TILE) {
        return null;
      }
      return { uuid: parseInt(uuid.slice(UUID_PREFIX.length)), type:'tile', ...rest };
    }
  )));

const toStructuredSectionFromTilesV1 = (page, defaultColumnCount, legacyConfigData)=> {
  // legacyConfigData may have gridPositions and/or gridColumnCount 
  // and/or other keys we don't care about
  var result = {
    type:'tiles',
    id: page.pageId,
    gridPositions: toStructuredGridPositionsFromV1(
      (page.type === 'home') ? 
        // this is some real legacy stuff here -- 'home' type pages
        // used to have their grid positions stored directly on the config element
        page.grid_positions || legacyConfigData.gridPositions
      :
        page.grid_positions || []
    ),
    columnCount:  (
      (page.type === 'home') ? 
        page.column_count || legacyConfigData.gridColumnCount || defaultColumnCount
      :
        page.column_count || defaultColumnCount
    )
  };
  return result;
};

const toStructuredSectionFromSingletonV1 = (page, orderedPageContentUuids)=> {
  return {
    type: page.type,
    id: page.pageId,
    singletonContentUuid: orderedPageContentUuids.length > 0 ? orderedPageContentUuids[0] : null
  };

};


const toStructuredSectionFromGenericV1 = (page, orderedPageContentUuids)=> {
  return {
    type: page.type,
    id: page.pageId,
    orderedContentUuids: orderedPageContentUuids
  };

};



export const toStructuredSection = (page, orderedPageContentUuids, extraData, defaultColumnCount)=> {

  switch (page.type) {

  case 'tiles':
  case 'home': // 'home' sections are all grid sections
    return {
      ...toStructuredSectionFromTilesV1(page, defaultColumnCount, extraData)
    };

  case 'pdf':
  case 'text':
    return {
      ...toStructuredSectionFromSingletonV1(page, orderedPageContentUuids)
    };

  default:
    return {
      ...toStructuredSectionFromGenericV1(page, orderedPageContentUuids)
    };


  }

};

