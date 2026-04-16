# PrizeBond Backend API Documentation Hub

Welcome to the API documentation for the PrizeBond Backend. All endpoints are hosted at the following base URL:

**Base URL:** `http://52.0.177.84:3000/api/v1/local`

---

## 📖 API Categories
| Category | File | Description |
| --- | --- | --- |
| **Auth** | [auth.md](./auth.md) | Register, Login, OTP, Reset PIN, Profile (@me) |
| **Users** | [users.md](./users.md) | User profiles, listing, updates, and status management |
| **Admin** | [admin.md](./admin.md) | Admin-only dashboard actions (Approval/Rejection) |

---

## 🧵 How to Stitch All APIs (Frontend Strategy)

To build a complete user flow, follow this sequence:

### 1. The Authentication Flow
1.  **Register:** Call `POST /auth/register` to create a new account.
2.  **Login:** Call `POST /auth/login`. On success, you'll receive an `accessToken`.
3.  **Store Token:** Save the `accessToken` securely (e.g., SecureStore in Expo).
4.  **Authorized Requests:** For all other requests, add the token to the header:
    `Authorization: Bearer <your_token>`

### 2. The Password Reset Flow
1.  **Request Reset:** Call `POST /auth/send-otp` to get a 4-digit code in your email.
2.  **Verify OTP:** Call `POST /auth/verify-otp` with the 4-digit code.
3.  **Update Password:** Upon verification, call `POST /auth/reset-pin` with your new PIN.

### 3. The Management Flow (Admin)
1.  **Login:** Login as an `ADMIN` user to get a special `accessToken`.
2.  **List Users:** Call `GET /admin/user-management/users?status=PENDING` to see who needs approval.
3.  **Approve/Reject:** Call `PATCH /admin/user-management/users/:id/status` with `status: ACTIVE` or `REJECTED`.

---

## 🛠️ Global Error Response Format
All APIs use a standard error format if something goes wrong:
```json
{
  "statusCode": 400,
  "timestamp": "2026-04-02T10:00:00.000Z",
  "path": "/api/v1/local/...",
  "message": "Detailed error message"
}
```
