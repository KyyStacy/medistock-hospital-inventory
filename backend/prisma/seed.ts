import { PrismaClient, Role, Unit, MovementType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Mulai seeding data...');

  // Clean existing data
  await prisma.stockMovement.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.user.deleteMany();

  // Seed Users
  const hashedPassword = await bcrypt.hash('password', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Administrator',
      email: 'admin@example.com',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  const viewer = await prisma.user.create({
    data: {
      name: 'Viewer User',
      email: 'viewer@example.com',
      password: hashedPassword,
      role: Role.VIEWER,
    },
  });

  console.log('✅ Users berhasil dibuat');

  // Seed Categories
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: 'Alat Kesehatan', description: 'Peralatan medis dan alat kesehatan rumah sakit' },
    }),
    prisma.category.create({
      data: { name: 'Bahan Habis Pakai', description: 'Material sekali pakai untuk keperluan medis' },
    }),
    prisma.category.create({
      data: { name: 'Obat-obatan', description: 'Obat dan sediaan farmasi' },
    }),
    prisma.category.create({
      data: { name: 'Perlengkapan Kantor', description: 'Alat tulis dan perlengkapan administrasi' },
    }),
  ]);

  console.log('✅ Categories berhasil dibuat');

  // Seed Suppliers
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        name: 'PT Medika Utama',
        phone: '021-5551234',
        email: 'info@medikautama.co.id',
        address: 'Jl. Kesehatan No. 1, Jakarta Pusat',
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'CV Sumber Sehat',
        phone: '031-8871234',
        email: 'order@sumbersehat.com',
        address: 'Jl. Farmasi No. 45, Surabaya',
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'PT Alkes Indonesia',
        phone: '022-7651234',
        email: 'sales@alkesindonesia.co.id',
        address: 'Jl. Industri Medis No. 12, Bandung',
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'PT Pharma Global',
        phone: '021-4431234',
        email: 'contact@pharmaglobal.co.id',
        address: 'Jl. Kemang Raya No. 88, Jakarta Selatan',
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'CV Mitra Kantor',
        phone: '021-6671234',
        email: 'info@mitrakantor.com',
        address: 'Jl. Perkantoran No. 20, Tangerang',
      },
    }),
  ]);

  console.log('✅ Suppliers berhasil dibuat');

  // Seed Products
  const productsData = [
    { sku: 'MED-001', name: 'Sarung Tangan Latex', categoryId: categories[1].id, supplierId: suppliers[0].id, unit: Unit.BOX, minimumStock: 20, currentStock: 50 },
    { sku: 'MED-002', name: 'Masker Bedah 3 Ply', categoryId: categories[1].id, supplierId: suppliers[0].id, unit: Unit.BOX, minimumStock: 30, currentStock: 15 },
    { sku: 'MED-003', name: 'Infus NaCl 0.9%', categoryId: categories[2].id, supplierId: suppliers[3].id, unit: Unit.BOTTLE, minimumStock: 50, currentStock: 120 },
    { sku: 'MED-004', name: 'Alkohol 70%', categoryId: categories[1].id, supplierId: suppliers[1].id, unit: Unit.BOTTLE, minimumStock: 15, currentStock: 8 },
    { sku: 'MED-005', name: 'Stetoskop Littmann', categoryId: categories[0].id, supplierId: suppliers[2].id, unit: Unit.PCS, minimumStock: 5, currentStock: 12 },
    { sku: 'MED-006', name: 'Tensimeter Digital', categoryId: categories[0].id, supplierId: suppliers[2].id, unit: Unit.PCS, minimumStock: 3, currentStock: 7 },
    { sku: 'MED-007', name: 'Thermometer Infrared', categoryId: categories[0].id, supplierId: suppliers[2].id, unit: Unit.PCS, minimumStock: 5, currentStock: 3 },
    { sku: 'MED-008', name: 'Perban Elastis', categoryId: categories[1].id, supplierId: suppliers[0].id, unit: Unit.PACK, minimumStock: 25, currentStock: 40 },
    { sku: 'MED-009', name: 'Kapas Steril', categoryId: categories[1].id, supplierId: suppliers[1].id, unit: Unit.PACK, minimumStock: 20, currentStock: 35 },
    { sku: 'MED-010', name: 'Plester Luka', categoryId: categories[1].id, supplierId: suppliers[0].id, unit: Unit.BOX, minimumStock: 15, currentStock: 5 },
    { sku: 'MED-011', name: 'Jarum Suntik 3ml', categoryId: categories[1].id, supplierId: suppliers[1].id, unit: Unit.BOX, minimumStock: 30, currentStock: 80 },
    { sku: 'MED-012', name: 'Paracetamol 500mg', categoryId: categories[2].id, supplierId: suppliers[3].id, unit: Unit.BOX, minimumStock: 40, currentStock: 100 },
    { sku: 'MED-013', name: 'Amoxicillin 500mg', categoryId: categories[2].id, supplierId: suppliers[3].id, unit: Unit.BOX, minimumStock: 25, currentStock: 60 },
    { sku: 'MED-014', name: 'Betadine 60ml', categoryId: categories[2].id, supplierId: suppliers[1].id, unit: Unit.BOTTLE, minimumStock: 10, currentStock: 22 },
    { sku: 'MED-015', name: 'Kasa Steril 16x16', categoryId: categories[1].id, supplierId: suppliers[0].id, unit: Unit.PACK, minimumStock: 20, currentStock: 10 },
    { sku: 'OFF-001', name: 'Kertas HVS A4', categoryId: categories[3].id, supplierId: suppliers[4].id, unit: Unit.PACK, minimumStock: 10, currentStock: 25 },
    { sku: 'OFF-002', name: 'Tinta Printer HP', categoryId: categories[3].id, supplierId: suppliers[4].id, unit: Unit.PCS, minimumStock: 5, currentStock: 2 },
    { sku: 'OFF-003', name: 'Map Rekam Medis', categoryId: categories[3].id, supplierId: suppliers[4].id, unit: Unit.PACK, minimumStock: 15, currentStock: 30 },
    { sku: 'MED-016', name: 'Pulse Oximeter', categoryId: categories[0].id, supplierId: suppliers[2].id, unit: Unit.PCS, minimumStock: 5, currentStock: 8 },
    { sku: 'MED-017', name: 'Nebulizer Set', categoryId: categories[0].id, supplierId: suppliers[2].id, unit: Unit.UNIT, minimumStock: 3, currentStock: 6 },
  ];

  const products = await Promise.all(
    productsData.map((p) => prisma.product.create({ data: p })),
  );

  console.log('✅ Products berhasil dibuat');

  // Seed Stock Movements (50 records)
  const movementNotes = {
    IN: [
      'Pengadaan rutin bulanan',
      'Restok dari supplier',
      'Penerimaan barang baru',
      'Pembelian tambahan',
      'Pengadaan darurat',
      'Pengiriman dari gudang pusat',
    ],
    OUT: [
      'Distribusi ke IGD',
      'Distribusi ke Rawat Inap',
      'Distribusi ke Poliklinik',
      'Pemakaian operasi',
      'Distribusi ke Laboratorium',
      'Distribusi ke Farmasi',
    ],
  };

  const movements = [];
  for (let i = 0; i < 50; i++) {
    const product = products[Math.floor(Math.random() * products.length)];
    const type: MovementType = Math.random() > 0.4 ? 'IN' : 'OUT';
    const quantity = type === 'IN'
      ? Math.floor(Math.random() * 30) + 5
      : Math.floor(Math.random() * 10) + 1;
    const notesList = movementNotes[type];
    const notes = notesList[Math.floor(Math.random() * notesList.length)];
    const createdBy = Math.random() > 0.3 ? admin.id : admin.id; // All movements by admin
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    movements.push(
      prisma.stockMovement.create({
        data: {
          productId: product.id,
          type,
          quantity,
          notes,
          createdBy,
          createdAt,
        },
      }),
    );
  }

  await Promise.all(movements);

  console.log('✅ Stock Movements berhasil dibuat');
  console.log('');
  console.log('📋 Akun Login:');
  console.log('   Admin  → admin@example.com / password');
  console.log('   Viewer → viewer@example.com / password');
  console.log('');
  console.log('🎉 Seeding selesai!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding gagal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
