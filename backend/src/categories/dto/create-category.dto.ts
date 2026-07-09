import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Alat Kesehatan', description: 'Nama kategori' })
  @IsString()
  @IsNotEmpty({ message: 'Nama kategori wajib diisi' })
  @MaxLength(100, { message: 'Nama kategori maksimal 100 karakter' })
  name: string;

  @ApiPropertyOptional({ example: 'Peralatan medis rumah sakit', description: 'Deskripsi kategori' })
  @IsOptional()
  @IsString()
  description?: string;
}
