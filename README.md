<h1 align="center">📦 PrizeBond App – Backend</h1>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS"/>
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma"/>
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black" alt="Swagger"/>
</p>

<p align="center">
  A production-ready, highly scalable RESTful API built for managing and drawing PrizeBonds. This system handles user portfolios, marketplace transactions, automated notifications, and secure administration.
</p>

---

## 🌟 Why I Built This

I built this project to demonstrate my ability to design and implement **enterprise-grade backend systems**. This application goes beyond basic CRUD by integrating real-world requirements such as **Role-Based Access Control (RBAC)**, **3rd-party API integrations** (Cloudinary, Firebase, Nodemailer), **complex relational databases**, and **clean architecture principles**. 

It showcases my proficiency in writing maintainable, secure, and well-documented code that is ready for production environments.

---

## 🚀 Key Features

- **🔐 Secure Authentication & Authorization**: JWT-based authentication with Passport.js, featuring secure password hashing (Bcrypt) and Role-Based Access Control (Admin vs. User).
- **💳 User Bond Portfolio**: Users can add, manage, and track their PrizeBonds seamlessly.
- **🛒 Marketplace System**: A robust marketplace for trading bonds, demonstrating complex transactional logic.
- **🎲 Automated Draws**: Logic for managing and executing PrizeBond draws, matching user bonds with winning numbers.
- **📄 PDF Parsing & File Uploads**: Integrated `pdf-parse` for document processing and `multer`/`Cloudinary` for media management.
- **📩 Real-time Notifications & Emails**: Push notifications via **Firebase Admin** and dynamic email routing with **Nodemailer** (supports SMTP fallback for dev environments).
- **📚 Comprehensive API Documentation**: Auto-generated Swagger UI integration for seamless frontend collaboration.

---

## 🛠 Tech Stack & Tools

- **Framework**: [NestJS](https://nestjs.com/) (Node.js)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Security & Validation**: Passport.js, JWT, Bcrypt, `class-validator`, `class-transformer`
- **Integrations**: Cloudinary (Image Hosting), Firebase Admin (Push Notifications), Nodemailer (Emails)

---

## 📐 Architecture & Best Practices

- **Modular Architecture**: Built leveraging NestJS's DI (Dependency Injection) container and modular structure, ensuring loose coupling and high cohesion.
- **Data Transfer Objects (DTOs)**: Strict input validation and serialization using `class-validator`.
- **Environment Configuration**: Centralized environment variable validation using `@nestjs/config`.
- **Database Migrations**: Version-controlled database schema management via Prisma Migrations.
- **Error Handling & Logging**: Consistent global exception filters and robust logging mechanisms.

### 📊 System Data Flow

```mermaid
graph TD
    Client["Client (Web / Mobile)"] -->|"REST API (HTTP)"| API["NestJS Application"]
    
    subgraph Backend Core
        API --> Auth["Auth Module (JWT)"]
        API --> Bonds["User Bonds Module"]
        API --> Draws["Draws & Logic Module"]
        API --> Market["Marketplace Module"]
        API --> Admin["Admin Module"]
    end
    
    Auth -->|"Read/Write"| DB[("PostgreSQL Database\n(via Prisma)")]
    Bonds -->|"Read/Write"| DB
    Draws -->|"Query & Update"| DB
    Market -->|"Transactions"| DB
    Admin -->|"Manage"| DB
    
    Draws -->|"Trigger"| Notify["Notifications Module"]
    Admin -->|"Trigger"| Notify
    
    subgraph External Services
        Notify -->|"Push Notifications"| Firebase["Firebase Cloud Messaging"]
        Notify -->|"Emails"| SMTP["SMTP Server (Nodemailer)"]
        Bonds -->|"Media/Images"| Cloudinary["Cloudinary"]
    end
```

---

## 📁 Project Structure

```text
prizebond-backend/
├── prisma/                 # Database schema and migrations
├── src/
│   ├── admin/              # Admin-specific controllers & services
│   ├── auth/               # JWT Authentication strategies & guards
│   ├── common/             # Global decorators, filters, and interceptors
│   ├── draws/              # PrizeBond draw logic
│   ├── marketplace/        # Bond trading platform logic
│   ├── notifications/      # Firebase & Email notification services
│   ├── user-bonds/         # User portfolio management
│   └── users/              # User profile & data management
└── ...
```

---

## ⚙️ Getting Started

### Prerequisites

Ensure you have the following installed:
- Node.js (v18+ LTS)
- PostgreSQL (v13+)
- npm or yarn

### 1. Clone & Install Dependencies

```bash
git clone <repository-url>
cd prizebond-backend
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory (use `.env.example` as a reference):

```ini
APP_PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/prizebond_db"

# JWT Auth
JWT_SECRET=supersecretkey
JWT_EXPIRES_IN=7d

# Email Service (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM="PrizeBond App <no-reply@prizebond.com>"

# Additional integrations (Firebase, Cloudinary) should be added as needed.
```

### 3. Database & Prisma Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev
```

*(Note: Use `npx prisma migrate deploy` for production environments)*

### 4. Running the Application

```bash
# Development mode
npm run start:dev

# Production build
npm run build
npm run start:prod
```

The server will be running at: `http://localhost:3000`

---

## 📘 API Documentation (Swagger)

Once the server is running, you can explore and test the API endpoints interactively via Swagger UI:

👉 **[http://localhost:3000/api/docs](http://localhost:3000/api/docs)**

---

## 📧 Email Sending Behavior

This project includes a robust email notification system. The behavior adapts automatically based on environment variables:

- **SMTP Enabled**: If all `SMTP_*` variables are present, real emails are sent using Nodemailer.
- **Development Fallback (SMTP Disabled)**: If variables are missing (e.g., local dev), the system prevents crashes, safely skips SMTP sending, and instead logs the full HTML email content to the console for easy debugging.

---

## 👨‍💻 Author

**Muhammad Absar**  
*Backend Developer – NestJS | PostgreSQL | Prisma*

This project reflects my commitment to building clean, scalable, and resilient backend systems. I am actively looking for software engineering roles where I can bring value through robust architecture and modern web technologies. 

---

## 📄 License

For educational and internal use only.
