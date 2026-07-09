import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StockInDto, StockOutDto } from './dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async stockIn(dto: StockInDto, userId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException('Produk tidak ditemukan');
    }

    // Use transaction to ensure data consistency
    const result = await this.prisma.$transaction(async (tx) => {
      // Create stock movement record
      const movement = await tx.stockMovement.create({
        data: {
          productId: dto.productId,
          type: 'IN',
          quantity: dto.quantity,
          notes: dto.notes,
          createdBy: userId,
        },
        include: {
          product: {
            select: { id: true, sku: true, name: true },
          },
          user: {
            select: { id: true, name: true },
          },
        },
      });

      // Update product stock
      const updatedProduct = await tx.product.update({
        where: { id: dto.productId },
        data: {
          currentStock: {
            increment: dto.quantity,
          },
        },
      });

      return {
        movement,
        product: {
          id: updatedProduct.id,
          name: updatedProduct.name,
          currentStock: updatedProduct.currentStock,
        },
      };
    });

    return result;
  }

  async stockOut(dto: StockOutDto, userId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException('Produk tidak ditemukan');
    }

    // Check if there's enough stock
    if (product.currentStock < dto.quantity) {
      throw new ConflictException(
        `Stok tidak mencukupi. Stok saat ini: ${product.currentStock}, diminta: ${dto.quantity}`,
      );
    }

    // Use transaction to ensure data consistency
    const result = await this.prisma.$transaction(async (tx) => {
      // Create stock movement record
      const movement = await tx.stockMovement.create({
        data: {
          productId: dto.productId,
          type: 'OUT',
          quantity: dto.quantity,
          notes: dto.notes,
          createdBy: userId,
        },
        include: {
          product: {
            select: { id: true, sku: true, name: true },
          },
          user: {
            select: { id: true, name: true },
          },
        },
      });

      // Update product stock
      const updatedProduct = await tx.product.update({
        where: { id: dto.productId },
        data: {
          currentStock: {
            decrement: dto.quantity,
          },
        },
      });

      return {
        movement,
        product: {
          id: updatedProduct.id,
          name: updatedProduct.name,
          currentStock: updatedProduct.currentStock,
        },
      };
    });

    return result;
  }
}
