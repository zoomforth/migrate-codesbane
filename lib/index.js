#!/usr/bin/env node
'use strict';

var _find = require('lodash/find');

var _find2 = _interopRequireDefault(_find);

var _reject = require('lodash/reject');

var _reject2 = _interopRequireDefault(_reject);

var _config_migrator = require('./config_migrator.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var stdin = process.stdin,
    stdout = process.stdout,
    inputChunks = [];

// Was executed with NODE_PATH=frontend_source npx babel-node --presets=stage-2,es2015 -- scripts/data_migrations/migrate_page_content_payloads.js < tests/static_resources/serialized_data/payloads.json

stdin.resume();
stdin.setEncoding('utf8');

stdin.on('data', function (chunk) {
  inputChunks.push(chunk);
});

stdin.on('end', function () {
  var lensContent = JSON.parse(inputChunks.join(''));

  // const lensContent = pagePayloads.hiddenLensContent.concat(pagePayloads.lensContent);
  var config = (0, _find2.default)(lensContent, _config_migrator.isConfig);
  var contents = (0, _reject2.default)(lensContent, _config_migrator.isConfig);

  var migratedConfig = {};

  if (config) {
    migratedConfig = (0, _config_migrator.getMigratedConfigData)(config, contents);
  }

  stdout.write(JSON.stringify(migratedConfig));
  stdout.write('\n');
});