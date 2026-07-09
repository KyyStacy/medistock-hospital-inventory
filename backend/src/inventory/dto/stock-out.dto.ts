import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class StockOutDto {
  @ApiProperty({ description: 'ID produk' })
  @IsUUID('4', { message: 'Format ID produk tidak valid' })
  @IsNotEmpty({ message: 'Produk wajib diisi' })
  productId: string;

  @ApiProperty({ example: 10, description: 'Jumlah stok keluar' })
  @IsInt({ message: 'Kuantitas harus berupa angka bulat' })
  @Min(1, { message: 'Kuantitas harus lebih dari 0' })
  quantity: number;

  @ApiPropertyOptional({ example: 'Distribusi ke IGD', description: 'Catatan' })
  @IsOptional()
  @IsString()
  notes?: string;
}
