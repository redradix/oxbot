'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const { isSpecialCommand, runSpecialCommand,
        findNode } = require('./tree.commands');

function getNode(tree, path) {
  const node = findNode(path, tree);
  return Promise.resolve(node);
}

function advance(tree, currentNode, state, input, db) {
  if (isSpecialCommand(input)) {
    return runSpecialCommand(input, state, currentNode, tree);
  }
  return Promise
    .cast(currentNode.advance(_.assign({ tree, state, db }, input)))
    .then(nextPath => nextPath && findNode(nextPath, tree));
}

function doRunNode(currentNode, state, _input, db, chat) {
  const { run, path, params } = currentNode;
  const input = _.set(_input, 'value', params || _input.value);
  return Promise
    .cast(run(_.assign({ state, db, chat }, input)))
    .then(nextState => _.assign(nextState, { path }));
}

function runNode(tree, currentNode, state, input, db, chat) {
  if (!currentNode) { return state; }
  if (currentNode.transient) {
    /* eslint-disable */
    return runAndAdvance(tree, currentNode, state, input, db, chat);
    /* eslint-enable */
  }
  return doRunNode(currentNode, state, input, db, chat);
}

function runAndAdvance(tree, currentNode, state, input, db, chat) {
  let nextState;
  return doRunNode(currentNode, state, input, db, chat)
    .then((_nextState) => {
      nextState = _nextState;
      return currentNode.advance(_.assign({ tree, state: nextState, db }, input));
    })
    .then(nextPath => getNode(tree, nextPath, nextState))
    .then(nextNode => runNode(tree, nextNode, nextState, input, db, chat));
}

module.exports = { getNode, advance, runNode };
