import { UserRoles } from "@prisma/client";
import { IUser } from "../interfaces/authInterfaces";
import { mockedPrisma } from "./mockPrisma";
import { FindUserByEmail } from "../helper/findUserByEmail";

describe("find user by email", () => {
  it("should get user by email", async () => {
    const testUser: IUser = {
      id: "123456abc",
      email: "email@gmail.com",
      name: "name",
      password: "password@123",
      imageUrl: "image",
      isVerified: false,
      role: UserRoles.CUSTOMER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockedPrisma.users.findUnique.mockResolvedValue(testUser);

    const result = await FindUserByEmail("email@gmail.com");

    expect(mockedPrisma.users.findUnique).toHaveBeenCalledWith({
      where: { email: "email@gmail.com" },
    });

    expect(result).toEqual(testUser);
  });
});