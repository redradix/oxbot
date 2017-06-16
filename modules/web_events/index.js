'use strict';

const _ = require('lodash');
const websockets = require('socket.io');

//module.exports = (db, queue, config) => {
//  const stream = telegramEventStream.getStream(config);
//  stream.onValue(telegramEventService.dispatchEvent(db, queue));
//  stream.onError(telegramEventService.dispatchError);
//};


module.exports = (db, queue, config, server) => {
  const io = websockets(server.listener, {origins: '*:*'})
  io.on('connection', (socket) => {
    socket.on('message', (payload, cb) => {
      queue.push({
        chat: socket.emit.bind(socket, 'message'),
        type: 'BOT_POSTBACK_RECEIVED',
        userid: socket.handshake.query.userid,
        payload: _.assign({}, {
          postback: { payload }
        })
      })
    })
  })
}