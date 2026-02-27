# 🏆 PrizeBond PK — NestJS Backend

Complete backend API with JWT auth, Prisma ORM, and PostgreSQL.

---

## 📁 Project Structure

```
prizebond-backend/
├── src/
│   ├── main.ts                          # Entry point
│   ├── app.module.ts                    # Root module
│   ├── auth/
│   │   ├── dto/auth.dto.ts              # All request DTOs with validation
│   │   ├── auth.controller.ts           # Route handlers
│   │   ├── auth.service.ts              # Business logic
│   │   ├── auth.module.ts               # Auth module
│   │   └── jwt.strategy.ts              # JWT Passport strategy
│   ├── users/
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   ├── prisma/
│   │   ├── prisma.service.ts            # PrismaClient wrapper
│   │   └── prisma.module.ts             # Global Prisma module
│   └── common/
│       ├── guards/jwt-auth.guard.ts     # JWT Guard
│       └── decorators/current-user.decorator.ts
├── prisma/
│   └── schema.prisma                    # Database schema
├── .env                                 # Environment variables
└── package.json
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18+
- PostgreSQL installed and running
- npm or yarn

### Step 1 — Install dependencies
```bash
npm install
```

### Step 2 — Configure environment
Edit `.env` file:
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/prizebond?schema=public"
JWT_SECRET="your-super-secret-key"
JWT_EXPIRES_IN="7d"
PORT=3000
```
Replace `yourpassword` with your PostgreSQL password.

### Step 3 — Create database
In PostgreSQL, create the database:
```sql
CREATE DATABASE prizebond;
```

### Step 4 — Run Prisma migration
```bash
npx prisma migrate dev --name init
```

### Step 5 — Generate Prisma client
```bash
npx prisma generate
```

### Step 6 — Start the server
```bash
npm run start:dev
```

Server runs at: `http://localhost:3000/api`

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login + get JWT token |
| POST | `/api/auth/send-otp` | ❌ | Send OTP to email (mock) |
| POST | `/api/auth/verify-otp` | ❌ | Verify OTP code |
| POST | `/api/auth/reset-pin` | ❌ | Reset PIN after OTP verify |
| GET | `/api/auth/me` | ✅ JWT | Get current user profile |
| GET | `/api/users` | ✅ JWT | List all users |
| GET | `/api/users/:id` | ✅ JWT | Get user by ID |

---

## 📋 Request & Response Examples

### Register
```
POST /api/auth/register
{
  "firstName": "Ali",
  "lastName": "Khan",
  "email": "ali@example.com",
  "mobile": "03001234567",
  "pin": "1234",
  "confirmPin": "1234",
  "address": "House 12, Street 4",
  "city": "Karachi",
  "role": "USER"
}
```

### Login
```
POST /api/auth/login
{ "email": "ali@example.com", "pin": "1234" }

Response: { "success": true, "token": "eyJ...", "user": { ... } }
```

### Send OTP
```
POST /api/auth/send-otp
{ "email": "ali@example.com" }
// OTP printed to server console
```

### Verify OTP
```
POST /api/auth/verify-otp
{ "email": "ali@example.com", "otp": "4567" }
```

### Reset PIN
```
POST /api/auth/reset-pin
{ "email": "ali@example.com", "newPin": "5678", "confirmPin": "5678" }
```

### Get Me (Protected)
```
GET /api/auth/me
Headers: { Authorization: "Bearer eyJ..." }
```

---

## 🔒 Security Notes
- PINs are hashed with bcrypt (10 salt rounds)
- JWT tokens expire in 7 days
- OTP codes expire in 5 minutes
- Sensitive fields (pin, otpCode) never returned in responses
- OTP fields cleared after successful PIN reset
