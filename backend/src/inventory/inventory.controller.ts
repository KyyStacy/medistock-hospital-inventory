import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { InventoryService } from './inventory.service';
import { StockInDto, StockOutDto } from './dto';
import { Roles, CurrentUser } from '../common/decorators';
import { RolesGuard } from '../common/guards';

@ApiTags('Inventory')
@Controller('inventory')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Post('stock-in')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Stok masuk (Admin)' })
  stockIn(@Body() dto: StockInDto, @CurrentUser('id') userId: string) {
    return this.inventoryService.stockIn(dto, userId);
  }

  @Post('stock-out')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Stok keluar (Admin)' })
  stockOut(@Body() dto: StockOutDto, @CurrentUser('id') userId: string) {
    return this.inventoryService.stockOut(dto, userId);
  }
}
