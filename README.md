# TODO: write docs

# Some usage examples

From your `index.js`:

```javascript
const config = require('config');
const oxbot = require('./oxbot');
const treeNodes = require('./modules/tree');

oxbot
  .setup(config.bot)
  .then(({ treeSet, server, queue, db }) => {
    const token = config.bot.telegram.token;
    const chat = oxbot.telegram(token);
    const tree = treeNodes(chat);
    treeSet(tree);

    console.log('* ready to go!');
  })
  .catch(console.error);
```

From your `./modules/tree`:

```javascript
const _ = require('lodash');

module.exports = chat => _.concat(
  // simple demo bot
  require('./tree.fitbot')(chat),
  require('./tree.fitbot.s1')(chat),
  require('./tree.fitbot.s2')(chat),
  require('./tree.fitbot.s3')(chat)
);
```

From `./modules/tree/tree.fitbot`:

```javascript
module.exports = (chat) => {
  return [
    {
      path: 'START',
      run: ({ state, userid, value, db }) => {
        chat.sendText(userid, 'I\'m pretty dumb');
        return state;
      },
      advance: () => 'START',
    },

  ];
};
```

From './config/default.json':

```json
{
    "bot": {
        "port": 7001,
        "db": {
            "host": "localhost",
            "port": "27017",
            "database": "fitbot-bot",
            "collection": "user_states"
        },
        "telegram": {
            "interval": 500,
            "token": "YOUR-TOKEN"
        }
    }
}
```

Good luck!
