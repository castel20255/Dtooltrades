# License Management Platform - API Reference

## Authentication

All authenticated endpoints require a valid Supabase session. The session is automatically managed via HTTP-only cookies.

### Login
- **Endpoint**: `POST /auth/login`
- **Method**: Web form submission
- **Description**: User login with email and password

### Signup
- **Endpoint**: `POST /auth/sign-up`
- **Method**: Web form submission
- **Description**: Create new user account
- **Note**: Email verification required before license access

### Logout
- **Endpoint**: Server-side sign out via Supabase client
- **Method**: DELETE
- **Description**: Clear session and logout user

---

## License Management APIs

### Validate License Key
```
POST /api/licenses/validate
Content-Type: application/json

{
  "licenseKey": "string",
  "deviceFingerprint": "string",
  "ipAddress": "string"
}

Response (200):
{
  "valid": boolean,
  "license": {
    "id": "uuid",
    "keyPrefix": "string",
    "expiresAt": "ISO8601",
    "status": "active|revoked|expired",
    "maxDevices": number,
    "devicesUsed": number
  },
  "session": {
    "sessionId": "uuid",
    "expiresAt": "ISO8601"
  }
}

Response (401):
{
  "error": "Invalid license key"
}

Response (403):
{
  "error": "License revoked" | "License expired" | "Device limit exceeded" | "IP blacklisted"
}
```

### Create License Key
```
POST /api/licenses/create
Authorization: Bearer {user_session}
Content-Type: application/json

{
  "planType": "30-day|yearly|lifetime",
  "maxDevices": 1-5 (default: 3),
  "durationDays": number (optional, overrides planType)
}

Response (201):
{
  "license": {
    "id": "uuid",
    "keyPrefix": "string",
    "fullKey": "string (shown once)",
    "expiresAt": "ISO8601",
    "status": "active",
    "maxDevices": number
  }
}

Response (400):
{
  "error": "Invalid plan type" | "Invalid device count"
}

Response (401):
{
  "error": "Unauthorized"
}

Response (402):
{
  "error": "Payment required"
}
```

### List User Licenses
```
GET /api/licenses/list
Authorization: Bearer {user_session}

Response (200):
{
  "licenses": [
    {
      "id": "uuid",
      "keyPrefix": "string",
      "status": "active|revoked|expired",
      "expiresAt": "ISO8601",
      "maxDevices": number,
      "devicesUsed": number,
      "createdAt": "ISO8601",
      "lastUsedAt": "ISO8601|null"
    }
  ]
}

Response (401):
{
  "error": "Unauthorized"
}
```

### Revoke License
```
POST /api/licenses/revoke
Authorization: Bearer {user_session}
Content-Type: application/json

{
  "licenseId": "uuid"
}

Response (200):
{
  "success": true,
  "license": {
    "id": "uuid",
    "status": "revoked",
    "revokedAt": "ISO8601"
  }
}

Response (404):
{
  "error": "License not found"
}

Response (403):
{
  "error": "Cannot revoke license (not owned by user)"
}
```

---

## Payment APIs

### Initiate MPESA Payment
```
POST /api/payments/initiate-mpesa
Authorization: Bearer {user_session}
Content-Type: application/json

{
  "phoneNumber": "254712345678",
  "amount": 500,
  "planType": "30-day|yearly|lifetime"
}

Response (201):
{
  "payment": {
    "id": "uuid",
    "status": "pending",
    "checkoutRequestId": "string",
    "amount": 500,
    "currency": "KES",
    "createdAt": "ISO8601"
  }
}

Response (400):
{
  "error": "Invalid phone number" | "Invalid amount" | "Invalid plan type"
}

Response (401):
{
  "error": "Unauthorized"
}

Response (503):
{
  "error": "MPESA service unavailable"
}
```

### MPESA Callback Handler
```
POST /api/payments/mpesa-callback
Content-Type: application/json

{
  "Body": {
    "stkCallback": {
      "MerchantRequestID": "string",
      "CheckoutRequestID": "string",
      "ResultCode": number,
      "ResultDesc": "string",
      "CallbackMetadata": {
        "Item": [
          { "Name": "Amount", "Value": number },
          { "Name": "MpesaReceiptNumber", "Value": "string" },
          { "Name": "PhoneNumber", "Value": "string" }
        ]
      }
    }
  }
}

Response (200):
{
  "success": true,
  "message": "Callback processed"
}
```

