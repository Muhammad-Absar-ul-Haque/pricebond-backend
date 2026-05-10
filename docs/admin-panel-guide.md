# Admin Panel Guide: Draw & Schedule Management

This guide explains how to use the admin APIs to manage the prize bond draw schedule and upload results.

## 1. Entering Draw Schedule (Bulk)

To populate the draw schedule for the entire year, use the bulk creation endpoint. This is more efficient than adding draws one by one.

### Endpoint
`POST /admin/draws/bulk`

### Authentication
Requires a valid Admin JWT token in the `Authorization: Bearer <token>` header.

### Request Body Example
```json
{
  "draws": [
    {
      "drawNumber": "105",
      "date": "2026-01-15",
      "city": "Karachi",
      "denomination": 750
    },
    {
      "drawNumber": "53",
      "date": "2026-02-16",
      "city": "Lahore",
      "denomination": 100
    }
  ]
}
```

### Response Example
```json
{
  "count": 2
}
```

---

## 2. Managing Individual Draws

### Create a Single Draw
`POST /admin/draws`

**Request Body:**
```json
{
  "drawNumber": "106",
  "date": "2026-03-15",
  "city": "Faisalabad",
  "denomination": 1500
}
```

### List All Draws (Admin View)
`GET /admin/draws`

Supports pagination and filtering by denomination.

**Query Parameters:**
- `page` (optional): Page number (default: 1).
- `limit` (optional): Items per page (default: 10).
- `denomination` (optional): Filter by bond value (e.g., 100, 750, 1500).

