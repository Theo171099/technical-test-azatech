import { Prisma, Gender } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { CreateCustomerInput, UpdateCustomerInput, CustomerQueryInput } from '../schemas/customer.schema';

export class CustomerService {
  static async getCustomers(query: CustomerQueryInput) {
    const page = query.page || 1;
    const perPage = query.per_page || 10;
    const skip = (page - 1) * perPage;

    const where: Prisma.CustomerWhereInput = {
      deleted_at: null,
    };

    if (query.search && query.search.trim()) {
      where.customer_name = {
        contains: query.search.trim(),
        mode: 'insensitive',
      };
    }

    const [total, items] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { customer_name: 'asc' },
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

  static async getCustomerById(id: string) {
    const customer = await prisma.customer.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!customer) {
      const error: any = new Error('Pelanggan tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    return customer;
  }

  static async createCustomer(data: CreateCustomerInput) {
    return await prisma.customer.create({
      data: {
        customer_name: data.customer_name,
        customer_address: data.customer_address,
        gender: data.gender as Gender,
        birth_date: new Date(data.birth_date),
        phone: data.phone || null,
      },
    });
  }

  static async updateCustomer(id: string, data: UpdateCustomerInput) {
    await this.getCustomerById(id);

    return await prisma.customer.update({
      where: { id },
      data: {
        ...(data.customer_name ? { customer_name: data.customer_name } : {}),
        ...(data.customer_address ? { customer_address: data.customer_address } : {}),
        ...(data.gender ? { gender: data.gender as Gender } : {}),
        ...(data.birth_date ? { birth_date: new Date(data.birth_date) } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
      },
    });
  }

  static async deleteCustomer(id: string) {
    await this.getCustomerById(id);

    return await prisma.customer.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
