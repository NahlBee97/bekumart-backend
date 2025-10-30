import { GetShippingCostService } from "../../services/shippingCostServices";
import { getShippingCost } from "../../helper/getShippingCost";
import { AppError } from "../../utils/appError";

jest.mock("../../helper/getShippingCost", () => ({
  getShippingCost: jest.fn(),
}));

const mockedGetShippingCost = getShippingCost as jest.Mock;

beforeEach(() => {
  mockedGetShippingCost.mockReset();
});

describe("GetShippingCostService", () => {
  const addressId = "addr-123";

  it("should return couriers if weight is valid and helper succeeds", async () => {
    const totalWeight = 50; // Di bawah 100
    const mockCouriers = [
      { code: "jne", name: "JNE", cost: 10000 },
      { code: "jnt", name: "J&T", cost: 11000 },
    ];
    mockedGetShippingCost.mockResolvedValue(mockCouriers);

    const result = await GetShippingCostService(addressId, totalWeight);

    expect(result).toEqual(mockCouriers);
    expect(mockedGetShippingCost).toHaveBeenCalledWith(addressId, totalWeight);
    expect(mockedGetShippingCost).toHaveBeenCalledTimes(1);
  });

  it("should throw AppError 400 if totalWeight is over 100", async () => {
    const totalWeight = 101; // Di atas 100

    await expect(
      GetShippingCostService(addressId, totalWeight)
    ).rejects.toThrow(new AppError("Order weight is too heavy", 400));

    expect(mockedGetShippingCost).not.toHaveBeenCalled();
  });

  it("should throw AppError 500 if getShippingCost returns an empty array", async () => {
    const totalWeight = 50;
    mockedGetShippingCost.mockResolvedValue([]);

    await expect(
      GetShippingCostService(addressId, totalWeight)
    ).rejects.toThrow(new AppError("Fails to get couriers", 500));

    expect(mockedGetShippingCost).toHaveBeenCalledWith(addressId, totalWeight);
  });

  it("should re-throw an error if the getShippingCost helper fails", async () => {
    const totalWeight = 50;
    const originalError = new Error("RajaOngkir API is down");
    mockedGetShippingCost.mockRejectedValue(originalError);

    await expect(
      GetShippingCostService(addressId, totalWeight)
    ).rejects.toThrow(originalError);

    expect(mockedGetShippingCost).toHaveBeenCalledWith(addressId, totalWeight);
  });
});
