import {
  CustomerInsightsService,
  CustomerOriginSummaryService,
  OperationalSummaryService,
  ProductInsightsService,
  SalesSummaryService,
} from "../../services/dashboardServices";
import { mockedPrisma } from "../mockPrisma";

describe("SalesSummaryService", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should return sales summary data with default 30 days", async () => {
    const mockAggregateData = {
      _sum: { totalAmount: 1000 },
      _count: { id: 10 },
    };

    const mockSalesData = [
      { createdAt: new Date("2025-10-28"), totalAmount: 500 },
      { createdAt: new Date("2025-10-29"), totalAmount: 500 },
    ];

    mockedPrisma.orders.aggregate.mockResolvedValue(mockAggregateData as any);
    mockedPrisma.orders.findMany.mockResolvedValue(mockSalesData as any);

    const result = await SalesSummaryService(30);

    expect(mockedPrisma.orders.aggregate).toHaveBeenCalledWith({
      _sum: { totalAmount: true },
      _count: { id: true },
      where: { status: { not: "CANCELLED" } },
    });

    expect(mockedPrisma.orders.findMany).toHaveBeenCalledWith({
      where: {
        createdAt: { gte: expect.any(Date) },
        status: { not: "CANCELLED" },
      },
      select: { createdAt: true, totalAmount: true },
      orderBy: { createdAt: "asc" },
    });

    expect(result).toEqual({
      totalRevenue: 1000,
      totalOrders: 10,
      averageOrderValue: 100,
      chartData: [
        { name: "2025-10-28", Revenue: 500 },
        { name: "2025-10-29", Revenue: 500 },
      ],
    });
  });

  it("should handle no orders", async () => {
    const mockAggregateData = {
      _sum: { totalAmount: null },
      _count: { id: 0 },
    };

    mockedPrisma.orders.aggregate.mockResolvedValue(mockAggregateData as any);
    mockedPrisma.orders.findMany.mockResolvedValue([]);

    const result = await SalesSummaryService(30);

    expect(mockedPrisma.orders.aggregate).toHaveBeenCalledWith({
      _sum: { totalAmount: true },
      _count: { id: true },
      where: { status: { not: "CANCELLED" } },
    });

    expect(mockedPrisma.orders.findMany).toHaveBeenCalledWith({
      where: {
        createdAt: { gte: expect.any(Date) },
        status: { not: "CANCELLED" },
      },
      select: { createdAt: true, totalAmount: true },
      orderBy: { createdAt: "asc" },
    });

    expect(result).toEqual({
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      chartData: [],
    });
  });
});

describe("ProductInsightsService", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should return best sellers and low stock products", async () => {
    const mockBestSellersData = [
      { productId: "1", _sum: { quantity: 50 } },
      { productId: "2", _sum: { quantity: 30 } },
    ];

    const mockProductDetails = [
      { id: "1", name: "Product 1" },
      { id: "2", name: "Product 2" },
    ];

    const mockLowStockProducts = [
      { name: "Low Stock 1", stock: 5 },
      { name: "Low Stock 2", stock: 8 },
    ];

    mockedPrisma.orderItems.groupBy.mockResolvedValue(
      mockBestSellersData as any
    );
    mockedPrisma.products.findMany
      .mockResolvedValueOnce(mockProductDetails as any)
      .mockResolvedValueOnce(mockLowStockProducts as any);

    const result = await ProductInsightsService();

    expect(mockedPrisma.orderItems.groupBy).toHaveBeenCalledWith({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });

    expect(mockedPrisma.products.findMany).toHaveBeenNthCalledWith(1, {
      where: { id: { in: ["1", "2"] } },
      select: { id: true, name: true },
    });

    expect(mockedPrisma.products.findMany).toHaveBeenNthCalledWith(2, {
      where: { stock: { lt: 10 } },
      orderBy: { stock: "asc" },
      select: { name: true, stock: true },
      take: 5,
    });

    expect(result).toEqual({
      bestSellers: [
        { name: "Product 1", quantitySold: 50 },
        { name: "Product 2", quantitySold: 30 },
      ],
      lowStockProducts: mockLowStockProducts,
    });
  });

  it("should handle no data", async () => {
    mockedPrisma.orderItems.groupBy.mockResolvedValue([]);
    mockedPrisma.products.findMany.mockResolvedValue([]);

    const result = await ProductInsightsService();

    expect(mockedPrisma.orderItems.groupBy).toHaveBeenCalledWith({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });

    expect(mockedPrisma.products.findMany).toHaveBeenNthCalledWith(1, {
      where: { id: { in: [] } },
      select: { id: true, name: true },
    });

    expect(result).toEqual({
      bestSellers: [],
      lowStockProducts: [],
    });
  });
});

