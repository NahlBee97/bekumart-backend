import { snap } from "../../utils/midtrans";
import { AppError } from "../../utils/appError";
import {
  validateCartItems,
  createPaymentTransaction,
  createOrderTransaction,
} from "../../helper/orderHelpers"; // Adjust path
import { FulfillmentTypes, PaymentMethod } from "@prisma/client";
import { mockedPrisma } from "../mockPrisma";

jest.mock("../../utils/midtrans", () => ({
  snap: {
    createTransaction: jest.fn(),
  },
}));

const mockedSnap = snap as jest.Mocked<typeof snap>;

describe("validateCartItems", () => {
  const fakeProductDatabase: any = {
    "product-1": { id: "product-1", stock: 10, price: 100, name: "Product 1" },
    "product-2": { id: "product-2", stock: 0, price: 50, name: "Product 2" },
    "product-3": { id: "product-3", stock: 5, price: 200, name: "Product 3" },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockedPrisma.products.findUnique.mockImplementation(
      ((args: any) => {
        const id = args.where.id;
        return Promise.resolve(fakeProductDatabase[id] || null);
      }) as any 
    );
  });

  const cartItems: any[] = [
    {
      productId: "product-1",
      quantity: 2,
      product: { price: 100, name: "Product 1" },
    },
  ];

  it("should pass validation for a valid cart", async () => {
    await expect(validateCartItems(cartItems)).resolves.not.toThrow();
  });

  it("should throw AppError 404 if a product is not found", async () => {
    const invalidCart: any[] = [
      { productId: "product-invalid", quantity: 1 },
    ];

    mockedPrisma.products.findUnique.mockResolvedValue(null);

    await expect(validateCartItems(invalidCart as any)) 
      .rejects.toThrow(
        new AppError('Product with ID "product-invalid" not found', 404)
      );
  });

  it("should throw AppError 400 if product is out of stock", async () => {
    const invalidCart: any[] = [
      {
        productId: "product-2",
        quantity: 1,
        product: { price: 50, name: "Product 2" },
      }, // product-2 has stock: 0
    ];

    await expect(validateCartItems(invalidCart)).rejects.toThrow(
      new AppError('Product "Product 2" is not available', 400)
    );
  });

  it("should throw AppError 400 if stock is insufficient", async () => {
    const invalidCart: any[] = [
      {
        productId: "product-3",
        quantity: 10,
        product: { price: 200, name: "Product 3" },
      }, // Stock: 5, Requested: 10
    ];

    await expect(validateCartItems(invalidCart)).rejects.toThrow(
      new AppError(
        'Insufficient stock for "Product 3". Available: 5, Requested: 10',
        400
      )
    );
  });

  it("should throw AppError 400 if price has changed", async () => {
    const invalidCart: any[] = [
      {
        productId: "product-1",
        quantity: 1,
        product: { price: 99.99, name: "Product 1" },
      }, // DB price: 100
    ];

    await expect(validateCartItems(invalidCart)).rejects.toThrow(
      new AppError(
        'Price has changed for "Product 1". Please refresh your cart',
        400
      )
    );
  });
});

