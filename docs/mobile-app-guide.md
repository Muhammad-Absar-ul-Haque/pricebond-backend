# Mobile App Integration Guide: Schedule & Results

This document provides developers with the necessary API details to implement the Draw Schedule and Results screens in the mobile application.

## 1. Annual Draw Schedule

Use this endpoint to show the calendar of draws for a specific year.

### Endpoint
`GET /results/schedule`

### Query Parameters
- `year` (Required): The year to fetch (e.g., `2026`).
- `denomination` (Optional): Filter by bond category (e.g., `750`).

### Response Example
```json
{
  "success": true,
  "year": 2026,
  "total": 2,
  "schedule": [
    {
      "id": 12,
      "drawNumber": "105",
      "date": "2026-01-15T00:00:00.000Z",
      "city": "Karachi",
      "denomination": 750,
      "hasResult": true
    },
    {
      "id": 13,
      "drawNumber": "53",
      "date": "2026-02-16T00:00:00.000Z",
      "city": "Lahore",
      "denomination": 100,
      "hasResult": false
    }
  ]
}
```

---

## 2. Results List (Latest Results)

This endpoint returns only the draws that have available results (PDFs). This should be used for the "Results" or "Downloads" tab.

### Endpoint
`GET /results`

### Query Parameters
- `denomination` (Optional): Filter by bond category (e.g., `750`).
- `city` (Optional): Filter by city name (e.g., `Karachi`). Supports partial and case-insensitive matching.
- `date` (Optional): Filter by specific draw date (format: `YYYY-MM-DD`).

### Response Example
```json
{
  "success": true,
  "total": 1,
  "draws": [
    {
      "id": 12,
      "drawNumber": "105",
      "date": "2026-01-15T00:00:00.000Z",
      "city": "Karachi",
      "denomination": 750,
      "hasResult": true,
      "resultPdfUrl": "https://res.cloudinary.com/...",
      "winningNumbersCount": 1201
    }
  ]
}
```

---

## 3. Draw Detail

Fetch metadata for a specific draw. Note that the winners list is **no longer included** in the JSON response to keep it fast. Users should download the PDF using `resultPdfUrl`.

### Endpoint
`GET /results/:id`

### Response Example
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
    "resultPdfUrl": "https://res.cloudinary.com/...",
    "totalWinners": 1201
  }
}
```

---

## 4. Quick Check (Serial Number Search)

Allows a user to check if a specific bond serial number has won in a specific denomination across all history.

### Endpoint
`GET /results/check`

### Query Parameters
- `serial` (Required): The 6-digit serial number.
- `denomination` (Required): The bond category.

### Response Example (Winner)
```json
{
  "isWinner": true,
  "message": "Congratulations! Your number 123456 has won.",
  "wins": [
    {
      "drawNumber": "105",
      "drawDate": "2026-01-15T00:00:00.000Z",
      "city": "Karachi",
      "prizeTier": "THIRD",
      "prizeAmount": "1250.00"
    }
  ]
}
```

---

## UI Integration Tips

### Schedule Screen
- Use a **Year Selector** (Dropdown) to let users switch between years (2025, 2026, etc.).
- Sort entries by date ascending (the API already does this).
- Use the `hasResult` flag to show a "View Result" button only for completed draws.

### Results Screen
- This list is sorted by date descending (latest first).
- Provide a clear "Download PDF" button using the `resultPdfUrl`.
- Display the `winningNumbersCount` to show how many people won in that draw.
- **Filtering**: Use the `denomination`, `city`, and `date` query parameters to provide an advanced search interface for results.
