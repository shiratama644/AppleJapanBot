import { z } from 'zod';

/**
 * PlayerDB API レスポンスのスキーマ。
 * 成功時は data.player.id に UUID または XUID が入る。
 */
export const PlayerDbResponseSchema = z.object({
  success: z.boolean(),
  data: z
    .object({
      player: z
        .object({
          id: z.string().min(1),
        })
        .optional(),
    })
    .optional(),
});

export type PlayerDbResponse = z.infer<typeof PlayerDbResponseSchema>;
