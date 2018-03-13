#!/usr/bin/env node

// Was executed with NODE_PATH=frontend_source npx babel-node --presets=stage-2,es2015 -- scripts/data_migrations/migrate_page_content_payloads.js < tests/static_resources/serialized_data/payloads.json

import find from 'lodash/find';
import reject from 'lodash/reject';

import {
  getMigratedConfigData,
  isConfig
} from './config_migrator.js';

const stdin = process.stdin,
  stdout = process.stdout,
  inputChunks = [];

stdin.resume();
stdin.setEncoding('utf8');

stdin.on('data', (chunk)=> {
  inputChunks.push(chunk);
});

stdin.on('end', ()=> {
  const lensContent = JSON.parse(inputChunks.join(''));

  // const lensContent = pagePayloads.hiddenLensContent.concat(pagePayloads.lensContent);
  const config = find(lensContent, isConfig);
  const contents = reject(lensContent, isConfig);

  var migratedConfig = {};

  if (config) {
    migratedConfig = getMigratedConfigData(config, contents);
  }

  stdout.write(JSON.stringify(migratedConfig));
  stdout.write('\n');
});

