# Expense Service API Implementation Plan

## 📋 Tổng Quan Dự Án

**Microservice**: Expense Service
**Framework**: NestJS + Prisma + PostgreSQL
**Port**: 3000
**Database Port**: 5433

---

## 🗂️ Cấu Trúc Database Hiện Tại

### Models

1. **Expense**
   - id: UUID (Primary Key)
   - userId: UUID
   - description: String
   - amount: Decimal(14,2)
   - category: String (nullable)
   - spentAt: Date
   - createdAt: Timestamp
   - updatedAt: Timestamp
   - Index: (userId, spentAt)

2. **Category**
   - slug: String (Primary Key)
   - name: String

---

## 🎯 API Endpoints Cần Implement

### 1. **GET /api/v1/expenses** - Lấy danh sách expense

- **Auth**: Required (JWT)
- **Features**:
  - Filter theo `from` (date)
  - Filter theo `to` (date)
  - Filter theo `category` (slug)
  - Filter theo `userId` (từ auth token)
  - Pagination: `page`, `limit`
  - Sort theo `spentAt` desc
- **Response**: List expenses + metadata (total, page, limit)

### 2. **POST /api/v1/expenses** - Tạo expense mới

- **Auth**: Required (JWT)
- **Body**:
  - description: string (required)
  - amount: number (required, > 0)
  - category: string (optional, slug)
  - spentAt: date (required)
- **Validation**:
  - userId lấy từ JWT token
  - Validate category exists nếu có
  - Validate amount > 0
  - Validate spentAt không quá xa trong tương lai

### 3. **GET /api/v1/expenses/:id** - Lấy chi tiết expense

- **Auth**: Required (JWT)
- **Validation**:
  - Kiểm tra expense tồn tại
  - Kiểm tra userId từ token === expense.userId (owner check)
- **Response**: Expense detail

### 4. **PUT /api/v1/expenses/:id** - Cập nhật expense

- **Auth**: Required (JWT)
- **Body**:
  - description: string (optional)
  - amount: number (optional, > 0)
  - category: string (optional, slug)
  - spentAt: date (optional)
- **Validation**:
  - Kiểm tra expense tồn tại
  - Kiểm tra userId từ token === expense.userId (owner check)
  - Validate category exists nếu có
  - Validate amount > 0 nếu có

### 5. **DELETE /api/v1/expenses/:id** - Xóa expense

- **Auth**: Required (JWT)
- **Validation**:
  - Kiểm tra expense tồn tại
  - Kiểm tra userId từ token === expense.userId (owner check)
- **Response**: Success message

### 6. **GET /api/v1/expenses/summary** - Thống kê expense

- **Auth**: Required (JWT)
- **Features**:
  - Filter theo `from` (date)
  - Filter theo `to` (date)
  - Filter theo `userId` (từ auth token)
  - Group by category
  - Group by time period (day/week/month)
- **Response**:
  ```json
  {
    "total": 1000000,
    "byCategory": [
      { "category": "food", "total": 500000, "count": 10 },
      { "category": "transport", "total": 300000, "count": 5 }
    ],
    "byTimePeriod": [{ "period": "2024-01", "total": 800000, "count": 12 }]
  }
  ```

### 7. **GET /api/v1/expenses/categories** - Lấy danh sách categories

- **Auth**: Public (không cần auth)
- **Response**: List tất cả categories từ bảng Category
- **Note**: Có thể cache kết quả này

---

## 📦 Các Package Cần Cài Đặt

```bash
# Authentication
npm install @nestjs/passport passport passport-jwt
npm install --save-dev @types/passport-jwt

# Validation
npm install class-validator class-transformer

# Config
npm install @nestjs/config

# Swagger (Optional - cho API documentation)
npm install @nestjs/swagger swagger-ui-express
```

---

## 🏗️ Cấu Trúc Code Cần Tạo