describe("createPaymentTransaction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockOrder = { id: "order-123", userId: "user-abc", totalAmount: 50000 };
  const mockUser = { name: "Test User", email: "test@example.com" };

  it("should create a payment transaction and return a token", async () => {
    mockedPrisma.users.findUnique.mockResolvedValue(mockUser as any);
    mockedSnap.createTransaction.mockResolvedValue({
      token: "fake-midtrans-token",
      redirect_url: "...",
    });

    const token = await createPaymentTransaction(mockOrder);

    expect(token).toBe("fake-midtrans-token");

    expect(mockedPrisma.users.findUnique).toHaveBeenCalledWith({
      where: { id: "user-abc" },
      select: { name: true, email: true },
    });

    expect(mockedSnap.createTransaction).toHaveBeenCalledWith({
      transaction_details: {
        order_id: "order-123",
        gross_amount: 50000,
      },
      customer_details: {
        first_name: "Test User",
        email: "test@example.com",
      },
    });
  });

  it("should throw AppError 404 if user is not found", async () => {
    mockedPrisma.users.findUnique.mockResolvedValue(null);

    await expect(createPaymentTransaction(mockOrder)).rejects.toThrow(
      new AppError("User not found", 404)
    );
  });

  it("should throw AppError 502 if Midtrans fails to return a token", async () => {
    mockedPrisma.users.findUnique.mockResolvedValue(mockUser as any);
    mockedSnap.createTransaction.mockResolvedValue({
      token: null,
      redirect_url: null,
    } as any);

    await expect(createPaymentTransaction(mockOrder)).rejects.toThrow(
      new AppError("Failed to create payment transaction", 502)
    );
  });

  it("should re-throw error if snap.createTransaction fails", async () => {
    const midtransError = new Error("Midtrans API is down");
    mockedPrisma.users.findUnique.mockResolvedValue(mockUser as any);
    mockedSnap.createTransaction.mockRejectedValue(midtransError);

    await expect(createPaymentTransaction(mockOrder)).rejects.toThrow(
      "Midtrans API is down"
    );
  });
});

describe('createOrderTransaction', () => {
  // Create a reusable mock transaction object (tx)
  const mockTx = {
    orders: {
      create: jest.fn(),
    },
    orderItems: {
      createMany: jest.fn(),
    },
    products: {
      update: jest.fn(),
    },
    cartItems: {
      deleteMany: jest.fn(),
    },
  };

  const mockCart = {
    id: 'cart-123',
    totalWeight: 1.5,
    items: [
      { productId: 'prod-A', quantity: 2, product: { price: 100 } },
      { productId: 'prod-B', quantity: 1, product: { price: 50 } },
    ],
  };
  
  const mockCreatedOrder = { id: 'new-order-id' };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock $transaction to immediately call the function passed to it,
    // and provide our mock 'tx' object as the argument.
    mockedPrisma.$transaction.mockImplementation(async (callback: any) => {
      return await callback(mockTx);
    });

    // Setup default return values for operations within the transaction
    mockTx.orders.create.mockResolvedValue(mockCreatedOrder);
    mockTx.products.update.mockResolvedValue({ stock: 5 }); // Default: success
  });

  const txArgs = {
    userId: 'user-abc',
    cart: mockCart,
    fulfillmentType: FulfillmentTypes.DELIVERY,
    courier: 'JNE',
    paymentMethod: PaymentMethod.ONLINE,
    addressId: 'addr-123',
    totalAmount: 250,
  };

  it('should execute all transaction steps correctly on success', async () => {
    const result = await createOrderTransaction(txArgs);

    expect(result).toEqual(mockCreatedOrder);

    expect(mockTx.orders.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-abc',
        totalAmount: 250,
        totalWeight: 1.5,
        fulfillmentType: 'DELIVERY',
        courier: 'JNE',
        paymentMethod: 'ONLINE',
        addressId: 'addr-123',
        status: 'PENDING',
      },
    });

    expect(mockTx.orderItems.createMany).toHaveBeenCalledWith({
      data: [
        { orderId: mockCreatedOrder.id, productId: 'prod-A', quantity: 2, priceAtPurchase: 100 },
        { orderId: mockCreatedOrder.id, productId: 'prod-B', quantity: 1, priceAtPurchase: 50 },
      ],
    });

    expect(mockTx.products.update).toHaveBeenCalledTimes(2);
    expect(mockTx.products.update).toHaveBeenCalledWith({
      where: { id: 'prod-A' },
      data: { sale: { increment: 2 }, stock: { decrement: 2 } },
      select: { stock: true },
    });

    expect(mockTx.cartItems.deleteMany).toHaveBeenCalledWith({
      where: { cartId: 'cart-123' },
    });
  });

  it('should throw AppError and roll back if stock goes negative', async () => {
    mockTx.products.update.mockResolvedValueOnce({ stock: -1 });

    await expect(createOrderTransaction(txArgs))
      .rejects.toThrow(new AppError('Insufficient stock for product prod-A', 400));
      
    expect(mockTx.cartItems.deleteMany).not.toHaveBeenCalled();
  });
});
