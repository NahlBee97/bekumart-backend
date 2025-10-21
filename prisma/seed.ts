// prisma/seed.ts

import { PrismaClient, UserRoles } from "@prisma/client";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// --- CONFIGURATION ---
const USER_COUNT = 100;
const ORDER_COUNT = 100;
const REVIEW_COUNT = 100;

// --- STATIC DATA (Indonesian) ---
const categoryData = [
  {
    name: "Nugget & Sosis",
    imageUrl: "https://picsum.photos/seed/nugget/400/300",
  },
  {
    name: "Bakso & Daging Olahan",
    imageUrl: "https://picsum.photos/seed/bakso/400/300",
  },
  {
    name: "Kentang Beku",
    imageUrl: "https://picsum.photos/seed/kentang/400/300",
  },
  {
    name: "Sayuran Beku",
    imageUrl: "https://picsum.photos/seed/sayuran/400/300",
  },
  {
    name: "Makanan Siap Saji",
    imageUrl: "https://picsum.photos/seed/siapsaji/400/300",
  },
  {
    name: "Dimsum & Pangsit",
    imageUrl: "https://picsum.photos/seed/dimsum/400/300",
  },
  {
    name: "Roti & Pastry Beku",
    imageUrl: "https://picsum.photos/seed/roti/400/300",
  },
  {
    name: "Es Krim & Dessert",
    imageUrl: "https://picsum.photos/seed/eskrim/400/300",
  },
  {
    name: "Daging Ayam Beku",
    imageUrl: "https://picsum.photos/seed/ayam/400/300",
  },
  {
    name: "Ikan & Seafood Beku",
    imageUrl: "https://picsum.photos/seed/ikan/400/300",
  },
];
const productData = [
  // Nugget & Sosis
  {
    name: "Fiesta Chicken Nugget",
    description: "Nugget ayam renyah, favorit keluarga.",
    rating: 4,
    price: 55000,
    stock: 150,
    weightInKg: 0.5,
    categoryName: "Nugget & Sosis",
  },
  {
    name: "So Good Sosis Ayam",
    description: "Sosis ayam lezat, cocok untuk dibakar atau digoreng.",
    rating: 3,
    price: 48000,
    stock: 120,
    weightInKg: 0.4,
    categoryName: "Nugget & Sosis",
  },
  // Bakso & Daging Olahan
  {
    name: "Bernardi Bakso Sapi",
    description: "Bakso sapi asli dengan rasa yang mantap.",
    price: 75000,
    stock: 80,
    rating: 2,
    weightInKg: 0.5,
    categoryName: "Bakso & Daging Olahan",
  },
  {
    name: "Villa Smoked Beef",
    description: "Daging sapi asap premium untuk isian roti atau pizza.",
    price: 62000,
    stock: 90,
    rating: 4,
    weightInKg: 0.25,
    categoryName: "Bakso & Daging Olahan",
  },
  // Kentang Beku
  {
    name: "Belfoods Favorite Shoestring Fries",
    description:
      "Kentang goreng beku potongan lurus, renyah di luar lembut di dalam.",
    rating: 5,
    price: 32000,
    stock: 200,
    weightInKg: 1.0,
    categoryName: "Kentang Beku",
  },
  {
    name: "Golden Farm Crinkle Cut Fries",
    description: "Kentang goreng beku potongan bergelombang.",
    rating: 1,
    price: 35000,
    stock: 180,
    weightInKg: 1.0,
    categoryName: "Kentang Beku",
  },
  // Sayuran Beku
  {
    name: "Golden Farm Mixed Vegetables",
    description:
      "Campuran sayuran beku (wortel, buncis, jagung, kacang polong).",
    rating: 3,
    price: 25000,
    stock: 100,
    weightInKg: 0.5,
    categoryName: "Sayuran Beku",
  },
  // Makanan Siap Saji
  {
    name: "Kanzler Crispy Chicken Burger",
    description: "Patty burger ayam renyah siap goreng.",
    price: 45000,
    stock: 70,
    rating: 2,
    weightInKg: 0.45,
    categoryName: "Makanan Siap Saji",
  },
  {
    name: "So Good Chicken Katsu",
    description: "Potongan dada ayam fillet dengan balutan tepung roti.",
    price: 58000,
    stock: 65,
    rating: 4,
    weightInKg: 0.4,
    categoryName: "Makanan Siap Saji",
  },
  // Dimsum & Pangsit
  {
    name: "Sumber Selera Siomay Ayam",
    description: "Siomay ayam beku yang lezat, tinggal kukus.",
    rating: 5,
    price: 38000,
    stock: 110,
    weightInKg: 0.3,
    categoryName: "Dimsum & Pangsit",
  },
  {
    name: "Edo Gyoza",
    description: "Pangsit Jepang dengan isian ayam dan sayuran.",
    price: 42000,
    stock: 95,
    rating: 5,
    weightInKg: 0.25,
    categoryName: "Dimsum & Pangsit",
  },
  // Roti & Pastry Beku
  {
    name: "Edo Puff Pastry Sheet",
    description: "Lembaran puff pastry serbaguna untuk kreasi kue.",
    rating: 3,
    price: 30000,
    stock: 130,
    weightInKg: 0.75,
    categoryName: "Roti & Pastry Beku",
  },
  {
    name: "My Roti Roti Maryam",
    description: "Roti maryam/canai beku, lembut dan gurih.",
    rating: 5,
    price: 28000,
    stock: 140,
    weightInKg: 0.5,
    categoryName: "Roti & Pastry Beku",
  },
  // Es Krim & Dessert
  {
    name: "Walls Viennetta",
    description: "Es krim legendaris dengan lapisan coklat renyah.",
    price: 65000,
    stock: 50,
    rating: 3,
    weightInKg: 0.8,
    categoryName: "Es Krim & Dessert",
  },
  {
    name: "Campina Hula Hula",
    description: "Es krim stik rasa tradisional kacang hijau.",
    rating: 4,
    price: 25000,
    stock: 250,
    weightInKg: 0.1,
    categoryName: "Es Krim & Dessert",
  },
  // Daging Ayam Beku
  {
    name: "So Good Paha Ayam Utuh",
    description: "Paha ayam utuh beku, higienis dan praktis.",
    price: 49000,
    stock: 85,
    rating: 5,
    weightInKg: 1.0,
    categoryName: "Daging Ayam Beku",
  },
  {
    name: "Fiesta Karage",
    description: "Potongan paha ayam tanpa tulang berbumbu ala Jepang.",
    price: 61000,
    stock: 75,
    rating: 1,
    weightInKg: 0.5,
    categoryName: "Daging Ayam Beku",
  },
  // Ikan & Seafood Beku
  {
    name: "Sakana Dori Fillet",
    description: "Fillet ikan dori beku tanpa kulit dan tulang.",
    price: 52000,
    stock: 90,
    rating: 2,
    weightInKg: 0.5,
    categoryName: "Ikan & Seafood Beku",
  },
  {
    name: "Fiesta Shrimp Shumai",
    description: "Siomay udang beku yang lezat dan nikmat.",
    price: 47000,
    stock: 105,
    rating: 3,
    weightInKg: 0.18,
    categoryName: "Ikan & Seafood Beku",
  },
  {
    name: "Cedea Fish Roll",
    description: "Olahan ikan berbentuk rol, cocok untuk sup atau digoreng.",
    price: 33000,
    stock: 160,
    rating: 5,
    weightInKg: 0.5,
    categoryName: "Ikan & Seafood Beku",
  },
];