**Response Example:**
```json
{
  "data": [
    {
      "id": 1,
      "drawNumber": "105",
      "date": "2026-01-15T00:00:00.000Z",
      "city": "Karachi",
      "denomination": 750,
      "resultPdfUrl": "https://res.cloudinary.com/..."
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Get Draw Detail
`GET /admin/draws/:id`

Returns draw details in the same optimized format as the mobile app.

**Response Example:**
```json
{
  "success": true,
  "draw": {
    "id": 12,
    "drawNumber": "105",
    "date": "2026-01-15T00:00:00.000Z",
    "city": "Karachi",
    "denomination": 750,
    "hasResult": true,
    "resultFileUrl": "https://res.cloudinary.com/...",
    "resultPdfUrl": "https://res.cloudinary.com/...",
    "totalWinners": 1201
  }
}
```

---

## 3. Uploading Draw Results (PDF)

Once a draw occurs, you must upload the official PDF result to extract winning numbers and make it available for download.

### Endpoint
`POST /admin/draws/:id/import-results`

### Form Data
- `file`: The PDF file of the results.
- `resultFileUrl` (optional): If the file is already hosted on Cloudinary, you can provide the URL instead.

### Workflow
1. Select the draw from your list.
2. Upload the official PDF.
3. The system will:
   - Parse all winning numbers (1st, 2nd, 3rd prizes).
   - Store the PDF on Cloudinary.
   - Notify users who have matching bonds in their "My Bonds" list.
   - Make the draw visible in the Mobile App "Results" section.

### Response Example
```json
{
  "message": "Results imported and scrutiny complete",
  "stats": {
    "total": 1201,
    "first": 1,
    "second": 3,
    "third": 1197,
    "newUserWinners": 5
  },
  "resultFileUrl": "https://res.cloudinary.com/..."
}
```

---

## 5. Marketplace Management

Allows administrators to monitor, filter, and manage all marketplace listings created by users.

### List All Listings
`GET /admin/marketplace`

Supports pagination, filtering by status/denomination, and search.

**Query Parameters:**
- `page` (optional): Page number (default: 1).
- `limit` (optional): Items per page (default: 10).
- `status` (optional): Filter by `ACTIVE`, `SOLD`, or `REMOVED`.
- `denomination` (optional): Filter by bond value (e.g., 750).
- `search` (optional): Search by serial number or seller name/email.

**Response Example:**
```json
{
  "data": [
    {
      "id": 15,
      "serial": "123456",
      "denomination": 750,
      "status": "ACTIVE",
      "seller": {
        "id": 5,
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@test.com"
      },
      "createdAt": "2026-05-10T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Get Listing Detail
`GET /admin/marketplace/:id`

Returns full details including seller and buyer information (if sold).

### Update Listing Status
`PATCH /admin/marketplace/:id/status`

**Request Body:**
```json
{
  "status": "REMOVED"
}
```

### Delete/Remove Listing
`DELETE /admin/marketplace/:id`

Marks the listing as `REMOVED`. This is the preferred way for admins to take down inappropriate listings.

---

## Frontend Integration Tips
- **Schedule Management**: Create a simple CSV uploader on your admin dashboard that maps to the `bulk` endpoint.
- **Result Processing**: Show a loading indicator during PDF import, as the server parses thousands of numbers and sends push notifications.
- **Admin Downloads**: Use the `resultPdfUrl` returned in the list and detail views to allow admins to re-download official result files.
- **Pagination**: Use the `meta` object in the response to implement a standard pagination control (Prev/Next/Page Numbers) for the draw list.

---

## 4. Admin Dashboard Analytics

The Admin Dashboard provides a bird's-eye view of your entire application's health, user activity, and operations. To populate the dashboard, use the dedicated statistics endpoint.

### Endpoint
`GET /admin/dashboard/stats`

### Authentication
Requires a valid Admin JWT token in the `Authorization: Bearer <token>` header.

### Response Example
```json
{
  "success": true,
  "data": {
    "kpi": {
      "totalActiveUsers": 12,
      "totalPendingCount": 3,
      "totalBondsRegistered": 450,
      "totalWinners": 5,
      "activeMarketplaceListings": 8
    },
    "actionRequired": {
      "pendingUsers": [
        { "id": 5, "firstName": "John", "lastName": "Doe", "email": "john@test.com", "createdAt": "2026-05-10T10:00:00.000Z" }
      ],
      "drawsMissingResults": [
        { "id": 2, "drawNumber": "Draw #98", "denomination": 1500, "city": "Karachi", "date": "2026-05-10T00:00:00.000Z" }
      ]
    },
    "recentActivity": {
      "recentWinners": [
        { "serial": "123456", "denomination": 1500, "user": { "firstName": "Ali", "lastName": "Khan" } }
      ],
      "latestSales": [
        { "serial": "987654", "denomination": 750, "seller": { "firstName": "Omar" }, "updatedAt": "2026-05-10T12:00:00.000Z" }
      ]
    },
    "charts": {
      "bondsByDenomination": [
        { "denomination": 750, "count": 200 },
        { "denomination": 1500, "count": 250 }
      ]
    }
  }
}
```

### UI Integration Guide (How to Show This Data)

To make your Admin Panel look premium and functional, map the JSON response to your React/Vue/Angular UI components as follows:

1. **KPI Cards (Top Row)**
   - **Data Source:** `data.kpi`
   - **UI Component:** 4-5 colorful summary cards at the top of the page.
   - **Mapping:** 
     - "Total Users" ➔ `kpi.totalActiveUsers` (Green icon)
     - "Bonds Registered" ➔ `kpi.totalBondsRegistered` (Blue icon)
     - "Total Winners" ➔ `kpi.totalWinners` (Gold/Trophy icon)
     - "Marketplace Listings" ➔ `kpi.activeMarketplaceListings` (Orange/Shopping icon)

2. **Action Required (High Priority Alerts)**
   - **Data Source:** `data.actionRequired`
   - **UI Component:** A red/yellow alert box or a high-priority "To-Do" table on the left side of the screen.
   - **Mapping:** 
     - If `actionRequired.pendingUsers.length > 0`, show a table: "Users Awaiting Approval". Add a quick "Approve" button next to each user that calls `PATCH /admin/users/:id/status`.
     - If `actionRequired.drawsMissingResults.length > 0`, show an alert: "Draws Missing Results". Add an "Upload PDF" button next to each draw that navigates to the PDF upload page.

3. **Charts & Analytics (Middle Section)**
   - **Data Source:** `data.charts`
   - **UI Component:** A Pie Chart or Doughnut Chart (using libraries like Recharts, Chart.js, or ApexCharts).
   - **Mapping:** Feed `charts.bondsByDenomination` into the chart to visually show which bond denominations are most popular among users.

4. **Recent Activity Feeds (Right Side or Bottom)**
   - **Data Source:** `data.recentActivity`
   - **UI Component:** A scrolling ticker or a minimal list/feed component.
   - **Mapping:** 
     - Map `recentActivity.recentWinners` to show: *"{user.firstName} {user.lastName} won on bond {serial} ({denomination})"*
     - Map `recentActivity.latestSales` to show: *"{seller.firstName} sold bond {serial} ({denomination})"*
