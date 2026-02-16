import { Controller, Post, Body, Req, UsePipes } from '@nestjs/common';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { createEventDto } from '@fx-library/shared';
import { ZodValidationPipe } from '../auth/pipes/zod-validation.pipe';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @UsePipes(new ZodValidationPipe(createEventDto))
  async create(
    @Body() body: { type: string; payload?: Record<string, unknown> },
    @Req() req: Request,
  ) {
    const userId = (req as any).user?.sub ?? null;
    return this.eventsService.create(body.type as any, userId, body.payload);
  }
}
