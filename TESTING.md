# Testing Guide

## Generating Test JWT Token

Since this service requires JWT authentication, you'll need a valid JWT token for testing. Here's how to generate one:

### Option 1: Using jwt.io

1. Go to [https://jwt.io](https://jwt.io)
2. In the "Decoded" section, enter this payload:
   ```json
   {
     "userId": "123e4567-e89b-12d3-a456-426614174000",
     "email": "test@example.com",
     "iat": 1702473600,
     "exp": 1703078400
   }
   ```
3. In the "Verify Signature" section, enter your JWT_SECRET from `.env`
4. Copy the generated token from the "Encoded" section

### Option 2: Using Node.js Script

Create a file `generate-token.js`:

```javascript
const jwt = require('jsonwebtoken');

const payload = {
  userId: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
};

const secret = 'dev-secret-key-change-in-production'; // Use your JWT_SECRET

const token = jwt.sign(payload, secret, { expiresIn: '7d' });

console.log('JWT Token:');
console.log(token);
```

Run: `node generate-token.js`

### Option 3: Using Online Tools

Use online JWT generators like:

- https://jwt.io
- https://dinochiesa.github.io/jwt/

## Testing with Postman/Thunder Client

1. Import the `postman-collection.json` file
2. Set the `JWT_TOKEN` variable with your generated token
3. Test the endpoints

## Testing with Swagger

1. Start the application: `npm run start:dev`
2. Open http://localhost:3000/api/docs
3. Click "Authorize" button
4. Enter `Bearer <your-jwt-token>`
5. Test the endpoints directly in the UI

## Testing with cURL

### Get Categories (No Auth)

```bash
curl http://localhost:3000/api/v1/expenses/categories
```

### Create Expense

```bash
curl -X POST http://localhost:3000/api/v1/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "description": "Test expense",
    "amount": 100000,
    "category": "food",
    "spentAt": "2024-12-13"
  }'
```

### Get All Expenses

```bash
curl http://localhost:3000/api/v1/expenses?page=1&limit=10 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Summary

```bash
curl http://localhost:3000/api/v1/expenses/summary?groupBy=month \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Running Unit Tests

```bash
npm run test
```

## Running E2E Tests

```bash
npm run test:e2e
```

## Important Notes

- The `userId` in JWT payload must be a valid UUID format
- JWT_SECRET in your test token must match the one in `.env`
- For production testing, obtain JWT tokens from your auth service
- Test tokens expire based on the `exp` claim
