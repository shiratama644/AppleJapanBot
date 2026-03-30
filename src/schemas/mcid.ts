import { z } from 'zod';

/**
 * Minecraft プレイヤー ID (MCID) のバリデーションスキーマ。
 *
 * - Java Edition (JE): 英数字・アンダースコアのみ、3〜16文字
 * - Bedrock Edition (BE): 英数字・アンダースコア・スペースを含む場合もあるが、
 *   API で検索可能な範囲は最大 16 文字
 *
 * 両エディションをまとめて受け付けるため、共通の安全な範囲でバリデーションする:
 * - 前後の空白をトリム
 * - 使用可能文字: 英字・数字・アンダースコア・スペース
 * - 長さ: 1〜16 文字（BE は 1 文字から有効なため min は 1）
 */
export const McidSchema = z
  .string()
  .trim()
  .min(1, 'MCIDを入力してください。')
  .max(16, 'MCIDは16文字以内で入力してください。')
  .regex(
    /^[A-Za-z0-9_ ]+$/,
    'MCIDに使用できるのは英字・数字・アンダースコア・スペースのみです。',
  );

export type Mcid = z.infer<typeof McidSchema>;
