// 初期データ投入スクリプト（任意）
// 使い方: npx tsx src/db/seed.ts
import { db } from './kysely';

async function main(): Promise<void> {
  // 例: 初期設定を bot_config に投入する場合
  // await db
  //   .insertInto('botConfig')
  //   .values({ key: 'list_message_id', value: '' })
  //   .onConflict(oc => oc.column('key').doNothing())
  //   .execute();
}

main()
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.destroy());
