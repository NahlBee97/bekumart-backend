import request from "supertest";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import app from "../../index";

const prisma = new PrismaClient();

describe("Auth API: /api/auth", () => {
  it("POST /register - should register a new user successfully", async () => {
    const newUser = {
      name: "Test User",
      email: "test@example.com",
      password: "Password@123",
    };

    const response = await request(app)
      .post("/api/auth/register")
      .send(newUser);

    expect(response.status).toBe(201);
    expect(response.body.message).toEqual("New user created successfully");

    const userInDb = await prisma.users.findUnique({
      where: { email: newUser.email },
    });

    expect(userInDb).not.toBeNull();
    expect(userInDb?.name).toBe(newUser.name);

    expect(userInDb?.password).not.toBe(newUser.password);
    const isPasswordHashed = await bcrypt.compare(
      newUser.password,
      userInDb?.password || ""
    );
    expect(isPasswordHashed).toBe(true);
  });

  // 4. THE "ERROR PATH" TEST
//   it("POST /register - should return 400 if email is already taken", async () => {
//     // ARRANGE: Create a user in the database first
//     await prisma.users.create({
//       data: {
//         name: "Existing User",
//         email: "existing@example.com",
//         password: "hashedpassword",
//       },
//     });

//     const duplicateUser = {
//       name: "Another User",
//       email: "existing@example.com", // Same email
//       password: "password456",
//     };

//     // ACT: Send the request
//     const response = await request(app)
//       .post("/api/auth/register")
//       .send(duplicateUser);

//     // ASSERT: Check for the 400 Bad Request error
//     expect(response.status).toBe(400);
//     expect(response.body.message).toContain(
//       "User with this email already exists"
//     );
//   });

  // You would add more tests for validation (e.g., "should return 400 if email is invalid")
});
