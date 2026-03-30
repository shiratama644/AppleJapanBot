import { Router } from 'express';
import { ChannelType } from 'discord.js';
import type { Client, Guild, TextChannel } from 'discord.js';
import { requireAuth } from '../middleware/requireAuth';
import { getAllGuildConfig, setGuildConfig } from '../../db/repositories/guildConfigRepo';
import type { DiscordGuildResponse } from '../types';
import logger from '../../utils/logger';

const DISCORD_API = 'https://discord.com/api/v10';

/** Discord の MANAGE_GUILD 権限フラグ */
const MANAGE_GUILD = BigInt(0x20);

/** ユーザーが管理者権限を持つギルドかどうかを確認する */
function hasManageGuild(permissions: string): boolean {
  try {
    return (BigInt(permissions) & MANAGE_GUILD) === MANAGE_GUILD;
  } catch {
    return false;
  }
}

/** ギルドのテキストチャンネル一覧を { id, name } の配列で返す */
function getTextChannels(guild: Guild): { id: string; name: string }[] {
  return guild.channels.cache
    .filter(c => c.type === ChannelType.GuildText)
    .map(c => ({ id: c.id, name: (c as TextChannel).name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** ユーザーのアクセストークンを使ってギルドへのアクセス権を確認する */
async function checkUserGuildAccess(accessToken: string, guildId: string): Promise<boolean> {
  const res = await fetch(`${DISCORD_API}/users/@me/guilds`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return false;

  const guilds = (await res.json()) as DiscordGuildResponse[];
  const guild = guilds.find(g => g.id === guildId);
  return guild != null && hasManageGuild(guild.permissions);
}

export function createGuildsRouter(client: Client): Router {
  const router = Router();

  /**
   * GET /api/guilds
   * Botが参加していて、かつログインユーザーが管理権限を持つギルド一覧を返す。
   */
  router.get('/guilds', requireAuth, async (req, res): Promise<void> => {
    const accessToken = req.session.user!.accessToken;

    const userGuildsRes = await fetch(`${DISCORD_API}/users/@me/guilds`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userGuildsRes.ok) {
      res.status(502).json({ error: 'Discord からギルド一覧の取得に失敗しました。' });
      return;
    }

    const userGuilds = (await userGuildsRes.json()) as DiscordGuildResponse[];

    // Bot が参加していて、かつユーザーが管理権限を持つギルドに絞り込む
    const accessible = userGuilds
      .filter(g => client.guilds.cache.has(g.id) && hasManageGuild(g.permissions))
      .map(g => ({
        id: g.id,
        name: g.name,
        icon: g.icon
          ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png`
          : null,
      }));

    res.json(accessible);
  });

  /**
   * GET /api/guilds/:guildId
   * 指定ギルドの設定情報（guildConfig）とテキストチャンネル一覧を返す。
   */
  router.get('/guilds/:guildId', requireAuth, async (req, res): Promise<void> => {
    const guildId = String(req.params.guildId);

    // アクセス権限チェック（Bot が参加しているギルドのみ）
    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
      res.status(404).json({ error: 'Bot が参加していないギルドです。' });
      return;
    }

    // ユーザーがそのギルドの管理権限を持つかチェック
    const authorized = await checkUserGuildAccess(req.session.user!.accessToken, guildId);
    if (!authorized) {
      res.status(403).json({ error: 'このギルドの管理権限がありません。' });
      return;
    }

    const [config, channels] = await Promise.all([
      getAllGuildConfig(guildId),
      getTextChannels(guild),
    ]);

    res.json({
      id: guild.id,
      name: guild.name,
      icon: guild.iconURL(),
      config,
      channels,
    });
  });

  /**
   * POST /api/guilds/:guildId/config
   * 指定ギルドの設定値を更新する。
   * Body: { key: string; value: string }
   */
  router.post('/guilds/:guildId/config', requireAuth, async (req, res): Promise<void> => {
    // Content-Type を検証することで、クロスオリジンのフォーム送信による CSRF を防ぐ
    if (!req.is('application/json')) {
      res.status(415).json({ error: 'Content-Type は application/json である必要があります。' });
      return;
    }

    const guildId = String(req.params.guildId);

    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
      res.status(404).json({ error: 'Bot が参加していないギルドです。' });
      return;
    }

    const authorized = await checkUserGuildAccess(req.session.user!.accessToken, guildId);
    if (!authorized) {
      res.status(403).json({ error: 'このギルドの管理権限がありません。' });
      return;
    }

    const { key, value } = req.body as { key?: unknown; value?: unknown };

    // 変更可能なキーのみを許可する（意図しないキーの書き込みを防ぐ）
    const allowedKeys = ['command_input_channel', 'link_list_channel'];
    if (typeof key !== 'string' || !allowedKeys.includes(key)) {
      res.status(400).json({ error: `key は ${allowedKeys.join(', ')} のいずれかである必要があります。` });
      return;
    }
    if (typeof value !== 'string' || !value.trim()) {
      res.status(400).json({ error: 'value は空でない文字列である必要があります。' });
      return;
    }

    try {
      await setGuildConfig(guildId, key, value.trim());
      res.json({ ok: true });
    } catch (err) {
      logger.error('guildConfig の更新に失敗しました:', err);
      res.status(500).json({ error: '設定の保存に失敗しました。' });
    }
  });

  /**
   * GET /api/guilds/:guildId/channels
   * 指定ギルドのテキストチャンネル一覧を返す。
   */
  router.get('/guilds/:guildId/channels', requireAuth, async (req, res): Promise<void> => {
    const guildId = String(req.params.guildId);

    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
      res.status(404).json({ error: 'Bot が参加していないギルドです。' });
      return;
    }

    const authorized = await checkUserGuildAccess(req.session.user!.accessToken, guildId);
    if (!authorized) {
      res.status(403).json({ error: 'このギルドの管理権限がありません。' });
      return;
    }

    res.json(getTextChannels(guild));
  });

  /**
   * GET /api/me
   * ログイン中のユーザー情報を返す（フロントエンドの状態確認用）。
   * レスポンスに csrfToken を含め、POST リクエストで使用できるようにする。
   */
  router.get('/me', requireAuth, (req, res): void => {
    const user = req.session.user!;
    if (!req.session.csrfToken) {
      res.status(500).json({ error: 'CSRFトークンが生成されていません。再度ログインしてください。' });
      return;
    }
    res.json({
      id: user.id,
      username: user.username,
      avatar: user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
        : `https://cdn.discordapp.com/embed/avatars/0.png`,
      csrfToken: req.session.csrfToken,
    });
  });

  return router;
}

