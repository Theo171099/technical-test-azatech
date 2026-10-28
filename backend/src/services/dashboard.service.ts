import { prisma } from '../utils/prisma';

export class DashboardService {
  static async getSummary() {
    // 1. Total transactions and total sales
    const ordersAggregate = await prisma.order.aggregate({
      _count: { id: true },
      _sum: { total_amount: true },
    });

    const totalTransactions = ordersAggregate._count.id || 0;
    const totalSales = Number(ordersAggregate._sum.total_amount || 0);

    // 2. Low stock products (stock < 5 and not deleted)
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: { lt: 5 },
        deleted_at: null,
      },
      orderBy: { stock: 'asc' },
    });

    // 3. Top 5 selling products by quantity
    const orderItemsGrouped = await prisma.orderItem.groupBy({
      by: ['product_id'],
      _sum: {
        quantity: true,
        subtotal: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 5,
    });

    const topProductIds = orderItemsGrouped.map((item) => item.product_id);
    const topProductsInfo = await prisma.product.findMany({
      where: { id: { in: topProductIds } },
    });

    const productMap = new Map<number, (typeof topProductsInfo)[0]>();
    topProductsInfo.forEach((p) => productMap.set(Number(p.id), p));

    const topSellingProducts = orderItemsGrouped.map((item) => {
      const prod = productMap.get(Number(item.product_id));
      return {
        product_id: Number(item.product_id),
        product_code: prod?.product_code || 'N/A',
        product_name: prod?.product_name || 'Produk Dihapus',
        total_quantity_sold: item._sum.quantity || 0,
        total_revenue: Number(item._sum.subtotal || 0),
        current_stock: prod?.stock ?? 0,
      };
    });

    // 4. Daily sales (last 14 days) for chart visualization
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    const recentOrders = await prisma.order.findMany({
      where: {
        order_date: { gte: fourteenDaysAgo },
      },
      select: {
        order_date: true,
        total_amount: true,
      },
      orderBy: { order_date: 'asc' },
    });

    const dailySalesMap = new Map<string, { total_orders: number; revenue: number }>();
    recentOrders.forEach((o) => {
      const dateKey = o.order_date.toISOString().slice(0, 10);
      const existing = dailySalesMap.get(dateKey) || { total_orders: 0, revenue: 0 };
      existing.total_orders += 1;
      existing.revenue += Number(o.total_amount);
      dailySalesMap.set(dateKey, existing);
    });

    const dailySales = Array.from(dailySalesMap.entries()).map(([date, data]) => ({
      date,
      total_orders: data.total_orders,
      revenue: data.revenue,
    }));

    return {
      total_transactions: totalTransactions,
      total_sales: totalSales,
      top_selling_products: topSellingProducts,
      low_stock_products: lowStockProducts,
      daily_sales: dailySales,
    };
  }
}
