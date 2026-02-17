import { Controller, Post, Body, Req, UsePipes } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { createEventDto, CreateEventDto } from '@fx-library/shared';
import { ZodValidationPipe } from '../auth/pipes/zod-validation.pipe';
import { AuthenticatedRequest } from '../auth/types/authenticated-request';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @UsePipes(new ZodValidationPipe(createEventDto))
  async create(@Body() body: CreateEventDto, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.sub ?? null;
    return this.eventsService.create(body.type, userId, body.payload);
  }
}
