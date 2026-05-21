# Deriv License Management Platform - Deployment Guide

## Overview
This is a comprehensive ISP-style license management platform for the Deriv V.O Analysis Engine, featuring Supabase authentication, license key generation, device fingerprinting, MPESA payments, and real-time WebSocket notifications.

## Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- Environment variables configured

## Environment Variables
Create a `.env.local` file with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# MPESA Configuration (Optional)
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=your_callback_url

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# Optional: Encryption keys for sensitive data
ENCRYPTION_KEY=your_encryption_key
```

## Database Setup
The database schema has been created with:
- **13 main tables**: users, admin_users, access_keys, devices, sessions, payments, subscriptions, blacklist, audit_logs, notifications, support_tickets, brute_force_attempts, settings
- **Row Level Security (RLS)** policies enabled on all tables
- **Automatic triggers** for user profile creation on signup
- **Performance indexes** on frequently queried fields

To apply the schema and RLS policies, use the Supabase MCP tools to execute the migration files in `supabase/migrations/`.

## Installation & Running

### Development
```bash
npm install
npm run dev
```
Visit http://localhost:3000

### Production Build
```bash
npm run build
npm start
```

## Key Features Implemented

### 1. Authentication System
- Email/password authentication via Supabase Auth
- Email verification requirement before license access
- Session management with refresh tokens
- Multi-device session tracking

### 2. License Management
- 30-day renewable license keys with max 3 devices
- License validation with device fingerprinting (6+ vectors)
- Key status tracking: active, revoked, expired
- Automatic expiration handling

### 3. Security Architecture
- AES-256 encryption for sensitive data
- bcrypt password hashing
- Device fingerprinting with IP tracking
- Brute force detection with rate limiting
- Audit logging for all admin actions
- Blacklist system for revoked keys and blocked IPs

### 4. Payment Integration
- MPESA STK PUSH integration for mobile payments
- Payment status tracking and reconciliation
- Invoice generation and history
- Automatic license activation on successful payment

### 5. User Portal (`/dashboard`)
- View active licenses and expiration dates
- Create new license requests
- Manage registered devices
- View payment history
- Real-time notifications

### 6. Admin Dashboard (`/admin`)
- **Licenses**: View, manage, and revoke all licenses
- **Users**: User management with license and payment statistics
- **Payments**: Payment tracking and reconciliation
- **Insights**: Analytics and KPIs (revenue, active users, churn)
- **Security**: Device management, blacklist, and audit logs
- Real-time updates with WebSocket notifications

### 7. API Routes
- `POST /api/licenses/validate` - Validate license key
- `POST /api/licenses/create` - Create new license
- `GET /api/licenses/list` - Get user's licenses
- `POST /api/licenses/revoke` - Revoke a license
- `POST /api/payments/initiate-mpesa` - Start MPESA payment
- `POST /api/payments/mpesa-callback` - MPESA callback handler
- `GET /api/admin/users` - List all users (admin only)
- `GET /api/admin/licenses` - Manage licenses (admin only)
- `GET /api/admin/analytics` - Get analytics data (admin only)

### 8. Real-time Features
- WebSocket support for live notifications
- Real-time license status updates
- Device login alerts
- Payment confirmations
- Security alerts for suspicious activity

## Architecture

### Frontend
- Next.js 16 (App Router)
- React with TypeScript
- Server Components for data fetching
- Client Components for interactivity

### Backend
- Next.js API Routes
- Supabase for database and authentication
- JWT for session validation
- WebSocket for real-time updates

### Database
- PostgreSQL (via Supabase)
- Row Level Security for data isolation
- Triggers for automation
- Indexes for performance

## File Structure
```
app/
  ├── auth/              # Authentication pages
  ├── dashboard/         # User dashboard
  ├── admin/             # Admin panel
  ├── api/              # API routes
  lib/
  ├── supabase/         # Supabase clients
  ├── websocket.ts      # WebSocket utilities
  components/
  ├── NotificationCenter.tsx
  └── LiveLicenseDashboard.tsx
```

## Admin User Setup
To create an admin user, use the Supabase dashboard or execute:

```sql
-- In Supabase SQL Editor
INSERT INTO public.admin_users (user_id, role, permissions)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@example.com'),
  'admin',
  '{"manage_licenses": true, "manage_users": true, "view_analytics": true, "manage_payments": true, "manage_security": true}'
);
```

## Security Best Practices
1. Keep `SUPABASE_SERVICE_ROLE_KEY` and `JWT_SECRET` confidential
2. Use HTTPS in production
3. Implement CORS policies appropriately
4. Monitor audit logs regularly
5. Set up email notifications for security events
6. Rotate encryption keys periodically
7. Implement rate limiting on public APIs
8. Use VPN/firewall for admin access

## Monitoring & Maintenance
- Check `audit_logs` table for security events
- Monitor `brute_force_attempts` for attack patterns
- Review `blacklist` for blocked users/IPs
- Track `notifications` delivery status
- Analyze payment reconciliation in `payments` table

## Troubleshooting

### Supabase Connection Issues
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Check Supabase project is active
- Ensure RLS policies are properly configured

### License Validation Failures
- Check device fingerprint calculation
- Verify license status is 'active'
- Confirm device count hasn't exceeded limit
- Check blacklist for blocked entries

### Payment Integration Issues
- Verify MPESA credentials are correct
- Check callback URL is publicly accessible
- Ensure payment metadata is properly formatted
- Review payment logs in `payments` table

## Support
For issues or questions, check the audit logs and error messages in the application logs. Enable debug logging by setting `DEBUG=*` environment variable.

## License
Proprietary - Deriv V.O Analysis Engine License Management Platform
