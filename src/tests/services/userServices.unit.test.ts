import cloudinary from "../../utils/cloudinary"; 
import bcrypt from "bcryptjs";
import { getPublicIdFromUrl } from "../../helper/fileUploadHelper"; 
import { AppError } from "../../utils/appError"; 

import {
  UploadProfileService,
  GetUserInfoService,
  EditUserInfoService,
  ChangeUserPasswordService,
} from "../../services/userServices"; 
import { mockedPrisma } from "../mockPrisma";

jest.mock("../../utils/cloudinary", () => ({
  uploader: {
    upload: jest.fn(),
  },
}));

jest.mock("bcryptjs", () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
}));

jest.mock("../../helper/fileUploadHelper", () => ({
  getPublicIdFromUrl: jest.fn(),
}));

const mockedGenSalt = bcrypt.genSalt as jest.Mock;
const mockedHash = bcrypt.hash as jest.Mock;
const mockedGetPublicId = getPublicIdFromUrl as jest.Mock;

beforeEach(() => {
  jest.resetAllMocks();
});

describe("UploadProfileService", () => {
  let dateNowSpy: jest.SpyInstance;

  beforeEach(() => {
    dateNowSpy = jest.spyOn(Date, "now").mockReturnValue(123456789);
  });

  afterEach(() => {
    dateNowSpy.mockRestore();
  });

  const mockUploadResult = { secure_url: "http://new.secure.url/image.jpg" };
  const mockUser: any = { id: "user-1", imageUrl: null };

  it("should upload a new image if user has no existing image", async () => {
    mockedPrisma.users.findUnique.mockResolvedValue(mockUser);
    (cloudinary.uploader.upload as jest.Mock).mockResolvedValue(
      mockUploadResult
    );

    await UploadProfileService("user-1", "data:uri...");

    expect(mockedPrisma.users.findUnique).toHaveBeenCalledWith({
      where: { id: "user-1" },
    });
    expect(mockedGetPublicId).not.toHaveBeenCalled(); // No existing URL, so not called

    expect(cloudinary.uploader.upload).toHaveBeenCalledWith("data:uri...", {
      public_id: "profile/profile_user-1_123456789",
      overwrite: true,
      folder: "profiles",
    });

    expect(mockedPrisma.users.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { imageUrl: mockUploadResult.secure_url },
    });
  });

  it("should overwrite an existing image if user has one", async () => {
    const userWithImage = {
      ...mockUser,
      imageUrl: "http://old.url/existing_id.jpg",
    };
    mockedPrisma.users.findUnique.mockResolvedValue(userWithImage);
    mockedGetPublicId.mockReturnValue("existing_id"); // Helper finds the old ID
    (cloudinary.uploader.upload as jest.Mock).mockResolvedValue(
      mockUploadResult
    );

    await UploadProfileService("user-1", "data:uri...");

    expect(mockedGetPublicId).toHaveBeenCalledWith(userWithImage.imageUrl);

    expect(cloudinary.uploader.upload).toHaveBeenCalledWith("data:uri...", {
      public_id: "existing_id", // Overwrites the old image
      overwrite: true,
      folder: "profiles",
    });
    expect(mockedPrisma.users.update).toHaveBeenCalledTimes(1);
  });

  it("should throw AppError 404 if user is not found", async () => {
    mockedPrisma.users.findUnique.mockResolvedValue(null);

    await expect(
      UploadProfileService("user-bad", "data:uri...")
    ).rejects.toThrow(new AppError("User not found", 404));
    expect(cloudinary.uploader.upload).not.toHaveBeenCalled();
  });
});

describe("GetUserInfoService", () => {
  it("should return a formatted user payload", async () => {
    const mockDbUser: any = {
      id: "user-1",
      email: "test@example.com",
      name: "Test User",
      role: "USER",
      isVerified: true,
      imageUrl: null,
      password: "hashed_password_should_not_be_returned", // Sensitive data
    };
    mockedPrisma.users.findUnique.mockResolvedValue(mockDbUser);

    const result = await GetUserInfoService("user-1");

    const expectedPayload = {
      id: "user-1",
      email: "test@example.com",
      name: "Test User",
      role: "USER",
      isVerified: true,
      imageUrl: null,
    };

    expect(result).toEqual(expectedPayload);
    expect(result).not.toHaveProperty("password");
  });

  it("should throw an Error if user is not found", async () => {
    mockedPrisma.users.findUnique.mockResolvedValue(null);

    await expect(GetUserInfoService("user-bad")).rejects.toThrow(
      "user not found"
    );
  });
});

describe("EditUserInfoService", () => {
  const existingUser = {
    id: "user-1",
    name: "Old Name",
    email: "old@example.com",
  };

  it("should update user info with partial data", async () => {
    const partialData = { name: "New Name" }; // Only updating the name
    const expectedUpdateData = {
      name: "New Name", // From partialData
      email: "old@example.com", // From existingUser (due to '||')
    };

    mockedPrisma.users.findUnique.mockResolvedValue(existingUser as any);
    mockedPrisma.users.update.mockResolvedValue({
      ...existingUser,
      ...partialData,
    } as any);

    await EditUserInfoService("user-1", partialData as any);

    expect(mockedPrisma.users.findUnique).toHaveBeenCalledWith({
      where: { id: "user-1" },
    });
    expect(mockedPrisma.users.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: expectedUpdateData, // Verify the merge logic
    });
  });

  it("should throw an Error if user is not found", async () => {
    mockedPrisma.users.findUnique.mockResolvedValue(null);

    await expect(
      EditUserInfoService("user-bad", { name: "a", email: "b" })
    ).rejects.toThrow("User not found");
    expect(mockedPrisma.users.update).not.toHaveBeenCalled();
  });
});

describe("ChangeUserPasswordService", () => {
  it("should hash and update a user's password", async () => {
    // 1. Setup
    mockedPrisma.users.findUnique.mockResolvedValue({ id: "user-1" } as any);
    mockedGenSalt.mockResolvedValue(10);
    mockedHash.mockResolvedValue("fake_hashed_password");

    // 2. Act
    await ChangeUserPasswordService("user-1", "new_password_123");

    // 3. Assert
    expect(mockedPrisma.users.findUnique).toHaveBeenCalledWith({
      where: { id: "user-1" },
    });
    expect(mockedGenSalt).toHaveBeenCalledWith(10);
    expect(mockedHash).toHaveBeenCalledWith(
      "new_password_123",
      10
    );
    expect(mockedPrisma.users.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { password: "fake_hashed_password" },
    });
  });

  it("should throw an Error if user is not found", async () => {
    mockedPrisma.users.findUnique.mockResolvedValue(null);

    await expect(
      ChangeUserPasswordService("user-bad", "new_pass")
    ).rejects.toThrow("User not found");
    expect(mockedHash).not.toHaveBeenCalled();
  });

  it("should throw AppError if hashing fails", async () => {
    mockedPrisma.users.findUnique.mockResolvedValue({ id: "user-1" } as any);
    mockedGenSalt.mockResolvedValue(10);
    mockedHash.mockResolvedValue(null as any); // Simulate hash returning null

    await expect(
      ChangeUserPasswordService("user-1", "new_pass")
    ).rejects.toThrow(new AppError("failed to hash password", 500));
  });
});
