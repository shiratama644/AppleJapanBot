import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';

// セッションに CSRF トークンフィールドを追加する
declare module 'express-session' {
  interface SessionData {
    csrfToken?: string;
  }
}

/**
 * CSRF 保護ミドルウェア。
 * GET/HEAD/OPTIONS はトークンを生成してレスポンスヘッダーで公開し、
 * POST/PUT/DELETE は X-CSRF-Token ヘッダーを検証する。
 */
export function csrfProtect(req: Request, res: Response, next: NextFunction): void {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    if (!req.session.csrfToken) {
      req.session.csrfToken = crypto.randomBytes(32).toString('hex');
    }
    res.setHeader('X-CSRF-Token', req.session.csrfToken);
    next();
    return;
  }

  // POST / PUT / DELETE: X-CSRF-Token ヘッダーを検証する
  const provided = req.headers['x-csrf-token'];
  if (
    typeof provided !== 'string' ||
    !req.session.csrfToken ||
    provided.length !== req.session.csrfToken.length ||
    !crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(req.session.csrfToken))
  ) {
    res.status(403).json({ error: 'CSRFトークンの検証に失敗しました。ページを再読み込みしてください。' });
    return;
  }
  next();
}
