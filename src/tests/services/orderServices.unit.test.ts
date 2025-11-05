// order.service.test.ts
import {
  FulfillmentTypes,
  PaymentMethod,
  OrderStatuses,
} from "@prisma/client";
import { GetUserCartService } from "../../services/cartServices";
import { sendOrderStatusUpdateEmail } from "../../helper/emailSender";
import { AppError } from "../../utils/appError";
import {
  createOrderTransaction,
  createPaymentTransaction,
  validateCartItems,
} from "../../helper/orderHelpers";

import {
  CreateOrderService,
  UpdateOrderStatusService,
  GetOrderItemsByOrderIdService,
  GetUserOrdersService,
  GetAllOrderService,
} from "../../services/orderServices";

import { mockedPrisma } from "../mockPrisma";

jest.mock("../../services/cartServices", () => ({
  GetUserCartService: jest.fn(),
}));

jest.mock("../../helper/emailSender", () => ({
  sendOrderStatusUpdateEmail: jest.fn(),
}));

jest.mock("../../helper/orderHelpers", () => ({
  createOrderTransaction: jest.fn(),
  createPaymentTransaction: jest.fn(),
  validateCartItems: jest.fn(),
}));

// --- Setup typed mock variables ---
const mockedGetUserCart = GetUserCartService as jest.Mock;
const mockedSendEmail = sendOrderStatusUpdateEmail as jest.Mock;
const mockedCreateOrderTx = createOrderTransaction as jest.Mock;
const mockedCreatePaymentTx = createPaymentTransaction as jest.Mock;
const mockedValidateCart = validateCartItems as jest.Mock;

// --- Reset mocks before each test ---
beforeEach(() => {
  jest.resetAllMocks();
});

describe("CreateOrderService", () => {
  const mockCart = {
    id: "cart-1",
    items: [{ productId: "prod-1", quantity: 2 }],
  };
  const mockOrder = { id: "order-123", userId: "user-1", totalAmount: 100 };

  it("should create an order and return a payment token for DELIVERY + ONLINE", async () => {
    mockedGetUserCart.mockResolvedValue(mockCart);
    mockedPrisma.addresses.findFirst.mockResolvedValue({ id: "addr-1" } as any); // Address is found
    mockedValidateCart.mockResolvedValue(true); // Cart passes validation
    mockedCreateOrderTx.mockResolvedValue(mockOrder);
    mockedCreatePaymentTx.mockResolvedValue("fake-payment-token");

    const result = await CreateOrderService(
      "user-1",
      FulfillmentTypes.DELIVERY,
      PaymentMethod.ONLINE,
      "JNE",
      "addr-1",
      100
    );

    expect(mockedGetUserCart).toHaveBeenCalledWith("user-1");
    expect(mockedPrisma.addresses.findFirst).toHaveBeenCalledTimes(1);
    expect(mockedValidateCart).toHaveBeenCalledWith(mockCart.items);
    expect(mockedCreateOrderTx).toHaveBeenCalledTimes(1);
    expect(mockedCreatePaymentTx).toHaveBeenCalledWith(mockOrder);
    expect(result).toEqual({
      newOrder: mockOrder,
      paymentToken: "fake-payment-token",
    });
  });

  it("should create an order and return payment token for PICKUP but ONLINE payment", async () => {
    mockedGetUserCart.mockResolvedValue(mockCart);
    mockedValidateCart.mockResolvedValue(true);
    mockedCreateOrderTx.mockResolvedValue(mockOrder);
    mockedCreatePaymentTx.mockResolvedValue("fake-payment-token");

    const result = await CreateOrderService(
      "user-1",
      FulfillmentTypes.PICKUP,
      PaymentMethod.ONLINE,
      "",
      "",
      100
    );

    // 3. Assert
    expect(mockedPrisma.addresses.findFirst).not.toHaveBeenCalled();
    expect(mockedValidateCart).toHaveBeenCalledWith(mockCart.items);
    expect(mockedCreateOrderTx).toHaveBeenCalledTimes(1);
    expect(mockedCreatePaymentTx).toHaveBeenCalledWith(mockOrder);
    expect(result).toEqual({
      newOrder: mockOrder,
      paymentToken: "fake-payment-token",
    });
  });

  it("should create an order and return NO payment token for PICKUP", async () => {
    mockedGetUserCart.mockResolvedValue(mockCart);
    mockedValidateCart.mockResolvedValue(true);
    mockedCreateOrderTx.mockResolvedValue(mockOrder);

    const result = await CreateOrderService(
      "user-1",
      FulfillmentTypes.PICKUP,
      PaymentMethod.INSTORE,
      "",
      "",
      100
    );

    expect(mockedPrisma.addresses.findFirst).not.toHaveBeenCalled(); // No address check for PICKUP
    expect(mockedCreatePaymentTx).not.toHaveBeenCalled(); // No payment token created
    expect(result).toEqual({ newOrder: mockOrder });
  });

  it("should throw AppError if cart is empty", async () => {
    mockedGetUserCart.mockResolvedValue({ items: [] }); // Empty cart

    await expect(
      CreateOrderService(
        "user-1",
        FulfillmentTypes.DELIVERY,
        PaymentMethod.ONLINE,
        "JNE",
        "addr-1",
        100
      )
    ).rejects.toThrow(new AppError("Cart is empty", 400));
  });

  it("should throw AppError if address is not found for DELIVERY", async () => {
    mockedGetUserCart.mockResolvedValue(mockCart);
    mockedPrisma.addresses.findFirst.mockResolvedValue(null); // Address NOT found

    await expect(
      CreateOrderService(
        "user-1",
        FulfillmentTypes.DELIVERY,
        PaymentMethod.ONLINE,
        "JNE",
        "addr-1",
        100
      )
    ).rejects.toThrow(
      new AppError("Address not found or does not belong to user", 400)
    );
  });

  it("should re-throw error from validateCartItems", async () => {
    const validationError = new AppError("Stock insufficient", 400);
    mockedGetUserCart.mockResolvedValue(mockCart);
    mockedPrisma.addresses.findFirst.mockResolvedValue({ id: "addr-1" } as any);
    mockedValidateCart.mockRejectedValue(validationError); // Validation fails

    await expect(
      CreateOrderService(
        "user-1",
        FulfillmentTypes.DELIVERY,
        PaymentMethod.ONLINE,
        "JNE",
        "addr-1",
        100
      )
    ).rejects.toThrow(validationError);
  });
});

