import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSupplierDto {
  @ApiProperty({ example: 'PT Medika Utama', description: 'Nama supplier' })
  @IsString()
  @IsNotEmpty({ message: 'Nama supplier wajib diisi' })
  @MaxLength(200, { message: 'Nama supplier maksimal 200 karakter' })
  name: string;

  @ApiPropertyOptional({ example: '021-5551234', description: 'Nomor telepon' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'info@medikautama.com', description: 'Email supplier' })
  @IsOptional()
  @IsEmail({}, { message: 'Format email tidak valid' })
  email?: string;

  @ApiPropertyOptional({ example: 'Jl. Kesehatan No. 1, Jakarta', description: 'Alamat supplier' })
  @IsOptional()
  @IsString()
  address?: string;
}
