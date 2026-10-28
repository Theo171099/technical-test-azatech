import { PrismaClient } from '@prisma/client';
import { InMemoryStore } from './in-memory-db';

// Handle BigInt serialization for JSON.stringify
if (!('toJSON' in BigInt.prototype)) {
  (BigInt.prototype as any).toJSON = function () {
    return Number(this);
  };
}

const realPrisma = new PrismaClient();
const inMemory = new InMemoryStore();

let activeDb: any = process.env.USE_IN_MEMORY_DB === 'true' ? inMemory : realPrisma;

export function switchToInMemory() {
  activeDb = inMemory;
  console.log('⚡ Active database: Embedded In-Memory Store (Seeded with 22 products, 16 customers, 32 orders)');
}

export function isUsingInMemory() {
  return activeDb === inMemory;
}

export async function initDatabaseConnection() {
  if (process.env.USE_IN_MEMORY_DB === 'true') {
    switchToInMemory();
    return;
  }

  try {
    // Attempt connecting to real PostgreSQL with a 2-second timeout
    await Promise.race([
      realPrisma.$connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 2000)),
    ]);
    console.log('🐘 Connected to external PostgreSQL database');
  } catch {
    console.log('⚠️ PostgreSQL tidak terdeteksi di localhost:5432.');
    switchToInMemory();
  }
}

export const prisma: any = new Proxy(
  {},
  {
    get(_target, prop) {
      return (activeDb as any)[prop];
    },
  }
);
