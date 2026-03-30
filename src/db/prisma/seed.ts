// 初期データ投入スクリプト（任意）
// 使い方: npx prisma db seed
import prisma from './client';

async function main(): Promise<void> {
  // 例: 初期設定を bot_config に投入する場合
  // await prisma.botConfig.upsert({
  //   where:  { key: 'list_message_id' },
  //   update: {},
  //   create: { key: 'list_message_id', value: '' },
  // });
}

main()
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
