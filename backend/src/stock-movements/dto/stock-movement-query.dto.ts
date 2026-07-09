import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { MovementType } from '@prisma/client';
import { PaginationDto } from '../../common/dto';

export class StockMovementQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: MovementType, description: 'Filter berdasarkan tipe (IN/OUT)' })
  @IsOptional()
  @IsEnum(MovementType)
  type?: MovementType;

  @ApiPropertyOptional({ description: 'Filter berdasarkan produk' })
  @IsOptional()
  @IsUUID('4')
  productId?: string;
}
