import type { DashboardUser, Guild, GuildDetail } from './types';

/**
 * 開発時は NEXT_PUBLIC_API_URL でExpressサーバーを指定する。
 * 本番時はExpressが同じオリジンで静的ファイルを提供するため省略可。
 * 例: NEXT_PUBLIC_API_URL=http://localhost:3000
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

let _csrfToken = '';

/** ログインユーザー情報を取得し、CSRFトークンをキャッシュする */
export async function getMe(): Promise<DashboardUser> {
  const res = await fetch(`${API_BASE}/api/me`);
  if (!res.ok) throw new Error('Not authenticated');
  const data = (await res.json()) as DashboardUser;
  _csrfToken = data.csrfToken ?? '';
  return data;
}

/** Botが参加していて管理権限を持つギルド一覧を取得する */
export async function getGuilds(): Promise<Guild[]> {
  const res = await fetch(`${API_BASE}/api/guilds`);
  if (!res.ok) throw new Error('Failed to fetch guilds');
  return res.json() as Promise<Guild[]>;
}

/** ギルドの設定情報とチャンネル一覧を取得する */
export async function getGuildDetail(guildId: string): Promise<GuildDetail> {
  const res = await fetch(`${API_BASE}/api/guilds/${encodeURIComponent(guildId)}`);
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? 'Failed to fetch guild');
  }
  return res.json() as Promise<GuildDetail>;
}

/** ギルドの設定値を更新する */
export async function updateGuildConfig(
  guildId: string,
  key: string,
  value: string,
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/guilds/${encodeURIComponent(guildId)}/config`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': _csrfToken,
    },
    body: JSON.stringify({ key, value }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? '設定の保存に失敗しました。');
  }
}
