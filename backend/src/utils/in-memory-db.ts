import bcrypt from 'bcryptjs';

export interface InMemoryUser {
  id: string;
  name: string;
  email: string;
  password: string;
  created_at: Date;
  updated_at: Date;
}

export interface InMemoryProduct {
  id: bigint;
  product_code: string;
  product_name: string;
  stock: number;
  price: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface InMemoryCustomer {
  id: string;
  customer_name: string;
  customer_address: string;
  gender: 'Pria' | 'Wanita';
  birth_date: Date;
  phone: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface InMemoryOrderItem {
  id: bigint;
  order_id: bigint;
  product_id: bigint;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: Date;
  updated_at: Date;
}

export interface InMemoryOrder {
  id: bigint;
  order_number: string;
  customer_id: string;
  created_by: string;
  order_date: Date;
  total_amount: number;
  created_at: Date;
  updated_at: Date;
}

export class InMemoryStore {
  users: InMemoryUser[] = [];
  products: InMemoryProduct[] = [];
  customers: InMemoryCustomer[] = [];
  orders: InMemoryOrder[] = [];
  orderItems: InMemoryOrderItem[] = [];

  private nextProductId = 1n;
  private nextOrderId = 1n;
  private nextOrderItemId = 1n;

  constructor() {
    this.seed();
  }

  private seed() {
    const hashedPassword = bcrypt.hashSync('password123', 10);
    const adminId = 'd3b07384-d113-4e89-8d19-91bb7d727409';
    this.users.push({
      id: adminId,
      name: 'Admin AZA',
      email: 'admin@azatech.id',
      password: hashedPassword,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const productCatalog = [
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
      { code: 'P0011', name: 'Bear Brand 189ml', stock: 3, price: 11000 }, // < 5 stock
      { code: 'P0012', name: 'Buavita Jambu 250ml', stock: 2, price: 8500 },  // < 5 stock
      { code: 'P0013', name: 'Nabati Wafer Keju 130g', stock: 28, price: 7000 },
      { code: 'P0014', name: 'Kopiko 78C Coffee Latte', stock: 34, price: 8000 },
      { code: 'P0015', name: 'Taro Net Seaweed 65g', stock: 22, price: 6500 },
      { code: 'P0016', name: 'Sari Roti Sobek Coklat', stock: 4, price: 14000 }, // < 5 stock
      { code: 'P0017', name: 'Kopi Kenangan Mantancino', stock: 40, price: 9500 },
      { code: 'P0018', name: 'Good Day Cappuccino Botol', stock: 55, price: 7000 },
      { code: 'P0019', name: 'Piattos Sapi Panggang 75g', stock: 19, price: 10500 },
      { code: 'P0020', name: 'Milo UHT Kotak 180ml', stock: 65, price: 6000 },
      { code: 'P0021', name: 'Coca-Cola Can 330ml', stock: 30, price: 8000 },
      { code: 'P0022', name: 'Nutrisari Jeruk Peras Box', stock: 15, price: 15000 },
    ];

    for (const p of productCatalog) {
      this.products.push({
        id: this.nextProductId++,
        product_code: p.code,
        product_name: p.name,
        stock: p.stock,
        price: p.price,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      });
    }

    const customerCatalog = [
      { name: 'Budi Santoso', address: 'Jl. Sudirman No. 45, Jakarta Pusat', gender: 'Pria' as const, birth: '1990-05-12', phone: '081234567890' },
      { name: 'Siti Rahmawati', address: 'Jl. Melati No. 12, Bandung', gender: 'Wanita' as const, birth: '1995-08-20', phone: '081398765432' },
      { name: 'Agus Pratama', address: 'Jl. Pemuda No. 78, Semarang', gender: 'Pria' as const, birth: '1988-11-03', phone: '085712345678' },
      { name: 'Dewi Lestari', address: 'Jl. Raya Darmo No. 88, Surabaya', gender: 'Wanita' as const, birth: '1992-02-14', phone: '087811223344' },
      { name: 'Eko Prasetyo', address: 'Jl. Kaliurang Km 5, Yogyakarta', gender: 'Pria' as const, birth: '1994-07-25', phone: '089655443322' },
      { name: 'Rina Kusuma', address: 'Jl. Gatot Subroto No. 34, Denpasar', gender: 'Wanita' as const, birth: '1997-03-30', phone: '081223344556' },
      { name: 'Hendra Gunawan', address: 'Jl. Asia Afrika No. 101, Bandung', gender: 'Pria' as const, birth: '1985-09-17', phone: '082155667788' },
      { name: 'Maya Anggraini', address: 'Jl. Gajah Mada No. 15, Medan', gender: 'Wanita' as const, birth: '1996-12-05', phone: '085233445566' },
      { name: 'Fajar Nugroho', address: 'Jl. Diponegoro No. 29, Surakarta', gender: 'Pria' as const, birth: '1993-04-18', phone: '081877889900' },
      { name: 'Indah Permata', address: 'Jl. Cempaka Putih No. 6, Jakarta Pusat', gender: 'Wanita' as const, birth: '1998-01-22', phone: '087799881122' },
      { name: 'Rizky Ramadhan', address: 'Jl. Veteran No. 40, Malang', gender: 'Pria' as const, birth: '1991-10-10', phone: '083811223399' },
      { name: 'Nurul Hidayah', address: 'Jl. Basuki Rahmat No. 55, Palembang', gender: 'Wanita' as const, birth: '1990-06-15', phone: '085644556677' },
      { name: 'Dimas Setiawan', address: 'Jl. Ahmad Yani No. 18, Balikpapan', gender: 'Pria' as const, birth: '1989-08-08', phone: '081344556677' },
      { name: 'Putri Ayu', address: 'Jl. Pahlawan No. 9, Makassar', gender: 'Wanita' as const, birth: '1999-09-19', phone: '082233445511' },
      { name: 'Aris Munandar', address: 'Jl. Urip Sumoharjo No. 70, Solo', gender: 'Pria' as const, birth: '1987-03-24', phone: '081566778899' },
      { name: 'Tri Wahyuni', address: 'Jl. Tebet Raya No. 14, Jakarta Selatan', gender: 'Wanita' as const, birth: '1994-11-28', phone: '089922334455' },
    ];

    for (let i = 0; i < customerCatalog.length; i++) {
      const c = customerCatalog[i];
      const hex = (i + 1).toString().padStart(4, '0');
      this.customers.push({
        id: `c0000000-0000-0000-0000-00000000${hex}`,
        customer_name: c.name,
        customer_address: c.address,
        gender: c.gender,
        birth_date: new Date(c.birth),
        phone: c.phone,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      });
    }

    // Seed 32 orders spread across last 30 days
    const now = new Date();
    for (let i = 1; i <= 32; i++) {
      const daysAgo = Math.floor((32 - i) * (28 / 32));
      const orderDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000 - (i % 8) * 3600 * 1000);
      const dateStr = orderDate.toISOString().slice(0, 10).replace(/-/g, '');
      const seq = String(i).padStart(4, '0');
      const orderNumber = `INV-${dateStr}-${seq}`;

      const customer = this.customers[i % this.customers.length];
      const orderId = this.nextOrderId++;

      const p1 = this.products[(i * 2) % this.products.length];
      const p2 = this.products[(i * 2 + 1) % this.products.length];

      const item1Subtotal = Number(p1.price) * 1;
      const item2Subtotal = Number(p2.price) * 2;
      const totalAmount = item1Subtotal + item2Subtotal;

      this.orders.push({
        id: orderId,
        order_number: orderNumber,
        customer_id: customer.id,
        created_by: adminId,
        order_date: orderDate,
        total_amount: totalAmount,
        created_at: orderDate,
        updated_at: orderDate,
      });

      this.orderItems.push({
        id: this.nextOrderItemId++,
        order_id: orderId,
        product_id: p1.id,
        quantity: 1,
        unit_price: Number(p1.price),
        subtotal: item1Subtotal,
        created_at: orderDate,
        updated_at: orderDate,
      });

      this.orderItems.push({
        id: this.nextOrderItemId++,
        order_id: orderId,
        product_id: p2.id,
        quantity: 2,
        unit_price: Number(p2.price),
        subtotal: item2Subtotal,
        created_at: orderDate,
        updated_at: orderDate,
      });
    }
  }

  // --- User methods ---
  user = {
    findUnique: async ({ where }: { where: { email?: string; id?: string } }) => {
      if (where.email) {
        return this.users.find((u) => u.email.toLowerCase() === where.email?.toLowerCase()) || null;
      }
      if (where.id) {
        return this.users.find((u) => u.id === where.id) || null;
      }
      return null;
    },
    create: async ({ data }: { data: any }) => {
      const user: InMemoryUser = {
        id: 'u-' + Math.random().toString(36).substring(2, 9),
        name: data.name,
        email: data.email,
        password: data.password,
        created_at: new Date(),
        updated_at: new Date(),
      };
      this.users.push(user);
      return user;
    },
  };

  // --- Product methods ---
  product = {
    findMany: async ({ where, skip = 0, take = 100, orderBy }: any = {}) => {
      let filtered = this.products.filter((p) => {
        if (where?.deleted_at === null && p.deleted_at !== null) return false;
        if (where?.stock?.lt !== undefined && !(p.stock < where.stock.lt)) return false;
        if (where?.id?.in && !where.id.in.some((id: any) => BigInt(id) === p.id)) return false;
        if (where?.OR) {
          const match = where.OR.some((cond: any) => {
            if (cond.product_name?.contains) {
              return p.product_name.toLowerCase().includes(cond.product_name.contains.toLowerCase());
            }
            if (cond.product_code?.contains) {
              return p.product_code.toLowerCase().includes(cond.product_code.contains.toLowerCase());
            }
            return false;
          });
          if (!match) return false;
        }
        return true;
      });

      if (orderBy) {
        if (orderBy.product_name) {
          filtered.sort((a, b) => orderBy.product_name === 'asc' ? a.product_name.localeCompare(b.product_name) : b.product_name.localeCompare(a.product_name));
        } else if (orderBy.price) {
          filtered.sort((a, b) => orderBy.price === 'asc' ? a.price - b.price : b.price - a.price);
        } else if (orderBy.stock) {
          filtered.sort((a, b) => orderBy.stock === 'asc' ? a.stock - b.stock : b.stock - a.stock);
        } else {
          filtered.sort((a, b) => Number(b.id - a.id));
        }
      }

      return filtered.slice(skip, skip + take);
    },

    findFirst: async ({ where }: any) => {
      return this.products.find((p) => {
        if (where.id && p.id !== BigInt(where.id)) return false;
        if (where.deleted_at === null && p.deleted_at !== null) return false;
        return true;
      }) || null;
    },

    findUnique: async ({ where }: any) => {
      if (where.product_code) {
        return this.products.find((p) => p.product_code === where.product_code) || null;
      }
      if (where.id) {
        return this.products.find((p) => p.id === BigInt(where.id)) || null;
      }
      return null;
    },

    count: async ({ where }: any = {}) => {
      return (await this.product.findMany({ where, take: 999999 })).length;
    },

    create: async ({ data }: any) => {
      const prod: InMemoryProduct = {
        id: this.nextProductId++,
        product_code: data.product_code,
        product_name: data.product_name,
        stock: data.stock,
        price: data.price,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      };
      this.products.unshift(prod);
      return prod;
    },

    update: async ({ where, data }: any) => {
      const prod = this.products.find((p) => p.id === BigInt(where.id));
      if (!prod) throw new Error('Product not found');

      if (data.stock?.decrement !== undefined) {
        prod.stock -= data.stock.decrement;
      } else if (typeof data.stock === 'number') {
        prod.stock = data.stock;
      }

      if (data.price !== undefined) prod.price = Number(data.price);
      if (data.product_name !== undefined) prod.product_name = data.product_name;
      if (data.product_code !== undefined) prod.product_code = data.product_code;
      if (data.deleted_at !== undefined) prod.deleted_at = data.deleted_at;
      prod.updated_at = new Date();

      return prod;
    },
  };

  // --- Customer methods ---
  customer = {
    findMany: async ({ where, skip = 0, take = 100, orderBy }: any = {}) => {
      let filtered = this.customers.filter((c) => {
        if (where?.deleted_at === null && c.deleted_at !== null) return false;
        if (where?.customer_name?.contains) {
          return c.customer_name.toLowerCase().includes(where.customer_name.contains.toLowerCase());
        }
        return true;
      });

      if (orderBy?.customer_name) {
        filtered.sort((a, b) => a.customer_name.localeCompare(b.customer_name));
      }

      return filtered.slice(skip, skip + take);
    },

    findFirst: async ({ where }: any) => {
      return this.customers.find((c) => {
        if (where.id && c.id !== where.id) return false;
        if (where.deleted_at === null && c.deleted_at !== null) return false;
        return true;
      }) || null;
    },

    count: async ({ where }: any = {}) => {
      return (await this.customer.findMany({ where, take: 999999 })).length;
    },

    create: async ({ data }: any) => {
      const hex = Math.random().toString(36).substring(2, 10);
      const cust: InMemoryCustomer = {
        id: `c-${hex}`,
        customer_name: data.customer_name,
        customer_address: data.customer_address,
        gender: data.gender,
        birth_date: new Date(data.birth_date),
        phone: data.phone || null,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      };
      this.customers.unshift(cust);
      return cust;
    },

    update: async ({ where, data }: any) => {
      const cust = this.customers.find((c) => c.id === where.id);
      if (!cust) throw new Error('Customer not found');

      if (data.customer_name !== undefined) cust.customer_name = data.customer_name;
      if (data.customer_address !== undefined) cust.customer_address = data.customer_address;
      if (data.gender !== undefined) cust.gender = data.gender;
      if (data.birth_date !== undefined) cust.birth_date = new Date(data.birth_date);
      if (data.phone !== undefined) cust.phone = data.phone;
      if (data.deleted_at !== undefined) cust.deleted_at = data.deleted_at;
      cust.updated_at = new Date();

      return cust;
    },
  };

  // --- Order methods ---
  order = {
    findMany: async ({ where, skip = 0, take = 100, orderBy }: any = {}) => {
      let filtered = this.orders.filter((o) => {
        if (where?.customer_id && o.customer_id !== where.customer_id) return false;
        if (where?.order_date?.gte && o.order_date < where.order_date.gte) return false;
        if (where?.order_date?.lte && o.order_date > where.order_date.lte) return false;
        return true;
      });

      filtered.sort((a, b) => b.order_date.getTime() - a.order_date.getTime());

      const sliced = filtered.slice(skip, skip + take);
      return sliced.map((o) => {
        const customer = this.customers.find((c) => c.id === o.customer_id);
        const creator = this.users.find((u) => u.id === o.created_by);
        const items = this.orderItems.filter((it) => it.order_id === o.id);
        return {
          ...o,
          customer: customer ? { id: customer.id, customer_name: customer.customer_name, phone: customer.phone } : null,
          creator: creator ? { id: creator.id, name: creator.name, email: creator.email } : null,
          _count: { order_items: items.length },
        };
      });
    },

    findUnique: async ({ where }: any) => {
      const o = this.orders.find((ord) => ord.id === BigInt(where.id));
      if (!o) return null;
      const customer = this.customers.find((c) => c.id === o.customer_id);
      const creator = this.users.find((u) => u.id === o.created_by);
      const items = this.orderItems
        .filter((it) => it.order_id === o.id)
        .map((it) => {
          const product = this.products.find((p) => p.id === it.product_id);
          return {
            ...it,
            product: product
              ? {
                  id: product.id,
                  product_code: product.product_code,
                  product_name: product.product_name,
                  price: product.price,
                  stock: product.stock,
                }
              : null,
          };
        });

      return {
        ...o,
        customer,
        creator: creator ? { id: creator.id, name: creator.name, email: creator.email } : null,
        order_items: items,
      };
    },

    count: async ({ where }: any = {}) => {
      let filtered = this.orders.filter((o) => {
        if (where?.customer_id && o.customer_id !== where.customer_id) return false;
        if (where?.order_date?.gte && o.order_date < where.order_date.gte) return false;
        if (where?.order_date?.lte && o.order_date > where.order_date.lte) return false;
        return true;
      });
      return filtered.length;
    },

    create: async ({ data }: any) => {
      const orderId = this.nextOrderId++;
      const order: InMemoryOrder = {
        id: orderId,
        order_number: data.order_number,
        customer_id: data.customer_id,
        created_by: data.created_by,
        order_date: data.order_date || new Date(),
        total_amount: data.total_amount,
        created_at: new Date(),
        updated_at: new Date(),
      };
      this.orders.unshift(order);

      const itemsCreated = [];
      if (data.order_items?.create) {
        for (const item of data.order_items.create) {
          const itemRecord: InMemoryOrderItem = {
            id: this.nextOrderItemId++,
            order_id: orderId,
            product_id: BigInt(item.product_id),
            quantity: item.quantity,
            unit_price: item.unit_price,
            subtotal: item.subtotal,
            created_at: new Date(),
            updated_at: new Date(),
          };
          this.orderItems.push(itemRecord);
          itemsCreated.push(itemRecord);
        }
      }

      const customer = this.customers.find((c) => c.id === order.customer_id);
      return {
        ...order,
        customer,
        order_items: itemsCreated,
      };
    },

    aggregate: async () => {
      const totalAmount = this.orders.reduce((sum, o) => sum + o.total_amount, 0);
      return {
        _count: { id: this.orders.length },
        _sum: { total_amount: totalAmount },
      };
    },
  };

  // --- OrderItem methods ---
  orderItem = {
    groupBy: async ({ take = 5 }: any = {}) => {
      const map = new Map<number, { quantity: number; subtotal: number }>();
      for (const item of this.orderItems) {
        const prodId = Number(item.product_id);
        const cur = map.get(prodId) || { quantity: 0, subtotal: 0 };
        cur.quantity += item.quantity;
        cur.subtotal += item.subtotal;
        map.set(prodId, cur);
      }

      const sorted = Array.from(map.entries())
        .map(([product_id, stats]) => ({
          product_id: BigInt(product_id),
          _sum: {
            quantity: stats.quantity,
            subtotal: stats.subtotal,
          },
        }))
        .sort((a, b) => b._sum.quantity - a._sum.quantity);

      return sorted.slice(0, take);
    },
  };

  async $transaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    return await callback(this);
  }

  async $disconnect() {
    // No-op
  }
}
