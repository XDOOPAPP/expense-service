# 📮 Expense Service - Postman Testing Guide

## Base URL
```
http://localhost:3000/api/v1
```

## 🔐 Authentication
Tất cả endpoints đều yêu cầu JWT token:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🚀 Quick Start

### Step 1: Login để lấy JWT Token

```http
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@fepa.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "email": "admin@fepa.com",
    "name": "Admin"
  }
}
```

💡 **Copy `access_token` và dùng cho tất cả requests tiếp theo!**

---

## 📋 Expense Endpoints

### 1️⃣ Create Expense (Tạo Chi Tiêu)

```http
POST http://localhost:3000/api/v1/expenses
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "description": "Lunch at restaurant",
  "amount": 150000,
  "category": "food",
  "spentAt": "2025-12-31"
}
```

**Request Body Fields:**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `description` | string | ✅ Yes | Mô tả chi tiêu (max 500 chars) | "Lunch at restaurant" |
| `amount` | number | ✅ Yes | Số tiền (min: 0.01) | 150000 |
| `category` | string | ❌ No | Category slug | "food", "transport", "shopping" |
| `spentAt` | string | ✅ Yes | Ngày chi tiêu (ISO 8601) | "2025-12-31" |

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user-uuid",
  "description": "Lunch at restaurant",
  "amount": 150000,
  "category": "food",
  "spentAt": "2025-12-31",
  "isFromOcr": false,
  "ocrJobId": null,
  "ocrConfidence": null,
  "createdAt": "2025-12-31T14:30:00.000Z",
  "updatedAt": "2025-12-31T14:30:00.000Z"
}
```

**Example Requests:**

1. **Basic expense:**
```json
{
  "description": "Coffee at Starbucks",
  "amount": 45000,
  "category": "food",
  "spentAt": "2025-12-31"
}
```

2. **Transportation:**
```json
{
  "description": "Grab to office",
  "amount": 35000,
  "category": "transport",
  "spentAt": "2025-12-31"
}
```

3. **Without category:**
```json
{
  "description": "Miscellaneous expense",
  "amount": 100000,
  "spentAt": "2025-12-31"
}
```

---

### 2️⃣ Get All Expenses (Lấy Danh Sách)

```http
GET http://localhost:3000/api/v1/expenses
Authorization: Bearer YOUR_TOKEN
```

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `from` | string | ❌ No | - | Filter từ ngày (ISO 8601) |
| `to` | string | ❌ No | - | Filter đến ngày (ISO 8601) |
| `category` | string | ❌ No | - | Filter theo category |
| `page` | number | ❌ No | 1 | Số trang |
| `limit` | number | ❌ No | 10 | Số items/trang (max: 100) |

**Example Requests:**

1. **Get all (default pagination):**
```http
GET http://localhost:3000/api/v1/expenses
```

2. **Filter by date range:**
```http
GET http://localhost:3000/api/v1/expenses?from=2025-12-01&to=2025-12-31
```

3. **Filter by category:**
```http
GET http://localhost:3000/api/v1/expenses?category=food
```

4. **Pagination:**
```http
GET http://localhost:3000/api/v1/expenses?page=2&limit=20
```

5. **Combined filters:**
```http
GET http://localhost:3000/api/v1/expenses?from=2025-12-01&category=food&limit=50
```

6. **Get OCR-created expenses:**
```http
GET http://localhost:3000/api/v1/expenses?isFromOcr=true
```

**Response:**
```json
{
  "data": [
    {
      "id": "expense-1-uuid",
      "userId": "user-uuid",
      "description": "Lunch at restaurant",
      "amount": 150000,
      "category": "food",
      "spentAt": "2025-12-31",
      "isFromOcr": false,
      "ocrJobId": null,
      "ocrConfidence": null,
      "createdAt": "2025-12-31T14:30:00.000Z",
      "updatedAt": "2025-12-31T14:30:00.000Z"
    },
    {
      "id": "expense-2-uuid",
      "userId": "user-uuid",
      "description": "OCR Scanned Receipt",
      "amount": 50000,
      "category": "food",
      "spentAt": "2025-12-30",
      "isFromOcr": true,
      "ocrJobId": "ocr-job-uuid",
      "ocrConfidence": 85.5,
      "createdAt": "2025-12-30T10:15:00.000Z",
      "updatedAt": "2025-12-30T10:15:00.000Z"
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3,
    "timestamp": "2025-12-31T14:35:00.000Z"
  }
}
```

---

### 3️⃣ Get Expense Summary (Tổng Hợp)

```http
GET http://localhost:3000/api/v1/expenses/summary
Authorization: Bearer YOUR_TOKEN
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `from` | string | ❌ No | Filter từ ngày |
| `to` | string | ❌ No | Filter đến ngày |

**Example Requests:**

1. **All-time summary:**
```http
GET http://localhost:3000/api/v1/expenses/summary
```

2. **This month:**
```http
GET http://localhost:3000/api/v1/expenses/summary?from=2025-12-01&to=2025-12-31
```

3. **Last 7 days:**
```http
GET http://localhost:3000/api/v1/expenses/summary?from=2025-12-25&to=2025-12-31
```

**Response:**
```json
{
  "totalAmount": 1250000,
  "totalExpenses": 15,
  "averageAmount": 83333.33,
  "byCategory": [
    {
      "category": "food",
      "total": 650000,
      "count": 8,
      "percentage": 52
    },
    {
      "category": "transport",
      "total": 350000,
      "count": 5,
      "percentage": 28
    },
    {
      "category": null,
      "total": 250000,
      "count": 2,
      "percentage": 20
    }
  ],
  "period": {
    "from": "2025-12-01",
    "to": "2025-12-31"
  }
}
```

---

### 4️⃣ Get Single Expense (Chi Tiết)

```http
GET http://localhost:3000/api/v1/expenses/{expenseId}
Authorization: Bearer YOUR_TOKEN
```

**Example:**
```http
GET http://localhost:3000/api/v1/expenses/550e8400-e29b-41d4-a716-446655440000
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user-uuid",
  "description": "Lunch at restaurant",
  "amount": 150000,
  "category": "food",
  "spentAt": "2025-12-31",
  "isFromOcr": false,
  "ocrJobId": null,
  "ocrConfidence": null,
  "createdAt": "2025-12-31T14:30:00.000Z",
  "updatedAt": "2025-12-31T14:30:00.000Z"
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Expense with ID 550e8400-e29b-41d4-a716-446655440000 not found",
  "error": "Not Found"
}
```

**403 Forbidden (Not Owner):**
```json
{
  "statusCode": 403,
  "message": "You do not have access to this expense",
  "error": "Forbidden"
}
```

---

### 5️⃣ Update Expense (Cập Nhật)

```http
PATCH http://localhost:3000/api/v1/expenses/{expenseId}
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "description": "Updated description",
  "amount": 200000,
  "category": "shopping"
}
```

**Request Body (All fields optional):**

| Field | Type | Description |
|-------|------|-------------|
| `description` | string | Mô tả mới |
| `amount` | number | Số tiền mới |
| `category` | string | Category mới |
| `spentAt` | string | Ngày mới |

**Example Requests:**

1. **Update description only:**
```json
{
  "description": "Dinner at Italian restaurant"
}
```

2. **Update amount and category:**
```json
{
  "amount": 250000,
  "category": "food"
}
```

3. **Update all fields:**
```json
{
  "description": "Shopping at mall",
  "amount": 500000,
  "category": "shopping",
  "spentAt": "2025-12-30"
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user-uuid",
  "description": "Updated description",
  "amount": 200000,
  "category": "shopping",
  "spentAt": "2025-12-31",
  "isFromOcr": false,
  "ocrJobId": null,
  "ocrConfidence": null,
  "createdAt": "2025-12-31T14:30:00.000Z",
  "updatedAt": "2025-12-31T15:00:00.000Z"
}
```

---

### 6️⃣ Delete Expense (Xóa)

```http
DELETE http://localhost:3000/api/v1/expenses/{expenseId}
Authorization: Bearer YOUR_TOKEN
```

**Example:**
```http
DELETE http://localhost:3000/api/v1/expenses/550e8400-e29b-41d4-a716-446655440000
```

**Response:**
```json
{
  "message": "Expense deleted successfully",
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## 🧪 Complete Testing Workflow

### Scenario 1: Create and Manage Expenses

```bash
# 1. Login
POST /auth/login
→ Get token

# 2. Create expense
POST /expenses
Body: { "description": "Lunch", "amount": 100000, "category": "food", "spentAt": "2025-12-31" }
→ Get expense ID

# 3. View all expenses
GET /expenses

# 4. Update expense
PATCH /expenses/{id}
Body: { "amount": 150000 }

# 5. View updated expense
GET /expenses/{id}

# 6. Delete expense
DELETE /expenses/{id}
```

### Scenario 2: Filter and Summary

```bash
# 1. Get expenses for December
GET /expenses?from=2025-12-01&to=2025-12-31

# 2. Get food expenses only
GET /expenses?category=food

# 3. Get summary for December
GET /expenses/summary?from=2025-12-01&to=2025-12-31

# 4. Get OCR-created expenses
GET /expenses?isFromOcr=true
```

### Scenario 3: OCR Integration Test

```bash
# 1. Create OCR job
POST /ocr/scan
Body: { "fileUrl": "https://example.com/receipt.jpg" }
→ Get job ID

# 2. Wait for processing (check status)
GET /ocr/jobs/{jobId}
→ Wait until status = "completed"

# 3. Check if expense was auto-created
GET /expenses?isFromOcr=true
→ Should see new expense with ocrJobId

# 4. Update OCR-created expense if needed
PATCH /expenses/{expenseId}
Body: { "description": "Corrected description", "amount": 55000 }
```

---

## 📊 Common Categories

| Category | Slug | Example |
|----------|------|---------|
| Food & Dining | `food` | Restaurant, coffee, groceries |
| Transportation | `transport` | Taxi, bus, gas |
| Shopping | `shopping` | Clothes, electronics |
| Healthcare | `health` | Doctor, pharmacy |
| Entertainment | `entertainment` | Movies, games |
| Utilities | `utilities` | Electricity, water, internet |
| Education | `education` | Books, courses |
| Other | `other` | Miscellaneous |

---

## 🔍 Validation Rules

### Create/Update Expense

| Field | Rules |
|-------|-------|
| `description` | Required, max 500 characters |
| `amount` | Required, minimum 0.01 |
| `category` | Optional, string |
| `spentAt` | Required, valid ISO 8601 date (YYYY-MM-DD) |

### Query Parameters

| Field | Rules |
|-------|-------|
| `from` / `to` | Valid ISO 8601 date |
| `page` | Integer, minimum 1 |
| `limit` | Integer, 1-100 |

---

## ❌ Common Errors

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": [
    "amount must not be less than 0.01",
    "description should not be empty"
  ],
  "error": "Bad Request"
}
```

**Causes:**
- Missing required fields
- Invalid data types
- Validation failed

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Causes:**
- Missing Authorization header
- Invalid/expired JWT token

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "You do not have access to this expense"
}
```

**Causes:**
- Trying to access another user's expense

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Expense with ID xxx not found"
}
```

