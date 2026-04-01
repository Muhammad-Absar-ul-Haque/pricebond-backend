# Admin User Management API Documentation

Base URL: `http://52.0.177.84:3000/api/v1/local`

This suite of APIs allows administrators to manage user registrations, review pending accounts, and approve or reject users for system access.

---

## 1. List Users by Status (Filtered)
Retrieves a list of users, typically used in an admin dashboard to show "New Requests" (PENDING) or "Active Users".

- **URL:** `/admin/user-management/users`
- **Method:** `GET`
- **Auth Required:** Yes (**Bearer Token**)
- **Target User Role:** `ADMIN`
- **Query Parameters:**
  - `status`: (Optional) `PENDING`, `ACTIVE`, `REJECTED`.
- **Success Response (200 OK):**
  ```json
  [
    {
      "id": "cuid_user_123",
      "firstName": "Alice",
      "lastName": "Johnson",
      "email": "alice@example.com",
      "mobile": "03001234567",
      "city": "Karachi",
      "status": "PENDING",
      "createdAt": "2024-04-01T10:00:00.000Z"
    }
  ]
  ```

---

## 2. Update User Status (Approve/Reject)
Changes a user's status. **Note:** Once a user is moved from `PENDING` to `ACTIVE`, they will be able to log in to the app for the first time.

- **URL:** `/admin/user-management/users/:id/status`
- **Method:** `PATCH`
- **Auth Required:** Yes (**Bearer Token**)
- **Target User Role:** `ADMIN`
- **Path Parameters:**
  - `id`: The CUID or ID of the user.
- **Request Body (JSON):**
  ```json
  {
    "status": "ACTIVE"
  }
  ```
  *(Options for status: `PENDING`, `ACTIVE`, `REJECTED`)*
- **Success Response (200 OK):**
  ```json
  {
    "message": "User status updated successfully",
    "userId": "cuid_user_123",
    "status": "ACTIVE"
  }
  ```

---

## 🏗️ Implementation Guide for Frontend AI

### The Admin Workflow Flow
1.  **Dashboard View:** The frontend should call `GET /admin/user-management/users?status=PENDING` to populate a table of new registration requests.
2.  **User Details:** The admin can see the names and contact info in the list.
3.  **Action (Approve/Reject):**
    *   **Approve:** Send a `PATCH` request with body `{ "status": "ACTIVE" }`.
    *   **Reject:** Send a `PATCH` request with body `{ "status": "REJECTED" }`.
4.  **Automatic Feedback:** The backend is configured to **automatically send an email** to the user once their status is changed to `ACTIVE` or `REJECTED`, notifying them of the result.

### Critical Security Note
These APIs are protected by both a `JwtAuthGuard` (token verification) and a `RolesGuard`. If a user with the role of `USER` tries to call these, they will receive a **403 Forbidden** error. Ensure you are logged in as an `ADMIN` to test these.
