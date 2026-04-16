# Auth API Documentation

Base URL: `http://52.0.177.84:3000/api/v1/local`

---

## 1. Register a New User
Registers a new user into the PrizeBond system.

- **URL:** `/auth/register`
- **Method:** `POST`
- **Auth Required:** No
- **Request Body (JSON):**
  ```json
  {
    "firstName": "Alice",
    "lastName": "Johnson",
    "email": "alice@example.com",
    "mobile": "03001234567",
    "pin": "1234",
    "confirmPin": "1234",
    "address": "123 Main St",
    "city": "Karachi",
    "role": "USER"
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "message": "User registered successfully",
    "user": { "id": "...", "email": "...", "role": "..." }
  }
  ```

---

## 2. Login
Authenticates a user and returns a JWT token.

- **URL:** `/auth/login`
- **Method:** `POST`
- **Auth Required:** No
- **Request Body (JSON):**
  ```json
  {
    "email": "alice@example.com",
    "pin": "1234"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1...",
    "user": { "id": "...", "email": "...", "role": "..." }
  }
  ```

---

## 3. Send OTP
Sends a 4-digit verification code to the user's email.

- **URL:** `/auth/send-otp`
- **Method:** `POST`
- **Auth Required:** No
- **Request Body (JSON):**
  ```json
  {
    "email": "alice@example.com"
  }
  ```
- **Success Response (200 OK):**
  ```json
  { "message": "OTP sent to your email" }
  ```

---

## 4. Verify OTP
Verifies the 4-digit code sent via email.

- **URL:** `/auth/verify-otp`
- **Method:** `POST`
- **Auth Required:** No
- **Request Body (JSON):**
  ```json
  {
    "email": "alice@example.com",
    "otp": "1234"
  }
  ```
- **Success Response (200 OK):**
  ```json
  { "message": "OTP verified successfully" }
  ```

---

## 5. Reset PIN
Resets the user's PIN after successful OTP verification.

- **URL:** `/auth/reset-pin`
- **Method:** `POST`
- **Auth Required:** No
- **Request Body (JSON):**
  ```json
  {
    "email": "alice@example.com",
    "newPin": "4321",
    "confirmPin": "4321"
  }
  ```
- **Success Response (200 OK):**
  ```json
  { "message": "PIN reset successful" }
  ```

---

## 6. Get Current User (@me)
Returns profile details of the currently logged-in user.

- **URL:** `/auth/me`
- **Method:** `GET`
- **Auth Required:** Yes (**Bearer Token**)
- **Success Response (200 OK):**
  ```json
  {
    "id": "...",
    "email": "...",
    "firstName": "...",
    "lastName": "...",
    "role": "..."
  }
  ```
