# BekuMart API (Backend)

This is the backend server for BekuMart, a full-stack frozen food e-commerce platform. It is a robust Node.js API built with Express, TypeScript, and Prisma, designed to be deployed as a serverless function on Vercel.

[Frontend Client Repo](https://github.com/NahlBee97/bekumart-frontend)

---

### ## ✨ Core Features

* **Secure JWT Authentication:** Implements a high-security auth system using short-lived access tokens and **HttpOnly refresh cookies** to prevent XSS attacks.
* **Live Payment Integration:** Securely creates payment transactions with the **Midtrans** payment gateway and verifies payment success using webhooks.
* **Advanced Business Logic:** Features a dynamic, distance-based delivery fee calculator that uses order weight and customer distance.
* **Integrate Rajaongkir:** Integrated rajaongkir public API to get delivery fee and indonesia regional data.
* **Role-Based Access Control:** Differentiates between `CUSTOMER` and `ADMIN` roles using a custom middleware, protecting sensitive admin endpoints.
* **Full CRUD Functionality:** Complete API for managing users, products, categories, carts, and orders.
* **Database Management:** Uses **Prisma** as an ORM for type-safe database queries against a PostgreSQL (Supabase) database.
* **Redis:** Cache the regional and shipping fee data to prevent over request to rajaongkir API.
* **Unit Tested:** Core business logic (services) is covered by a comprehensive **Jest** unit test suite.

---

### ## 💻 Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Language:** TypeScript
* **Database/ORM:** Prisma & PostgreSQL (hosted on Supabase)
* **Authentication:** JSON Web Tokens (JWT), bcrypt
* **Caching:** Redis
* **Delivery Fee:** Rajaongkir API
* **Payments:** Midtrans
* **Testing:** Jest
* **Deployment:** Vercel

---

### ## 📡 API Endpoints

Overview of the API routes:

* `/api/auth` 
* `/api/products`
* `/api/carts` 
* `/api/orders` 
* `/api/shipping-cost` 
* `/api/dashboard`
* `/api/reviews` 

---

### ## 🛠️ Running Locally

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/bekumart-backend.git](https://github.com/your-username/bekumart-backend.git)
    cd bekumart-backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root (you can copy `.env.example`).
    ```env
    DATABASE_URL="your_supabase_connection_string"
    JWT_ACCESS_SECRET="your_secret_key"
    JWT_REFRESH_SECRET="your_other_secret_key"
    MIDTRANS_SERVER_KEY="your_sandbox_server_key"
    FRONTEND_URL="http://localhost:3000"
    ```

4.  **Sync the database:**
    Apply all migrations to your database.
    ```bash
    npx prisma migrate deploy
    ```

5.  **Run the development server:**
    ```bash
    npm run dev
    ```

### ## 🧪 Testing

This project includes a full unit test suite for the backend.

```bash
npm test