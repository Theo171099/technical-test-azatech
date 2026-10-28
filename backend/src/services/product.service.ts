import { Prisma } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { CreateProductInput, UpdateProductInput, ProductQueryInput } from '../schemas/product.schema';

export class ProductService {
  static async getProducts(query: ProductQueryInput) {
    const page = query.page || 1;
    const perPage = query.per_page || 10;
    const skip = (page - 1) * perPage;

    const where: Prisma.ProductWhereInput = {
      deleted_at: null,
    };

    if (query.search && query.search.trim()) {
      const term = query.search.trim();
      where.OR = [
        { product_name: { contains: term, mode: 'insensitive' } },
        { product_code: { contains: term, mode: 'insensitive' } },
      ];
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { id: 'desc' };
    if (query.sort) {
      switch (query.sort) {
        case 'name_asc':
          orderBy = { product_name: 'asc' };
          break;
        case 'name_desc':
          orderBy = { product_name: 'desc' };
          break;
        case 'price_asc':
          orderBy = { price: 'asc' };
          break;
        case 'price_desc':
          orderBy = { price: 'desc' };
          break;
        case 'stock_asc':
          orderBy = { stock: 'asc' };
          break;
        case 'stock_desc':
          orderBy = { stock: 'desc' };
          break;
      }
    }

    const [total, items] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: perPage,
        orderBy,
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

  static async getProductById(id: number | bigint) {
    const product = await prisma.product.findFirst({
      where: {
        id: BigInt(id),
        deleted_at: null,
      },
    });

    if (!product) {
      const error: any = new Error('Produk tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    return product;
  }

  static async createProduct(data: CreateProductInput) {
    const existing = await prisma.product.findUnique({
      where: { product_code: data.product_code },
    });

    if (existing) {
      const error: any = new Error('Kode produk sudah terdaftar');
      error.statusCode = 409;
      error.errors = { product_code: ['Kode produk sudah digunakan oleh produk lain'] };
      throw error;
    }

    return await prisma.product.create({
      data: {
        product_code: data.product_code,
        product_name: data.product_name,
        stock: data.stock,
        price: data.price,
      },
    });
  }

  static async updateProduct(id: number | bigint, data: UpdateProductInput) {
    const product = await this.getProductById(id);

    if (data.product_code && data.product_code !== product.product_code) {
      const duplicate = await prisma.product.findUnique({
        where: { product_code: data.product_code },
      });
      if (duplicate && duplicate.id !== product.id) {
        const error: any = new Error('Kode produk sudah terdaftar');
        error.statusCode = 409;
        error.errors = { product_code: ['Kode produk sudah digunakan oleh produk lain'] };
        throw error;
      }
    }

    return await prisma.product.update({
      where: { id: BigInt(id) },
      data,
    });
  }

  static async deleteProduct(id: number | bigint) {
    await this.getProductById(id);

    // Soft delete to keep historical order data intact
    return await prisma.product.update({
      where: { id: BigInt(id) },
      data: { deleted_at: new Date() },
    });
  }
}
