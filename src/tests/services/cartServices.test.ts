import {
  AddItemToCartService,
  DeleteItemInCartService,
  GetUserCartService,
  UpdateItemInCartService,
} from "../../services/cartServices";
import { AppError } from "../../utils/appError";
import { product, returnCart, userCart, userId } from "../constans/cartContant";
import { mockedPrisma } from "../mockPrisma";

describe("GetUserCartService", () => {
  beforeEach(() => {
    jest.resetAllMocks();

    mockedPrisma.carts.findFirst.mockResolvedValue(userCart);
  });

  it("should return user cart with total weight, total quantity and totalprice", async () => {
    const result = await GetUserCartService(userId);

    expect(mockedPrisma.carts.findFirst).toHaveBeenCalledWith({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
                productPhotos: true,
              },
            },
          },
        },
      },
    });

    expect(result).toEqual(returnCart);
  });

  it("should throw error if find cart fails", async () => {
    const dbError = new Error("Database error");
    mockedPrisma.carts.findFirst.mockRejectedValue(dbError);

    await expect(GetUserCartService(userId)).rejects.toThrow(dbError);

    expect(mockedPrisma.carts.findFirst).toHaveBeenCalledWith({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
                productPhotos: true,
              },
            },
          },
        },
      },
    });
  });

  it("should throw error if user cart not found", async () => {
    mockedPrisma.carts.findFirst.mockResolvedValue(null);

    await expect(GetUserCartService(userId)).rejects.toThrow(
      new AppError("Cart not found", 404)
    );

    expect(mockedPrisma.carts.findFirst).toHaveBeenCalledWith({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
                productPhotos: true,
              },
            },
          },
        },
      },
    });
  });
});

