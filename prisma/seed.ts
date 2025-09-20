import prisma from "../src/lib/prisma.ts";

// Data kategori yang akan di-seed
const categoriesToSeed = [
  { name: "Daging Olahan" },
  { name: "Hasil Laut Olahan" },
  { name: "Bakery & Pastry Beku" },
  { name: "Jajanan & Cemilan" },
  { name: "Sayuran & Buah Beku" },
  { name: "Makanan Siap Saji" },
  { name: "Bumbu & Produk Dasar" },
];

async function main() {
  console.log("🌱 Mulai proses seeding...");

  for (const cat of categoriesToSeed) {
    const category = await prisma.categories.upsert({
      where: { name: cat.name }, // Cari kategori berdasarkan nama yang unik
      update: {}, // Jika sudah ada, jangan lakukan apa-apa
      create: {
        // Jika belum ada, buat data baru
        name: cat.name,
      },
    });
    console.log(`✅ Kategori "${category.name}" berhasil dibuat/ditemukan.`);
  }

  console.log("🎉 Proses seeding selesai.");
}

// Menjalankan fungsi main dan menangani error
main()
  .catch((e) => {
    console.error("❌ Terjadi error saat seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    // Selalu tutup koneksi ke database setelah selesai
    await prisma.$disconnect();
  });
