# 📦 PrizeBond App – Backend

A production-ready backend application built with **NestJS**, **PostgreSQL**, and **Prisma ORM**.  
This README explains how to set up, run, and share the project when distributing it as a ZIP file.

---

## 🚀 Tech Stack

- Node.js (LTS)
- NestJS
- PostgreSQL
- Prisma ORM
- JWT Authentication
- Swagger API Documentation

---

## 📁 Project Structure

```
prizebond-backend/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── auth/
│   ├── users/
│   ├── admin/
│   ├── common/
│   ├── config/
│   ├── app.module.ts
│   └── main.ts
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

---

## ⚙️ Prerequisites

Ensure the following are installed:

- Node.js >= 18
- PostgreSQL >= 13
- npm or yarn

Check versions:
```
node -v
npm -v
psql --version
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory using `.env.example`.

Example:
```
APP_PORT=3000
NODE_ENV=development

DATABASE_URL="postgresql://postgres:password@localhost:5432/prizebond_db"

JWT_SECRET=supersecretkey
JWT_EXPIRES_IN=7d
```

---

## 🗄️ Database & Prisma Setup

Install dependencies:
```
npm install
```

Generate Prisma Client:
```
npx prisma generate
```

Run migrations:
```
npx prisma migrate deploy
```

(For development)
```
npx prisma migrate dev
```

---

## ▶️ Running the Project

Development mode:
```
npm run start:dev
```

Production mode:
```
npm run build
npm run start:prod
```

Server runs at:
```
http://localhost:3000
```

---

## 📘 API Documentation (Swagger)

Access Swagger UI at:
```
http://localhost:3000/api/docs
```

---

## 🔑 Authentication

- Login/Register returns JWT token
- Use token in headers:
```
Authorization: Bearer <TOKEN>
```

---

## 📦 How to Run After Receiving ZIP

1. Unzip the project
2. Open terminal in project folder
3. Install dependencies:
   ```
   npm install
   ```
4. Create `.env` file
5. Setup database:
   ```
   npx prisma generate
   npx prisma migrate deploy
   ```
6. Start server:
   ```
   npm run start:dev
   ```

---

## ❗ Common Issues

**Prisma error**
```
npx prisma generate
```

**Database connection failed**
- Check DATABASE_URL
- Ensure PostgreSQL is running

---

## 👨‍💻 Author

Muhammad Absar  
Backend Developer – NestJS | PostgreSQL | Prisma

---

## 📄 License

For educational and internal use only.

## Email Sending Behavior (SMTP & Fallback Logging)

This project includes an email notification system that sends emails when admins perform actions (e.g. user approval, rejection, suspension).

The behavior automatically changes based on environment variables.

## When Emails ARE Sent (SMTP Enabled)

Emails are sent only if all required SMTP environment variables are present.

Add the following to your .env file:

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM="PrizeBond App <no-reply@prizebond.com>"

When these variables are configured:

Real emails are sent using SMTP

EmailService logs:

📧 Email service ENABLED (SMTP configured)
📧 Email sent to user@email.com

## When Emails Are NOT Sent (SMTP Disabled)

If any SMTP environment variable is missing, emails will NOT be sent.

This commonly happens in:

Local development

Testing environments

CI pipelines

Instead of sending emails, the system will:

❌ Skip SMTP sending

✅ Log the full email content to the console

## Example console output:

📧 Email service DISABLED (SMTP env missing)
📨 Email NOT sent (development mode)
----------------------------------------
FROM: PrizeBond App <no-reply@localhost>
TO: user@email.com
SUBJECT: Your account has been approved
BODY (HTML):
<p>Your account is now active. You can log in and start using the app.</p>
----------------------------------------
