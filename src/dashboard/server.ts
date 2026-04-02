import express from 'express';
import session from 'express-session';
import path from 'path';
import fs from 'fs';
import type { Client } from 'discord.js';
import { env } from '../config/env';
import logger from '../utils/logger';
import { createAuthRouter } from './routes/auth';
import { createGuildsRouter } from './routes/guilds';
import { csrfProtect } from './middleware/csrf';

// express-session の SessionData 拡張を読み込む
import './types';

// tsx で直接実行中（開発モード）かどうかを判定する
const isDev = __filename.endsWith('.ts');

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
      // 開発時（HTTP localhost）は secure: false にしてセッションが機能するようにする
      cookie: {
        secure: !isDev,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
      },
    }),
  );

  // 静的ファイル（Next.js の静的エクスポート出力）
  // 開発時は pnpm build を実行していないため public/ が存在しない場合がある
  const publicDir = path.join(__dirname, 'public');
  if (fs.existsSync(publicDir)) {
    // extensions: ['html'] により /dashboard → dashboard.html のように .html 省略アクセスを可能にする
    app.use(express.static(publicDir, { extensions: ['html'] }));
  } else if (isDev) {
    // 開発時: フロントエンドの Next.js dev サーバー (port 3001) へ誘導するページを返す
    const devPort = 3001;
    app.get('/', (_req, res) => {
      res.send(
        `<!DOCTYPE html><html lang="ja"><head><meta charset="utf-8">` +
        `<meta http-equiv="refresh" content="0;url=http://localhost:${devPort}">` +
        `<title>リダイレクト中...</title></head><body>` +
        `<p>開発モードです。Next.js dev サーバー (<a href="http://localhost:${devPort}">http://localhost:${devPort}</a>) へリダイレクトしています...</p>` +
        `<p>フロントエンドを起動するには別ターミナルで <code>pnpm dev:dashboard</code> を実行してください。</p>` +
        `</body></html>`,
      );
    });
  }

  // 認証ルート
  app.use('/auth', createAuthRouter());

  // API ルート（CSRF 保護を含む）
  app.use('/api', csrfProtect, createGuildsRouter(client));

  app.listen(env.DASHBOARD_PORT, () => {
    logger.info(`🌐 ダッシュボードが起動しました: http://localhost:${env.DASHBOARD_PORT}`);
  });
}
