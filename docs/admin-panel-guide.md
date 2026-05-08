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

Returns all draws. If a result is available, `resultPdfUrl` will contain the download link for the admin to view/download.

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

## Frontend Integration Tips
- **Schedule Management**: Create a simple CSV uploader on your admin dashboard that maps to the `bulk` endpoint.
- **Result Processing**: Show a loading indicator during PDF import, as the server parses thousands of numbers and sends push notifications.
- **Admin Downloads**: Use the `resultPdfUrl` returned in the list and detail views to allow admins to re-download official result files.
