import {
  CreateAddressService,
  DeleteAddressByIdService,
  EditAddressByIdService,
  GetAddressesByUserIdService,
  SetDefaultAddressService,
} from "../../services/addressServices";
import { AppError } from "../../utils/appError";
import { mockedPrisma } from "../mockPrisma";

const addressId = "string";
const userId = "string";
const addresses = [
  {
    id: addressId,
    receiver: "string",
    userId,
    street: "string",
    subdistrict: "string",
    district: "string",
    city: "string",
    province: "string",
    postalCode: "string",
    phone: "string",
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
const newAddress = {
  ...addresses[0],
};
const dataToUpdate = {
  ...addresses[0],
  addressId,
};

describe("GetAddressesByUserIdService", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedPrisma.addresses.findMany.mockResolvedValue(addresses);
  });
  it("should return addresses", async () => {
    const result = await GetAddressesByUserIdService(userId);

    expect(mockedPrisma.addresses.findMany).toHaveBeenCalledWith({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    expect(result).toEqual(addresses);
  });
});

describe("CreateAddressService", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedPrisma.$transaction.mockImplementation(
      async (callback: any) => await callback(mockedPrisma)
    );

    mockedPrisma.addresses.updateMany.mockResolvedValue({ count: 1 });
    mockedPrisma.addresses.create.mockResolvedValue(newAddress);
  });

  it("should create new address, set it as default and set other to false", async () => {
    const result = await CreateAddressService(userId, { ...newAddress });

    expect(mockedPrisma.$transaction).toHaveBeenCalled();
    expect(mockedPrisma.addresses.updateMany).toHaveBeenCalledWith({
      where: {
        userId,
      },
      data: { isDefault: false },
    });
    expect(mockedPrisma.addresses.create).toHaveBeenCalledWith({
      data: { ...newAddress, updatedAt: expect.any(Date) },
    });
    expect(result).toEqual(newAddress);
  });
});

describe("EditAddressByIdService", () => {
  beforeEach(() => {
    jest.resetAllMocks();

    mockedPrisma.addresses.findUnique.mockResolvedValue(addresses[0]);
    mockedPrisma.addresses.update.mockResolvedValue({
      ...addresses[0],
      ...dataToUpdate,
    });
  });

  it("should update address with specific id", async () => {
    const result = await EditAddressByIdService(addressId, dataToUpdate);

    expect(mockedPrisma.addresses.findUnique).toHaveBeenCalledWith({
      where: { id: addressId },
    });
    expect(mockedPrisma.addresses.update).toHaveBeenCalledWith({
      where: { id: addressId },
      data: {
        receiver: dataToUpdate.receiver || addresses[0].receiver,
        street: dataToUpdate.street || addresses[0].street,
        subdistrict: dataToUpdate.subdistrict || addresses[0].subdistrict,
        district: dataToUpdate.district || addresses[0].district,
        city: dataToUpdate.city || addresses[0].city,
        province: dataToUpdate.province || addresses[0].province,
        postalCode: dataToUpdate.postalCode || addresses[0].postalCode,
        phone: dataToUpdate.phone || addresses[0].phone,
      },
    });
    expect(result).toEqual({
      ...addresses[0],
      ...dataToUpdate,
    });
  });

  it("should throw error if address not found", async () => {
    mockedPrisma.addresses.findUnique.mockResolvedValue(null);

    await expect(
      EditAddressByIdService(addressId, dataToUpdate)
    ).rejects.toThrow(new AppError("Address not found", 404));

    expect(mockedPrisma.addresses.findUnique).toHaveBeenCalledWith({
      where: { id: addressId },
    });
    expect(mockedPrisma.addresses.update).not.toHaveBeenCalled();
  });
});

describe("SetDefaultAddressService", () => {
  beforeEach(() => {
    jest.resetAllMocks();

    mockedPrisma.addresses.findUnique.mockResolvedValue({
      ...addresses[0],
      userId,
    });
    mockedPrisma.$transaction.mockImplementation(
      async (callback: any) => await callback(mockedPrisma)
    );
    mockedPrisma.addresses.updateMany.mockResolvedValue({ count: 1 });
    mockedPrisma.addresses.update.mockResolvedValue({
      ...addresses[0],
      isDefault: true,
    });
  });

  it("should set address to default with addressId and userId provided", async () => {
    const result = await SetDefaultAddressService(addressId, userId);

    expect(mockedPrisma.addresses.findUnique).toHaveBeenCalledWith({
      where: { id: addressId },
    });
    expect(mockedPrisma.$transaction).toHaveBeenCalled();
    expect(mockedPrisma.addresses.updateMany).toHaveBeenCalledWith({
      where: {
        userId,
        id: { not: addressId },
      },
      data: { isDefault: false },
    });
    expect(mockedPrisma.addresses.update).toHaveBeenCalledWith({
      where: { id: addressId },
      data: { isDefault: true },
    });
    expect(result).toEqual({
      ...addresses[0],
      isDefault: true,
    });
  });

  it("should throw error if address not found", async () => {
    mockedPrisma.addresses.findUnique.mockResolvedValue(null);

    await expect(SetDefaultAddressService(addressId, userId)).rejects.toThrow(
      new AppError("Address not found", 404)
    );

    expect(mockedPrisma.addresses.findUnique).toHaveBeenCalledWith({
      where: { id: addressId },
    });
    expect(mockedPrisma.$transaction).not.toHaveBeenCalled();
  });

  it("should throw error if address belongs to different user", async () => {
    mockedPrisma.addresses.findUnique.mockResolvedValue({
      ...addresses[0],
      userId: "different-user-id",
    });

    await expect(SetDefaultAddressService(addressId, userId)).rejects.toThrow(
      new AppError("Address not found", 404)
    );

    expect(mockedPrisma.addresses.findUnique).toHaveBeenCalledWith({
      where: { id: addressId },
    });
    expect(mockedPrisma.$transaction).not.toHaveBeenCalled();
  });
});

describe("DeleteAddressByIdService", () => {
  beforeEach(() => {
    jest.resetAllMocks();

    mockedPrisma.addresses.findUnique.mockResolvedValue(addresses[0]);
    mockedPrisma.addresses.delete.mockResolvedValue(addresses[0]);
  });

  it("should delete address with coresponding id", async () => {
    await DeleteAddressByIdService(addressId);

    expect(mockedPrisma.addresses.findUnique).toHaveBeenCalledWith({
      where: { id: addressId },
    });
    expect(mockedPrisma.addresses.delete).toHaveBeenCalledWith({
      where: { id: addressId },
    });
  });

  it("should throw error if address not found", async () => {
    const notFoundError = new AppError("Address not found", 404);

    mockedPrisma.addresses.findUnique.mockResolvedValue(null);

    await expect(DeleteAddressByIdService(addressId)).rejects.toThrow(
      notFoundError
    );

    expect(mockedPrisma.addresses.findUnique).toHaveBeenCalledWith({
      where: { id: addressId },
    });
    expect(mockedPrisma.addresses.delete).not.toHaveBeenCalledWith();
  });
});
