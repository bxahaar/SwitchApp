# Backend Setup & Deployment Guide

## Overview
This guide walks you through setting up the complete backend infrastructure for the Car Service Management mobile application using Supabase.

---

## Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Supabase CLI**: Install via `npm install -g supabase` (optional, for local development)
3. **Project Credentials**: Have your project URL and API keys ready

---

## Step 1: Create Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: Car Service Manager
   - **Database Password**: (generate a strong password)
   - **Region**: Choose closest to your users (Middle East recommended for Iran)
5. Wait for project provisioning (2-3 minutes)

---

## Step 2: Database Setup

### 2.1 Run Schema SQL

1. Go to **SQL Editor** in Supabase dashboard
2. Create a new query
3. Copy and paste the entire SQL schema from `/supabase/DATABASE_SCHEMA.md`
4. Execute the query in this order:
   - Tables creation
   - RLS policies
   - Indexes
   - Functions and triggers
   - Seed data

### 2.2 Verify Tables

Go to **Table Editor** and verify these tables exist:
- ✅ user_profiles
- ✅ cars
- ✅ service_categories
- ✅ service_checklist_items
- ✅ services
- ✅ service_items
- ✅ reminders
- ✅ insurance_records
- ✅ technical_inspection_records
- ✅ blog_posts
- ✅ notifications

---

## Step 3: Enable Phone Authentication

### 3.1 Enable Phone Provider

1. Go to **Authentication** > **Providers**
2. Enable **Phone** provider
3. Choose SMS provider:
   - **Twilio** (recommended for production)
   - **MessageBird**
   - **Vonage**

### 3.2 Configure Twilio (Example)

1. Sign up at [twilio.com](https://twilio.com)
2. Get credentials:
   - Account SID
   - Auth Token
   - Phone Number
3. In Supabase, enter Twilio credentials
4. Configure message template (optional):
   ```
   کد تایید شما: {{ .Code }}
   Your verification code: {{ .Code }}
   ```

### 3.3 Test Phone Auth

1. Go to **Authentication** > **Users**
2. Click "Invite user" > Phone
3. Enter your phone number
4. Verify you receive SMS

---

## Step 4: Deploy Edge Functions

### 4.1 Link Project

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF
```

### 4.2 Deploy Functions

```bash
# Deploy the server function
supabase functions deploy make-server-cd2dec47

# Verify deployment
supabase functions list
```

### 4.3 Set Environment Variables

The following environment variables are automatically available:
- `SUPABASE_URL`: Your project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (has admin access)
- `SUPABASE_ANON_KEY`: Anonymous key (public access)

---

## Step 5: Configure Row Level Security (RLS)

### 5.1 Verify RLS is Enabled

Go to **Authentication** > **Policies** and verify policies exist for:
- user_profiles
- cars
- services
- service_items
- reminders
- insurance_records
- technical_inspection_records
- notifications

### 5.2 Test RLS

1. Create a test user via Authentication panel
2. Get their access token
3. Try to query data:
   ```bash
   curl -X GET "https://YOUR_PROJECT_REF.supabase.co/rest/v1/cars" \
     -H "apikey: YOUR_ANON_KEY" \
     -H "Authorization: Bearer USER_ACCESS_TOKEN"
   ```
4. Verify the user can only see their own data

---

## Step 6: Seed Initial Data

### 6.1 Service Categories

The service categories should already be seeded from the schema. Verify in Table Editor:
- Engine (موتور)
- Brake System (ترمز)
- Gearbox (گیربکس)
- Battery (باتری)
- Tires (لاستیک)
- Oil Change (تعویض روغن)
- Filters (فیلترها)
- Suspension (سیستم تعلیق)
- Electrical (سیستم برق)
- Cooling System (سیستم خنک‌کننده)
- General Service (سرویس عمومی)
- Other (سایر)

### 6.2 Service Checklist Items

Add checklist items for each category. Example for "Oil Change":

```sql
INSERT INTO service_checklist_items (category_id, name_en, name_fa, display_order)
SELECT id, 'Engine oil replacement', 'تعویض روغن موتور', 1 FROM service_categories WHERE key = 'oil';

INSERT INTO service_checklist_items (category_id, name_en, name_fa, display_order)
SELECT id, 'Oil filter replacement', 'تعویض فیلتر روغن', 2 FROM service_categories WHERE key = 'oil';

INSERT INTO service_checklist_items (category_id, name_en, name_fa, display_order)
SELECT id, 'Check oil level', 'بررسی سطح روغن', 3 FROM service_categories WHERE key = 'oil';
```

### 6.3 Sample Blog Posts (Optional)

```sql
INSERT INTO blog_posts (
  title_en, title_fa, 
  content_en, content_fa,
  category, is_published, featured,
  published_at
) VALUES (
  'Essential Car Maintenance Tips',
  'نکات ضروری نگهداری خودرو',
  'Regular maintenance is crucial for your car''s longevity...',
  'نگهداری منظم برای طول عمر خودروی شما بسیار مهم است...',
  'maintenance', true, true,
  NOW()
);
```

---

## Step 7: Test API Endpoints

### 7.1 Health Check

```bash
curl https://YOUR_PROJECT_REF.supabase.co/functions/v1/make-server-cd2dec47/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

### 7.2 Send OTP

```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/make-server-cd2dec47/auth/send-otp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"phoneNumber": "+989123456789", "language": "fa"}'
```

### 7.3 Get Service Categories

```bash
curl https://YOUR_PROJECT_REF.supabase.co/functions/v1/make-server-cd2dec47/service-categories?language=fa \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

---

## Step 8: Mobile App Integration

### 8.1 Environment Variables

In your React Native / mobile app, set these environment variables:

```javascript
// .env or config file
export const SUPABASE_URL = 'https://YOUR_PROJECT_REF.supabase.co';
export const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
export const API_BASE_URL = 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/make-server-cd2dec47';
```

### 8.2 API Client Setup

```typescript
// api/client.ts
import axios from 'axios';
import { SUPABASE_ANON_KEY, API_BASE_URL } from './config';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  },
});

