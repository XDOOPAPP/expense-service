# 💰 Expense Service - FEPA

A microservice for managing personal expenses built with NestJS, Prisma, and PostgreSQL.

## 📋 Features

- ✅ Complete CRUD operations for expenses
- ✅ JWT Authentication & Authorization
- ✅ Expense filtering by date range and category
- ✅ Pagination support
- ✅ Expense summary and statistics (by category and time period)
- ✅ Category management
- ✅ Owner-based authorization
- ✅ Swagger API documentation
- ✅ Input validation with class-validator
- ✅ Consistent error handling
- ✅ Response transformation

## 🛠️ Tech Stack

- **Framework**: NestJS 11
- **Language**: TypeScript 5.7
- **Database**: PostgreSQL 17
- **ORM**: Prisma 5.20
- **Authentication**: Passport JWT
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger UI

## 📁 Project Structure

```
src/
├── common/              # Shared utilities
│   ├── decorators/     # Custom decorators (@Auth, @CurrentUser)
│   ├── guards/         # Auth guards
│   ├── filters/        # Exception filters
│   ├── interceptors/   # Response transformers
│   └── strategies/     # JWT strategy
├── config/             # App configuration
├── categories/         # Categories module
├── expenses/           # Expenses module
│   ├── dto/           # Data transfer objects
│   └── entities/      # Entity definitions
├── prisma/            # Prisma service
└── main.ts            # Application entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- Docker & Docker Compose (for database)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Copy environment variables:

```bash
cp .env.example .env
```

4. Update `.env` with your configuration

### Database Setup

1. Start PostgreSQL with Docker:

```bash
docker-compose up -d
```

2. Generate Prisma Client:

```bash
npm run prisma:generate
```

3. Run migrations:

```bash
npm run prisma:migrate
```

4. Seed categories:

```bash
npm run prisma:seed
```

## 🏃‍♂️ Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

Application will be running at:

- API: http://localhost:3000/api/v1
- Swagger Docs: http://localhost:3000/api/docs

## 📡 API Endpoints

### Authentication

All endpoints (except Categories) require JWT Bearer token in Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### **Categories** (Public)

```http
GET /api/v1/expenses/categories
```

Get all expense categories

---

#### **Expenses** (Protected - requires auth)

**1. Create Expense**

```http
POST /api/v1/expenses
Content-Type: application/json

{
  "description": "Lunch at restaurant",
  "amount": 150000,
  "category": "food",
  "spentAt": "2024-12-13"
}
```

**2. Get All Expenses**

```http
GET /api/v1/expenses?from=2024-01-01&to=2024-12-31&category=food&page=1&limit=10
```

Query Parameters:

- `from` (optional): Start date (ISO 8601)
- `to` (optional): End date (ISO 8601)
- `category` (optional): Category slug
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**3. Get Expense by ID**

```http
GET /api/v1/expenses/:id
```

**4. Update Expense**

```http
PATCH /api/v1/expenses/:id
Content-Type: application/json

{
  "description": "Dinner at restaurant",
  "amount": 200000,
  "category": "food",
  "spentAt": "2024-12-13"
}
```

All fields are optional

**5. Delete Expense**

```http
DELETE /api/v1/expenses/:id
```

**6. Get Expense Summary**

```http
GET /api/v1/expenses/summary?from=2024-01-01&to=2024-12-31&groupBy=month
```

Query Parameters:

- `from` (optional): Start date
- `to` (optional): End date
- `groupBy` (optional): `day`, `week`, `month`, or `year`

Response:

```json
{
  "data": {
    "total": 1500000,
    "count": 15,
    "byCategory": [
      {
        "category": "food",
        "total": 800000,
        "count": 8
      }
    ],
    "byTimePeriod": [
      {
        "period": "2024-12",
        "total": 1500000,
        "count": 15
      }
    ]
  }
}
```

---

## 🔒 JWT Token Format

The service expects JWT tokens with the following payload structure:

```json
{
  "userId": "uuid-string",
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234567890
}
```

The `userId` field is required for authentication and authorization.

---

## 📊 Database Schema

### Expense

- `id`: UUID (Primary Key)
- `userId`: UUID
- `description`: String
- `amount`: Decimal(14,2)
- `category`: String (nullable)
- `spentAt`: Date
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### Category

- `slug`: String (Primary Key)
- `name`: String

---

## 🧪 Testing

```bash
# unit tests
$ npm run test

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

## 🗃️ Available Categories

The service comes pre-seeded with the following categories:

| Slug          | Name              |
| ------------- | ----------------- |
| food          | Food & Dining     |
| transport     | Transportation    |
| shopping      | Shopping          |
| entertainment | Entertainment     |
| utilities     | Utilities         |
| healthcare    | Healthcare        |
| education     | Education         |
| travel        | Travel            |
| housing       | Housing           |
| insurance     | Insurance         |
| personal      | Personal Care     |
| gifts         | Gifts & Donations |
| investments   | Investments       |
| other         | Other             |

---

## 🔧 Available Scripts

```bash
# Development
npm run start:dev          # Start in watch mode
npm run start:debug        # Start with debug mode

# Build
npm run build              # Build for production

# Database
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run migrations
npm run prisma:studio      # Open Prisma Studio
npm run prisma:seed        # Seed database
npm run db:push            # Push schema to database

# Testing
npm run test               # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run tests with coverage
npm run test:e2e           # Run e2e tests

# Code Quality
npm run lint               # Lint code
npm run format             # Format code
```

---

## 🐳 Docker Commands

```bash
# Start database
docker-compose up -d

# Stop database
docker-compose down

# View logs
docker-compose logs -f

# Remove volumes (⚠️ deletes all data)
docker-compose down -v
```

---

## 📝 Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5433/fepa_expense?schema=public"

# JWT
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"

# App
PORT=3000
NODE_ENV=development
```

---

## 🚨 Error Handling

All errors follow a consistent format:

```json
{
  "statusCode": 400,
  "message": ["Error message"],
  "errors": null,
  "timestamp": "2024-12-13T10:00:00.000Z",
  "path": "/api/v1/expenses"
}
```

Common status codes:

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid JWT)
- `403` - Forbidden (not owner)
- `404` - Not Found
- `500` - Internal Server Error

---

## 🎯 Future Improvements

- [ ] Add caching for categories endpoint
- [ ] Implement rate limiting
- [ ] Add bulk expense creation
- [ ] Export expenses to CSV/Excel
- [ ] Add expense attachments (receipts)
- [ ] Implement budget tracking
- [ ] Add recurring expenses
- [ ] Implement notifications
- [ ] Add multi-currency support

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

Built with ❤️ for FEPA (Financial Expense Planning Application)
