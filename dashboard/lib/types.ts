/** Dashboardに表示するユーザー情報 */
export interface DashboardUser {
  id: string;
  username: string;
  avatar: string;
  csrfToken: string;
}

/** ギルド (サーバー) */
export interface Guild {
  id: string;
  name: string;
  icon: string | null;
}

/** ギルド設定 + チャンネル一覧 */
export interface GuildDetail extends Guild {
  config: Record<string, string>;
  channels: Channel[];
}

/** テキストチャンネル */
export interface Channel {
  id: string;
  name: string;
}
