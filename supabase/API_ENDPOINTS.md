# Car Service Management - API Endpoints

## Base URL
```
https://{projectId}.supabase.co/functions/v1/make-server-cd2dec47
```

## Authentication
All authenticated endpoints require the `Authorization` header:
```
Authorization: Bearer {accessToken}
```

For public endpoints (health, insights), use:
```
Authorization: Bearer {publicAnonKey}
```

---

## 1. Authentication Endpoints

### POST `/auth/send-otp`
Send OTP code to phone number

**Request Body:**
```json
{
  "phoneNumber": "+989123456789",
  "language": "fa"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

---

### POST `/auth/verify-otp`
Verify OTP and get access token

**Request Body:**
```json
{
  "phoneNumber": "+989123456789",
  "otpCode": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "eyJhbGc...",
  "refreshToken": "v1.refresh...",
  "user": {
    "id": "uuid",
    "phone": "+989123456789"
  }
}
```

---

### POST `/auth/refresh`
Refresh access token

**Request Body:**
```json
{
  "refreshToken": "v1.refresh..."
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "eyJhbGc...",
  "refreshToken": "v1.refresh..."
}
```

---

## 2. Profile Endpoints

### GET `/profile`
Get current user's profile

**Headers:** `Authorization: Bearer {accessToken}`

**Response:**
```json
{
  "id": "uuid",
  "phoneNumber": "+989123456789",
  "displayName": "علی احمدی",
  "preferredLanguage": "fa",
  "themePreference": "dark",
  "distanceUnit": "km",
  "currency": "toman",
  "pushNotificationToken": "expo-token...",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-20T14:22:00Z"
}
```

---

### PUT `/profile`
Update user profile

**Headers:** `Authorization: Bearer {accessToken}`

**Request Body:**
```json
{
  "displayName": "علی احمدی",
  "preferredLanguage": "fa",
  "themePreference": "dark",
  "pushNotificationToken": "expo-token..."
}
```

**Response:**
```json
{
  "success": true,
  "profile": { /* updated profile */ }
}
```

---

## 3. Car Endpoints

### GET `/cars`
Get all user's cars

**Headers:** `Authorization: Bearer {accessToken}`

**Query Parameters:**
- `includeInactive` (boolean, optional): Include inactive cars

**Response:**
```json
{
  "cars": [
    {
      "id": "uuid",
      "userId": "uuid",
      "brand": "تویوتا",
      "model": "کمری",
      "year": 2020,
      "color": "نقره‌ای",
      "licensePlate": "۱۲ الف ۳۴۵ ایران ۶۷",
      "vin": "1HGBH41JXMN109186",
      "currentMileage": 45000,
      "displayOrder": 0,
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-20T14:22:00Z",
      "stats": {
        "totalServices": 12,
        "lastServiceDate": "2024-01-10",
        "upcomingReminders": 2
      }
    }
  ]
}
```

---

### GET `/cars/:carId`
Get single car details

**Headers:** `Authorization: Bearer {accessToken}`

**Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "brand": "تویوتا",
  "model": "کمری",
  /* ... all car fields ... */
  "insurance": {
    "id": "uuid",
    "insuranceType": "third_party",
    "endDate": "2024-12-31",
    "daysUntilExpiry": 245
  },
  "technicalInspection": {
    "id": "uuid",
    "expiryDate": "2024-11-15",
    "daysUntilExpiry": 199
  }
}
```

---

### POST `/cars`
Create new car

**Headers:** `Authorization: Bearer {accessToken}`

**Request Body:**
```json
{
  "brand": "تویوتا",
  "model": "کمری",
  "year": 2020,
  "color": "نقره‌ای",
  "licensePlate": "۱۲ الف ۳۴۵ ایران ۶۷",
  "vin": "1HGBH41JXMN109186",
  "currentMileage": 45000
}
```

**Response:**
```json
{
  "success": true,
  "car": { /* created car object */ }
}
```

---

### PUT `/cars/:carId`
Update car

**Headers:** `Authorization: Bearer {accessToken}`

**Request Body:**
```json
{
  "currentMileage": 45500,
  "color": "مشکی"
}
```

**Response:**
```json
{
  "success": true,
  "car": { /* updated car object */ }
}
```

---

### DELETE `/cars/:carId`
Delete car (soft delete by default)

