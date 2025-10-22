import { prisma } from "../lib/prisma";

export async function SalesSummaryService(value: number) {
  const salesData = await prisma.orders.aggregate({
    _sum: { totalAmount: true },
    _count: { id: true },
    where: { status: { not: "CANCELLED" } },
  });

  const totalRevenue = salesData._sum.totalAmount || 0;
  const totalOrders = salesData._count.id || 0;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Data for sales chart (last 30 days)
  const startDate = new Date();

  startDate.setDate(startDate.getDate() - (value ? value : 30));

  const salesOverTime = await prisma.orders.findMany({
    where: {
      createdAt: { gte: startDate },
      status: { not: "CANCELLED" },
    },
    select: { createdAt: true, totalAmount: true },
    orderBy: { createdAt: "asc" },
  });

  const dailySales = salesOverTime.reduce((acc, order) => {
    const date = order.createdAt.toISOString().split("T")[0];
    if (!acc[date]) acc[date] = 0;
    acc[date] += order.totalAmount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(dailySales).map((date) => ({
    name: date,
    Revenue: dailySales[date],
  }));

  return { totalRevenue, totalOrders, averageOrderValue, chartData };
}

export async function ProductInsightsService() {
  const bestSellersData = await prisma.orderItems.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 5,
  });
  const productDetails = await prisma.products.findMany({
    where: { id: { in: bestSellersData.map((p) => p.productId) } },
    select: { id: true, name: true },
  });
  const bestSellers = bestSellersData.map((item) => ({
    name:
      productDetails.find((p) => p.id === item.productId)?.name || "Unknown",
    quantitySold: item._sum.quantity,
  }));

  // Low stock products
  const lowStockProducts = await prisma.products.findMany({
    where: { stock: { lt: 10 } },
    orderBy: { stock: "asc" },
    select: { name: true, stock: true },
    take: 5,
  });

  return { bestSellers, lowStockProducts };
}

export async function CustomerInsightsService() {
  const totalUsers = await prisma.users.count({ where: { role: "CUSTOMER" } });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newUsers = await prisma.users.count({
    where: { role: "CUSTOMER", createdAt: { gte: thirtyDaysAgo } },
  });

  return { totalUsers, newUsers };
}

export async function OperationalSummaryService() {
  // Order status breakdown
  const statusCounts = await prisma.orders.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  // Recent orders
  const recentOrders = await prisma.orders.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      totalAmount: true,
      status: true,
      user: { select: { name: true } },
    },
  });

  const totalOrders = await prisma.orders.aggregate({
    _count: {id: true}
  })

  return { statusCounts, recentOrders, totalOrders };
}

export async function CustomerOriginSummaryService() {
  const subDistrictCount = await prisma.addresses.groupBy({
    by: ["subdistrict"],
    where: {
      isDefault: true, // Only count default addresses
    },
    _count: {
      subdistrict: true,
    },
    orderBy: {
      _count: {
        subdistrict: "desc", // Order by count, highest first
      },
    },
  });

  // Transform the data to a more useful format
  const customerOrigins = subDistrictCount.map((item) => ({
    location: item.subdistrict,
    count: item._count.subdistrict,
  }));

  return customerOrigins;
}
