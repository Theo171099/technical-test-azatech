import { Prisma } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { CreateOrderInput, OrderQueryInput } from '../schemas/order.schema';

export class OrderService {
  static async getOrders(query: OrderQueryInput) {
    const page = query.page || 1;
    const perPage = query.per_page || 10;
    const skip = (page - 1) * perPage;

    const where: Prisma.OrderWhereInput = {};

    if (query.customer_id) {
      where.customer_id = query.customer_id;
    }

    if (query.from || query.to) {
      where.order_date = {};
      if (query.from) {
        where.order_date.gte = new Date(`${query.from}T00:00:00.000Z`);
      }
      if (query.to) {
        where.order_date.lte = new Date(`${query.to}T23:59:59.999Z`);
      }
    }

    const [total, items] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { order_date: 'desc' },
        include: {
          customer: {
            select: {
              id: true,
              customer_name: true,
              phone: true,
            },
          },
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              order_items: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / perPage) || 1;

    return {
      items,
      meta: {
        page,
        per_page: perPage,
        total,
        total_pages: totalPages,
      },
    };
  }

  static async getOrderById(id: number | bigint) {
    const order = await prisma.order.findUnique({
      where: { id: BigInt(id) },
      include: {
        customer: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        order_items: {
          include: {
            product: {
              select: {
                id: true,
                product_code: true,
                product_name: true,
                price: true,
                stock: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      const error: any = new Error('Order tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    return order;
  }

  static async createOrder(userId: string, input: CreateOrderInput) {
    return await prisma.$transaction(async (tx) => {
      // 1. Verify customer exists
      const customer = await tx.customer.findFirst({
        where: { id: input.customer_id, deleted_at: null },
      });

      if (!customer) {
        const error: any = new Error('Pelanggan tidak ditemukan atau sudah dinonaktifkan');
        error.statusCode = 404;
        throw error;
      }

      // 2. Aggregate quantities if same product was passed multiple times
      const aggregatedItems = new Map<number, number>();
      input.items.forEach((item) => {
        const current = aggregatedItems.get(item.product_id) || 0;
        aggregatedItems.set(item.product_id, current + item.quantity);
      });

      // 3. Fetch products to validate stock and prices
      const productIds = Array.from(aggregatedItems.keys()).map((id) => BigInt(id));
      const products = await tx.product.findMany({
        where: {
          id: { in: productIds },
          deleted_at: null,
        },
      });

      const productMap = new Map<number, (typeof products)[0]>();
      products.forEach((p) => productMap.set(Number(p.id), p));

      // 4. Validate stock for each item
      const errors: Record<string, string[]> = {};
      input.items.forEach((item, index) => {
        const product = productMap.get(item.product_id);
        if (!product) {
          errors[`items.${index}.product_id`] = [
            `Produk dengan ID ${item.product_id} tidak ditemukan atau sudah dinonaktifkan`,
          ];
          return;
        }

        const totalNeeded = aggregatedItems.get(item.product_id) || item.quantity;
        if (product.stock < totalNeeded) {
          errors[`items.${index}.quantity`] = [
            `Stok ${product.product_name} tersisa ${product.stock}, diminta ${totalNeeded}`,
          ];
        }
      });

      if (Object.keys(errors).length > 0) {
        const error: any = new Error('Stok tidak mencukupi');
        error.statusCode = 422;
        error.errors = errors;
        throw error;
      }

      // 5. Generate unique order number (format: INV-YYYYMMDD-XXXX)
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const date = String(now.getDate()).padStart(2, '0');
      const dateStr = `${year}${month}${date}`;

      const startOfDay = new Date(year, now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const endOfDay = new Date(year, now.getMonth(), now.getDate(), 23, 59, 59, 999);

      const countToday = await tx.order.count({
        where: {
          order_date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      const sequence = String(countToday + 1).padStart(4, '0');
      const orderNumber = `INV-${dateStr}-${sequence}`;

      // 6. Calculate subtotal and total amount strictly on server
      let totalAmount = 0;
      const orderItemsData = input.items.map((item) => {
        const product = productMap.get(item.product_id)!;
        const unitPrice = Number(product.price);
        const subtotal = unitPrice * item.quantity;
        totalAmount += subtotal;

        return {
          product_id: product.id,
          quantity: item.quantity,
          unit_price: unitPrice,
          subtotal,
        };
      });

      // 7. Create Order & OrderItems
      const createdOrder = await tx.order.create({
        data: {
          order_number: orderNumber,
          customer_id: customer.id,
          created_by: userId,
          order_date: now,
          total_amount: totalAmount,
          order_items: {
            create: orderItemsData,
          },
        },
        include: {
          customer: true,
          order_items: {
            include: {
              product: true,
            },
          },
        },
      });

      // 8. Decrement stock atomically
      for (const [productId, quantity] of aggregatedItems.entries()) {
        await tx.product.update({
          where: { id: BigInt(productId) },
          data: {
            stock: {
              decrement: quantity,
            },
          },
        });
      }

      return createdOrder;
    });
  }
}