**Headers:** `Authorization: Bearer {accessToken}`

**Query Parameters:**
- `permanent` (boolean, optional): Permanently delete

**Response:**
```json
{
  "success": true,
  "message": "Car deleted successfully"
}
```

---

### PUT `/cars/:carId/reorder`
Update car display order

**Headers:** `Authorization: Bearer {accessToken}`

**Request Body:**
```json
{
  "displayOrder": 1
}
```

**Response:**
```json
{
  "success": true
}
```

---

## 4. Service Endpoints

### GET `/cars/:carId/services`
Get service history for a car

**Headers:** `Authorization: Bearer {accessToken}`

**Query Parameters:**
- `limit` (number, optional): Max results (default: 50)
- `offset` (number, optional): Pagination offset
- `category` (string, optional): Filter by category key
- `fromDate` (date, optional): Filter from date
- `toDate` (date, optional): Filter to date

**Response:**
```json
{
  "services": [
    {
      "id": "uuid",
      "carId": "uuid",
      "category": {
        "id": "uuid",
        "key": "oil",
        "nameFa": "تعویض روغن",
        "nameEn": "Oil Change",
        "icon": "oil",
        "color": "#9B59B6"
      },
      "serviceDate": "2024-01-10",
      "mileage": 44500,
      "cost": 2500000,
      "currency": "toman",
      "description": "تعویض روغن و فیلتر",
      "notes": "از روغن سینتتیک استفاده شد",
      "serviceProvider": "تعمیرگاه مهرگان",
      "serviceProviderPhone": "+982112345678",
      "items": [
        {
          "id": "uuid",
          "checklistItemId": "uuid",
          "name": "تعویض روغن موتور",
          "isChecked": true,
          "notes": null
        },
        {
          "id": "uuid",
          "customItemName": "تعویض واشر کارتر",
          "isChecked": true,
          "notes": "واشر فلزی"
        }
      ],
      "createdAt": "2024-01-10T15:30:00Z",
      "updatedAt": "2024-01-10T15:30:00Z"
    }
  ],
  "pagination": {
    "total": 12,
    "limit": 50,
    "offset": 0
  }
}
```

---

### GET `/cars/:carId/services/:serviceId`
Get single service details

**Headers:** `Authorization: Bearer {accessToken}`

**Response:**
```json
{
  "id": "uuid",
  /* ... full service object with items ... */
}
```

---

### POST `/cars/:carId/services`
Create new service record

**Headers:** `Authorization: Bearer {accessToken}`

**Request Body:**
```json
{
  "categoryId": "uuid",
  "serviceDate": "2024-01-10",
  "mileage": 44500,
  "cost": 2500000,
  "currency": "toman",
  "description": "تعویض روغن و فیلتر",
  "notes": "از روغن سینتتیک استفاده شد",
  "serviceProvider": "تعمیرگاه مهرگان",
  "serviceProviderPhone": "+982112345678",
  "items": [
    {
      "checklistItemId": "uuid",
      "isChecked": true,
      "notes": null
    },
    {
      "customItemName": "تعویض واشر کارتر",
      "isChecked": true,
      "notes": "واشر فلزی"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "service": { /* created service object */ }
}
```

---

### PUT `/cars/:carId/services/:serviceId`
Update service record

**Headers:** `Authorization: Bearer {accessToken}`

**Request Body:**
```json
{
  "cost": 2700000,
  "notes": "هزینه تعویض واشر اضافه شد",
  "items": [
    /* updated items array */
  ]
}
```

**Response:**
```json
{
  "success": true,
  "service": { /* updated service object */ }
}
```

---

### DELETE `/cars/:carId/services/:serviceId`
Delete service record

**Headers:** `Authorization: Bearer {accessToken}`

**Response:**
```json
{
  "success": true,
  "message": "Service deleted successfully"
}
```

---

### GET `/cars/:carId/services/stats`
Get service statistics for a car

**Headers:** `Authorization: Bearer {accessToken}`

**Query Parameters:**
- `year` (number, optional): Filter by year

**Response:**
```json
{
  "totalServices": 12,
  "totalCost": 45000000,
  "averageCostPerService": 3750000,
  "servicesByCategory": [
    {
      "categoryKey": "oil",
      "categoryName": "تعویض روغن",
      "count": 4,
      "totalCost": 10000000
    },
    {
      "categoryKey": "brake",
      "categoryName": "ترمز",
      "count": 2,
      "totalCost": 8000000
    }
  ],
  "monthlyServices": [
    { "month": "2024-01", "count": 2, "cost": 5000000 },
    { "month": "2024-02", "count": 1, "cost": 2500000 }
  ]
}
```

