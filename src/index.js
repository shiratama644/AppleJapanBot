require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { client: db, connectDB, saveLink, getAllLinks, getConfig, setConfig } = require('./db');

const GUILD_ID     = process.env.GUILD_ID     || '1475040943240384697';
const CHANNEL_A_ID = process.env.CHANNEL_A_ID || '1475103472709009460'; // コマンド受付チャンネル
const CHANNEL_B_ID = process.env.CHANNEL_B_ID || '1479758785492029651'; // 連携リスト表示チャンネル

// Discord メッセージ1件に含められる Embed の上限
const MAX_EMBEDS_PER_MESSAGE = 10;

const client = new Client({
	  intents: [
	    GatewayIntentBits.Guilds,
	    GatewayIntentBits.GuildMessages,
	    GatewayIntentBits.MessageContent
	  ]
});

client.once('clientReady', async () => {
	  console.log(`🤖 Logged in as ${client.user.tag}`);
	  await connectDB();
});

/**
 * MCIDからJE/BEを判定し、エディション・プレイヤーヘッドURLを返す。
 * @returns {{ edition: 'JE'|'BE', headUrl: string } | null}
 */
async function resolvePlayer(mcid) {
	  // JE判定: PlayerDB API でUUIDを取得
	  try {
	    const res = await fetch(`https://playerdb.co/api/player/minecraft/${encodeURIComponent(mcid)}`);
	    if (res.ok) {
	      const data = await res.json();
	      if (data.success && data.data?.player?.id) {
	        return {
	          edition: 'JE',
	          headUrl: `https://mc-heads.net/avatar/${data.data?.player?.id}/128`
	        };
	      }
	    }
	  } catch (_) {}

	  // BE判定: PlayerDB API でXUIDを取得
	  try {
	    const res = await fetch(`https://playerdb.co/api/player/xbox/${encodeURIComponent(mcid)}`);
	    if (res.ok) {
	      const data = await res.json();
	      if (data.success && data.data?.player?.id) {
	        return {
	          edition: 'BE',
	          headUrl: `https://mc-heads.net/avatar/.${mcid}/128` // Floodgate仕様: BEプレイヤーはMCIDの先頭に . を付けることでJEと区別する
	        };
	      }
	    }
	  } catch (_) {}

	  return null;
}

/**
 * 登録済みプレイヤー一覧からEmbedの配列を生成する（最大10件/メッセージ）。
 */
function buildEmbeds(players) {
	  if (players.length === 0) {
	    return [
	      new EmbedBuilder()
	        .setTitle('Minecraft 連携リスト')
	        .setDescription('まだ誰も登録されていません。')
	        .setColor(0x2b2d31)
	    ];
	  }

	  return players.slice(0, MAX_EMBEDS_PER_MESSAGE).map(p =>
	    new EmbedBuilder()
	      .setTitle(p.mcid)
	      .setDescription(p.discord_name)
	      .addFields({ name: 'エディション', value: p.edition, inline: true })
	      .setThumbnail(p.head_url)
	      .setColor(p.edition === 'JE' ? 0x5865f2 : 0x57f287)
	  );
}

/**
 * チャンネルBの連携リストメッセージを更新（なければ新規作成）する。
 */
async function updateListMessage() {
	  const channelB = await client.channels.fetch(CHANNEL_B_ID);
	  const players  = await getAllLinks();
	  const embeds   = buildEmbeds(players);

	  const msgId = await getConfig('list_message_id');
	  if (msgId) {
	    try {
	      const msg = await channelB.messages.fetch(msgId);
	      await msg.edit({ embeds });
	      return;
	    } catch (_) {
	      // メッセージが削除されている場合は新規作成へ
	    }
	  }

	  const msg = await channelB.send({ embeds });
	  await setConfig('list_message_id', msg.id);
}

client.on('messageCreate', async (message) => {
	  if (message.author.bot) return;
	  if (message.guildId !== GUILD_ID) return;

	  // すべてのコマンドはチャンネルAでのみ受け付ける
	  if (message.channelId !== CHANNEL_A_ID) return;

	  if (message.content.startsWith('!link ')) {
	    const mcid = message.content.slice('!link '.length).trim();
	    if (!mcid) {
	      await message.reply('使い方: `!link <MCID>`');
	      return;
	    }

	    const loadingMsg = await message.reply('⏳ プレイヤー情報を確認中...');

	    try {
	      const player = await resolvePlayer(mcid);
	      if (!player) {
	        await loadingMsg.edit('❌ MCIDが見つかりませんでした。JE・BEどちらでも存在しないIDです。');
	        return;
	      }

	      // サーバーのニックネームを優先し、未設定の場合はグローバルユーザー名を使用
	      const discordName = message.member?.displayName ?? message.author.username;
	      await saveLink(message.author.id, discordName, mcid, player.edition, player.headUrl);
	      await updateListMessage();

	      await loadingMsg.edit(`✅ \`${mcid}\` (${player.edition}) を **${discordName}** として登録しました！`);
	    } catch (err) {
	      console.error('!link エラー:', err);
	      await loadingMsg.edit('⚠️ エラーが発生しました。しばらくしてから再試行してください。');
	    }
	  }
});

client.login(process.env.DISCORD_TOKEN);
