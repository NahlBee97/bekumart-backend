import { AppError } from "../../utils/appError"; // Sesuaikan path
import {
  GetProductsService,
  GetProductByIdService,
  CreateProductService,
  UpdateProductService,
  DeleteProductService,
} from "../../services/productServices"; // Sesuaikan path
import { mockedPrisma } from "../mockPrisma";

beforeEach(() => {
  jest.resetAllMocks();
});

describe("GetProductsService", () => {
  it("should call findMany with correct filters (all provided)", async () => {
    const queries = {
      search: "laptop",
      minPrice: "1000",
      maxPrice: "5000",
      rating: "4.5",
    };

    mockedPrisma.products.findMany.mockResolvedValue([]); // Hanya mengembalikan array kosong

    await GetProductsService(queries);

    const expectedWhereClause = {
      AND: [
        {
          OR: [
            { name: { contains: "laptop", mode: "insensitive" } },
            { category: { name: { contains: "laptop", mode: "insensitive" } } },
          ],
        },
        { price: { gte: 1000 } },
        { price: { lte: 5000 } },
        { rating: { gte: 4.5 } },
      ],
    };

    expect(mockedPrisma.products.findMany).toHaveBeenCalledWith({
      where: expectedWhereClause,
      include: { productPhotos: true, category: true },
      orderBy: { createdAt: "desc" },
    });
  });

  it('should call findMany with no "where" clause if queries are empty', async () => {
    await GetProductsService({}); // Panggil dengan query kosong

    expect(mockedPrisma.products.findMany).toHaveBeenCalledWith({
      where: {}, // Objek 'where' harus kosong (karena "AND" dihapus)
      include: { productPhotos: true, category: true },
      orderBy: { createdAt: "desc" },
    });
  });

  it("should only include search filter", async () => {
    await GetProductsService({ search: "test" });

    expect(mockedPrisma.products.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: [
            {
              OR: [
                { name: { contains: "test", mode: "insensitive" } },
                {
                  category: { name: { contains: "test", mode: "insensitive" } },
                },
              ],
            },
          ],
        },
      })
    );
  });
});

describe("GetProductByIdService", () => {
  it("should return a product if found", async () => {
    const mockProduct = { id: "prod-1", name: "Test Product" };
    mockedPrisma.products.findUnique.mockResolvedValue(mockProduct as any);

    const result = await GetProductByIdService("prod-1");

    expect(result).toEqual(mockProduct);
    expect(mockedPrisma.products.findUnique).toHaveBeenCalledWith({
      where: { id: "prod-1" },
      include: { category: true },
    });
  });

  it("should throw AppError 404 if product is not found", async () => {
    mockedPrisma.products.findUnique.mockResolvedValue(null);

    await expect(GetProductByIdService("prod-bad")).rejects.toThrow(
      new AppError("Product not found", 404)
    );
  });
});

describe("CreateProductService", () => {
  it("should create and return a new product", async () => {
    const newProductData = { name: "New Product", price: 100 };
    const createdProduct = { id: "prod-new", ...newProductData };

    mockedPrisma.products.create.mockResolvedValue(createdProduct as any);

    const result = await CreateProductService(newProductData as any);

    expect(result).toEqual(createdProduct);
    expect(mockedPrisma.products.create).toHaveBeenCalledWith({
      data: newProductData,
    });
  });
});

describe("UpdateProductService", () => {
  const existingProduct = {
    id: "prod-1",
    name: "Old Name",
    price: 100,
    description: "Old Description",
    stock: 10,
    weightInKg: 1,
    categoryId: "cat-1",
  };

  it("should update a product with partial data", async () => {
    const partialData = { name: "New Name", price: 150 };

    // Ini adalah data yang diharapkan akan dikirim ke prisma.update
    const expectedMergedData = {
      name: "New Name", // dari partialData
      price: 150, // dari partialData
      description: "Old Description", // dari existingProduct
      stock: 10, // dari existingProduct
      weightInKg: 1, // dari existingProduct
      categoryId: "cat-1", // dari existingProduct
    };

    const returnedUpdatedProduct = { ...existingProduct, ...partialData };

    mockedPrisma.products.findUnique.mockResolvedValue(existingProduct as any);
    mockedPrisma.products.update.mockResolvedValue(
      returnedUpdatedProduct as any
    );

    const result = await UpdateProductService("prod-1", partialData as any);

    expect(result).toEqual(returnedUpdatedProduct);
    expect(mockedPrisma.products.findUnique).toHaveBeenCalledWith({
      where: { id: "prod-1" },
    });
    expect(mockedPrisma.products.update).toHaveBeenCalledWith({
      where: { id: "prod-1" },
      data: expectedMergedData, // Memverifikasi logika penggabungan (merge)
    });
  });

  it("should throw AppError 404 if product to update is not found", async () => {
    mockedPrisma.products.findUnique.mockResolvedValue(null);

    await expect(UpdateProductService("prod-bad", {})).rejects.toThrow(
      new AppError("Product not found", 404)
    );
    expect(mockedPrisma.products.update).not.toHaveBeenCalled();
  });
});

describe("DeleteProductService", () => {
  const existingProduct = { id: "prod-1", name: "Test Product" };

  // Siapkan mock transaction object
  const mockTx = {
    cartItems: { deleteMany: jest.fn() },
    orderItems: { deleteMany: jest.fn() },
    productPhotos: { deleteMany: jest.fn() },
    products: { delete: jest.fn() },
  };

  beforeEach(() => {
    mockedPrisma.$transaction.mockImplementation(async (callback: any) => {
      return await callback(mockTx);
    });
  });

  it("should delete a product and all related items in a transaction", async () => {
    mockedPrisma.products.findUnique.mockResolvedValue(existingProduct as any);

    await DeleteProductService("prod-1");

    expect(mockedPrisma.products.findUnique).toHaveBeenCalledWith({
      where: { id: "prod-1" },
    });

    expect(mockedPrisma.$transaction).toHaveBeenCalledTimes(1);

    expect(mockTx.cartItems.deleteMany).toHaveBeenCalledWith({
      where: { productId: "prod-1" },
    });
    expect(mockTx.orderItems.deleteMany).toHaveBeenCalledWith({
      where: { productId: "prod-1" },
    });
    expect(mockTx.productPhotos.deleteMany).toHaveBeenCalledWith({
      where: { productId: "prod-1" },
    });
    expect(mockTx.products.delete).toHaveBeenCalledWith({
      where: { id: "prod-1" },
    });
  });

  it("should throw AppError 404 if product to delete is not found", async () => {
    mockedPrisma.products.findUnique.mockResolvedValue(null);

    await expect(DeleteProductService("prod-bad")).rejects.toThrow(
      new AppError("Product not found", 404)
    );
    expect(mockedPrisma.$transaction).not.toHaveBeenCalled();
  });
});