describe("CustomerInsightsService", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should return customer insights", async () => {
    mockedPrisma.users.count
      .mockResolvedValueOnce(100) // Total users
      .mockResolvedValueOnce(10); // New users in last 30 days

    const result = await CustomerInsightsService();

    expect(mockedPrisma.users.count).toHaveBeenNthCalledWith(1, {
      where: { role: "CUSTOMER" },
    });

    expect(mockedPrisma.users.count).toHaveBeenNthCalledWith(2, {
      where: {
        role: "CUSTOMER",
        createdAt: { gte: expect.any(Date) },
      },
    });

    expect(result).toEqual({
      totalUsers: 100,
      newUsers: 10,
    });
  });

  it("should handle no customers", async () => {
    mockedPrisma.users.count.mockResolvedValue(0);

    const result = await CustomerInsightsService();

    expect(result).toEqual({
      totalUsers: 0,
      newUsers: 0,
    });
  });
});

describe("OperationalSummaryService", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should return operational summary", async () => {
    const mockStatusCounts = [
      { status: "PENDING", _count: { status: 5 } },
      { status: "COMPLETED", _count: { status: 10 } },
    ];

    const mockRecentOrders = [
      {
        id: "1",
        totalAmount: 100,
        status: "PENDING",
        user: { name: "User 1" },
      },
      {
        id: "2",
        totalAmount: 200,
        status: "COMPLETED",
        user: { name: "User 2" },
      },
    ];

    const mockTotalOrders = {
      _count: { id: 15 },
    };

    mockedPrisma.orders.groupBy.mockResolvedValue(mockStatusCounts as any);
    mockedPrisma.orders.findMany.mockResolvedValue(mockRecentOrders as any);
    mockedPrisma.orders.aggregate.mockResolvedValue(mockTotalOrders as any);

    const result = await OperationalSummaryService();

    expect(mockedPrisma.orders.groupBy).toHaveBeenCalledWith({
      by: ["status"],
      _count: { status: true },
    });

    expect(mockedPrisma.orders.findMany).toHaveBeenCalledWith({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        totalAmount: true,
        status: true,
        user: { select: { name: true } },
      },
    });

    expect(mockedPrisma.orders.aggregate).toHaveBeenCalledWith({
      _count: { id: true },
    });

    expect(result).toEqual({
      statusCounts: mockStatusCounts,
      recentOrders: mockRecentOrders,
      totalOrders: mockTotalOrders,
    });
  });

  it("should handle no orders", async () => {
    mockedPrisma.orders.groupBy.mockResolvedValue([]);
    mockedPrisma.orders.findMany.mockResolvedValue([]);
    mockedPrisma.orders.aggregate.mockResolvedValue({
      _count: { id: 0 },
    } as any);

    const result = await OperationalSummaryService();

    expect(result).toEqual({
      statusCounts: [],
      recentOrders: [],
      totalOrders: { _count: { id: 0 } },
    });
  });
});

describe("CustomerOriginSummaryService", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should return customer origin summary", async () => {
    const mockSubDistrictCount = [
      {
        subdistrict: "District 1",
        _count: { subdistrict: 10 },
      },
      {
        subdistrict: "District 2",
        _count: { subdistrict: 5 },
      },
    ];

    mockedPrisma.addresses.groupBy.mockResolvedValue(
      mockSubDistrictCount as any
    );

    const result = await CustomerOriginSummaryService();

    expect(mockedPrisma.addresses.groupBy).toHaveBeenCalledWith({
      by: ["subdistrict"],
      where: { isDefault: true },
      _count: { subdistrict: true },
      orderBy: {
        _count: { subdistrict: "desc" },
      },
    });

    expect(result).toEqual([
      { location: "District 1", count: 10 },
      { location: "District 2", count: 5 },
    ]);
  });

  it("should handle no customer origins", async () => {
    mockedPrisma.addresses.groupBy.mockResolvedValue([]);

    const result = await CustomerOriginSummaryService();

    expect(result).toEqual([]);
  });
});