const subDistricts = [
  "BONTOKAPE",
  "DARUSSALAM",
  "KANANGA",
  "KARA",
  "LEU",
  "NGGEMBE",
  "RADA",
  "RASABAU",
  "RATO",
  "SANOLO",
  "SONDOSIA",
  "TAMBE",
  "TIMU",
  "TUMPU",
];

const getRandomItem = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

async function cleanupDatabase() {
  console.log("🧹 Clearing existing data...");
  await prisma.$transaction([
    prisma.reviewLikes.deleteMany(),
    prisma.reviewPhotos.deleteMany(),
    prisma.reviews.deleteMany(),
    prisma.orderItems.deleteMany(),
    prisma.cartItems.deleteMany(),
    prisma.productPhotos.deleteMany(),
    prisma.tokens.deleteMany(),
    prisma.orders.deleteMany(),
    prisma.addresses.deleteMany(),
    prisma.carts.deleteMany(),
    prisma.products.deleteMany(),
    prisma.categories.deleteMany(),
    prisma.users.deleteMany(),
  ]);
  console.log("🗑️ Database cleared.");
}

async function main() {
  await cleanupDatabase();
  console.log(`🌱 Seeding database...`);

  // --- 1. Create Categories from static data ---
  await prisma.categories.createMany({
    data: categoryData,
  });
  const createdCategories = await prisma.categories.findMany();
  const categoryMap = new Map(createdCategories.map((c) => [c.name, c.id]));
  console.log(`- Created ${createdCategories.length} categories.`);

  // --- 2. Create Users (dynamically) ---
  const users = [];
  const hashedPassword = await bcrypt.hash("Password123!", 10);
  for (let i = 0; i < USER_COUNT; i++) {
    const user = await prisma.users.create({
      data: {
        email: faker.internet.email().toLowerCase(),
        name: faker.person.fullName(),
        password: hashedPassword,
        isVerified: true,
        imageUrl: faker.image.avatar(),
        role: i === 0 ? UserRoles.ADMIN : UserRoles.CUSTOMER,
      },
    });
    users.push(user);
  }
  console.log(`- Created ${users.length} users.`);

  // --- 3. Create Products from static data ---
  const products = [];
  for (const p of productData) {
    const categoryId = categoryMap.get(p.categoryName);
    if (!categoryId) {
      console.warn(
        `Category "${p.categoryName}" not found for product "${p.name}". Skipping.`
      );
      continue;
    }

    const product = await prisma.products.create({
      data: {
        name: p.name,
        description: p.description,
        price: p.price,
        rating: p.rating,
        stock: p.stock,
        weightInKg: p.weightInKg,
        categoryId: categoryId,
        productPhotos: {
          // Create 2 static photos for each product
          create: [
            {
              // Use product name and index to create a unique, static URL
              imageUrl: `https://picsum.photos/seed/${encodeURIComponent(
                p.name
              )}1/400/300`,
              isDefault: true,
            },
            {
              imageUrl: `https://picsum.photos/seed/${encodeURIComponent(
                p.name
              )}2/400/300`,
              isDefault: false,
            },
          ],
        },
      },
    });
    products.push(product);
  }
  console.log(`- Created ${products.length} products with photos.`);

  // --- 4. Create Addresses for Users (dynamically) ---
  const addresses = [];
  for (const user of users) {
    for (let i = 0; i < faker.number.int({ min: 1, max: 2 }); i++) {
      const address = await prisma.addresses.create({
        data: {
          receiver: user.name,
          phone: faker.phone.number(),
          street: faker.location.streetAddress(),
          subdistrict: getRandomItem(subDistricts),
          district: "BOLO",
          city: "BIMA",
          province: "NUSA TENGGARA BARAT (NTB)",
          postalCode: faker.location.zipCode("#####"),
          isDefault: i === 0,
          userId: user.id,
        },
      });
      addresses.push(address);
    }
  }
  console.log(`- Created ${addresses.length} addresses.`);

  // --- 5. Create Carts and Cart Items (dynamically) ---
  for (const user of users) {
    const cart = await prisma.carts.create({ data: { userId: user.id } });
    const itemsToAdd = faker.number.int({ min: 1, max: 5 });
    const productSample = [...products]
      .sort(() => 0.5 - Math.random())
      .slice(0, itemsToAdd);
    for (const product of productSample) {
      await prisma.cartItems.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          quantity: faker.number.int({ min: 1, max: 3 }),
        },
      });
    }
  }
  console.log(`- Created carts and cart items for all users.`);

  // --- 6. Create Orders and Order Items (dynamically) ---
  for (let i = 0; i < ORDER_COUNT; i++) {
    const user = getRandomItem(users);
    const userAddresses = await prisma.addresses.findMany({
      where: { userId: user.id },
    });
    if (userAddresses.length === 0) continue;

    let totalAmount = 0,
      totalWeight = 0;
    const itemsInOrder = faker.number.int({ min: 1, max: 4 });
    const productSample = [...products]
      .sort(() => 0.5 - Math.random())
      .slice(0, itemsInOrder);
    const orderItemsData = productSample.map((product) => {
      const quantity = faker.number.int({ min: 1, max: 3 });
      totalAmount += product.price * quantity;
      totalWeight += product.weightInKg * quantity;
      return {
        productId: product.id,
        quantity: quantity,
        priceAtPurchase: product.price,
      };
    });

    await prisma.orders.create({
      data: {
        userId: user.id,
        addressId: getRandomItem(userAddresses).id,
        totalAmount,
        totalWeight,
        status: getRandomItem([
          "PENDING",
          "PROCESSING",
          "COMPLETED",
          "CANCELLED",
        ]),
        fulfillmentType: getRandomItem(["DELIVERY", "PICKUP"]),
        paymentMethod: getRandomItem(["ONLINE", "INSTORE"]),
        items: { create: orderItemsData },
      },
    });
  }
  console.log(`- Created ${ORDER_COUNT} orders with order items.`);

  // --- 7. Create Reviews with Likes (dynamically) ---
  const usedReviewPairs = new Set<string>();
  for (let i = 0; i < REVIEW_COUNT; i++) {
    const user = getRandomItem(users);
    const product = getRandomItem(products);
    const pairKey = `${user.id}-${product.id}`;
    if (usedReviewPairs.has(pairKey)) continue;

    const review = await prisma.reviews.create({
      data: {
        userId: user.id,
        productId: product.id,
        rating: faker.number.int({ min: 3, max: 5 }),
        desc: faker.lorem.paragraph(),
      },
    });
    usedReviewPairs.add(pairKey);

    const likers = [...users]
      .sort(() => 0.5 - Math.random())
      .slice(0, faker.number.int({ min: 0, max: 15 }));
    for (const liker of likers) {
      if (liker.id === user.id) continue;
      await prisma.reviewLikes.create({
        data: { userId: liker.id, reviewId: review.id },
      });
    }
  }
  console.log(`- Created reviews with likes.`);
  console.log("✅ Seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error("❌ An error occurred during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
