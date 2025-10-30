import axios from "axios";
import { redis } from "../../lib/redis";
import { GetUserCartService } from "../../services/cartServices";
import { getShippingCost } from "../../helper/getShippingCost";
import { AppError } from "../../utils/appError";
import { mockedPrisma } from "../mockPrisma";
import { ORIGIN_SUBDISTRICT_ID, RAJAONGKIR_BASE_URL } from "../../config";

jest.mock("axios");
jest.mock("../../lib/redis", () => ({
  redis: {
    get: jest.fn(),
    setex: jest.fn(),
  },
}));
jest.mock("../../services/cartServices", () => ({
  GetUserCartService: jest.fn(),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedRedisGet = redis.get as jest.Mock;
const mockedRedisSetex = redis.setex as jest.Mock;
const mockedCartService = GetUserCartService as jest.Mock;

const mockAddress = {
  id: "address-123",
  userId: "user-abc",
  district: "Bima",
  subdistrict: "Sila",
  // ...properti alamat lainnya
};

const mockCart = {
  items: [{ id: "item-1", quantity: 2 }],
};

const mockSubDistricts = [
  { id: "5678", name: "Sila" },
  { id: "5679", name: "Woha" },
];

const mockCouriers = [
  {
    code: "jne",
    name: "JNE",
    costs: [{ service: "REG", cost: [{ value: 10000 }] }],
  },
];

describe("getShippingCost", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch from API, set cache, and return costs if cache is empty", async () => {
    mockedPrisma.addresses.findUnique.mockResolvedValue(mockAddress as any);
    mockedCartService.mockResolvedValue(mockCart);

    mockedRedisGet.mockResolvedValueOnce(JSON.stringify(mockSubDistricts));

    // get couriers from cache
    mockedRedisGet.mockResolvedValueOnce(null);

    mockedAxios.post.mockResolvedValue({ data: { data: mockCouriers } });

    const totalWeight = 1.5;
    const result = await getShippingCost("address-123", totalWeight);

    expect(mockedPrisma.addresses.findUnique).toHaveBeenCalledWith({
      where: { id: "address-123" },
    });
    expect(mockedCartService).toHaveBeenCalledWith("user-abc");
    expect(mockedRedisGet).toHaveBeenCalledWith("bima_sub_districts");

    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      `${RAJAONGKIR_BASE_URL}/calculate/domestic-cost`,
      {
        origin: ORIGIN_SUBDISTRICT_ID,
        destination: "5678", // ID 'Sila' dari mockSubDistricts
        weight: 1500, // 1.5 kg * 1000
        courier: "jne:jnt:pos",
        price: "lowest",
      },
      expect.any(Object) // config headers
    );

    const expectedCacheKey = "sila_couriers_1500";

    expect(mockedRedisSetex).toHaveBeenCalledWith(
      expectedCacheKey,
      259200,
      JSON.stringify(mockCouriers)
    );

    expect(result).toEqual(mockCouriers);
  });

  it("should return costs from cache if available", async () => {
    mockedPrisma.addresses.findUnique.mockResolvedValue(mockAddress as any);
    mockedCartService.mockResolvedValue(mockCart);

    mockedRedisGet.mockResolvedValueOnce(JSON.stringify(mockSubDistricts));

    // Panggilan redis.get kedua (shipping cost cache) -> CACHE HIT
    mockedRedisGet.mockResolvedValueOnce(JSON.stringify(mockCouriers));

    const result = await getShippingCost("address-123", 1.5);

    expect(mockedAxios.post).not.toHaveBeenCalled();
    expect(mockedRedisSetex).not.toHaveBeenCalled();

    expect(result).toEqual(mockCouriers);
  });

  it("should throw AppError 404 if address is not found", async () => {
    mockedPrisma.addresses.findUnique.mockResolvedValue(null);

    await expect(getShippingCost("address-123", 1.5)).rejects.toThrow(
      new AppError("Address not found", 404)
    );
  });

  it("should throw AppError 404 if cart is empty", async () => {
    mockedPrisma.addresses.findUnique.mockResolvedValue(mockAddress as any);
    mockedCartService.mockResolvedValue({ items: [] }); // Keranjang kosong

    await expect(getShippingCost("address-123", 1.5)).rejects.toThrow(
      new AppError("Cart is empty", 404)
    );
  });

  it("should throw AppError 500 if sub-districts are not cached", async () => {
    mockedPrisma.addresses.findUnique.mockResolvedValue(mockAddress as any);
    mockedCartService.mockResolvedValue(mockCart);

    // Panggilan redis.get pertama (sub-districts) -> CACHE MISS
    mockedRedisGet.mockResolvedValueOnce(null);

    await expect(getShippingCost("address-123", 1.5)).rejects.toThrow(
      new AppError("Can not get subdistricts", 500)
    );
  });

  it("should throw AppError 404 if subdistrict name does not match cache", async () => {
    mockedPrisma.addresses.findUnique.mockResolvedValue(mockAddress as any);

    mockedCartService.mockResolvedValue(mockCart);

    mockedRedisGet.mockResolvedValueOnce(null);

    await expect(getShippingCost("address-123", 1.5)).rejects.toThrow(
      new AppError("Can not get subdistricts", 500)
    );
  });

  it("should throw an error if axios post fails", async () => {
    mockedPrisma.addresses.findUnique.mockResolvedValue(mockAddress as any);

    mockedCartService.mockResolvedValue(mockCart);

    mockedRedisGet.mockResolvedValueOnce(JSON.stringify(mockSubDistricts));

    mockedRedisGet.mockResolvedValueOnce(null);

    mockedAxios.post.mockRejectedValue(
      new AppError("Can not fetch couriers", 500)
    );

    await expect(getShippingCost("address-123", 1.5)).rejects.toThrow(
      new AppError("Can not fetch couriers", 500)
    );
  });
});
