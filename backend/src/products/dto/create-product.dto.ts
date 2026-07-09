import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { Unit } from '@prisma/client';

export class CreateProductDto {
  @ApiProperty({ example: 'MED-001', description: 'SKU produk (unik)' })
  @IsString()
  @IsNotEmpty({ message: 'SKU wajib diisi' })
  @MaxLength(50, { message: 'SKU maksimal 50 karakter' })
  sku: string;

  @ApiProperty({ example: 'Sarung Tangan Latex', description: 'Nama produk' })
  @IsString()
  @IsNotEmpty({ message: 'Nama produk wajib diisi' })
  @MaxLength(200, { message: 'Nama produk maksimal 200 karakter' })
  name: string;

  @ApiProperty({ description: 'ID kategori' })
  @IsUUID('4', { message: 'Format ID kategori tidak valid' })
  @IsNotEmpty({ message: 'Kategori wajib diisi' })
  categoryId: string;

  @ApiProperty({ description: 'ID supplier' })
  @IsUUID('4', { message: 'Format ID supplier tidak valid' })
  @IsNotEmpty({ message: 'Supplier wajib diisi' })
  supplierId: string;

  @ApiProperty({ enum: Unit, example: 'BOX', description: 'Satuan produk' })
  @IsEnum(Unit, { message: 'Unit harus salah satu dari: PCS, BOX, PACK, BOTTLE, UNIT' })
  @IsNotEmpty({ message: 'Unit wajib diisi' })
  unit: Unit;

  @ApiProperty({ example: 10, description: 'Stok minimum' })
  @IsInt({ message: 'Stok minimum harus berupa angka bulat' })
  @Min(0, { message: 'Stok minimum tidak boleh negatif' })
  minimumStock: number;

  @ApiPropertyOptional({ example: 'Sarung tangan lateks non-steril', description: 'Deskripsi produk' })
  @IsOptional()
  @IsString()
  description?: string;
}
