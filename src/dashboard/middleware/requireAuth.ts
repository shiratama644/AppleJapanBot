import type { Request, Response, NextFunction } from 'express';

/**
 * セッションにユーザー情報がない場合は /auth/login へリダイレクトする。
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (req.session.user) {
    next();
    return;
  }
  res.redirect('/auth/login');
}
