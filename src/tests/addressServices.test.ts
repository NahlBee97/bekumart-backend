import {
  CreateAddressService,
  DeleteAddressByIdService,
  EditAddressByIdService,
  GetAddressesByUserIdService,
  SetDefaultAddressService,
} from "../services/addressServices";
import { AppError } from "../utils/appError";
import {
  addresses,
  addressId,
  dataToUpdate,
  newAddress,
  userId,
} from "./addressConstant";
import { mockedPrisma } from "./mockPrisma";

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

  it("should throw error if get addresses fails", async () => {
    const dbError = new Error("Database connection error");

    mockedPrisma.addresses.findMany.mockRejectedValue(dbError);

    await expect(GetAddressesByUserIdService(userId)).rejects.toThrow(
      new AppError("Can not get addresses", 500)
    );

    expect(mockedPrisma.addresses.findMany).toHaveBeenCalledWith({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
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

  it("should throw error if update other address fails", async () => {
    mockedPrisma.addresses.updateMany.mockImplementation(() => {
      throw Error;
    });

    await expect(
      CreateAddressService(userId, { ...newAddress })
    ).rejects.toThrow(AppError);

    expect(mockedPrisma.$transaction).toHaveBeenCalled();
    expect(mockedPrisma.addresses.updateMany).toHaveBeenCalledWith({
      where: {
        userId,
      },
      data: { isDefault: false },
    });
    expect(mockedPrisma.addresses.create).not.toHaveBeenCalled();
  });

  it("should throw error if create new address fails", async () => {
    mockedPrisma.addresses.create.mockImplementation(() => {
      throw Error;
    });

    await expect(
      CreateAddressService(userId, { ...newAddress })
    ).rejects.toThrow(AppError);

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

  it("should throw error if update address fails", async () => {
    const dbError = new AppError("Failed to update address", 500);
    mockedPrisma.addresses.update.mockRejectedValue(new Error("DB Error"));

    await expect(
      EditAddressByIdService(addressId, dataToUpdate)
    ).rejects.toThrow(dbError);

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

  it("should throw error if error finding address", async () => {
    const findError = new Error("Database error");
    mockedPrisma.addresses.findUnique.mockRejectedValue(findError);

    await expect(SetDefaultAddressService(addressId, userId)).rejects.toThrow(
      new AppError("Error finding address.", 500)
    );

    expect(mockedPrisma.addresses.findUnique).toHaveBeenCalledWith({
      where: { id: addressId },
    });
    expect(mockedPrisma.$transaction).not.toHaveBeenCalled();
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

  it("should throw error if updateMany addresses to false fails", async () => {
    const updateError = new Error("Update failed");
    mockedPrisma.addresses.updateMany.mockRejectedValue(updateError);

    await expect(SetDefaultAddressService(addressId, userId)).rejects.toThrow(
      new AppError("Could not set default address.", 500)
    );

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
    expect(mockedPrisma.addresses.update).not.toHaveBeenCalled();
  });

  it("should throw error if update address to default fails", async () => {
    const updateError = new Error("Update failed");
    mockedPrisma.addresses.update.mockRejectedValue(updateError);

    await expect(SetDefaultAddressService(addressId, userId)).rejects.toThrow(
      new AppError("Could not set default address.", 500)
    );

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

  it("should throw error if error finding address", async () => {
    const findError = new Error("Database error");

    mockedPrisma.addresses.findUnique.mockImplementation(() => {
      throw findError;
    });

    await expect(DeleteAddressByIdService(addressId)).rejects.toThrow(
      new AppError("Error finding address.", 500)
    );

    expect(mockedPrisma.addresses.findUnique).toHaveBeenCalledWith({
      where: { id: addressId },
    });
    expect(mockedPrisma.addresses.delete).not.toHaveBeenCalledWith();
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

  it("should throw error if fail to delete address", async () => {
    const deleteError = new AppError("Could not delete address", 500);

    mockedPrisma.addresses.delete.mockImplementation(() => {
      throw deleteError;
    });

    await expect(DeleteAddressByIdService(addressId)).rejects.toThrow(
      deleteError
    );

    expect(mockedPrisma.addresses.findUnique).toHaveBeenCalledWith({
      where: { id: addressId },
    });
    expect(mockedPrisma.addresses.delete).toHaveBeenCalledWith({
      where: { id: addressId },
    });
  });
});
