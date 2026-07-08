# API Testing Guide

Quick reference for testing all API endpoints with real examples.

---

## Setup

```bash
# Set your project credentials
export PROJECT_REF="your-project-ref"
export ANON_KEY="your-anon-key"
export ACCESS_TOKEN="your-access-token-after-login"

# Base URL
export BASE_URL="https://${PROJECT_REF}.supabase.co/functions/v1/make-server-cd2dec47"
```

---

## 1. Health Check

```bash
curl "${BASE_URL}/health"
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

---

## 2. Authentication

### Send OTP

```bash
curl -X POST "${BASE_URL}/auth/send-otp" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -d '{
    "phoneNumber": "+989123456789",
    "language": "fa"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "کد تایید ارسال شد"
}
```

### Verify OTP

```bash
curl -X POST "${BASE_URL}/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -d '{
    "phoneNumber": "+989123456789",
    "otpCode": "123456"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "v1.refresh...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "phone": "+989123456789"
  }
}
```

### Refresh Token

```bash
curl -X POST "${BASE_URL}/auth/refresh" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -d '{
    "refreshToken": "v1.refresh..."
  }'
```

---

## 3. Profile

### Get Profile

```bash
curl "${BASE_URL}/profile" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

**Expected Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "phoneNumber": "+989123456789",
  "displayName": "علی احمدی",
  "preferredLanguage": "fa",
  "themePreference": "dark",
  "distanceUnit": "km",
  "currency": "toman",
  "pushNotificationToken": null,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-20T14:22:00Z"
}
```

### Update Profile

```bash
curl -X PUT "${BASE_URL}/profile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -d '{
    "displayName": "علی احمدی",
    "preferredLanguage": "fa",
    "themePreference": "dark",
    "pushNotificationToken": "expo-token-abc123"
  }'
```

---

## 4. Cars

### Get All Cars

```bash
curl "${BASE_URL}/cars" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### Get Single Car

```bash
curl "${BASE_URL}/cars/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### Create Car

```bash
curl -X POST "${BASE_URL}/cars" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -d '{
    "brand": "تویوتا",
    "model": "کمری",
    "year": 2020,
    "color": "نقره‌ای",
    "licensePlate": "۱۲ الف ۳۴۵ ایران ۶۷",
    "vin": "1HGBH41JXMN109186",
    "currentMileage": 45000
  }'
```

### Update Car

```bash
curl -X PUT "${BASE_URL}/cars/550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -d '{
    "currentMileage": 45500,
    "color": "مشکی"
  }'
```

### Delete Car (Soft Delete)

```bash
curl -X DELETE "${BASE_URL}/cars/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### Delete Car (Permanent)

```bash
curl -X DELETE "${BASE_URL}/cars/550e8400-e29b-41d4-a716-446655440000?permanent=true" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

---

## 5. Service Categories

### Get All Categories

```bash
curl "${BASE_URL}/service-categories?language=fa" \
  -H "Authorization: Bearer ${ANON_KEY}"
```

**Expected Response:**
```json
{
  "categories": [
    {
      "id": "uuid",
      "key": "engine",
      "nameEn": "Engine",
      "nameFa": "موتور",
      "icon": "engine",
      "color": "#5E59C0",
      "displayOrder": 1,
      "isActive": true
    },
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

### Get Checklist Items for Category

```bash
curl "${BASE_URL}/service-categories/550e8400-e29b-41d4-a716-446655440000/checklist?language=fa" \
  -H "Authorization: Bearer ${ANON_KEY}"
```

---

## 6. Services

### Get Service History

```bash
curl "${BASE_URL}/cars/550e8400-e29b-41d4-a716-446655440000/services?limit=20&offset=0" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### Get Service History (Filtered)

```bash
# Filter by category
curl "${BASE_URL}/cars/550e8400-e29b-41d4-a716-446655440000/services?category=oil" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"

# Filter by date range
curl "${BASE_URL}/cars/550e8400-e29b-41d4-a716-446655440000/services?fromDate=2024-01-01&toDate=2024-12-31" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### Get Single Service

```bash
curl "${BASE_URL}/cars/550e8400-e29b-41d4-a716-446655440000/services/660e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### Create Service

```bash
curl -X POST "${BASE_URL}/cars/550e8400-e29b-41d4-a716-446655440000/services" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -d '{
    "categoryId": "770e8400-e29b-41d4-a716-446655440000",
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
        "checklistItemId": "880e8400-e29b-41d4-a716-446655440000",
        "isChecked": true,
        "notes": null
      },
      {
        "customItemName": "تعویض واشر کارتر",
        "isChecked": true,
        "notes": "واشر فلزی"
      }
    ]
  }'
