# Food Delivery App

A production-ready food delivery application built with Next.js 15, Prisma, and shadcn/ui. Features a native app-like experience similar to Zomato and Swiggy.

## Features

- 🔐 **Phone + Password Authentication** - Secure user authentication with session management
- 🍽️ **Restaurant Browsing** - Browse restaurants with search and filtering
- 🛒 **Shopping Cart** - Add items to cart with quantity controls
- 📦 **Order Management** - Place orders and track their status in real-time
- 👨‍💼 **Admin Dashboard** - Manage orders with real-time notifications
- 🔔 **Real-time Notifications** - Browser notifications for new orders
- 📱 **Mobile-First Design** - Native app-like experience with smooth interactions
- 🌙 **Dark Mode** - Beautiful dark theme support

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **UI**: shadcn/ui + Tailwind CSS v4
- **Authentication**: Custom session-based auth
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or hosted)

### 1. Clone and Install

\`\`\`bash
# Install dependencies
npm install
\`\`\`

### 2. Database Setup

#### Option A: Local PostgreSQL

\`\`\`bash
# Create a PostgreSQL database
createdb food_delivery

# Set your database URL in .env
echo "DATABASE_URL=postgresql://username:password@localhost:5432/food_delivery" > .env
\`\`\`

#### Option B: Hosted PostgreSQL (Recommended for Production)

Use a hosted PostgreSQL service like:
- [Neon](https://neon.tech) - Serverless PostgreSQL
- [Supabase](https://supabase.com) - PostgreSQL with additional features
- [Railway](https://railway.app) - Easy PostgreSQL hosting

Add your database URL to `.env`:

\`\`\`env
DATABASE_URL=postgresql://user:password@host:5432/database
\`\`\`

### 3. Initialize Database

\`\`\`bash
# Generate Prisma Client
npx prisma generate

# Run migrations to create tables
npx prisma migrate dev --name init

# Seed the database with sample data
npm run db:seed
\`\`\`

This will create:
- 3 sample restaurants (Spice Paradise, Pizza Haven, Burger Junction)
- Multiple menu items for each restaurant
- Sample categories
- An admin user (phone: 9999999999, password: admin123)

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Default Credentials

### Admin Account
- **Phone**: 9999999999
- **Password**: admin123
- **Access**: Admin dashboard at `/admin`

### Test User Account
You can create a new user account through the signup page.

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── restaurants/  # Restaurant data endpoints
│   │   ├── orders/       # Order management endpoints
│   │   └── admin/        # Admin-only endpoints
│   ├── admin/            # Admin dashboard pages
│   ├── restaurant/       # Restaurant detail pages
│   ├── orders/           # Order tracking pages
│   ├── cart/             # Shopping cart page
│   └── login/            # Authentication pages
├── components/            # React components
├── contexts/             # React contexts (Auth)
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
│   ├── prisma.ts        # Prisma client
│   ├── session.ts       # Session management
│   └── auth.ts          # Password hashing
├── prisma/               # Database schema and migrations
└── scripts/              # Database scripts
\`\`\`

## Key Features Explained

### Authentication
- Phone number + password authentication
- Secure session management with HTTP-only cookies
- Role-based access control (USER, ADMIN)
- Protected routes with middleware

### Restaurant Browsing
- Search restaurants by name
- Filter by cuisine type
- View restaurant details and menus
- Categorized menu items

### Shopping Cart
- Add/remove items with quantity controls
- Persistent cart state using localStorage
- Real-time price calculations
- Multiple delivery addresses

### Order Management
- Place orders with delivery details
- Track order status with timeline view
- Order history for users
- Admin can update order status

### Admin Dashboard
- Real-time order notifications
- View all orders with filtering
- Update order status
- Statistics dashboard
- Browser notifications for new orders

## Database Schema

The app uses the following main models:

- **User** - User accounts with authentication
- **Restaurant** - Restaurant information
- **MenuItem** - Menu items with pricing
- **Category** - Menu categories
- **Order** - Customer orders
- **OrderItem** - Items in each order
- **Address** - Delivery addresses

## Environment Variables

Create a `.env` file with:

\`\`\`env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Session (optional - auto-generated if not provided)
SESSION_SECRET=your-secret-key-here
\`\`\`

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `DATABASE_URL` - Your PostgreSQL connection string
4. Deploy!

Vercel will automatically:
- Build your Next.js app
- Run Prisma generate
- Deploy to production

### Database Migrations in Production

After deployment, run migrations:

\`\`\`bash
npx prisma migrate deploy
\`\`\`

Then seed the database:

\`\`\`bash
npm run db:seed
\`\`\`

## Production Considerations

### Security
- [ ] Use strong SESSION_SECRET in production
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Implement rate limiting for API routes
- [ ] Add CSRF protection
- [ ] Validate and sanitize all user inputs

### Performance
- [ ] Add Redis for session storage (currently in-memory)
- [ ] Implement caching for restaurant data
- [ ] Add image optimization
- [ ] Enable database connection pooling

### Features to Add
- [ ] Payment integration (Stripe, Razorpay)
- [ ] Real-time order tracking with WebSockets
- [ ] Email/SMS notifications
- [ ] Restaurant owner dashboard
- [ ] Reviews and ratings
- [ ] Delivery partner tracking
- [ ] Multiple payment methods
- [ ] Promo codes and discounts

## Scripts

\`\`\`bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server

# Database
npx prisma generate     # Generate Prisma Client
npx prisma migrate dev  # Run migrations (dev)
npx prisma migrate deploy # Run migrations (prod)
npm run db:seed         # Seed database
npx prisma studio       # Open Prisma Studio (database GUI)
\`\`\`

## Troubleshooting

### "Auth check error" on startup
This is normal if the database isn't initialized yet. Run the database setup steps above.

### Prisma Client errors
\`\`\`bash
# Regenerate Prisma Client
npx prisma generate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
\`\`\`

### Port already in use
\`\`\`bash
# Kill process on port 3000
npx kill-port 3000
\`\`\`

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the code comments
3. Check Prisma documentation: https://www.prisma.io/docs
4. Check Next.js documentation: https://nextjs.org/docs

## License

MIT
\`\`\`

```json file="" isHidden
