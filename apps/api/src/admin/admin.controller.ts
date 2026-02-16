import {
  Controller,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  UsePipes,
  ParseUUIDPipe,
} from '@nestjs/common';
import { createAssetDto, updateAssetDto } from '@fx-library/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ZodValidationPipe } from '../auth/pipes/zod-validation.pipe';
import { AdminService } from './admin.service';

@Controller('admin/assets')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createAssetDto))
  async create(@Body() body: any) {
    return this.adminService.createAsset(body);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateAssetDto)) body: any,
  ) {
    return this.adminService.updateAsset(id, body);
  }

  @Post(':id/publish')
  async publish(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.publish(id);
  }

  @Post(':id/unpublish')
  async unpublish(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.unpublish(id);
  }
}
