# Prize Bond System: API Documentation

All API requests must be sent with `Content-Type: application/json` unless otherwise specified. Authentication is required for User and Admin endpoints.

---

## 🏗️ 1. Public APIs

These endpoints are unauthenticated and designed for the mobile app's landing/search pages.

### `GET /results`

**Description**: Lists all historical draws. Supports filtering by denomination.

- **Query Params**: `denomination` (Optional - Number)
- **Response**: `200 OK`
  ```json
  [
    {
      "id": "cuid123",
      "drawNumber": "102",
      "date": "2024-04-15",
      "city": "Karachi",
      "denomination": 750,
      "fileUrl": "https://..."
    }
  ]
  ```

### `GET /results/check`

**Description**: Checks if a single 6-digit serial number has won in any draw for a specific denomination.

- **Query Params**: `serial` (6 digits), `denomination` (Number)
- **Response**: `200 OK`
  ```json
  {
    "isWinner": true,
    "message": "Congratulations! Your number 123456 has won.",
    "wins": [
      {
        "drawNumber": "102",
        "drawDate": "2024-03-01",
        "prizeTier": "FIRST",
        "prizeAmount": 750000
      }
    ]
  }
  ```

---

## 👑 2. Admin APIs (Auth Required)

Endpoint access restricted to users with `role: 'ADMIN'`.

### `POST /admin/draws`

**Description**: Registers a new draw event.

- **Body**:
  ```json
  {
    "drawNumber": "105",
    "date": "2024-06-01",
    "city": "Multan",
    "denomination": 1500
  }
  ```

### `POST /admin/draws/:id/import-results`

**Description**: Accepts an official PDF and extracts winners automatically.

- **Content-Type**: `multipart/form-data`
- **Body**: `file` (Binary PDF file)
- **Database Action**:
  1. Truncates any existing winners for this Draw ID.
  2. Bulk-inserts extracted serials into `WinningNumber` table.
  3. Triggers **Scrutiny Service** to update user bonds.
- **Response**: Returns stats on found winners and updated user bonds.

---

## 📱 3. User APIs (Auth Required)

Endpoint access restricted to logged-in users.

### `POST /my-bonds`

**Description**: Adds a physical bond to the user's digital wallet.

- **Body**:
  ```json
  {
    "serial": "098765",
    "denomination": 750
  }
  ```
- **Logic**: Automatically checks against the winner database upon saving and sets status to `WINNER` if a match exists.

### `GET /my-bonds`

**Description**: Lists all bonds in the user's portfolio with their current win status.

- **Response**:
  ```json
  [
    {
      "id": "bond_id_1",
      "serial": "098765",
      "status": "WINNER",
      "denomination": 750,
      "createdAt": "..."
    }
  ]
  ```

### `DELETE /my-bonds/:id`

**Description**: Removes a bond from the user's tracking list.

---

## 🏪 4. Marketplace APIs (Auth Required)

All marketplace endpoints require a valid JWT token.

### `POST /marketplace/create`

**Description**: Create a new marketplace listing for a prize bond.

- **Body**:
  ```json
  {
    "serial": "123456",
    "denomination": 750,
    "bondDetails": "Optional notes about the bond"
  }
  ```
- **Response**: `201 Created` — Returns the created listing with seller info.

### `GET /marketplace`

**Description**: Fetch all currently `ACTIVE` marketplace listings.

- **Response**: `200 OK`
  ```json
  [
    {
      "id": "listing_id",
      "serial": "123456",
      "denomination": 750,
      "bondDetails": "...",
      "status": "ACTIVE",
      "seller": {
        "id": "seller_id",
        "firstName": "Ali",
        "lastName": "Khan",
        "city": "Karachi"
      },
      "createdAt": "..."
    }
  ]
  ```

### `GET /marketplace/my-listings`

**Description**: Fetch all listings created by the currently logged-in user (any status).

- **Response**: `200 OK` — Array of the user's own listings.

### `GET /marketplace/:id`

**Description**: Get full details of a specific listing. Used by the frontend to populate the detail/chat screen.

- **Response**: `200 OK` — Includes full seller contact info (name, email, mobile, city) and buyer info if sold.

### `PATCH /marketplace/:id/status`

**Description**: Update the status of a listing. Only the original seller can perform this action.

- **Body (Mark as Sold)**:
  ```json
  {
    "status": "SOLD",
    "buyerId": "cuid_of_buyer"
  }
  ```
- **Body (Remove listing)**:
  ```json
  {
    "status": "REMOVED"
  }
  ```
- **Side Effects when SOLD**:
  1. Associates `buyerId` with the listing record.
  2. Creates a new `UserBond` record for the buyer (auto-transfer).
  3. Removes the matching `UserBond` from the seller's list.
- **Constraints**: Only `ACTIVE` listings can be updated. Seller cannot buy their own listing.
