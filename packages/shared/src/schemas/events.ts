import { z } from 'zod';
import { EventType } from '../enums';

export const createEventDto = z.object({
  type: EventType,
  payload: z.record(z.unknown()).optional(),
});
export type CreateEventDto = z.infer<typeof createEventDto>;