describe("UpdateOrderStatusService", () => {
  it("should update the order status and send an email", async () => {
    const mockUpdatedOrder = {
      id: "order-123",
      status: OrderStatuses.COMPLETED,
      user: { email: "test@example.com" },
      // ... other order properties
    };

    mockedPrisma.orders.update.mockResolvedValue(mockUpdatedOrder as any);
    mockedSendEmail.mockResolvedValue(true); // Email sent successfully

    const result = await UpdateOrderStatusService(
      "order-123",
      OrderStatuses.COMPLETED
    );

    expect(mockedPrisma.orders.update).toHaveBeenCalledWith({
      where: { id: "order-123" },
      data: { status: OrderStatuses.COMPLETED },
      include: expect.any(Object), // We can just check that it includes *something*
    });

    expect(mockedSendEmail).toHaveBeenCalledWith(mockUpdatedOrder);
    expect(result).toEqual(mockUpdatedOrder);
  });
});

describe("GetOrderItemsByOrderIdService", () => {
  it("should return order items if found", async () => {
    const mockItems = [{ id: "item-1", productId: "prod-1" }];
    mockedPrisma.orderItems.findMany.mockResolvedValue(mockItems as any);

    const result = await GetOrderItemsByOrderIdService("order-123");

    expect(result).toEqual(mockItems);
    expect(mockedPrisma.orderItems.findMany).toHaveBeenCalledWith({
      where: { orderId: "order-123" },
      include: expect.any(Object),
    });
  });

  it("should throw AppError 404 if no order items are found", async () => {
    mockedPrisma.orderItems.findMany.mockResolvedValue([]); // Empty array

    await expect(GetOrderItemsByOrderIdService("order-123")).rejects.toThrow(
      new AppError("order items not found", 404)
    );
  });
});

describe("GetUserOrdersService", () => {
  it("should return a user's orders", async () => {
    const mockOrders = [{ id: "order-1" }, { id: "order-2" }];
    mockedPrisma.orders.findMany.mockResolvedValue(mockOrders as any);

    const result = await GetUserOrdersService("user-1");

    expect(result).toEqual(mockOrders);
    expect(mockedPrisma.orders.findMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      orderBy: { createdAt: "desc" },
    });
  });
});

describe("GetAllOrderService", () => {
  it("should fetch all orders if no status is provided", async () => {
    const mockOrders = [{ id: "order-1" }];
    mockedPrisma.orders.findMany.mockResolvedValue(mockOrders as any);

    const result = await GetAllOrderService(null as any); // Test with null status

    expect(result).toEqual(mockOrders);
    expect(mockedPrisma.orders.findMany).toHaveBeenCalledWith({
      include: { user: true },
      orderBy: { createdAt: "desc" },
      // Note: no 'where' clause
    });
  });

  it("should fetch filtered orders if a status is provided", async () => {
    const mockOrders = [{ id: "order-2", status: "COMPLETED" }];
    mockedPrisma.orders.findMany.mockResolvedValue(mockOrders as any);

    const result = await GetAllOrderService(OrderStatuses.COMPLETED);

    expect(result).toEqual(mockOrders);
    expect(mockedPrisma.orders.findMany).toHaveBeenCalledWith({
      where: { status: OrderStatuses.COMPLETED }, // 'where' clause exists
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
  });
});