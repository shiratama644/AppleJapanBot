require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { client: db, connectDB } = require('./db');

const client = new Client({
	  intents: [GatewayIntentBits.Guilds]
});

client.once('clientReady', async () => {
	  console.log(`🤖 Logged in as ${client.user.tag}`);

	  await connectDB();

	  const res = await db.query('SELECT NOW()');
	  console.log("DB時間:", res.rows[0]);
});

client.login(process.env.DISCORD_TOKEN);