```
src/
├── common/
│   ├── decorators/
│   │   ├── auth.decorator.ts          # Custom auth decorator
│   │   └── user.decorator.ts          # Extract user from request
│   ├── guards/
│   │   └── jwt-auth.guard.ts         # JWT authentication guard
│   ├── filters/
│   │   └── http-exception.filter.ts  # Global exception filter
│   └── interceptors/
│       └── transform.interceptor.ts   # Response transformation
│
├── config/
│   └── app.config.ts                  # App configuration
│
├── expenses/
│   ├── expenses.controller.ts         # API endpoints
│   ├── expenses.service.ts            # Business logic
│   ├── expenses.module.ts             # Module definition
│   ├── dto/
│   │   ├── create-expense.dto.ts     # DTO cho POST
│   │   ├── update-expense.dto.ts     # DTO cho PUT
│   │   ├── query-expense.dto.ts      # DTO cho GET list
│   │   └── summary-expense.dto.ts    # DTO cho summary
│   └── entities/
│       └── expense.entity.ts          # Entity/Response interface
│
├── categories/
│   ├── categories.controller.ts       # API endpoints
│   ├── categories.service.ts          # Business logic
│   └── categories.module.ts           # Module definition
│
├── prisma/
│   └── prisma.service.ts              # ✅ Đã có
│
├── app.module.ts                      # Root module
└── main.ts                            # Bootstrap
```

---

## 🔨 Chi Tiết Implementation

### Phase 1: Setup Infrastructure (30 phút)

1. **Cài đặt packages**

   ```bash
   npm install @nestjs/passport passport passport-jwt class-validator class-transformer @nestjs/config
   npm install --save-dev @types/passport-jwt
   ```

2. **Tạo configuration**
   - `src/config/app.config.ts`: JWT secret, database URL, port
   - Cập nhật `app.module.ts` để import ConfigModule

3. **Setup global validation & transformation**
   - Update `main.ts`:
     - Enable global ValidationPipe
     - Enable CORS
     - Set global prefix `/api/v1`
     - Enable transform options

### Phase 2: Authentication Setup (45 phút)

1. **Tạo JWT Strategy**
   - `src/common/strategies/jwt.strategy.ts`
   - Validate JWT token
   - Extract userId từ payload

2. **Tạo Guards**
   - `src/common/guards/jwt-auth.guard.ts`
   - Protect routes với JWT

3. **Tạo Decorators**
   - `src/common/decorators/auth.decorator.ts`: `@Auth()` decorator
   - `src/common/decorators/user.decorator.ts`: `@CurrentUser()` để extract userId

4. **Tạo Exception Filters**
   - `src/common/filters/http-exception.filter.ts`
   - Standardize error responses

### Phase 3: Categories Module (30 phút)

1. **Tạo Categories Module**

   ```
   src/categories/
   ├── categories.controller.ts
   ├── categories.service.ts
   └── categories.module.ts
   ```

2. **Implement GET /api/v1/expenses/categories**
   - Service: `categoriesService.findAll()`
   - Controller: Public route (không auth)
   - Return tất cả categories

3. **Test endpoint**

### Phase 4: Expenses Module - CRUD (2 giờ)

1. **Tạo DTOs**
   - `create-expense.dto.ts`:
     ```typescript
     {
       description: string;    // @IsString, @IsNotEmpty
       amount: number;         // @IsNumber, @Min(0.01)
       category?: string;      // @IsOptional, @IsString
       spentAt: Date;          // @IsDateString
     }
     ```
   - `update-expense.dto.ts`:
     ```typescript
     // All fields optional (PartialType)
     ```
   - `query-expense.dto.ts`:
     ```typescript
     {
       from?: Date;            // @IsOptional, @IsDateString
       to?: Date;              // @IsOptional, @IsDateString
       category?: string;      // @IsOptional
       page?: number;          // @IsOptional, @Min(1), default: 1
       limit?: number;         // @IsOptional, @Min(1), @Max(100), default: 10
     }
     ```

2. **Implement Service Methods**
   - `findAll(userId, query)`: GET list with filters & pagination
   - `findOne(id, userId)`: GET by id + owner check
   - `create(data, userId)`: POST create
   - `update(id, data, userId)`: PUT update + owner check
   - `remove(id, userId)`: DELETE + owner check

3. **Implement Controller**
   - `GET /expenses`: `@Auth()`, `@Query()`, `@CurrentUser()`
   - `POST /expenses`: `@Auth()`, `@Body()`, `@CurrentUser()`
   - `GET /expenses/:id`: `@Auth()`, `@Param()`, `@CurrentUser()`
   - `PUT /expenses/:id`: `@Auth()`, `@Param()`, `@Body()`, `@CurrentUser()`
   - `DELETE /expenses/:id`: `@Auth()`, `@Param()`, `@CurrentUser()`

4. **Business Logic trong Service**
   - Owner check: Verify `userId === expense.userId`
   - Not found: Throw `NotFoundException`
   - Category validation: Check category exists trước khi save
   - Pagination: Tính offset, return total count

### Phase 5: Expenses Summary (1 giờ)

