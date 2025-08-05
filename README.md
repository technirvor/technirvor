# Tech Nirvor - E-commerce Platform

🛒 **Tech Nirvor** is a modern, full-featured e-commerce platform built with Next.js, designed specifically for the Bangladeshi market. It offers a complete online shopping experience with features like product management, order tracking, admin dashboard, and AI-powered customer support.

## 🌟 Features

### Customer Features

- **Product Catalog**: Browse products by categories and subcategories
- **Advanced Search**: Real-time product search with filtering
- **Shopping Cart**: Add/remove products with persistent cart state
- **Order Management**: Place orders with cash on delivery (COD)
- **Order Tracking**: Track order status in real-time
- **Flash Sales**: Limited-time offers and discounts
- **Combo Products**: Product bundles with special pricing
- **AI Chat Support**: Intelligent customer support with Gemini AI
- **Mobile Responsive**: Optimized for all device sizes
- **PWA Support**: Progressive Web App capabilities

### Admin Features

- **Dashboard**: Comprehensive analytics and overview
- **Product Management**: Add, edit, and manage products
- **Category Management**: Organize products into categories
- **Order Management**: Process and track customer orders
- **Flash Sale Management**: Create and manage promotional campaigns
- **Combo Product Management**: Create product bundles
- **Hero Slides**: Manage homepage banners
- **District Management**: Configure delivery areas and charges
- **User Management**: Admin user access control
- **Security Monitoring**: Track admin activities and API usage
- **Analytics**: Sales insights and performance metrics

## 🛠️ Tech Stack

- **Framework**: Next.js 15.2.4 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **AI Integration**: Google Gemini AI
- **Analytics**: Vercel Analytics + Google Analytics
- **Marketing**: Facebook Pixel integration
- **File Storage**: Vercel Blob
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Google Gemini AI API key
- Vercel account (for deployment)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd technirvor
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI Configuration
GEMINI_API_KEY=your_gemini_api_key

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=your_google_analytics_id
NEXT_PUBLIC_META_PIXEL_ID=your_facebook_pixel_id
META_CAPI_ACCESS_TOKEN=your_meta_capi_access_token
META_CAPI_TEST_CODE=your_meta_test_code

# API Security (Optional)
NEXT_PUBLIC_API_KEY=your_api_key
```

### 4. Database Setup

1. Create a new Supabase project
2. Run the SQL scripts in the `scripts/` directory in this order:

   ```bash
   # Core tables
   scripts/create-tables.sql

   # Admin security
   scripts/admin-security.sql

   # Additional features
   scripts/create-reviews-table.sql
   scripts/notifications.sql
   scripts/create-admin-activity-logs.sql

   # Sample data (optional)
   scripts/seed-data.sql
   ```

3. Set up Row Level Security (RLS) policies:
   ```bash
   scripts/add-orders-rls-policies.sql
   scripts/fix-admin-orders-rls.sql
   ```

### 5. Create Admin User

```bash
# Run this SQL in your Supabase SQL editor
# Replace with your email and desired password
scripts/create-admin-user.sql
```

### 6. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📁 Project Structure

```
technirvor/
├── app/                    # Next.js App Router
│   ├── (admin)/           # Admin panel routes
│   ├── (company)/         # Company pages (privacy, terms, etc.)
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── cart/              # Shopping cart
│   ├── checkout/          # Checkout process
│   ├── product/           # Product pages
│   └── ...
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui components
│   └── ...
├── lib/                   # Utility functions and configurations
│   ├── supabase.ts       # Supabase client
│   ├── auth.ts           # Authentication helpers
│   ├── types.ts          # TypeScript type definitions
│   └── ...
├── scripts/              # Database SQL scripts
├── public/               # Static assets
└── ...
```

## 🔧 Configuration

### Database Schema

The application uses the following main tables:

- `products` - Product catalog
- `categories` - Product categories
- `orders` - Customer orders
- `order_items` - Order line items
- `combo_products` - Product bundles
- `hero_slides` - Homepage banners
- `districts` - Delivery areas
- `admin_users` - Admin access control
- `admin_activity_logs` - Security audit logs

### Authentication

The app uses Supabase Auth with custom admin role management:

- Customer authentication for order tracking
- Admin authentication with role-based access
- Session management with secure cookies

### AI Chat Integration

The AI chat feature uses Google Gemini AI to provide:

- Product recommendations
- Order assistance
- Customer support in Bengali and English
- Smart product search

## 🚀 Deployment

### Vercel Deployment

1. Connect your repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy with automatic builds on push

### Environment Variables for Production

Ensure all environment variables are set in your production environment:

- Supabase credentials
- Gemini AI API key
- Analytics tracking IDs
- Site URL (production domain)

## 📱 PWA Features

The application includes Progressive Web App capabilities:

- Offline support
- App-like experience on mobile
- Push notifications (configurable)
- Install prompt for mobile users

## 🔒 Security Features

- **Content Security Policy (CSP)**: Configured in middleware
- **Rate Limiting**: API endpoint protection
- **Admin Activity Logging**: Track all admin actions
- **Input Validation**: Zod schema validation
- **SQL Injection Protection**: Parameterized queries
- **XSS Protection**: Content sanitization

## 📊 Analytics & Monitoring

- **Vercel Analytics**: Performance monitoring
- **Google Analytics**: User behavior tracking
- **Facebook Pixel**: Marketing analytics
- **Admin Dashboard**: Business metrics

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

### Code Style

- ESLint + Prettier for code formatting
- TypeScript for type safety
- Tailwind CSS for styling
- Component-based architecture

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support and questions:

- Check the documentation
- Review the code comments
- Contact the development team

## 🔄 Recent Updates

- ✅ Fixed webpack serialization warnings
- ✅ Resolved admin logout issues
- ✅ Enhanced security configurations
- ✅ Improved Content Security Policy
- ✅ Optimized build performance

---

**Tech Nirvor** - Empowering e-commerce in Bangladesh 🇧🇩
