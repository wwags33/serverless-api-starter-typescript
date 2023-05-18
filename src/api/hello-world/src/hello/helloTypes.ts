import { z } from 'zod';

export const HelloPathParams = z.object({
  helloId: z.string().uuid(),
});
