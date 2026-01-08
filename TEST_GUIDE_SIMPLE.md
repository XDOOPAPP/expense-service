# 🚀 Hướng dẫn Test Expense Service (Siêu nhanh)

Tài liệu này hướng dẫn cách chạy và test Expense Service từ lúc mới clone code về.

## 1. Khởi chạy hệ thống (Docker)

Mở terminal và chạy theo thứ tự:

```powershell
# B1: Chạy hạ tầng (Database, RabbitMQ)
cd deployment
docker-compose up -d

# B2: Chạy API Gateway & Auth Service (Để lấy Login/Token)
cd ../api-gateway
docker-compose up -d

# B3: Chạy Expense Service
cd ../expense-service
docker-compose up -d --build
```

---

## 2. Khởi tạo Database (BẮT BUỘC)

Sau khi container đã chạy, bạn cần tạo bảng và dữ liệu mẫu:

```powershell
# Tạo bảng trong Database
docker exec -it expense-service npx prisma migrate deploy
docker exec -it expense-service npx prisma db push

# Thêm danh mục mẫu (food, transport, shopping...)
docker exec -it expense-service node prisma/seed.js
```

---

## 3. Test trên Postman

### Bước 1: Lấy Token (Login)
*   **Method:** `POST`
*   **URL:** `http://localhost:3000/api/v1/user/login` (hoặc `/auth/login`)
*   **Body (JSON):**
    ```json
    {
      "email": "admin@fepa.com",
      "password": "admin123"
    }
    ```
*   **Kết quả:** Copy chuỗi `access_token` trả về.

### Bước 2: Tạo Chi Tiêu (Create Expense)
*   **Method:** `POST`
*   **URL:** `http://localhost:3000/api/v1/expenses`
*   **Headers:** 
    *   `Authorization`: `Bearer <Dán_Token_Vào_Đây>`
*   **Body (JSON):**
    ```json
    {
      "description": "Ăn trưa văn phòng",
      "amount": 50000,
      "category": "food",
      "spentAt": "2026-01-08"
    }
    ```

### Bước 3: Xem danh sách
*   **Method:** `GET`
*   **URL:** `http://localhost:3000/api/v1/expenses`
*   **Headers:** `Authorization`: `Bearer <Token>`

---

## 💡 Lưu ý quan trọng
*   **Lỗi 500:** Nếu gặp lỗi này, hãy chạy lệnh `docker logs expense-service` để xem lỗi.
*   **Cổng kết nối:** 
    *   API Gateway: `3000` (Chúng ta dùng cổng này để test tập trung).
    *   RabbitMQ: `http://localhost:15672` (fepa/fepa123).
