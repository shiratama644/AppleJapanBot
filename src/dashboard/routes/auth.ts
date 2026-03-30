import { Router } from 'express';
import { env } from '../../config/env';
import type { DiscordTokenResponse, DiscordUserResponse } from '../types';

const DISCORD_API = 'https://discord.com/api/v10';

export function createAuthRouter(): Router {
  const router = Router();

  // ログイン: Discord OAuth2 認可ページへリダイレクト
  router.get('/login', (_req, res) => {
    const params = new URLSearchParams({
      client_id: env.DISCORD_CLIENT_ID!,
      redirect_uri: env.DISCORD_REDIRECT_URI!,
      response_type: 'code',
      scope: 'identify guilds',
    });
    res.redirect(`https://discord.com/api/oauth2/authorize?${params.toString()}`);
  });

  // コールバック: コードをトークンに交換し、セッションにユーザー情報を保存
  router.get('/callback', async (req, res): Promise<void> => {
    const code = req.query.code;
    if (typeof code !== 'string' || !code) {
      res.status(400).send('認証コードが見つかりません。');
      return;
    }

    // コードをアクセストークンに交換
    const tokenRes = await fetch(`${DISCORD_API}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: env.DISCORD_CLIENT_ID!,
        client_secret: env.DISCORD_CLIENT_SECRET!,
        grant_type: 'authorization_code',
        code,
        redirect_uri: env.DISCORD_REDIRECT_URI!,
      }).toString(),
    });

    if (!tokenRes.ok) {
      res.status(502).send('Discord からトークンの取得に失敗しました。');
      return;
    }

    const tokenData = (await tokenRes.json()) as DiscordTokenResponse;

    // ユーザー情報を取得
    const userRes = await fetch(`${DISCORD_API}/users/@me`, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userRes.ok) {
      res.status(502).send('Discord からユーザー情報の取得に失敗しました。');
      return;
    }

    const userData = (await userRes.json()) as DiscordUserResponse;

    req.session.user = {
      id: userData.id,
      username: userData.username,
      avatar: userData.avatar,
      accessToken: tokenData.access_token,
    };

    res.redirect('/dashboard.html');
  });

  // ログアウト: セッションを破棄してトップへ
  router.get('/logout', (req, res): void => {
    req.session.destroy(() => {
      res.redirect('/');
    });
  });

  return router;
}
