import { prisma } from "../lib/prisma";

export default async function SalesSummaryService() {
    const salesData = await prisma.orders.aggregate({
      _sum: { totalAmount: true },
      _count: { id: true },
      where: { status: { not: "CANCELLED" } },
    });

    const totalRevenue = salesData._sum.totalAmount || 0;
    const totalOrders = salesData._count.id || 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Data for sales chart (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const salesOverTime = await prisma.orders.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
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