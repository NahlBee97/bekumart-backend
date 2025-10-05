import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Struktur data produk, dikelompokkan berdasarkan nama kategori
const productsData = {
  "Daging Olahan": [
    {
      name: "Sosis Sapi Premium 500g",
      description:
        "Sosis sapi berkualitas tinggi dengan bumbu khas, cocok untuk dibakar atau digoreng.",
      price: 55000,
      // imageUrl: "https://placehold.co/600x400/EAD5A0/53422D?text=Sosis+Sapi",
      stock: 150,
      rating: 4.8,
      sale: 1000,
      weightInKg: 0.5,
    },
    {
      name: "Nugget Ayam Crispy 1kg",
      description:
        "Nugget ayam renyah di luar dan lembut di dalam, favorit keluarga.",
      price: 78000,
      // imageUrl: "https://placehold.co/600x400/F4C430/000000?text=Nugget+Ayam",
      stock: 200,
      rating: 4.2,
      sale: 2000,
      weightInKg: 1.0,
    },
  ],
  "Hasil Laut Olahan": [
    {
      name: "Bakso Ikan Tenggiri Super",
      description:
        "Bakso ikan kenyal yang terbuat dari daging ikan tenggiri asli pilihan.",
      price: 42000,
      // imageUrl: "https://placehold.co/600x400/F0F8FF/4682B4?text=Bakso+Ikan",
      stock: 120,
      rating: 4.6,
      sale: 500,
      weightInKg: 0.5,
    },
    {
      name: "Tempura Udang Lapis Roti",
      description:
        "Udang segar dibalut dengan adonan tempura dan tepung roti yang renyah.",
      price: 65000,
      // imageUrl: "https://placehold.co/600x400/FFDAB9/A0522D?text=Tempura+Udang",
      stock: 80,
      rating: 5,
      sale: 2000,
      weightInKg: 0.4,
    },
  ],
  "Bakery & Pastry Beku": [
    {
      name: "Roti Maryam Original (Isi 5)",
      description:
        "Roti pipih berlapis yang lembut dan gurih, siap dipanaskan di wajan.",
      price: 25000,
      // imageUrl: "https://placehold.co/600x400/F5DEB3/8B4513?text=Roti+Maryam",
      stock: 300,
      rating: 4.4,
      sale: 3000,
      weightInKg: 0.6,
    },
    {
      name: "Donat Kentang Beku (Isi 10)",
      description:
        "Donat kentang empuk yang hanya perlu digoreng dan diberi topping sesuka hati.",
      price: 35000,
      // imageUrl: "https://placehold.co/600x400/D2B48C/654321?text=Donat+Beku",
      stock: 250,
      rating: 4.2,
      sale: 400,
      weightInKg: 0.8,
    },
  ],
  "Jajanan & Cemilan": [
    {
      name: "Kentang Goreng Shoestring 1kg",
      description:
        "Potongan kentang tipis dan panjang, renyah sempurna saat digoreng.",
      price: 38000,
      // imageUrl:
      //   "https://placehold.co/600x400/FFD700/000000?text=Kentang+Goreng",
      stock: 500,
      rating: 4.9,
      sale: 200,
      weightInKg: 1.0,
    },
    {
      name: "Cireng Salju Bumbu Rujak",
      description:
        "Cireng renyah di luar dan lembut di dalam, disajikan dengan bumbu rujak pedas manis.",
      price: 22000,
      // imageUrl: "https://placehold.co/600x400/FFFFFF/000000?text=Cireng",
      stock: 180,
      rating: 4.8,
      sale: 300,
      weightInKg: 0.5,
    },
  ],
  "Sayuran & Buah Beku": [
    {
      name: "Sayuran Campur (Wortel, Buncis, Jagung) 500g",
      description:
        "Campuran sayuran segar beku, praktis untuk sup dan tumisan.",
      price: 20000,
      // imageUrl: "https://placehold.co/600x400/90EE90/228B22?text=Sayur+Campur",
      stock: 400,
      rating: 4.6,
      sale: 1500,
      weightInKg: 0.5,
    },
    {
      name: "Stroberi Beku Premium 1kg",
      description:
        "Buah stroberi utuh berkualitas yang dibekukan, cocok untuk jus dan smoothies.",
      price: 95000,
      // imageUrl: "https://placehold.co/600x400/DC143C/FFFFFF?text=Stroberi",
      stock: 100,
      rating: 5,
      sale: 2500,
      weightInKg: 1.0,
    },
  ],
  "Makanan Siap Saji": [
    {
      name: "Rendang Daging Sapi Siap Saji",
      description:
        "Rendang daging sapi dengan bumbu otentik yang meresap, hanya perlu dihangatkan.",
      price: 85000,
      // imageUrl: "https://placehold.co/600x400/8B4513/FFFFFF?text=Rendang",
      stock: 70,
      rating: 4.8,
      sale: 700,
      weightInKg: 0.3,
    },
    {
      name: "Chicken Katsu Original",
      description: "Fillet ayam renyah ala Jepang, praktis tinggal goreng.",
      price: 48000,
      // imageUrl: "https://placehold.co/600x400/F4A460/000000?text=Chicken+Katsu",
      stock: 90,
      rating: 4.5,
      sale: 400,
      weightInKg: 0.5,
    },
  ],
  "Bumbu & Produk Dasar": [
    {
      name: "Bumbu Dasar Putih 250g",
      description:
        "Bumbu serbaguna dari bawang merah dan putih, untuk aneka tumisan dan masakan berkuah.",
      price: 18000,
      // imageUrl: "https://placehold.co/600x400/FAFAD2/000000?text=Bumbu+Putih",
      stock: 130,
      rating: 5,
      sale: 800,
      weightInKg: 0.25,
    },
    {
      name: "Kaldu Ayam Kampung Beku 500ml",
      description: "Kaldu ayam asli tanpa MSG, kaya rasa dan menyehatkan.",
      price: 30000,
      // imageUrl: "https://placehold.co/600x400/FFFACD/CD853F?text=Kaldu+Ayam",
      stock: 110,
      rating: 4.3,
      sale: 400,
      weightInKg: 0.5,
    },
  ],
};