---

## Admin APIs

### List All Users
```
GET /api/admin/users
Authorization: Bearer {admin_session}

Query Parameters:
- limit: number (default: 100)
- offset: number (default: 0)
- search: string (search by email or name)
- sortBy: "created_at|total_spent" (default: created_at)

Response (200):
{
  "users": [
    {
      "id": "uuid",
      "email": "string",
      "fullName": "string",
      "country": "string",
      "createdAt": "ISO8601",
      "licenseCount": number,
      "activeLicenses": number,
      "totalSpent": number,
      "lastPayment": "ISO8601|null"
    }
  ],
  "count": number,
  "total": number
}

Response (403):
{
  "error": "Insufficient permissions"
}
```

### Manage All Licenses
```
GET /api/admin/licenses
Authorization: Bearer {admin_session}

Query Parameters:
- status: "active|revoked|expired"
- userId: "uuid" (filter by user)
- limit: number (default: 100)

Response (200):
{
  "licenses": [
    {
      "id": "uuid",
      "userId": "uuid",
      "userEmail": "string",
      "keyPrefix": "string",
      "status": "active|revoked|expired",
      "expiresAt": "ISO8601",
      "createdAt": "ISO8601",
      "deviceCount": number
    }
  ],
  "count": number
}

Response (403):
{
  "error": "Insufficient permissions"
}
```

### Get Analytics Data
```
GET /api/admin/analytics
Authorization: Bearer {admin_session}

Query Parameters:
- period: "day|week|month|year" (default: month)

Response (200):
{
  "summary": {
    "totalUsers": number,
    "activeUsers": number,
    "totalRevenue": number,
    "activeSubscriptions": number
  },
  "licenses": {
    "total": number,
    "active": number,
    "expired": number,
    "revoked": number
  },
  "payments": {
    "successful": number,
    "pending": number,
    "failed": number,
    "totalAmount": number
  },
  "timeline": [
    {
      "date": "YYYY-MM-DD",
      "newUsers": number,
      "payments": number,
      "revenue": number
    }
  ]
}

Response (403):
{
  "error": "Insufficient permissions"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "ISO8601"
}
```

### Common Error Codes
- `UNAUTHORIZED`: Missing or invalid session
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `BAD_REQUEST`: Invalid request parameters
- `CONFLICT`: Resource already exists
- `RATE_LIMIT`: Too many requests
- `SERVICE_ERROR`: Server error
- `PAYMENT_ERROR`: Payment processing failed

---

## Rate Limiting
- Public endpoints: 100 requests per minute per IP
- Authenticated endpoints: 1000 requests per minute per user
- Payment endpoints: 10 requests per minute per user

---

## WebSocket Events

Connect to WebSocket at `wss://yourdomain.com/api/websocket`

### Subscribe to Notifications
```json
{
  "type": "subscribe",
  "event": "license_expiring|payment_received|device_login|security_alert"
}
```

### Notification Format
```json
{
  "type": "notification",
  "event": "license_expiring|payment_received|device_login|security_alert",
  "data": {
    "id": "uuid",
    "title": "string",
    "message": "string",
    "timestamp": "ISO8601"
  }
}
```

---

## Best Practices

1. **Validate Responses**: Always check response status codes
2. **Handle Errors**: Implement proper error handling for all requests
3. **Rate Limiting**: Implement client-side rate limiting
4. **Security**: Never expose license keys in logs or debugging
5. **Caching**: Cache license validation results (5-10 minutes)
6. **Retry Logic**: Implement exponential backoff for failed requests
7. **Monitoring**: Log all payment-related API calls

---

## SDK / Library Support

Client libraries for common languages:
- JavaScript/TypeScript: Use native `fetch` with Supabase client
- Python: `requests` library with JWT authentication
- Java: `okhttp` or `HttpClient` with JWT authentication