// Add auth token interceptor
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken(); // Get from secure storage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

### 8.3 Example: Login Flow

```typescript
// api/auth.ts
import apiClient from './client';

export const sendOTP = async (phoneNumber: string, language: string = 'fa') => {
  const response = await apiClient.post('/auth/send-otp', {
    phoneNumber,
    language,
  });
  return response.data;
};

export const verifyOTP = async (phoneNumber: string, otpCode: string) => {
  const response = await apiClient.post('/auth/verify-otp', {
    phoneNumber,
    otpCode,
  });
  return response.data;
};
```

### 8.4 Example: Fetch Cars

```typescript
// api/cars.ts
import apiClient from './client';

export const getCars = async () => {
  const response = await apiClient.get('/cars');
  return response.data.cars;
};

export const createCar = async (carData: any) => {
  const response = await apiClient.post('/cars', carData);
  return response.data.car;
};
```

---

## Step 9: Security Checklist

### 9.1 Verify RLS Policies

- [ ] All user-facing tables have RLS enabled
- [ ] Policies restrict access to user's own data
- [ ] Service role key is NOT exposed to frontend
- [ ] Anonymous key is used for public endpoints only

### 9.2 Test Data Isolation

1. Create two test users
2. Add cars for each user
3. Try to access User B's cars with User A's token
4. Verify access is denied

### 9.3 Rate Limiting

Supabase provides built-in rate limiting:
- 100 requests per minute for authenticated users
- 30 requests per minute per IP for anonymous users

Consider implementing additional rate limiting for OTP endpoints.

---

## Step 10: Monitoring & Logging

### 10.1 Enable Logs

1. Go to **Edge Functions** > **make-server-cd2dec47**
2. Click **Logs** tab
3. Monitor real-time logs

### 10.2 Set Up Alerts

1. Go to **Settings** > **Alerts**
2. Configure alerts for:
   - High error rate
   - Database performance issues
   - Storage limits

### 10.3 Analytics

Use Supabase built-in analytics:
- API requests
- Database queries
- Storage usage
- Active users

---

## Step 11: Production Checklist

Before going live:

- [ ] All tables have proper indexes
- [ ] RLS policies are tested and verified
- [ ] Phone authentication is configured with production SMS provider
- [ ] Edge Functions are deployed and tested
- [ ] Environment variables are set correctly
- [ ] API endpoints are tested with Postman/curl
- [ ] Mobile app can successfully authenticate
- [ ] CRUD operations work for all entities
- [ ] Error handling is in place
- [ ] Logs are monitored
- [ ] Backup strategy is configured (Supabase auto-backups)
- [ ] Database is seeded with initial data

---

## Troubleshooting

### Issue: Phone OTP not received

**Solutions:**
1. Check SMS provider credentials
2. Verify phone number format (+country code)
3. Check Supabase logs for errors
4. Test with Twilio test credentials first

### Issue: RLS blocking legitimate requests

**Solutions:**
1. Check the access token is valid
2. Verify user_id matches in database
3. Review RLS policies in SQL Editor
4. Test with service role key (temporarily) to isolate issue

### Issue: Edge Function timeout

**Solutions:**
1. Check function logs for errors
2. Optimize database queries (add indexes)
3. Reduce payload size
4. Increase function timeout limit

### Issue: CORS errors

**Solutions:**
1. Verify CORS configuration in Edge Function
2. Check request headers include `Content-Type`
3. Ensure `Authorization` header is properly set

---

## Next Steps

### Phase 2 Features (Future)

1. **Push Notifications**
   - Set up Firebase Cloud Messaging
   - Store FCM tokens in user_profiles
   - Implement notification sending logic

2. **File Uploads**
   - Enable Supabase Storage
   - Create buckets for service documents, insurance PDFs
   - Implement signed URL generation

3. **Advanced Analytics**
   - Create materialized views for stats
   - Implement cost analysis charts
   - Add mileage prediction

4. **Multi-language CMS**
   - Admin panel for blog post management
   - Rich text editor for content
   - Image upload for blog covers

5. **Car Sharing**
   - Add car_sharing table
   - Implement invite system
   - Role-based permissions

---

## Support

- **Supabase Docs**: https://supabase.com/docs
- **API Reference**: See `/supabase/API_ENDPOINTS.md`
- **Database Schema**: See `/supabase/DATABASE_SCHEMA.md`

---

## Cost Estimation

### Free Tier (Supabase)
- 500 MB database
- 1 GB file storage
- 2 GB bandwidth
- 50,000 monthly active users

This is sufficient for initial launch and testing.

### Pro Tier ($25/month)
- 8 GB database
- 100 GB file storage
- 50 GB bandwidth
- Unlimited monthly active users

Recommended when you reach 100+ active users.

---

## Conclusion

Your backend is now fully configured and ready for mobile app integration! 🎉

The architecture is:
- ✅ Scalable (handles thousands of users)
- ✅ Secure (RLS policies protect user data)
- ✅ Production-ready (proper error handling, logging)
- ✅ Extensible (easy to add new features)
- ✅ Well-documented (comprehensive API docs)
