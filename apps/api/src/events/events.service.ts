import { Injectable } from '@nestjs/common';
import { EventType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    type: EventType,
    userId: string | null,
    payload?: Record<string, unknown>,
  ) {
    const event = await this.prisma.event.create({
      data: {
        type,
        userId,
        payload: (payload as Prisma.InputJsonValue) ?? undefined,
      },
    });
    return { id: event.id };
  }
}
