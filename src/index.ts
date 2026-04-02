import path from 'path';
import fs from 'fs';
import client from './client';
import config from './config/config';
import type { Command, BotEvent } from './types/index';
import { startDashboard } from './dashboard/server';
import { migrate } from './db/migrate';
import logger from './utils/logger';

// tsx（開発時）は .ts を、コンパイル済み（本番）は .js を読み込む
const ext = __filename.endsWith('.ts') ? '.ts' : '.js';

/** ディレクトリを再帰的にスキャンし、指定の拡張子を持つファイルパスを返す */
function scanFiles(dir: string, suffix: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return scanFiles(full, suffix);
    return entry.name.endsWith(suffix) ? [full] : [];
  });
}

// commands/ 配下（サブディレクトリ含む）のコマンドを登録する
for (const filePath of scanFiles(path.join(__dirname, 'commands'), ext)) {
  const mod = require(filePath) as { default?: Command };
  const command = mod.default;
  if (command?.data) {
    client.commands.set(command.data.name, command);
  }
}

// events/ 配下のイベントを登録する
for (const filePath of scanFiles(path.join(__dirname, 'events'), ext)) {
  const mod = require(filePath) as { default?: BotEvent };
  const event = mod.default;
  if (event?.name && event?.execute) {
    // ClientEvents の型マップを動的キーで絞り込むことは不可能なため型アサーションを使用
    const handler = (...args: unknown[]) => { (event.execute as (...a: unknown[]) => void)(...args); };
    if (event.once) {
      (client.once as (e: string, fn: (...a: unknown[]) => void) => void)(event.name, handler);
    } else {
      (client.on as (e: string, fn: (...a: unknown[]) => void) => void)(event.name, handler);
    }
  }
}

client.login(config.discord.token);

// DBマイグレーションを起動時に自動実行し、完了後にダッシュボードを起動する
migrate()
  .then(() => {
    logger.info('✅ DBマイグレーション完了');
    // Webダッシュボードを起動する（必須環境変数が設定されている場合のみ）
    startDashboard(client);
  })
  .catch((e: unknown) => {
    logger.error('❌ DBマイグレーション失敗:', e);
    // マイグレーション失敗時もダッシュボードは起動する
    startDashboard(client);
  });
