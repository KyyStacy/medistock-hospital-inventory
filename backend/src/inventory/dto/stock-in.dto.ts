import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class StockInDto {
  @ApiProperty({ description: 'ID produk' })
  @IsUUID('4', { message: 'Format ID produk tidak valid' })
  @IsNotEmpty({ message: 'Produk wajib diisi' })
  productId: string;

  @ApiProperty({ example: 50, description: 'Jumlah stok masuk' })
  @IsInt({ message: 'Kuantitas harus berupa angka bulat' })
  @Min(1, { message: 'Kuantitas harus lebih dari 0' })
  quantity: number;

  @ApiPropertyOptional({ example: 'Pengadaan bulan Juli', description: 'Catatan' })
  @IsOptional()
  @IsString()
  notes?: string;
}