async function main() {
  console.log("🌱 Mulai proses seeding produk...");

  // 1. Ambil semua kategori dari database
  const categories = await prisma.categories.findMany();
  if (categories.length === 0) {
    console.error(
      "❌ Error: Tidak ada kategori di database. Jalankan seed untuk kategori terlebih dahulu."
    );
    return;
  }

  // 2. Loop setiap kategori dan buat produk yang sesuai
  for (const category of categories) {
    const productsForCategory =
      productsData[category.name as keyof typeof productsData];

    if (!productsForCategory) {
      console.warn(
        `⚠️ Peringatan: Tidak ada data produk yang didefinisikan untuk kategori "${category.name}".`
      );
      continue;
    }

    console.log(`📦 Seeding produk untuk kategori: "${category.name}"...`);

    for (const product of productsForCategory) {
      await prisma.products.upsert({
        where: { name: product.name }, // Gunakan 'name' sebagai unique identifier
        update: {}, // Jika sudah ada, jangan lakukan apa-apa
        create: {
          ...product,
          categoryId: category.id, // Hubungkan dengan ID kategori yang benar
        },
      });
      console.log(`  ✅ Produk "${product.name}" berhasil dibuat/ditemukan.`);
    }
  }

  // console.log("🎉 Proses seeding produk selesai.");
  // await prisma.orderItems.deleteMany();
  // await prisma.orders.deleteMany();
  // await prisma.addresses.deleteMany();
  // await prisma.cartItems.deleteMany();
  // await prisma.carts.deleteMany();
  // await prisma.users.deleteMany();
  // await prisma.products.deleteMany();
}

// Menjalankan fungsi main dan menangani error
main()
  .catch((e) => {
    console.error("❌ Terjadi error saat seeding produk:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
