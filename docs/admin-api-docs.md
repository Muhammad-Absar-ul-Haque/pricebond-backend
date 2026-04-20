# PrizeBond Admin Panel API Documentation

This document provides technical details for the PrizeBond Backend APIs specifically designed for the Admin Panel.

## 📡 General Information

- **Base URL**: `http://52.0.177.84:3000/api/v1/local`

---

## 🔐 Authentication APIs

### 1. Admin Login

**Endpoint**: `POST /auth/login`
**Description**: Authenticates the admin and returns a JWT token.

**Request Body**:

```json
{
  "email": "admin@example.com",
  "pin": "1234"
}
```

**Successful Response (200 OK)**:

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@example.com",
    "role": "ADMIN"
  }
}
```

---

## 👥 User Management APIs

Base URL: `/admin/user-management`

### 1. List Users

**Endpoint**: `GET /admin/user-management/users`
**Description**: Fetches all users, optionally filtered by their registration status.

**Query Parameters**:

- `status` (optional): `PENDING`, `ACTIVE`, `REJECTED`.

**Response (200 OK)**:

```json
[
  {
    "id": 2,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "mobile": "03001234567",
    "city": "Lahore",
    "status": "PENDING",
    "createdAt": "2024-04-20T10:00:00.000Z"
  }
]
```

### 2. Update User Status (Approve/Reject)

**Endpoint**: `PATCH /admin/user-management/users/:id/status`
**Description**: Approves or rejects a user registration.

**Path Parameters**:

- `id`: The User ID.

**Request Body**:

```json
{
  "status": "ACTIVE"
}
```

_(Status can be `ACTIVE` or `REJECTED`)_

---

## 📝 Draw Management APIs

Base URL: `/admin/draws`

### 1. Create a New Draw

**Endpoint**: `POST /admin/draws`
**Description**: Initializes a new draw in the system.

**Request Body**:

```json
{
  "drawNumber": "98",
  "date": "2024-05-15",
  "city": "Karachi",
  "denomination": 100
}
```

### 2. List All Draws

**Endpoint**: `GET /admin/draws`
**Description**: Lists all draws with their winner counts.

**Query Parameters**:

- `denomination` (optional): Filter by bond amount.

**Response (200 OK)**:

```json
[
  {
    "id": 1,
    "drawNumber": "97",
    "date": "2024-03-15T00:00:00.000Z",
    "city": "Multan",
    "denomination": 200,
    "resultFileUrl": "https://...",
    "_count": {
      "winningNumbers": 2400
    }
  }
]
```

### 3. Import Draw Results (PDF Upload)

**Endpoint**: `POST /admin/draws/:id/import-results`
**Description**: Uploads the official PDF result file. The backend will parse the PDF, extract winning numbers, store them, and trigger an automatic "Winner Scrutiny" for all users.

**Content-Type**: `multipart/form-data`

**Form-Data Fields**:

- `file`: The PDF file.
- `resultFileUrl` (optional): A pre-signed cloud URL if the file was already uploaded to S3/Cloudinary.

**Response (201 Created)**:

```json
{
  "message": "Results imported and scrutiny complete",
  "stats": {
    "total": 2400,
    "first": 1,
    "second": 3,
    "third": 2396,
    "newUserWinners": 5
  },
  "resultFileUrl": "..."
}
```

### 4. Get Draw Detail

**Endpoint**: `GET /admin/draws/:id`
**Description**: Fetches detailed information about a specific draw, including its winning numbers (limited preview) and result PDF status.

**Path Parameters**:

- `id`: The Draw ID.

**Response (200 OK)**:

```json
{
  "id": 1,
  "drawNumber": "97",
  "date": "2024-03-15T00:00:00.000Z",
  "city": "Multan",
  "denomination": 200,
  "resultFileUrl": "https://...",
  "_count": {
    "winningNumbers": 2400
  },
  "winningNumbers": [
    {
      "id": 101,
      "serial": "123456",
      "prizeTier": "FIRST",
      "prizeAmount": 750000,
      "drawId": 1,
      "createdAt": "..."
    }
  ]
}
```

### 5. Delete Draw PDF & Results

**Endpoint**: `DELETE /admin/draws/:id/pdf`
**Description**: Removes the uploaded result PDF and deletes all associated winning numbers for this draw. Useful if the wrong PDF was uploaded or results need to be cleared.

**Path Parameters**:

- `id`: The Draw ID.

**Response (200 OK)**:

```json
{
  "message": "Results PDF and associated winning numbers deleted successfully"
}
```

---

## 🔔 Notifications API (For Testing Admin actions)

_Admin can verify notifications are working by checking these if logged in as a test user._

- `GET /notifications`: List inbox.
- `PATCH /notifications/:id/read`: Mark as read.

---

## ⚠️ Important Notes for AI Developer

1. **Authorization**: Every request (except Login) must include the `Authorization` header with the Bearer token.
2. **Error Handling**: The backend returns standardized error messages. If you get a 401, the token has expired.
3. **Roles**: Ensure the frontend checks the `user.role` from the login response. Only `role === 'ADMIN'` can access the `/admin/*` routes.
4. **PDF Upload**: The Import Results endpoint uses `multipart/form-data`. Ensure your file picker correctly sends the `file` field.
