# Food Delivery Application (404)

This is a comprehensive full-stack Food Delivery application. It allows users to order food from various restaurants, couriers to manage and deliver orders, restaurant owners to manage their menus, and an admin panel for overall system oversight.

## Technology Stack
- **Backend**: Java 21, Spring Boot (Spring Security, Spring Data JPA)
- **Frontend**: React.js, Node.js 20
- **Database**: MySQL 8
- **Containerization**: Docker & Docker Compose

## Features
- **Admin**: Oversee the entire platform, view metrics, and manage complaints.
- **Customer**: Browse restaurants, search by cuisine or delivery type, add items to cart, place orders, make payments, and favorite restaurants.
- **Restaurant Owner**: Manage restaurant profile, add/remove/edit menu items, view incoming orders, and change restaurant status (open/closed).
- **Courier**: View available deliveries, accept orders, and manage active deliveries.

## Quick Start (Docker)

The easiest way to run the application is using Docker Compose. Make sure you have Docker Desktop or Docker Engine installed on your machine.

1. **Clone the repository** and navigate to the root directory `404/`.
2. **Start the containers** in detached mode:
   ```bash
   docker compose up -d --build
   ```
3. Docker will build the backend and frontend images, and start the MySQL database. Wait a minute or two for the services (especially the database and backend) to fully initialize.

### Useful Links
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8080](http://localhost:8080)

## Seeded Data
If you start the backend with an empty database, a `DataSeeder` automatically provisions the system with several test accounts and restaurants. You can use these accounts to log in and test the application immediately:

- **Admin Account**: `admin` / `admin`
- **Customer Account**: `user1` / `user1`
- **Courier Account**: `courier1` / `courier1`

Additionally, **10 Restaurants** (e.g., Pizza Place, Burger Joint) are created and seeded with 3 menu items each. You can log into their profiles using emails like `pizza@demo.com` and password `pass1`.

## Manual Setup (Without Docker)

If you prefer to run the application locally without Docker:

### Prerequisites
- JDK 21
- Node.js (v18+)
- MySQL Server (running on port 3306)

### Database Setup
1. Create a MySQL database named `user_db`.
2. Update the `application.properties` file strictly with your MySQL credentials (if they differ from root/password).

### Running the Backend
Navigate to `backend/delivery_backend` and run:
   ```bash
   mvn spring-boot:run
   ```
Or build the jar and execute it manually. It will run on `http://localhost:8080`.

### Running the Frontend
Navigate to `frontend/delivery_frontend` and run:
   ```bash
   npm install
   npm start
   ```
It will run on `http://localhost:3000`.

## Troubleshooting

- **Database Connection Issues**: Make sure your local MySQL instance has the correct credentials and permissions if running outside of Docker. If running Docker, make sure port `3306` is not already occupied by a local MySQL process.
- **React Compilation Errors**: Ensure you have installed the dependencies correctly via `npm install` inside the frontend directory before running `npm start`.

---
*Developed for 404 Project.*
