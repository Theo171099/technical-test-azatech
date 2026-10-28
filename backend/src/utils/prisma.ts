import { PrismaClient } from '@prisma/client';

// Handle BigInt serialization for JSON.stringify
declare global {
  interface BigInt {
    toJSON(): number;
  }
}

BigInt.prototype.toJSON = function () {
  return Number(this);
};

export const prisma = new PrismaClient();
