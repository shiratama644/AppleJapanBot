import express from 'express';
import session from 'express-session';
import path from 'path';
import type { Client } from 'discord.js';
import { env } from '../config/env';
import logger from '../utils/logger';
import { createAuthRouter } from './routes/auth';
import { createGuildsRouter } from './routes/guilds';
import { csrfProtect } from './middleware/csrf';

// express-session の SessionData 拡張を読み込む
import './types';

/**
 * Webダッシュボードサーバーを起動する。
 * SESSION_SECRET / DISCORD_CLIENT_ID / DISCORD_CLIENT_SECRET / DISCORD_REDIRECT_URI が
 * 設定されていない場合はスキップする。
 */
export function startDashboard(client: Client): void {
  if (
    !env.SESSION_SECRET ||
    !env.DISCORD_CLIENT_ID ||
    !env.DISCORD_CLIENT_SECRET ||
    !env.DISCORD_REDIRECT_URI
  ) {
    logger.info(
      'ダッシュボードの必須設定が不完全なため起動をスキップします。' +
      '（SESSION_SECRET / DISCORD_CLIENT_ID / DISCORD_CLIENT_SECRET / DISCORD_REDIRECT_URI を設定してください）',
    );
    return;
  }

  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use(
    session({
      secret: env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      // セッションクッキーは常に HTTPS でのみ送信する（secure: true）
      // ローカル開発では ngrok / cloudflare tunnel 等で HTTPS を用意してください
      cookie: {
        secure: true,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
      },
    }),
  );

  // 静的ファイル（Next.js の静的エクスポート出力）
  // extensions: ['html'] により /dashboard → dashboard.html のように .html 省略アクセスを可能にする
  app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

  // 認証ルート
  app.use('/auth', createAuthRouter());

  // API ルート（CSRF 保護を含む）
  app.use('/api', csrfProtect, createGuildsRouter(client));

  app.listen(env.DASHBOARD_PORT, () => {
    logger.info(`🌐 ダッシュボードが起動しました: http://localhost:${env.DASHBOARD_PORT}`);
  });
}