```

### Update Service

```bash
curl -X PUT "${BASE_URL}/cars/550e8400-e29b-41d4-a716-446655440000/services/660e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -d '{
    "cost": 2700000,
    "notes": "هزینه تعویض واشر اضافه شد"
  }'
```

### Delete Service

```bash
curl -X DELETE "${BASE_URL}/cars/550e8400-e29b-41d4-a716-446655440000/services/660e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

---

## 7. Reminders

### Get Reminders for Car

```bash
curl "${BASE_URL}/cars/550e8400-e29b-41d4-a716-446655440000/reminders" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### Get Upcoming Reminders (Filtered)

```bash
curl "${BASE_URL}/cars/550e8400-e29b-41d4-a716-446655440000/reminders?status=upcoming" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### Get All Upcoming Reminders (All Cars)

```bash
curl "${BASE_URL}/reminders/upcoming?limit=20" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### Create Reminder

```bash
curl -X POST "${BASE_URL}/cars/550e8400-e29b-41d4-a716-446655440000/reminders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -d '{
    "categoryId": "770e8400-e29b-41d4-a716-446655440000",
    "title": "تعویض روغن موتور",
    "description": "زمان تعویض روغن موتور فرا رسیده است",
    "dueDate": "2024-02-15",
    "dueMileage": 50000,
    "notifyDaysBefore": 7,
    "notifyKmBefore": 500
  }'
```

### Update Reminder

```bash
curl -X PUT "${BASE_URL}/cars/550e8400-e29b-41d4-a716-446655440000/reminders/990e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -d '{
    "dueDate": "2024-02-20",
    "dueMileage": 51000,
    "status": "upcoming"
  }'
```

### Complete Reminder

```bash
curl -X POST "${BASE_URL}/cars/550e8400-e29b-41d4-a716-446655440000/reminders/990e8400-e29b-41d4-a716-446655440000/complete" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -d '{
    "serviceId": "660e8400-e29b-41d4-a716-446655440000"
  }'
```

### Dismiss Reminder

```bash
curl -X POST "${BASE_URL}/cars/550e8400-e29b-41d4-a716-446655440000/reminders/990e8400-e29b-41d4-a716-446655440000/dismiss" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### Delete Reminder

```bash
curl -X DELETE "${BASE_URL}/cars/550e8400-e29b-41d4-a716-446655440000/reminders/990e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

---

## 8. Insurance

### Get Insurance Records

```bash
curl "${BASE_URL}/cars/550e8400-e29b-41d4-a716-446655440000/insurance" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### Get Current Insurance Only

```bash
curl "${BASE_URL}/cars/550e8400-e29b-41d4-a716-446655440000/insurance?current=true" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### Create Insurance Record

```bash
curl -X POST "${BASE_URL}/cars/550e8400-e29b-41d4-a716-446655440000/insurance" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -d '{
    "insuranceType": "third_party",
    "insuranceCompany": "بیمه ایران",
    "policyNumber": "IR-123456789",
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "premiumAmount": 15000000,
    "currency": "toman",
    "notes": "بیمه شخص ثالث",
    "isCurrent": true
  }'
```

### Update Insurance Record

```bash
curl -X PUT "${BASE_URL}/cars/550e8400-e29b-41d4-a716-446655440000/insurance/aa0e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -d '{
    "endDate": "2025-01-01",
    "isCurrent": true
  }'
```

### Delete Insurance Record

```bash
curl -X DELETE "${BASE_URL}/cars/550e8400-e29b-41d4-a716-446655440000/insurance/aa0e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

---

## 9. Technical Inspection

### Get Inspection Records

```bash
curl "${BASE_URL}/cars/550e8400-e29b-41d4-a716-446655440000/inspections" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### Get Current Inspection Only

```bash
curl "${BASE_URL}/cars/550e8400-e29b-41d4-a716-446655440000/inspections?current=true" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### Create Inspection Record

```bash
curl -X POST "${BASE_URL}/cars/550e8400-e29b-41d4-a716-446655440000/inspections" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -d '{
    "inspectionCenter": "مرکز معاینه فنی شماره ۱",
    "certificateNumber": "TI-987654321",
    "inspectionDate": "2024-01-05",
    "expiryDate": "2024-07-05",
    "passed": true,
    "notes": "تمامی موارد تایید شد",
    "isCurrent": true
  }'
```

### Update Inspection Record

```bash
curl -X PUT "${BASE_URL}/cars/550e8400-e29b-41d4-a716-446655440000/inspections/bb0e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -d '{
    "expiryDate": "2024-08-05",
    "isCurrent": true
  }'
```

### Delete Inspection Record