describe("AddItemToCartService", () => {
  const quantity = 2;
  beforeEach(() => {
    jest.resetAllMocks();

    mockedPrisma.products.findUnique.mockResolvedValue(product as any);
    mockedPrisma.carts.findFirst.mockResolvedValue(userCart);
    mockedPrisma.cartItems.findFirst.mockResolvedValue(userCart.items[0]);
    mockedPrisma.$transaction.mockImplementation(async (callback: any) => {
      return callback(mockedPrisma);
    });
  });

  it("should update item quantity in cart if existing cart item found and return the updated cart", async () => {
    mockedPrisma.cartItems.update.mockResolvedValue({
      ...userCart.items[0],
      quantity: userCart.items[0].quantity + quantity,
    });
    mockedPrisma.carts.findUnique.mockResolvedValue({
      ...userCart,
      items: [
        {
          ...userCart.items[0],
          quantity: userCart.items[0].quantity + quantity,
        },
        userCart.items[1],
      ],
    } as any);

    const result = await AddItemToCartService(userId, product.id, quantity);

    expect(mockedPrisma.products.findUnique).toHaveBeenCalledWith({
      where: { id: product.id },
      select: { id: true, stock: true },
    });
    expect(mockedPrisma.carts.findFirst).toHaveBeenCalledWith({
      where: { userId },
      include: { items: true },
    });
    expect(mockedPrisma.cartItems.findFirst).toHaveBeenCalledWith({
      where: { cartId: userCart.id, productId: product.id },
    });
    expect(mockedPrisma.$transaction).toHaveBeenCalled();
    expect(mockedPrisma.cartItems.update).toHaveBeenCalledWith({
      where: { id: userCart.items[0].id },
      data: { quantity: userCart.items[0].quantity + quantity },
    });
    expect(mockedPrisma.carts.create).not.toHaveBeenCalled();
    expect(mockedPrisma.carts.findUnique).toHaveBeenCalledWith({
      where: { id: userCart.id },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, price: true, productPhotos: true },
            },
          },
        },
      },
    });
    expect(result).toEqual({
      ...userCart,
      items: [
        {
          ...userCart.items[0],
          quantity: userCart.items[0].quantity + quantity,
        },
        userCart.items[1],
      ],
    });
  });

  it("should create new cart item if cart item not found", async () => {
    mockedPrisma.cartItems.create.mockResolvedValue({
      ...product,
      quantity,
    } as any);

    mockedPrisma.carts.findUnique.mockResolvedValue({
      ...userCart,
      items: [{ ...product, quantity }],
    } as any);

    mockedPrisma.cartItems.findFirst.mockResolvedValue(null);

    const result = await AddItemToCartService(userId, product.id, quantity);

    expect(mockedPrisma.products.findUnique).toHaveBeenCalledWith({
      where: { id: product.id },
      select: { id: true, stock: true },
    });
    expect(mockedPrisma.carts.findFirst).toHaveBeenCalledWith({
      where: { userId },
      include: { items: true },
    });
    expect(mockedPrisma.cartItems.findFirst).toHaveBeenCalledWith({
      where: { cartId: userCart.id, productId: product.id },
    });
    expect(mockedPrisma.$transaction).toHaveBeenCalled();
    expect(mockedPrisma.cartItems.update).not.toHaveBeenCalledWith();

    expect(mockedPrisma.cartItems.create).toHaveBeenCalledWith({
      data: {
        cartId: userCart.id,
        productId: product.id,
        quantity,
      },
    });

    expect(mockedPrisma.carts.findUnique).toHaveBeenCalledWith({
      where: { id: userCart.id },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, price: true, productPhotos: true },
            },
          },
        },
      },
    });

    expect(result).toEqual({ ...userCart, items: [{ ...product, quantity }] });
  });

  it("should throw error if finding product fails", async () => {
    const dbError = new Error("Database error");
    mockedPrisma.products.findUnique.mockRejectedValue(dbError);
    await expect(
      AddItemToCartService(userId, product.id, quantity)
    ).rejects.toThrow(dbError);

    expect(mockedPrisma.products.findUnique).toHaveBeenCalledWith({
      where: { id: product.id },
      select: { id: true, stock: true },
    });
  });

  it("should throw error if product not found", async () => {
    mockedPrisma.products.findUnique.mockResolvedValue(null);
    await expect(
      AddItemToCartService(userId, product.id, quantity)
    ).rejects.toThrow(new AppError("Product not found.", 404));
    expect(mockedPrisma.products.findUnique).toHaveBeenCalledWith({
      where: { id: product.id },
      select: { id: true, stock: true },
    });
  });

  it("should throw error if insufficient stock", async () => {
    mockedPrisma.products.findUnique.mockResolvedValue({
      ...product,
      stock: 5,
    } as any);
    await expect(AddItemToCartService(userId, product.id, 10)).rejects.toThrow(
      new AppError("Insufficient product stock.", 400)
    );
    expect(mockedPrisma.products.findUnique).toHaveBeenCalledWith({
      where: { id: product.id },
      select: { id: true, stock: true },
    });
  });

  it("should throw error if finding cart fails", async () => {
    const dbError = new Error("Database error");
    mockedPrisma.carts.findFirst.mockRejectedValue(dbError);
    await expect(
      AddItemToCartService(userId, product.id, quantity)
    ).rejects.toThrow(dbError);
    expect(mockedPrisma.products.findUnique).toHaveBeenCalledWith({
      where: { id: product.id },
      select: { id: true, stock: true },
    });
    expect(mockedPrisma.carts.findFirst).toHaveBeenCalledWith({
      where: { userId },
      include: { items: true },
    });
  });

  it("should throw error if cart not found", async () => {
    mockedPrisma.carts.findFirst.mockResolvedValue(null);
    await expect(
      AddItemToCartService(userId, product.id, quantity)
    ).rejects.toThrow(new AppError("Cart not found", 404));
    expect(mockedPrisma.products.findUnique).toHaveBeenCalledWith({
      where: { id: product.id },
      select: { id: true, stock: true },
    });
    expect(mockedPrisma.carts.findFirst).toHaveBeenCalledWith({
      where: { userId },
      include: { items: true },
    });
  });
  it("should throw error if finding cart item fails", async () => {
    const dbError = new Error("Database error");
    mockedPrisma.cartItems.findFirst.mockRejectedValue(dbError);
    await expect(
      AddItemToCartService(userId, product.id, quantity)
    ).rejects.toThrow(dbError);
    expect(mockedPrisma.products.findUnique).toHaveBeenCalledWith({
      where: { id: product.id },
      select: { id: true, stock: true },
    });
    expect(mockedPrisma.carts.findFirst).toHaveBeenCalledWith({
      where: { userId },
      include: { items: true },
    });
    expect(mockedPrisma.cartItems.findFirst).toHaveBeenCalledWith({
      where: { cartId: userCart.id, productId: product.id },
    });
  });

  it("should throw error if update item fails", async () => {
    const dbError = new Error("Database error");
    mockedPrisma.cartItems.update.mockRejectedValue(dbError);
    await expect(
      AddItemToCartService(userId, product.id, quantity)
    ).rejects.toThrow(dbError);
    expect(mockedPrisma.products.findUnique).toHaveBeenCalledWith({
      where: { id: product.id },
      select: { id: true, stock: true },
    });
    expect(mockedPrisma.carts.findFirst).toHaveBeenCalledWith({
      where: { userId },
      include: { items: true },
    });
    expect(mockedPrisma.cartItems.findFirst).toHaveBeenCalledWith({
      where: { cartId: userCart.id, productId: product.id },
    });
    expect(mockedPrisma.$transaction).toHaveBeenCalled();
    expect(mockedPrisma.cartItems.update).toHaveBeenCalledWith({
      where: { id: userCart.items[0].id },
      data: { quantity: userCart.items[0].quantity + quantity },
    });
  });

  it("should throw error if create item fails", async () => {
    const dbError = new Error("Database error");
    mockedPrisma.cartItems.findFirst.mockResolvedValue(null);
    mockedPrisma.cartItems.create.mockRejectedValue(dbError);
    await expect(
      AddItemToCartService(userId, product.id, quantity)
    ).rejects.toThrow(dbError);
    expect(mockedPrisma.products.findUnique).toHaveBeenCalledWith({
      where: { id: product.id },
      select: { id: true, stock: true },
    });
    expect(mockedPrisma.carts.findFirst).toHaveBeenCalledWith({
      where: { userId },
      include: { items: true },
    });
    expect(mockedPrisma.cartItems.findFirst).toHaveBeenCalledWith({
      where: { cartId: userCart.id, productId: product.id },
    });
    expect(mockedPrisma.$transaction).toHaveBeenCalled();
    expect(mockedPrisma.cartItems.update).not.toHaveBeenCalled();
    expect(mockedPrisma.cartItems.create).toHaveBeenCalledWith({
      data: {
        cartId: userCart.id,
        productId: product.id,
        quantity,
      },
    });
  });

  it("should throw error if transaction fails", async () => {
    const dbError = new Error("Database error");
    mockedPrisma.$transaction.mockRejectedValue(dbError);
    await expect(
      AddItemToCartService(userId, product.id, quantity)
    ).rejects.toThrow(dbError);
    expect(mockedPrisma.$transaction).toHaveBeenCalled();
  });
});

