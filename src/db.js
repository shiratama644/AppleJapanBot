require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
	  host: process.env.DB_HOST,
	  port: process.env.DB_PORT,
	  user: process.env.DB_USER,
	  password: process.env.DB_PASSWORD,
	  database: process.env.DB_NAME
});

async function connectDB() {
	  await client.connect();
	  console.log("✅ DB接続成功");
	  await initDB();
}

async function initDB() {
	  await client.query(`
	    CREATE TABLE IF NOT EXISTS linked_players (
	      discord_id   TEXT PRIMARY KEY,
	      discord_name TEXT NOT NULL,
	      mcid         TEXT NOT NULL,
	      edition      TEXT NOT NULL,
	      head_url     TEXT NOT NULL,
	      linked_at    TIMESTAMP DEFAULT NOW()
	    )
	  `);
	  await client.query(`
	    CREATE TABLE IF NOT EXISTS bot_config (
	      key   TEXT PRIMARY KEY,
	      value TEXT NOT NULL
	    )
	  `);
}

async function saveLink(discordId, discordName, mcid, edition, headUrl) {
	  await client.query(`
	    INSERT INTO linked_players (discord_id, discord_name, mcid, edition, head_url)
	    VALUES ($1, $2, $3, $4, $5)
	    ON CONFLICT (discord_id) DO UPDATE
	      SET discord_name = $2,
	          mcid         = $3,
	          edition      = $4,
	          head_url     = $5,
	          linked_at    = NOW()
	  `, [discordId, discordName, mcid, edition, headUrl]);
}

async function getAllLinks() {
	  const res = await client.query(
	    'SELECT discord_id, discord_name, mcid, edition, head_url, linked_at FROM linked_players ORDER BY linked_at ASC'
	  );
	  return res.rows;
}

async function getConfig(key) {
	  const res = await client.query('SELECT value FROM bot_config WHERE key = $1', [key]);
	  return res.rows[0]?.value ?? null;
}

async function setConfig(key, value) {
	  await client.query(`
	    INSERT INTO bot_config (key, value)
	    VALUES ($1, $2)
	    ON CONFLICT (key) DO UPDATE SET value = $2
	  `, [key, value]);
}

module.exports = { client, connectDB, saveLink, getAllLinks, getConfig, setConfig };