```bash
curl -X DELETE "${BASE_URL}/cars/550e8400-e29b-41d4-a716-446655440000/inspections/bb0e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

---

## 10. Insights / Blog

### Get All Blog Posts

```bash
curl "${BASE_URL}/insights?language=fa&limit=20&offset=0" \
  -H "Authorization: Bearer ${ANON_KEY}"
```

### Get Featured Posts

```bash
curl "${BASE_URL}/insights?language=fa&featured=true" \
  -H "Authorization: Bearer ${ANON_KEY}"
```

### Get Posts by Category

```bash
curl "${BASE_URL}/insights?language=fa&category=maintenance" \
  -H "Authorization: Bearer ${ANON_KEY}"
```

### Get Single Post

```bash
curl "${BASE_URL}/insights/cc0e8400-e29b-41d4-a716-446655440000?language=fa" \
  -H "Authorization: Bearer ${ANON_KEY}"
```

---

## 11. Notifications

### Get Notifications

```bash
curl "${BASE_URL}/notifications?limit=50&offset=0" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### Get Unread Notifications

```bash
curl "${BASE_URL}/notifications?unread=true" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### Get Notifications by Type

```bash
curl "${BASE_URL}/notifications?type=reminder" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### Mark Notification as Read

```bash
curl -X PUT "${BASE_URL}/notifications/dd0e8400-e29b-41d4-a716-446655440000/read" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### Mark All Notifications as Read

```bash
curl -X PUT "${BASE_URL}/notifications/read-all" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### Delete Notification

```bash
curl -X DELETE "${BASE_URL}/notifications/dd0e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

---

## 12. Dashboard

### Get Dashboard Data

```bash
curl "${BASE_URL}/dashboard" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

**Expected Response:**
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
    {
      "id": "uuid",
      "title": "تعویض روغن موتور",
      "dueDate": "2024-02-15",
      "dueMileage": 50000,
      "car": {
        "id": "uuid",
        "brand": "تویوتا",
        "model": "کمری"
      }
    }
  ],
  "recentServices": [
    {
      "id": "uuid",
      "serviceDate": "2024-01-10",
      "cost": 2500000,
      "category": {
        "nameFa": "تعویض روغن"
      },
      "car": {
        "brand": "تویوتا",
        "model": "کمری"
      }
    }
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

## Testing with Postman

### Import Collection

Create a Postman collection with these environment variables:

```json
{
  "PROJECT_REF": "your-project-ref",
  "ANON_KEY": "your-anon-key",
  "ACCESS_TOKEN": "set-after-login",
  "BASE_URL": "https://{{PROJECT_REF}}.supabase.co/functions/v1/make-server-cd2dec47"
}
```

### Example Request in Postman

**GET Cars**
- Method: GET
- URL: `{{BASE_URL}}/cars`
- Headers:
  - `Authorization`: `Bearer {{ACCESS_TOKEN}}`

---

## Common Error Responses

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

## Performance Testing

### Load Testing with Apache Bench

```bash
# Test health endpoint
ab -n 1000 -c 10 "${BASE_URL}/health"

# Test authenticated endpoint (requires token)
ab -n 100 -c 5 -H "Authorization: Bearer ${ACCESS_TOKEN}" "${BASE_URL}/cars"
```

### Stress Testing with wrk

```bash
# Install wrk
brew install wrk  # macOS
sudo apt-get install wrk  # Ubuntu

# Run stress test
wrk -t12 -c400 -d30s "${BASE_URL}/health"
```

---

## Debugging Tips

### Enable Verbose Output

```bash
curl -v "${BASE_URL}/cars" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### Save Response to File

```bash
curl "${BASE_URL}/dashboard" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -o dashboard-response.json
```

### Pretty Print JSON Response

```bash
curl "${BASE_URL}/cars" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  | jq '.'
```

### Check Response Time

```bash
curl -w "\nTime: %{time_total}s\n" "${BASE_URL}/dashboard" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

---

## Production Checklist

Before deploying to production, test all endpoints:

- [ ] Health check returns 200
- [ ] Send OTP works with real phone number
- [ ] Verify OTP returns valid token
- [ ] Profile endpoints work
- [ ] Cars CRUD operations work
- [ ] Services CRUD operations work
- [ ] Reminders CRUD operations work
- [ ] Insurance CRUD operations work
- [ ] Technical inspection CRUD operations work
- [ ] Service categories return data
- [ ] Blog posts return data
- [ ] Notifications work
- [ ] Dashboard loads all data
- [ ] Error handling works (test with invalid data)
- [ ] Rate limiting is configured
- [ ] CORS headers are correct

---

## Support

If you encounter issues:
1. Check Supabase Edge Function logs
2. Verify RLS policies are correct
3. Test with service role key (temporarily)
4. Review database query logs
5. Check phone number format for OTP
6. Ensure token is not expired
