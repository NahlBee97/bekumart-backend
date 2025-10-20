import { PrismaClient } from "@prisma/client";

// Instantiate Prisma Client
const prisma = new PrismaClient();

// Product IDs to be reviewed
const productIds = [
  "cmgdab7ty0003vnd4w3dfoxec",
  "cmgdab8q10005vnd4f449bd2r",
  "cmgdaba0o0007vnd4kmznqtwo",
  "cmgdabb5e0009vnd4lclveoa0",
  "cmgdabc8d000bvnd4dqwlvivr",
  "cmgdabecz000dvnd4jfb1send",
];

// A predefined list of 10 user IDs
const userIds = [
  "cmgcztcnn0000vn1gim1spua0",
  "cmgel71rn0002vnhkd3926w5k",
  "cmggcgwpk0000vnv46wnxc22q",
  "cmggj00t70000vnh06f6y5j1e",
  "cmghvuepn0000vnd0nluz11nf",
];

// Expanded sample reviews for more variety
const sampleReviews = [
  {
    desc: "Produknya luar biasa! Kualitasnya sangat baik dan pengirimannya cepat. Sangat direkomendasikan.",
    rating: 5,
    likeCount: 25,
  },
  {
    desc: "Cukup bagus untuk harganya. Sesuai dengan deskripsi, meskipun ada sedikit kekurangan.",
    rating: 4,
    likeCount: 8,
  },
  {
    desc: "Tidak seperti yang saya harapkan. Kualitasnya kurang memuaskan dan bahannya terasa murah.",
    rating: 2,
    likeCount: 1,
  },
  {
    desc: "Sangat puas! Akan beli lagi di toko ini. Pelayanannya juga ramah dan responsif.",
    rating: 5,
    likeCount: 32,
  },
  {
    desc: "Pengiriman agak lambat, tapi produknya oke. Berfungsi dengan baik sejauh ini.",
    rating: 3,
    likeCount: 4,
  },
  {
    desc: "Keren banget! Desainnya bagus dan bahannya premium. Terlihat lebih mahal dari harganya.",
    rating: 5,
    likeCount: 18,
  },
  {
    desc: "Biasa saja, tidak ada yang istimewa. Sesuai harga lah, jangan berharap lebih.",
    rating: 3,
    likeCount: 2,
  },
  {
    desc: "Awalnya ragu, tapi ternyata produknya bagus. Packing aman dan rapi. Mantap!",
    rating: 4,
    likeCount: 11,
  },
  {
    desc: "Barang sampai dengan selamat. Belum dicoba, semoga awet dan tidak ada masalah.",
    rating: 4,
    likeCount: 6,
  },
  {
    desc: "Mengecewakan. Produk tidak berfungsi sama sekali. Proses pengembalian dana juga rumit.",
    rating: 1,
    likeCount: 0,
  },
];

async function main() {
  console.log("Cleaning up old reviews...");
  await prisma.reviews.deleteMany({});

  console.log("Start seeding reviews...");

  // For each product, create one review from each predefined user ID
  let totalReviewsCreated = 0;
  for (const productId of productIds) {
    const reviewsData = [];
    for (const userId of userIds) {
      // Pick a random review from the sample data
      const randomReview =
        sampleReviews[Math.floor(Math.random() * sampleReviews.length)];

      reviewsData.push({
        userId: userId,
        productId: productId,
        desc: randomReview.desc,
        rating: randomReview.rating,
        likeCount: randomReview.likeCount,
      });
    }

    // Use createMany for efficiency
    await prisma.reviews.createMany({
      data: reviewsData,
    });
    totalReviewsCreated += reviewsData.length;
    console.log(
      `- Added ${reviewsData.length} reviews for product ${productId}`
    );
  }

  console.log(
    `\nSeeding finished. Created ${totalReviewsCreated} total reviews.`
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
