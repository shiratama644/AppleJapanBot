/** ダッシュボードのセッションに保存するユーザー情報 */
export interface DashboardUser {
  id: string;
  username: string;
  avatar: string | null;
  accessToken: string;
}

/** Discord OAuth2 トークンレスポンス */
export interface DiscordTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

/** Discord ユーザー情報（/users/@me） */
export interface DiscordUserResponse {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
}

/** Discord ギルド情報（/users/@me/guilds） */
export interface DiscordGuildResponse {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
}

// express-session の SessionData を拡張してユーザー情報を保持できるようにする
declare module 'express-session' {
  interface SessionData {
    user?: DashboardUser;
  }
}
