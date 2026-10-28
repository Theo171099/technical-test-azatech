import { PrismaClient, Gender } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean existing records (order matters due to foreign keys)
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // 2. Seed Admin User
  const hashedPassword = await bcrypt.hash('password123', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'Admin AZA',
      email: 'admin@azatech.id',
      password: hashedPassword,
    },
  });
  console.log(`✅ Admin user seeded: ${admin.email} (password: password123)`);

  // 3. Seed 22 Products (including low stock products < 5 for dashboard alert)
  const productData = [
    { code: 'P0001', name: 'Hydrococo 150ml', stock: 45, price: 12000 },
    { code: 'P0002', name: 'Indomie Goreng Spesial', stock: 120, price: 3500 },
    { code: 'P0003', name: 'Aqua 600ml', stock: 80, price: 4000 },
    { code: 'P0004', name: 'Teh Botol Sosro 250ml', stock: 60, price: 5000 },
    { code: 'P0005', name: 'Ultra Milk Cokelat 250ml', stock: 35, price: 7500 },
    { code: 'P0006', name: 'Pocari Sweat 500ml', stock: 50, price: 9000 },
    { code: 'P0007', name: 'Silverqueen Almond 62g', stock: 25, price: 17500 },
    { code: 'P0008', name: 'Chitato Sapi Panggang 68g', stock: 40, price: 11500 },
    { code: 'P0009', name: 'Oreo Vanilla 133g', stock: 30, price: 9500 },
    { code: 'P0010', name: 'Beng-Beng Reguler 20g', stock: 95, price: 2500 },
    { code: 'P0011', name: 'Bear Brand 189ml', stock: 3, price: 11000 }, // Stock < 5
    { code: 'P0012', name: 'Buavita Jambu 250ml', stock: 2, price: 8500 },  // Stock < 5
    { code: 'P0013', name: 'Nabati Wafer Keju 130g', stock: 28, price: 7000 },
    { code: 'P0014', name: 'Kopiko 78C Coffee Latte', stock: 34, price: 8000 },
    { code: 'P0015', name: 'Taro Net Seaweed 65g', stock: 22, price: 6500 },
    { code: 'P0016', name: 'Sari Roti Sobek Coklat', stock: 4, price: 14000 }, // Stock < 5
    { code: 'P0017', name: 'Kopi Kenangan Mantancino', stock: 40, price: 9500 },
    { code: 'P0018', name: 'Good Day Cappuccino Botol', stock: 55, price: 7000 },
    { code: 'P0019', name: 'Piattos Sapi Panggang 75g', stock: 19, price: 10500 },
    { code: 'P0020', name: 'Milo UHT Kotak 180ml', stock: 65, price: 6000 },
    { code: 'P0021', name: 'Coca-Cola Can 330ml', stock: 30, price: 8000 },
    { code: 'P0022', name: 'Nutrisari Jeruk Peras Box', stock: 15, price: 15000 },
  ];

  const products = [];
  for (const item of productData) {
    const prod = await prisma.product.create({
      data: {
        product_code: item.code,
        product_name: item.name,
        stock: item.stock,
        price: item.price,
      },
    });
    products.push(prod);
  }
  console.log(`✅ ${products.length} Products seeded`);

  // 4. Seed 16 Customers
  const customerData = [
    { name: 'Budi Santoso', address: 'Jl. Sudirman No. 45, Jakarta Pusat', gender: Gender.Pria, birth: '1990-05-12', phone: '081234567890' },
    { name: 'Siti Rahmawati', address: 'Jl. Melati No. 12, Bandung', gender: Gender.Wanita, birth: '1995-08-20', phone: '081398765432' },
    { name: 'Agus Pratama', address: 'Jl. Pemuda No. 78, Semarang', gender: Gender.Pria, birth: '1988-11-03', phone: '085712345678' },
    { name: 'Dewi Lestari', address: 'Jl. Raya Darmo No. 88, Surabaya', gender: Gender.Wanita, birth: '1992-02-14', phone: '087811223344' },
    { name: 'Eko Prasetyo', address: 'Jl. Kaliurang Km 5, Yogyakarta', gender: Gender.Pria, birth: '1994-07-25', phone: '089655443322' },
    { name: 'Rina Kusuma', address: 'Jl. Gatot Subroto No. 34, Denpasar', gender: Gender.Wanita, birth: '1997-03-30', phone: '081223344556' },
    { name: 'Hendra Gunawan', address: 'Jl. Asia Afrika No. 101, Bandung', gender: Gender.Pria, birth: '1985-09-17', phone: '082155667788' },
    { name: 'Maya Anggraini', address: 'Jl. Gajah Mada No. 15, Medan', gender: Gender.Wanita, birth: '1996-12-05', phone: '085233445566' },
    { name: 'Fajar Nugroho', address: 'Jl. Diponegoro No. 29, Surakarta', gender: Gender.Pria, birth: '1993-04-18', phone: '081877889900' },
    { name: 'Indah Permata', address: 'Jl. Cempaka Putih No. 6, Jakarta Pusat', gender: Gender.Wanita, birth: '1998-01-22', phone: '087799881122' },
    { name: 'Rizky Ramadhan', address: 'Jl. Veteran No. 40, Malang', gender: Gender.Pria, birth: '1991-10-10', phone: '083811223399' },
    { name: 'Nurul Hidayah', address: 'Jl. Basuki Rahmat No. 55, Palembang', gender: Gender.Wanita, birth: '1990-06-15', phone: '085644556677' },
    { name: 'Dimas Setiawan', address: 'Jl. Ahmad Yani No. 18, Balikpapan', gender: Gender.Pria, birth: '1989-08-08', phone: '081344556677' },
    { name: 'Putri Ayu', address: 'Jl. Pahlawan No. 9, Makassar', gender: Gender.Wanita, birth: '1999-09-19', phone: '082233445511' },
    { name: 'Aris Munandar', address: 'Jl. Urip Sumoharjo No. 70, Solo', gender: Gender.Pria, birth: '1987-03-24', phone: '081566778899' },
    { name: 'Tri Wahyuni', address: 'Jl. Tebet Raya No. 14, Jakarta Selatan', gender: Gender.Wanita, birth: '1994-11-28', phone: '089922334455' },
  ];

  const customers = [];
  for (const c of customerData) {
    const customer = await prisma.customer.create({
      data: {
        customer_name: c.name,
        customer_address: c.address,
        gender: c.gender,
        birth_date: new Date(c.birth),
        phone: c.phone,
      },
    });
    customers.push(customer);
  }
  console.log(`✅ ${customers.length} Customers seeded`);

  // 5. Seed 32 Orders spread across the last 30 days
  const now = new Date();
  for (let i = 1; i <= 32; i++) {
    // Days ago between 0 and 29
    const daysAgo = Math.floor((32 - i) * (28 / 32));
    const orderDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000 - (i % 8) * 3600 * 1000);
    const dateStr = orderDate.toISOString().slice(0, 10).replace(/-/g, '');
    const seq = String(i).padStart(4, '0');
    const orderNumber = `INV-${dateStr}-${seq}`;

    const customer = customers[i % customers.length];

    // Pick 1 to 3 items
    const itemCount = (i % 3) + 1;
    const selectedProducts: typeof products = [];
    for (let j = 0; j < itemCount; j++) {
      const prodIndex = (i * 2 + j) % products.length;
      if (!selectedProducts.includes(products[prodIndex])) {
        selectedProducts.push(products[prodIndex]);
      }
    }

    let totalAmount = 0;
    const itemsData = selectedProducts.map((p, idx) => {
      const quantity = (idx % 2) + 1;
      const unitPrice = Number(p.price);
      const subtotal = quantity * unitPrice;
      totalAmount += subtotal;
      return {
        product_id: p.id,
        quantity,
        unit_price: unitPrice,
        subtotal,
      };
    });

    await prisma.order.create({
      data: {
        order_number: orderNumber,
        customer_id: customer.id,
        created_by: admin.id,
        order_date: orderDate,
        total_amount: totalAmount,
        order_items: {
          create: itemsData,
        },
      },
    });
  }

  console.log('✅ 32 Orders spread across 30 days seeded successfully');
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeder failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
