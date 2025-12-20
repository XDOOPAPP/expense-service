# Class Diagram - Expense Service

## UML Class Diagram (Đơn giản hóa)

```mermaid
classDiagram
    %% ============= ENTITIES =============
    class Expense {
        -String id
        -String userId
        -String description
        -Decimal amount
        -String category
        -DateTime spentAt
        -DateTime createdAt
        -DateTime updatedAt
    }

    class Category {
        -String slug
        -String name
    }

    %% ============= DTOs =============
    class CreateExpenseDto {
        +String description
        +Number amount
        +String category
        +String spentAt
    }

    class UpdateExpenseDto {
        +String description
        +Number amount
        +String category
        +String spentAt
    }

    class QueryExpenseDto {
        +String from
        +String to
        +String category
        +Number page
        +Number limit
    }

    class SummaryExpenseDto {
        +String from
        +String to
        +String groupBy
    }

    %% ============= CONTROLLERS =============
    class ExpensesController {
        -ExpensesService expensesService
        +create(dto, userId) Promise
        +findAll(query, userId) Promise
        +findOne(id, userId) Promise
        +update(id, dto, userId) Promise
        +remove(id, userId) Promise
        +getSummary(query, userId) Promise
    }

    class CategoriesController {
        -CategoriesService categoriesService
        +findAll() Promise
    }

    %% ============= SERVICES =============
    class ExpensesService {
        -PrismaService prisma
        +create(dto, userId) Promise
        +findAll(query, userId) Promise
        +findOne(id, userId) Promise
        +update(id, dto, userId) Promise
        +remove(id, userId) Promise
        +getSummary(query, userId) Promise
    }

    class CategoriesService {
        -PrismaService prisma
        +findAll() Promise
    }

    %% ============= REPOSITORY =============
    class PrismaService {
        <<Repository>>
        +expense ExpenseRepository
        +category CategoryRepository
        +findMany() Promise
        +findUnique() Promise
        +create() Promise
        +update() Promise
        +delete() Promise
    }

    %% ============= RELATIONSHIPS =============
    ExpensesController --> ExpensesService
    CategoriesController --> CategoriesService

    ExpensesService --> PrismaService
    CategoriesService --> PrismaService

    ExpensesController ..> CreateExpenseDto
    ExpensesController ..> UpdateExpenseDto
    ExpensesController ..> QueryExpenseDto
    ExpensesController ..> SummaryExpenseDto

    ExpensesService ..> Expense
    CategoriesService ..> Category

    PrismaService ..> Expense
    PrismaService ..> Category

    Expense --> Category : references
    UpdateExpenseDto --|> CreateExpenseDto : extends
```

## Kiến trúc Layered

```
┌─────────────────────────────────────┐
│         CONTROLLER LAYER            │
│  ExpensesController                 │
│  CategoriesController               │
│  (Nhận request, validate, response) │
└─────────────────┬───────────────────┘
                  │ uses
┌─────────────────▼───────────────────┐
│          SERVICE LAYER              │
│  ExpensesService                    │
│  CategoriesService                  │
│  (Business logic, validation)       │
└─────────────────┬───────────────────┘
                  │ uses
┌─────────────────▼───────────────────┐
│        REPOSITORY LAYER             │
│  PrismaService                      │
│  (Database access, queries)         │
└─────────────────┬───────────────────┘
                  │ accesses
┌─────────────────▼───────────────────┐
│         DATABASE LAYER              │
│  Expense Entity                     │
│  Category Entity                    │
│  (PostgreSQL)                       │
└─────────────────────────────────────┘

         ┌──────────────┐
         │  DTOs        │
         │  (Transfer)  │
         └──────────────┘
```

## Luồng xử lý:

**Request → Controller → Service → Repository → Database**

1. **Controller**: Nhận TCP message, validate DTO
2. **Service**: Xử lý business logic
3. **Repository (Prisma)**: Truy vấn database
4. **Entity**: Dữ liệu từ database
