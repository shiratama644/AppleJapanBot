require('dotenv').config();
const path = require('path');
const fs   = require('fs');
const client = require('./client');
const config = require('./config/config');

// src/events/ 配下のイベントファイルを自動登録する
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.login(config.discord.token);