---

### GET `/cars/:carId/services/export`
Export service history to CSV/JSON

**Headers:** `Authorization: Bearer {accessToken}`

**Query Parameters:**
- `format` (string): 'csv' or 'json'
- `language` (string): 'fa' or 'en'

**Response:**
- Content-Type: text/csv or application/json
- Content-Disposition: attachment; filename="service-history.csv"

---

## 5. Reminder Endpoints

### GET `/cars/:carId/reminders`
Get reminders for a car

**Headers:** `Authorization: Bearer {accessToken}`

**Query Parameters:**
- `status` (string, optional): Filter by status ('upcoming', 'completed', 'overdue', 'dismissed')

**Response:**
```json
{
  "reminders": [
    {
      "id": "uuid",
      "carId": "uuid",
      "category": {
        "id": "uuid",
        "key": "oil",
        "nameFa": "تعویض روغن",
        "icon": "oil",
        "color": "#9B59B6"
      },
      "title": "تعویض روغن موتور",
      "description": "زمان تعویض روغن موتور فرا رسیده است",
      "dueDate": "2024-02-15",
      "dueMileage": 50000,
      "status": "upcoming",
      "notifyDaysBefore": 7,
      "notifyKmBefore": 500,
      "lastNotificationSentAt": null,
      "completedAt": null,
      "completedServiceId": null,
      "daysUntilDue": 15,
      "kmUntilDue": 5000,
      "isOverdue": false,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### GET `/reminders/upcoming`
Get all upcoming reminders for user (across all cars)

**Headers:** `Authorization: Bearer {accessToken}`

**Query Parameters:**
- `limit` (number, optional): Max results (default: 20)

**Response:**
```json
{
  "reminders": [
    {
      /* reminder object with car details */
      "car": {
        "id": "uuid",
        "brand": "تویوتا",
        "model": "کمری",
        "licensePlate": "۱۲ الف ۳۴۵ ایران ۶۷"
      }
    }
  ]
}
```

---

### POST `/cars/:carId/reminders`
Create new reminder

**Headers:** `Authorization: Bearer {accessToken}`

**Request Body:**
```json
{
  "categoryId": "uuid",
  "title": "تعویض روغن موتور",
  "description": "زمان تعویض روغن موتور فرا رسیده است",
  "dueDate": "2024-02-15",
  "dueMileage": 50000,
  "notifyDaysBefore": 7,
  "notifyKmBefore": 500
}
```

**Response:**
```json
{
  "success": true,
  "reminder": { /* created reminder object */ }
}
```

---

### PUT `/cars/:carId/reminders/:reminderId`
Update reminder

**Headers:** `Authorization: Bearer {accessToken}`

**Request Body:**
```json
{
  "dueDate": "2024-02-20",
  "dueMileage": 51000,
  "status": "upcoming"
}
```

**Response:**
```json
{
  "success": true,
  "reminder": { /* updated reminder object */ }
}
```

---

### POST `/cars/:carId/reminders/:reminderId/complete`
Mark reminder as completed

**Headers:** `Authorization: Bearer {accessToken}`

**Request Body:**
```json
{
  "serviceId": "uuid" // Optional: link to completed service
}
```

**Response:**
```json
{
  "success": true,
  "reminder": {
    "id": "uuid",
    "status": "completed",
    "completedAt": "2024-01-20T15:30:00Z",
    "completedServiceId": "uuid"
  }
}
```

---

### POST `/cars/:carId/reminders/:reminderId/dismiss`
Dismiss reminder

**Headers:** `Authorization: Bearer {accessToken}`

**Response:**
```json
{
  "success": true,
  "reminder": {
    "id": "uuid",
    "status": "dismissed"
  }
}
```

---

### DELETE `/cars/:carId/reminders/:reminderId`
Delete reminder

**Headers:** `Authorization: Bearer {accessToken}`

**Response:**
```json
{
  "success": true,
  "message": "Reminder deleted successfully"
}
```

---

## 6. Insurance Endpoints

### GET `/cars/:carId/insurance`
Get insurance records for a car

**Headers:** `Authorization: Bearer {accessToken}`

**Query Parameters:**
- `current` (boolean, optional): Only return current insurance

**Response:**
```json
{
  "records": [
    {
      "id": "uuid",
      "carId": "uuid",
      "insuranceType": "third_party",
      "insuranceCompany": "بیمه ایران",
      "policyNumber": "IR-123456789",
      "startDate": "2024-01-01",
      "endDate": "2024-12-31",
      "premiumAmount": 15000000,
      "currency": "toman",
      "documentUrl": null,
      "isCurrent": true,
      "notes": "بیمه شخص ثالث",
      "daysUntilExpiry": 245,
      "isExpiringSoon": false,
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-01T10:00:00Z"
    }
  ]
}
```

---

### POST `/cars/:carId/insurance`
Create insurance record

**Headers:** `Authorization: Bearer {accessToken}`

**Request Body:**
```json
{
  "insuranceType": "third_party",
  "insuranceCompany": "بیمه ایران",
  "policyNumber": "IR-123456789",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "premiumAmount": 15000000,
  "currency": "toman",
  "notes": "بیمه شخص ثالث",
  "isCurrent": true
}
```

**Response:**
```json
{
  "success": true,
  "insurance": { /* created insurance object */ }
}
```

---

### PUT `/cars/:carId/insurance/:insuranceId`
Update insurance record

**Headers:** `Authorization: Bearer {accessToken}`

**Request Body:**
```json
{
  "endDate": "2025-01-01",
  "isCurrent": true
}
```

**Response:**
```json
{
  "success": true,
  "insurance": { /* updated insurance object */ }
}
```

---

### DELETE `/cars/:carId/insurance/:insuranceId`
Delete insurance record

**Headers:** `Authorization: Bearer {accessToken}`

**Response:**
```json
{
  "success": true,
  "message": "Insurance record deleted successfully"
}
```

---

## 7. Technical Inspection Endpoints

### GET `/cars/:carId/inspections`
Get technical inspection records for a car

**Headers:** `Authorization: Bearer {accessToken}`

**Query Parameters:**
- `current` (boolean, optional): Only return current inspection

**Response:**
```json
{
  "records": [
    {
      "id": "uuid",
      "carId": "uuid",
      "inspectionCenter": "مرکز معاینه فنی شماره ۱",
      "certificateNumber": "TI-987654321",
      "inspectionDate": "2024-01-05",
      "expiryDate": "2024-07-05",
      "passed": true,
      "notes": "تمامی موارد تایید شد",
      "documentUrl": null,
      "isCurrent": true,
      "daysUntilExpiry": 135,
      "isExpiringSoon": false,
      "createdAt": "2024-01-05T14:30:00Z",
      "updatedAt": "2024-01-05T14:30:00Z"
    }
  ]
}
```

---

### POST `/cars/:carId/inspections`
Create technical inspection record

**Headers:** `Authorization: Bearer {accessToken}`

**Request Body:**
```json
{
  "inspectionCenter": "مرکز معاینه فنی شماره ۱",
  "certificateNumber": "TI-987654321",
  "inspectionDate": "2024-01-05",
  "expiryDate": "2024-07-05",
  "passed": true,
  "notes": "تمامی موارد تایید شد",
  "isCurrent": true
}
```

**Response:**
```json
{
  "success": true,
  "inspection": { /* created inspection object */ }
}
```

---

### PUT `/cars/:carId/inspections/:inspectionId`
Update technical inspection record

**Headers:** `Authorization: Bearer {accessToken}`

**Request Body:**
```json
{
  "expiryDate": "2024-08-05",
  "isCurrent": true
}
```

**Response:**
```json
{
  "success": true,
  "inspection": { /* updated inspection object */ }
}
```

---

### DELETE `/cars/:carId/inspections/:inspectionId`
Delete technical inspection record

**Headers:** `Authorization: Bearer {accessToken}`

**Response:**
```json
{
  "success": true,
  "message": "Inspection record deleted successfully"
}
```

---

## 8. Service Categories & Checklist Items

### GET `/service-categories`
Get all service categories

**Headers:** `Authorization: Bearer {publicAnonKey}` (public endpoint)

**Query Parameters:**
- `language` (string): 'fa' or 'en'

**Response:**
```json
{
  "categories": [
    {
      "id": "uuid",
      "key": "oil",
      "nameEn": "Oil Change",
      "nameFa": "تعویض روغن",
      "icon": "oil",
      "color": "#9B59B6",
      "displayOrder": 6,
      "isActive": true
    }
  ]
}
```

---

### GET `/service-categories/:categoryId/checklist`
Get checklist items for a category

**Headers:** `Authorization: Bearer {publicAnonKey}` (public endpoint)

**Query Parameters:**
- `language` (string): 'fa' or 'en'

**Response:**
```json
{
  "items": [
    {
      "id": "uuid",
      "categoryId": "uuid",
      "nameEn": "Engine oil replacement",
      "nameFa": "تعویض روغن موتور",
      "displayOrder": 1,
      "isActive": true
    }
  ]
}
```

---

## 9. Insights / Blog Endpoints

### GET `/insights`
Get published blog posts

**Headers:** `Authorization: Bearer {publicAnonKey}` (public endpoint)

**Query Parameters:**
- `language` (string): 'fa' or 'en'
- `category` (string, optional): Filter by category
- `featured` (boolean, optional): Only featured posts
- `limit` (number, optional): Max results (default: 20)
- `offset` (number, optional): Pagination offset

**Response:**
```json
{
  "posts": [
    {
      "id": "uuid",
      "titleEn": "Essential Car Maintenance Tips",
      "titleFa": "نکات ضروری نگهداری خودرو",
      "contentEn": "Regular maintenance is crucial...",
      "contentFa": "نگهداری منظم بسیار مهم است...",
      "coverImageUrl": "https://...",
      "videoUrl": null,
      "category": "maintenance",
      "tags": ["maintenance", "tips", "oil"],
      "featured": true,
      "author": "تیم فنی",
      "publishedAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "limit": 20,
    "offset": 0
  }
}
```

---

### GET `/insights/:postId`
Get single blog post

**Headers:** `Authorization: Bearer {publicAnonKey}` (public endpoint)

**Query Parameters:**
- `language` (string): 'fa' or 'en'

**Response:**
```json
{
  "id": "uuid",
  "titleEn": "Essential Car Maintenance Tips",
  "titleFa": "نکات ضروری نگهداری خودرو",
  "contentEn": "Regular maintenance is crucial...",
  "contentFa": "نگهداری منظم بسیار مهم است...",
  /* ... full post details ... */
}
```

---

## 10. Notification Endpoints

### GET `/notifications`
Get user's notifications

**Headers:** `Authorization: Bearer {accessToken}`

**Query Parameters:**
- `unread` (boolean, optional): Only unread notifications
- `type` (string, optional): Filter by type
- `limit` (number, optional): Max results (default: 50)
- `offset` (number, optional): Pagination offset

**Response:**
```json
{
  "notifications": [
    {
      "id": "uuid",
      "userId": "uuid",
      "type": "reminder",
      "title": "یادآور تعویض روغن",
      "body": "روغن موتور تویوتا کمری خود را تا ۷ روز دیگر تعویض کنید",
      "referenceType": "reminder",
      "referenceId": "uuid",
      "isRead": false,
      "sentAt": "2024-01-20T09:00:00Z",
      "readAt": null,
      "pushSent": true,
      "pushSentAt": "2024-01-20T09:00:05Z"
    }
  ],
  "pagination": {
    "total": 15,
    "limit": 50,
    "offset": 0,
    "unreadCount": 3
  }
}
```

---

### PUT `/notifications/:notificationId/read`
Mark notification as read

**Headers:** `Authorization: Bearer {accessToken}`

**Response:**
```json
{
  "success": true,
  "notification": {
    "id": "uuid",
    "isRead": true,
    "readAt": "2024-01-20T15:30:00Z"
  }
}
```

---

### PUT `/notifications/read-all`
Mark all notifications as read

**Headers:** `Authorization: Bearer {accessToken}`

**Response:**
```json
{
  "success": true,
  "count": 3
}
```

---

### DELETE `/notifications/:notificationId`
Delete notification

**Headers:** `Authorization: Bearer {accessToken}`

**Response:**
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

---

## 11. Dashboard Endpoint

### GET `/dashboard`
Get comprehensive dashboard data

**Headers:** `Authorization: Bearer {accessToken}`

**Response:**
```json
{
  "cars": [
    {
      "id": "uuid",
      "brand": "تویوتا",
      "model": "کمری",
      "currentMileage": 45000,
      "lastServiceDate": "2024-01-10",
      "upcomingReminders": 2,
      "insurance": {
        "endDate": "2024-12-31",
        "daysUntilExpiry": 245,
        "isExpiringSoon": false
      },
      "technicalInspection": {
        "expiryDate": "2024-07-05",
        "daysUntilExpiry": 135,
        "isExpiringSoon": false
      }
    }
  ],
  "upcomingReminders": [
    /* top 5 upcoming reminders across all cars */
  ],
  "recentServices": [
    /* last 10 services across all cars */
  ],
  "alerts": [
    {
      "type": "insurance_expiring",
      "carId": "uuid",
      "message": "بیمه تویوتا کمری تا ۳۰ روز دیگر منقضی می‌شود",
      "severity": "warning",
      "daysUntil": 30
    }
  ],
  "stats": {
    "totalCars": 3,
    "totalServices": 45,
    "totalCostThisYear": 50000000,
    "upcomingRemindersCount": 5
  }
}
```

---

## Error Responses

All endpoints follow a consistent error format:

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation error",
  "details": {
    "field": "serviceDate",
    "message": "Service date is required"
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Invalid or expired access token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Forbidden",
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Not found",
  "message": "Car not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "An unexpected error occurred",
  "requestId": "uuid"
}
```

---

## Rate Limiting

- **Authenticated endpoints**: 100 requests per minute per user
- **Public endpoints**: 30 requests per minute per IP
- **OTP endpoints**: 3 requests per 5 minutes per phone number

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```

---

## Pagination

All list endpoints support pagination with these query parameters:
- `limit`: Number of items per page (default: 20, max: 100)
- `offset`: Number of items to skip (default: 0)

Response includes pagination metadata:
```json
{
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 40,
    "hasNext": true,
    "hasPrev": true
  }
}
```

---

## Filtering & Sorting

Most list endpoints support:
- **Filtering**: `?category=oil&status=completed`
- **Sorting**: `?sortBy=serviceDate&sortOrder=desc`
- **Search**: `?search=toyota`

---

## WebSocket Events (Future)

For real-time updates:

```javascript
// Connect to WebSocket
ws://projectId.supabase.co/functions/v1/make-server-cd2dec47/ws

// Subscribe to events
{
  "action": "subscribe",
  "channel": "user:{userId}",
  "accessToken": "eyJhbGc..."
}

// Receive events
{
  "event": "reminder_due",
  "data": { /* reminder object */ }
}
```

Event types:
- `reminder_due`: Reminder is now due
- `reminder_approaching`: Reminder approaching due date/mileage
- `insurance_expiring`: Insurance expiring soon
- `inspection_expiring`: Technical inspection expiring soon
- `service_added`: New service record added
- `car_updated`: Car details updated

---

## Best Practices

1. **Always include Authorization header** for authenticated endpoints
2. **Use pagination** for list endpoints to reduce payload size
3. **Cache service categories** and checklist items (they rarely change)
4. **Handle 401 errors** by refreshing access token
5. **Retry failed requests** with exponential backoff
6. **Validate input** on client side before sending requests
7. **Use proper HTTP methods**: GET (read), POST (create), PUT (update), DELETE (delete)
8. **Store access tokens securely** (never in localStorage, use secure storage)
9. **Log errors** with request IDs for debugging
10. **Test with different languages** ('fa' and 'en')

---

## Testing

Example cURL requests:

### Send OTP
```bash
curl -X POST https://projectId.supabase.co/functions/v1/make-server-cd2dec47/auth/send-otp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {publicAnonKey}" \
  -d '{"phoneNumber": "+989123456789", "language": "fa"}'
```

### Get Cars
```bash
curl -X GET https://projectId.supabase.co/functions/v1/make-server-cd2dec47/cars \
  -H "Authorization: Bearer {accessToken}"
```

### Create Service
```bash
curl -X POST https://projectId.supabase.co/functions/v1/make-server-cd2dec47/cars/{carId}/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {accessToken}" \
  -d '{
    "categoryId": "uuid",
    "serviceDate": "2024-01-10",
    "mileage": 44500,
    "cost": 2500000,
    "items": [{"checklistItemId": "uuid", "isChecked": true}]
  }'
```