**Causes:**
- Invalid expense ID
- Expense doesn't exist

---

## 🎯 Postman Collection Setup

### Method 1: Import from Swagger

1. Start API Gateway: `docker-compose up -d`
2. Open Postman
3. Click **Import** → **Link**
4. Paste: `http://localhost:3000/docs-json`
5. Click **Import**

### Method 2: Manual Setup

1. Create new Collection: "FEPA - Expense Service"
2. Add Collection Variable:
   - `baseUrl`: `http://localhost:3000/api/v1`
   - `token`: (empty, will be set after login)
3. Add Authorization to Collection:
   - Type: Bearer Token
   - Token: `{{token}}`
4. Create folders:
   - Auth
   - Expenses
   - OCR
5. Add requests from this guide

### Setting Token Automatically

In Login request, add to **Tests** tab:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.collectionVariables.set("token", response.access_token);
    console.log("Token saved:", response.access_token);
}
```

---

## 🔗 Related Endpoints

- **Categories**: `GET /api/v1/categories` - Get all available categories
- **OCR**: `POST /api/v1/ocr/scan` - Scan receipt and auto-create expense
- **Budgets**: `GET /api/v1/budgets` - View budget limits

---

## 📚 Additional Resources

- **Swagger UI**: http://localhost:3000/docs
- **Prisma Studio**: Run `docker-compose exec expense-service npx prisma studio`
- **Database**: PostgreSQL at `localhost:5432` (fepa/fepa123)
- **RabbitMQ**: http://localhost:15672 (fepa/fepa123)

---

## 💡 Pro Tips

1. **Use Environment Variables** in Postman for `baseUrl` and `token`
2. **Save common requests** as examples for quick access
3. **Use Pre-request Scripts** to auto-refresh expired tokens
4. **Enable Auto-save** in Postman settings
5. **Use Postman Console** (View → Show Postman Console) for debugging
6. **Test with invalid data** to verify validation works
7. **Check response times** to monitor performance
