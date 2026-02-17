import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  UsePipes,
  ParseUUIDPipe,
} from '@nestjs/common';
import { createCollectionDto, addCollectionItemDto } from '@fx-library/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ZodValidationPipe } from '../auth/pipes/zod-validation.pipe';
import { CollectionsService } from './collections.service';

@Controller('collections')
@UseGuards(JwtAuthGuard)
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createCollectionDto))
  async create(@Body() body: { title: string }, @CurrentUser('sub') userId: string) {
    return this.collectionsService.create(userId, body.title);
  }

  @Get()
  async findAll(@CurrentUser('sub') userId: string) {
    return this.collectionsService.findAllByUser(userId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('sub') userId: string) {
    return this.collectionsService.findById(id, userId);
  }

  @Post(':id/items')
  @UsePipes(new ZodValidationPipe(addCollectionItemDto))
  async addItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { assetId: string },
    @CurrentUser('sub') userId: string,
  ) {
    return this.collectionsService.addItem(id, body.assetId, userId);
  }

  @Delete(':id/items/:assetId')
  async removeItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('assetId', ParseUUIDPipe) assetId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.collectionsService.removeItem(id, assetId, userId);
  }
}
