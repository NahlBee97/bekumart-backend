// prisma/clearDatabase.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Starting database clearing process...');

  // The order of deletion is important to avoid foreign key constraint errors.
  // We delete from "child" tables before "parent" tables.
  await prisma.$transaction([
    prisma.reviewLikes.deleteMany({}),
    // prisma.reviewPhotos.deleteMany({}),
    // prisma.reviews.deleteMany({}),
    // prisma.orderItems.deleteMany({}),
    // prisma.cartItems.deleteMany({}),
    // prisma.productPhotos.deleteMany({}),
    // prisma.tokens.deleteMany({}),
    // prisma.orders.deleteMany({}),
    // prisma.addresses.deleteMany({}),
    // prisma.carts.deleteMany({}),
    // prisma.products.deleteMany({}),
    // prisma.categories.deleteMany({}),
    // prisma.users.deleteMany({}),
  ]);

  console.log('✅ Database has been successfully cleared.');
}

main()
  .catch((e) => {
    console.error('❌ An error occurred while clearing the database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });