# Prize Bond System: PDF Parsing Logic

This document explains the internal mechanisms used to extract winning bond serial numbers from official PDF result documents.

## 1. The Parsing Engine
The backend uses the `pdf-parse` library to extract raw text data from uploaded PDF files. 
- **Method**: Text Stream Extraction.
- **Requirement**: The PDF must be **digitally created** (text-based). Scanned photographs are not supported by the current parser.

---

## 2. Text Identification Logic
The system uses **Regular Expressions (Regex)** to pinpoint specific data points within the unstructured text stream.

### A. Metadata Extraction
The parser scans for global metadata to verify the document's validity:
- **Denomination**: `Rs\.\s*(\d+)\/-`
- **Draw Number**: `(\d+)(?:st|nd|rd|th)\s+Draw`
- **Date**: `Dated:\s*(\d{1,2}[-/.]\d{1,2}[-/.]\d{4})`

### B. Prize Category Identification
The system divides the text into "Logical Zones" based on headers:
1. **First Prize Zone**: Text between "First Prize" and "Second Prize".
2. **Second Prize Zone**: Text between "Second Prize" and "Third Prize".
3. **Third Prize Zone**: Text starting from "Third Prize" until the end of the results list.

---

## 3. Serial Number Extraction
Within each Zone, the system pulls every isolated **6-digit sequence** (`\b\d{6}\b`). 

### Why isolation matters:
- It ignores bond amounts (e.g., 750 or 1500) because they are not 6 digits.
- It ignores dates because they typically contain separators (`/` or `-`).
- It captures only valid, standalone bond numbers.

### Support for various layouts:
Because the parser looks for "islands" of 6-digits, it supports results displayed in:
- **Columns** (often used for 3rd prize).
- **Bulky Paragraphs** separated by spaces or dots.
- **Formatted lists** separated by pipes (`|`) or commas.

---

## 4. Implementation Details
- **Location**: `src/common/pdf-parser/pdf-parser.service.ts`
- **Error Protection**: If the parser finds **zero winners**, the import is aborted with a `400 Bad Request` to prevent empty draws.
- **Duplicates**: The parser automatically removes duplicate serial numbers found in the same section.
- **Case Sensitivity**: All header searches (e.g., "First Prize") are case-insensitive.
