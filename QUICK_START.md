# Quick Start Guide - Deriv License Management Platform

## Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free tier available at https://supabase.com)

## 1. Setup Supabase Project

1. Go to https://supabase.com and create a free project
2. Note your project URL and anon key from Settings > API
3. Get your service role key for admin operations

## 2. Environment Configuration

Create `.env.local` in the project root:

```env
# Required: Supabase Setup
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Optional: MPESA Configuration
MPESA_CONSUMER_KEY=your_mpesa_key
MPESA_CONSUMER_SECRET=your_mpesa_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/mpesa-callback

# Optional: JWT Configuration
JWT_SECRET=your-secret-key-min-32-chars
```

## 3. Install Dependencies

```bash
npm install
```

## 4. Database Setup

The database schema is automatically configured. To manually apply RLS policies (optional):

1. Log into your Supabase dashboard
2. Navigate to SQL Editor
3. Copy the migration queries from the documentation
4. Execute them

## 5. Create Admin User

In Supabase dashboard SQL editor:

```sql
-- First, sign up a user through the app at /auth/sign-up
-- Then promote them to admin:

INSERT INTO public.admin_users (user_id, role, permissions)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'your-email@example.com'),
  'admin',
  '{"manage_licenses": true, "manage_users": true, "view_analytics": true, "manage_payments": true, "manage_security": true}'
);
```

## 6. Start Development Server

```bash
npm run dev
```

Server starts at http://localhost:3000

## 7. Test the Platform

### User Flow
1. Go to http://localhost:3000/auth/sign-up
2. Create account with email and password
3. Verify email (check Supabase Auth logs)
4. Go to /dashboard
5. Create a license key
6. View active licenses

### Admin Flow
1. Ensure your user has admin role (see step 5)
2. Go to http://localhost:3000/admin/dashboard
3. Access license management, user management, payments, etc.

## 8. Test APIs

### Validate a License Key
```bash
curl -X POST http://localhost:3000/api/licenses/validate \
  -H "Content-Type: application/json" \
  -d '{
    "licenseKey": "your-generated-key",
    "deviceFingerprint": "test-device",
    "ipAddress": "127.0.0.1"
  }'
```

### Create License (Authenticated)
```bash
# First get your session cookie, then:
curl -X POST http://localhost:3000/api/licenses/create \
  -H "Content-Type: application/json" \
  -b "your-session-cookie" \
  -d '{
    "planType": "30-day",
    "maxDevices": 3
  }'
```

## Key Pages to Explore

| Page | URL | Purpose |
|------|-----|---------|
| Login | `/auth/login` | User authentication |
| Sign Up | `/auth/sign-up` | New user registration |
| Dashboard | `/dashboard` | User license management |
| Admin Dashboard | `/admin/dashboard` | Admin overview |
| License Manager | `/admin/licenses` | Manage all licenses |
| User Manager | `/admin/license-users` | Manage users |
| Payments | `/admin/payments` | Payment tracking |
| Security | `/admin/security` | Security management |
| Insights | `/admin/insights` | Analytics |

## Database Tables

- `users` - User profiles
- `admin_users` - Admin roles
- `access_keys` - License keys
- `devices` - Device tracking
- `sessions` - Active sessions
- `payments` - Transactions
- `subscriptions` - Plans
- `audit_logs` - Activity logs
- `notifications` - User notifications
- `blacklist` - Blocked entries
- `brute_force_attempts` - Attack logs
- `support_tickets` - Support requests
- `settings` - Configuration

## API Endpoints

### License APIs
- `POST /api/licenses/create` - Generate license
- `GET /api/licenses/list` - List user's licenses
- `POST /api/licenses/validate` - Validate license key
- `POST /api/licenses/revoke` - Revoke license

### Payment APIs
- `POST /api/payments/initiate-mpesa` - Start MPESA payment
- `POST /api/payments/mpesa-callback` - MPESA callback

### Admin APIs
- `GET /api/admin/users` - List users (admin only)
- `GET /api/admin/licenses` - Manage licenses (admin only)
- `GET /api/admin/analytics` - Get analytics (admin only)

## Common Issues

### "Supabase connection failed"
- Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Verify Supabase project is active
- Check network connectivity

### "Email verification required"
- Supabase Auth requires email verification by default
- Check Supabase auth logs for verification email
- You can disable this in Supabase Auth settings for development

### "Admin access denied"
- Ensure your user record exists in `admin_users` table
- Check the `role` field is 'admin'
- Verify `user_id` matches your auth user ID

### WebSocket connection errors
- Check browser console for connection errors
- Ensure WebSocket is enabled in your hosting
- Verify callback URLs for MPESA are correct

## Development Tips

1. **Enable debug logging**:
   ```bash
   DEBUG=* npm run dev
   ```

2. **Check Supabase logs**: Dashboard > Logs section

3. **View RLS errors**: Supabase Auth > Policies

4. **Test without payment**: MPESA integration is optional

5. **Use Supabase Studio**: View/edit database directly

## Next Steps

1. Read `DEPLOYMENT.md` for production setup
2. Review `API_REFERENCE.md` for API details
3. Check `LICENSE_PLATFORM_README.md` for feature documentation
4. Customize styling in `tailwind.config.ts` (if needed)
5. Deploy to Vercel with proper environment variables

## Getting Help

- Check error messages in browser console
- Review Supabase dashboard logs
- Read documentation files in project root
- Check Next.js documentation: https://nextjs.org/docs

## Production Deployment

```bash
# Build for production
npm run build

# Test production build locally
npm start

# Deploy to Vercel
vercel
```

Make sure all environment variables are set in your deployment platform before deploying!
