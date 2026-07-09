import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const [
      totalProducts,
      totalCategories,
      totalSuppliers,
      lowStockProducts,
      recentActivities,
      lowStockList,
    ] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.category.count(),
      this.prisma.supplier.count(),
      this.prisma.product.count({
        where: {
          currentStock: {
            lte: this.prisma.product.fields.minimumStock as unknown as number,
          },
        },
      }),
      this.prisma.stockMovement.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          product: {
            select: { id: true, sku: true, name: true, unit: true },
          },
          user: {
            select: { id: true, name: true },
          },
        },
      }),
      this.prisma.product.findMany({
        where: {
          currentStock: {
            lte: 0,
          },
        },
        orderBy: { currentStock: 'asc' },
        take: 10,
        include: {
          category: { select: { name: true } },
          supplier: { select: { name: true } },
        },
      }),
    ]);

    // Get low stock products using raw comparison
    const lowStockCount = await this.prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*)::int as count FROM products WHERE current_stock <= minimum_stock
    `;

    const lowStockItems = await this.prisma.$queryRaw<Array<{
      id: string;
      sku: string;
      name: string;
      unit: string;
      current_stock: number;
      minimum_stock: number;
      category_name: string;
      supplier_name: string;
    }>>`
      SELECT p.id, p.sku, p.name, p.unit, p.current_stock, p.minimum_stock,
             c.name as category_name, s.name as supplier_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.current_stock <= p.minimum_stock
      ORDER BY p.current_stock ASC
      LIMIT 10
    `;

    return {
      summary: {
        totalProducts,
        totalCategories,
        totalSuppliers,
        lowStockProducts: Number(lowStockCount[0]?.count || 0),
      },
      recentActivities,
      lowStockItems: lowStockItems.map((item) => ({
        id: item.id,
        sku: item.sku,
        name: item.name,
        unit: item.unit,
        currentStock: item.current_stock,
        minimumStock: item.minimum_stock,
        categoryName: item.category_name,
        supplierName: item.supplier_name,
      })),
    };
  }
}
