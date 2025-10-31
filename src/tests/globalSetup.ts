// tests/globalSetup.ts
import { config } from "dotenv";

export default async () => {
  // Load environment variables from .env.test
  config({ path: ".env.test" });

  console.log("Using test database URL:", process.env.DATABASE_URL);

  // You could also run migrations here
  // execSync('npx prisma migrate reset --force');
};
