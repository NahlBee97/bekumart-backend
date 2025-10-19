import { PrismaClient } from "@prisma/client";

// Instantiate Prisma Client
const prisma = new PrismaClient();

// The user ID you provided
const userId = "cmgel71rn0002vnhkd3926w5k";

// Product IDs to be reviewed
const productIds = [
  "cmgdab7ty0003vnd4w3dfoxec",
  "cmgdab8q10005vnd4f449bd2r",
  "cmgdaba0o0007vnd4kmznqtwo",
  "cmgdabb5e0009vnd4lclveoa0",
  "cmgdabc8d000bvnd4dqwlvivr",
  "cmgdabecz000dvnd4jfb1send",
];

// Some sample reviews to make the data feel real
const sampleReviews = [
  {
    desc:
      "Produknya luar biasa! Kualitasnya sangat baik dan pengirimannya cepat. Sangat direkomendasikan.",
    rating: 5,
    likeCount: 15,
  },
  {
    desc:
      "Cukup bagus untuk harganya. Sesuai dengan deskripsi, meskipun ada sedikit kekurangan.",
    rating: 4,
    likeCount: 8,
  },
  {
    desc: "Tidak seperti yang saya harapkan. Kualitasnya kurang memuaskan.",
    rating: 2,
    likeCount: 1,
  },
  {
    desc: "Sangat puas! Akan beli lagi di toko ini. Pelayanannya juga ramah.",
    rating: 5,
    likeCount: 22,
  },
  {
    desc:
      "Pengiriman agak lambat, tapi produknya oke. Berfungsi dengan baik.",
    rating: 3,
    likeCount: 4,
  },
  {
    desc: "Keren banget! Desainnya bagus dan bahannya premium.",
    rating: 5,
    likeCount: 18,
  },
  {
    desc: "Biasa saja, tidak ada yang istimewa. Sesuai harga lah.",
    rating: 3,
    likeCount: 2,
  },
];

async function main() {
  console.log("Start seeding reviews...");

  for (const productId of productIds) {
    // Pick a random review from the sample data
    const randomReview =
      sampleReviews[Math.floor(Math.random() * sampleReviews.length)];

    // Use `upsert` to create a review if it doesn't exist, or update it if it does.
    // This prevents errors if the script is run multiple times for the same user and product.
    await prisma.reviews.create({
      data: {
        // If no review exists for this user and product, create a new one.
        userId: userId,
        productId: productId,
        desc: randomReview.desc,
        rating: randomReview.rating,
        likeCount: randomReview.likeCount,
      },
    });
  }

  console.log(
    `Seeding finished. Upserted ${productIds.length} reviews for user ${userId}.`
  );
}

// Execute the main function and handle disconnection
main()
  .catch((e) => {
    console.error("An error occurred during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