describe("UpdateItemInCartService", () => {
  const itemId = userCart.items[0].id;
  const quantity = 5;

  beforeEach(() => {
    jest.resetAllMocks();

    mockedPrisma.cartItems.findUnique.mockResolvedValue(userCart.items[0]);
    mockedPrisma.cartItems.update.mockResolvedValue({
      ...userCart.items[0],
      quantity,
    });
  });

  it("should update item quantity in cart", async () => {
    const result = await UpdateItemInCartService(itemId, quantity);

    expect(mockedPrisma.cartItems.findUnique).toHaveBeenCalledWith({
      where: { id: itemId },
    });
    expect(mockedPrisma.cartItems.update).toHaveBeenCalledWith({
      where: { id: itemId },
      data: { quantity },
    });
    expect(result).toEqual({ ...userCart.items[0], quantity });
  });

  it("should throw error if finding cart item fails", async () => {
    const dbError = new Error("Database error");
    mockedPrisma.cartItems.findUnique.mockRejectedValue(dbError);
    await expect(UpdateItemInCartService(itemId, quantity)).rejects.toThrow(
      dbError
    );
    expect(mockedPrisma.cartItems.findUnique).toHaveBeenCalledWith({
      where: { id: itemId },
    });
  });

  it("should throw error if item not found", async () => {
    mockedPrisma.cartItems.findUnique.mockResolvedValue(null);
    await expect(UpdateItemInCartService(itemId, quantity)).rejects.toThrow(
      new AppError("Item not found in cart", 404)
    );
    expect(mockedPrisma.cartItems.findUnique).toHaveBeenCalledWith({
      where: { id: itemId },
    });
  });

  it("should throw error if updating item fails", async () => {
    const dbError = new Error("Database error");
    mockedPrisma.cartItems.findUnique.mockResolvedValue(userCart.items[0]);
    mockedPrisma.cartItems.update.mockRejectedValue(dbError);
    await expect(UpdateItemInCartService(itemId, quantity)).rejects.toThrow(
      dbError
    );
    expect(mockedPrisma.cartItems.findUnique).toHaveBeenCalledWith({
      where: { id: itemId },
    });
    expect(mockedPrisma.cartItems.update).toHaveBeenCalledWith({
      where: { id: itemId },
      data: { quantity },
    });
  });
});

describe("DeleteItemInCartService", () => {
  const itemId = userCart.items[0].id;
  beforeEach(() => {
    jest.resetAllMocks();

    mockedPrisma.cartItems.findUnique.mockResolvedValue(userCart.items[0]);
    mockedPrisma.cartItems.delete.mockResolvedValue(userCart.items[0]);
  });

  it("should delete item from cart", async () => {
    const result = await DeleteItemInCartService(itemId);

    expect(mockedPrisma.cartItems.findUnique).toHaveBeenCalledWith({
      where: { id: itemId },
    });
    expect(mockedPrisma.cartItems.delete).toHaveBeenCalledWith({
      where: { id: itemId },
    });
  });

  it("should throw error if finding cart item fails", async () => {
    const dbError = new Error("Database error");
    mockedPrisma.cartItems.findUnique.mockRejectedValue(dbError);
    await expect(DeleteItemInCartService(itemId)).rejects.toThrow(dbError);
    expect(mockedPrisma.cartItems.findUnique).toHaveBeenCalledWith({
      where: { id: itemId },
    });
  });

  it("should throw error if item not found", async () => {
    mockedPrisma.cartItems.findUnique.mockResolvedValue(null);
    await expect(DeleteItemInCartService(itemId)).rejects.toThrow(
      new AppError("Item not found in cart", 404)
    );
    expect(mockedPrisma.cartItems.findUnique).toHaveBeenCalledWith({
      where: { id: itemId },
    });
  });

  it("should throw error if deleting item fails", async () => {
    const dbError = new Error("Database error");
    mockedPrisma.cartItems.delete.mockRejectedValue(dbError);
    await expect(DeleteItemInCartService(itemId)).rejects.toThrow(dbError);
    expect(mockedPrisma.cartItems.findUnique).toHaveBeenCalledWith({
      where: { id: itemId },
    });
    expect(mockedPrisma.cartItems.delete).toHaveBeenCalledWith({
      where: { id: itemId },
    });
  });
});
