# D-Tool Trades License Management Platform

A comprehensive, production-ready license management system built with Next.js, Supabase, and modern web technologies.

## 🎯 Overview

The D-Tool Trades License Management Platform provides:

- **User Management**: Complete user registration, authentication, and profile management
- **License System**: Secure license key generation, distribution, and device management
- **Payment Processing**: MPESA integration for secure payment handling (East African markets)
- **Admin Dashboard**: Comprehensive admin interface for user, payment, and security management
- **Real-time Features**: WebSocket-based notifications and live license status updates
- **Security**: Row-level security policies, brute-force protection, and device blocking

## 🏗️ Architecture

### Technology Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (JWT-based)
- **Payments**: MPESA (Safaricom)
- **Real-time**: WebSocket connections
- **Styling**: Tailwind CSS with custom design system

### Database Schema

#### Core Tables

1. **users**
   - User accounts and profile information
   - Supports country/region localization
   - Track creation and update timestamps

2. **access_keys**
   - License keys with device management
   - Hash-based key storage for security
   - Expiration tracking
   - Device count limits

3. **key_devices**
   - Individual device registrations
   - Device fingerprinting
   - Activation/deactivation tracking
   - IP address logging

4. **payments**
   - Payment transaction records
   - MPESA integration data
   - Multiple currency support
   - Status tracking (pending, completed, failed)

5. **admin_users**
   - Admin account management
   - Role-based access control (admin, moderator)
   - Activity logging

6. **audit_logs**
   - Comprehensive action logging
   - Security event tracking
   - User activity monitoring

7. **notifications**
   - In-app notification system
   - Real-time event notifications
   - Read/unread status tracking

## 🔐 Security Features

### Authentication
- JWT-based token authentication
- Secure password hashing
- Session management with HTTP-only cookies
- Multi-factor authentication support (extensible)

### Authorization
- Row-Level Security (RLS) policies
- Role-based access control (RBAC)
- Admin-only endpoints
- User data isolation

### Device Management
- Device fingerprinting
- Device blocking/whitelisting
- IP-based access control
- Device activation limits

### Threat Protection
- Brute-force attack detection
- IP blocking after failed attempts
- Rate limiting on API endpoints
- CORS configuration

## 📱 User Features

### Dashboard
- Real-time license status
- Device management
- Payment history
- Usage statistics

### License Management
- View active licenses
- See device assignments
- Monitor expiration dates
- Receive renewal reminders

### Payments
- Initiate MPESA payments
- View transaction history
- Get payment receipts
- Track refunds

## 👨‍💼 Admin Features

### User Management
- View all users
- Search and filter users
- View user details
- Manage user status

### Payment Management
- View all transactions
- Filter by status/date
- Export payment data
- Reconcile payments

### Analytics & Insights
- Revenue tracking
- User growth metrics
- Payment method breakdown
- Geographic distribution
- System health monitoring

### Security Management
- Monitor brute-force attempts
- Manage blocked devices
- Manage blocked IPs
- View security alerts

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh-token` - Refresh JWT token

### License Management
- `GET /api/licenses` - Get user's licenses
- `POST /api/licenses/validate` - Validate license key
- `POST /api/licenses/activate-device` - Register device
- `DELETE /api/licenses/:id/devices/:deviceId` - Remove device

### Payments
- `POST /api/payments/initiate-mpesa` - Start MPESA payment
- `POST /api/payments/mpesa-callback` - MPESA webhook
- `GET /api/payments` - Get user's payments

### Admin
- `GET /api/admin/users` - List all users
- `GET /api/admin/payments` - List all payments
- `GET /api/admin/analytics` - Get platform analytics
- `GET /api/admin/security` - Get security metrics

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- MPESA business account (for payments)

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_URL=your_supabase_url

# JWT
JWT_SECRET=your_jwt_secret

# MPESA
MPESA_BUSINESS_CODE=your_business_code
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/mpesa-callback
```

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run migrations (if needed)
npm run db:migrate

# Start development server
npm run dev
```

## 📊 Key Features Implementation

### Real-time Notifications
- WebSocket connections for live updates
- Notification types:
  - License activation/revocation
  - Payment received/failed
  - Security alerts
  - Device changes
  - Expiration warnings

### License Validation
- Cryptographic key verification
- Device fingerprinting
- Expiration checking
- Device limit enforcement

### Payment Processing
- MPESA STK push for mobile payments
- Automatic license generation on payment
- Transaction logging
- Webhook handling

### Admin Analytics
- Real-time dashboard metrics
- Revenue tracking
- User growth charts
- Payment method distribution
- System health monitoring

## 🔄 Deployment

### Vercel Deployment

```bash
# Push to GitHub
git push origin main

# Deploy to Vercel
vercel deploy
```

### Environment Setup
1. Configure Supabase project
2. Set environment variables in Vercel
3. Configure MPESA callback URL to your domain
4. Set up custom domain and SSL

## 📈 Scaling Considerations

### Database Optimization
- Index creation for frequently queried columns
- Partition large tables (payments, audit_logs)
- Connection pooling via Supabase

### Real-time Scaling
- Replace in-memory WebSocket storage with Redis
- Implement message queuing for notifications
- Add load balancing

### Performance
- Implement caching strategies
- Optimize database queries
- Use CDN for static assets
- Implement database replication

## 🧪 Testing

```bash
# Run tests
npm test

# Run E2E tests
npm run test:e2e

# Type checking
npm run type-check
```

## 📝 Development Guidelines

### Code Structure
```
/app                 # Next.js app router
  /api              # API routes
  /admin            # Admin pages
  /auth             # Authentication pages
  /dashboard        # User dashboard
/components         # React components
/lib                # Utility functions and libraries
/hooks              # Custom React hooks
/public             # Static assets
```

### Naming Conventions
- Components: PascalCase (UserDashboard.tsx)
- Utilities: camelCase (validateLicense.ts)
- Constants: UPPER_SNAKE_CASE

### Database Conventions
- Tables: snake_case, plural (access_keys)
- Columns: snake_case
- Foreign keys: {table}_id format
- Timestamps: created_at, updated_at

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write tests
4. Submit a pull request
5. Code review and merge

## 📄 License

This project is proprietary. All rights reserved.

## 🆘 Support

For issues and questions:
- Open an issue in GitHub
- Contact support@dtooltrades.com
- Check documentation at docs.dtooltrades.com

## 🔄 Version History

### v1.0.0 (Current)
- Initial release
- Core license management
- MPESA integration
- Admin dashboard
- Real-time notifications
- Security features

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [MPESA API Guide](https://developer.safaricom.co.ke/docs)
- [WebSocket Best Practices](https://tools.ietf.org/html/rfc6455)
