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
}

module.exports = { client, connectDB };
