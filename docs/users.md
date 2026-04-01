# Users API Documentation

Base URL: `http://52.0.177.84:3000/api/v1/local`

---

## 1. List All Users (Admin)
Returns a list of all users in the system.

- **URL:** `/users`
- **Method:** `GET`
- **Auth Required:** Yes (**Bearer Token**)
- **Target User Role:** `ADMIN`
- **Success Response (200 OK):**
  ```json
  [
    { "id": "...", "email": "...", "firstName": "...", "lastName": "...", "role": "...", "status": "ACTIVE" }
  ]
  ```

---

## 2. Get User By ID
Returns detailed profile information for a specific user.

- **URL:** `/users/:id`
- **Method:** `GET`
- **Auth Required:** Yes (**Bearer Token**)
- **Path Parameters:**
  - `id`: The CUID or ID of the user.
- **Success Response (200 OK):**
  ```json
  {
    "id": "...",
    "email": "...",
    "firstName": "...",
    "lastName": "...",
    "mobile": "...",
    "role": "...",
    "status": "ACTIVE"
  }
  ```

---

## 3. Update User Profile Details
Updates specific profile fields for a user.

- **URL:** `/users/:id`
- **Method:** `PATCH`
- **Auth Required:** Yes (**Bearer Token**)
- **Path Parameters:**
  - `id`: The CUID or ID of the user to update.
- **Request Body (JSON):**
  ```json
  {
    "firstName": "Alice (Updated)",
    "lastName": "Johnson",
    "mobile": "03009876543",
    "address": "456 Side St",
    "city": "Lahore"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "id": "...",
    "firstName": "Alice (Updated)",
    "lastName": "Johnson",
    "email": "...",
    "mobile": "03009876543",
    "address": "456 Side St",
    "city": "Lahore",
    "role": "USER",
    "updatedAt": "..."
  }
  ```

---

## 4. Update User Status (Approve/Reject)
Allows an Administrator to change the status of a user (e.g., from PENDING to ACTIVE).

- **URL:** `/admin/user-management/users/:id/status`
- **Method:** `PATCH`
- **Auth Required:** Yes (**Bearer Token**)
- **Target User Role:** `ADMIN`
- **Path Parameters:**
  - `id`: The CUID or ID of the user to update.
- **Request Body (JSON):**
  ```json
  {
    "status": "ACTIVE"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "id": "...",
    "status": "ACTIVE",
    "message": "User status updated successfully"
  }
  ```
