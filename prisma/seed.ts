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
    review:
      "Produknya luar biasa! Kualitasnya sangat baik dan pengirimannya cepat. Sangat direkomendasikan.",
    rating: 5,
    likes: 15,
  },
  {
    review:
      "Cukup bagus untuk harganya. Sesuai dengan deskripsi, meskipun ada sedikit kekurangan.",
    rating: 4,
    likes: 8,
  },
  {
    review: "Tidak seperti yang saya harapkan. Kualitasnya kurang memuaskan.",
    rating: 2,
    likes: 1,
  },
  {
    review: "Sangat puas! Akan beli lagi di toko ini. Pelayanannya juga ramah.",
    rating: 5,
    likes: 22,
  },
  {
    review:
      "Pengiriman agak lambat, tapi produknya oke. Berfungsi dengan baik.",
    rating: 3,
    likes: 4,
  },
  {
    review: "Keren banget! Desainnya bagus dan bahannya premium.",
    rating: 5,
    likes: 18,
  },
  {
    review: "Biasa saja, tidak ada yang istimewa. Sesuai harga lah.",
    rating: 3,
    likes: 2,
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
        review: randomReview.review,
        rating: randomReview.rating,
        likes: randomReview.likes,
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