1. **Tạo Summary DTO**
   - `summary-expense.dto.ts`:
     ```typescript
     {
       from?: Date;
       to?: Date;
       groupBy?: 'category' | 'day' | 'week' | 'month';
     }
     ```

2. **Implement Summary Service**
   - `getSummary(userId, query)`:
     - Use Prisma aggregation
     - Group by category: `groupBy(['category'])`
     - Group by time period: Format `spentAt`
     - Calculate total amount & count

3. **Implement Summary Controller**
   - `GET /expenses/summary`: `@Auth()`, `@Query()`, `@CurrentUser()`

4. **Optimize Query**
   - Use existing index: `(userId, spentAt)`
   - Use `_sum`, `_count` aggregation

### Phase 6: Testing & Documentation (1 giờ)

1. **Unit Tests**
   - Test service methods với mocked PrismaService
   - Test owner check logic
   - Test validation logic

2. **E2E Tests**
   - Test all endpoints với valid/invalid JWT
   - Test pagination
   - Test filters
   - Test owner check

3. **API Documentation**
   - Add Swagger decorators (optional)
   - Update README.md với API examples

---

## 🔒 Security Considerations

1. **Authentication**
   - JWT token required cho các protected routes
   - Token validation trong JwtStrategy
   - Extract userId từ token payload

2. **Authorization**
   - Owner check: User chỉ có thể CRUD expenses của mình
   - Implement trong service layer

3. **Validation**
   - DTO validation với class-validator
   - Sanitize input data
   - Validate amount > 0
   - Validate category exists

4. **Error Handling**
   - Không expose sensitive info trong error messages
   - Return appropriate HTTP status codes
   - Use global exception filter

---

## 📊 Response Format Standards

### Success Response

```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### List Response with Pagination

```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### Error Response

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [...],
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/v1/expenses"
}
```

---

## 🚀 Deployment Checklist

- [ ] Environment variables setup (.env)
  - DATABASE_URL
  - JWT_SECRET
  - JWT_EXPIRES_IN
  - PORT
- [ ] Database migrations
  - Run `npm run prisma:migrate`
  - Seed categories table
- [ ] Docker setup
  - Update Dockerfile nếu cần
  - Update docker-compose.yml nếu cần
- [ ] Testing
  - Unit tests pass
  - E2E tests pass
  - Manual testing với Postman/Thunder Client

---

## 📝 Notes

1. **JWT Token Format Expected**:

   ```json
   {
     "userId": "uuid-string",
     "email": "user@example.com",
     "iat": 1234567890,
     "exp": 1234567890
   }
   ```

2. **Category Data Seeding**:
   - Cần seed data cho bảng Category
   - Tạo file `prisma/seed.ts` để seed categories

3. **Date Handling**:
   - Client gửi date format ISO 8601
   - Backend parse với Date object
   - Database store as DATE type

4. **Decimal Handling**:
   - Prisma Decimal type
   - Convert to number khi return response
   - Validate precision trong DTO

5. **Performance Optimization**:
   - Index đã có: `(userId, spentAt)`
   - Consider thêm index cho `category` nếu query nhiều
   - Cache categories list (rarely changes)

---

## ⏱️ Timeline Estimate

| Phase     | Task                    | Time           |
| --------- | ----------------------- | -------------- |
| 1         | Setup Infrastructure    | 30 min         |
| 2         | Authentication Setup    | 45 min         |
| 3         | Categories Module       | 30 min         |
| 4         | Expenses CRUD           | 2 hours        |
| 5         | Expenses Summary        | 1 hour         |
| 6         | Testing & Documentation | 1 hour         |
| **Total** |                         | **~5.5 hours** |

---

## 🎯 Priority Order

1. ✅ **High Priority** (MVP)
   - Phase 1: Setup Infrastructure
   - Phase 2: Authentication Setup
   - Phase 3: Categories Module
   - Phase 4: Expenses CRUD (GET, POST, PUT, DELETE)

2. 🔶 **Medium Priority** (Enhanced Features)
   - Phase 5: Expenses Summary

3. 🔵 **Low Priority** (Nice to Have)
   - Phase 6: Comprehensive Testing & Documentation
   - Swagger API Documentation
   - Advanced filtering options
   - Export to CSV/Excel

---

## 🔗 Related Services (Future Integration)

- **Auth Service**: Validate JWT tokens, get user info
- **Notification Service**: Send alerts khi chi tiêu vượt ngân sách
- **Report Service**: Generate monthly reports
- **Budget Service**: Track và compare với budget limits

---

_Last Updated: December 13, 2025_
