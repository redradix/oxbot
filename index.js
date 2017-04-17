'use strict';

const _ = require('lodash');
const _server = require('./base/server');
const _db = require('./base/db');
const _static = require('./base/static');
// app modules
const Queue = require('./modules/queue');
const events = require('./modules/web_events');
// bot modules
const botMain = require('./modules/bot');
const decisionTree = require('./modules/decisionTree');
// exported API
const commands = require('./modules/decisionTree/tree.commands');

const botModules = { botMain };

// -------------------------
// config
const defaultConfig = {
  apiPrefix: '/bot',
  port: 7000,
  db: {
    host: 'localhost',
    port: 27017,
    database: 'botox-bot',
    collection: 'user-states'
  }
}

function setup(userConfig) {
  const config = _.defaultsDeep(userConfig, defaultConfig);
  // -------------------------
  // init all async base modules
  return Promise.all([
    _db(config.db),
    _server(config),
  ])
    .then(([db, server]) => {
      // -------------------------
      // communication queue
      const queue = new Queue(db);

      // -------------------------
      // the decision tree
      let tree = [];
      const treeGet = () => tree;
      const treeSet = (v) => tree = v;


      // -------------------------
      // initialize the web modules
      // const { verifyToken } = config;
      // _.forEach(webModules, (module, key) => {
      //   server.route(
      //     module(`${config.apiPrefix}/${key}`, verifyToken, db, queue)
      //   );
      // });
      events(db, queue, config, server);

      // -------------------------
      // initialize the bot modules
      _.forEach(botModules, (module) => {
        module(config, db, queue, treeGet);
      });

      // -------------------------
      // server static files
      _static(server);
      server.start();
      return { db, server, queue, treeSet };
    });
}

module.exports = { setup, commands };
