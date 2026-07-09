import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StockMovementsService } from './stock-movements.service';
import { StockMovementQueryDto } from './dto';
import { RolesGuard } from '../common/guards';

@ApiTags('Stock Movements')
@Controller('stock-movements')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class StockMovementsController {
  constructor(private stockMovementsService: StockMovementsService) {}

  @Get()
  @ApiOperation({ summary: 'Mendapatkan riwayat pergerakan stok' })
  findAll(@Query() query: StockMovementQueryDto) {
    return this.stockMovementsService.findAll(query);
  }
}
