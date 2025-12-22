# ☕ CITA - Coffee Business Analytics Platform

> ⚠️ **IMPORTANT NOTICE**
> 
> This repository is for **PORTFOLIO and DEMONSTRATION purposes only**.
> 
> **The code is NOT open source and may NOT be used, copied, or modified.**
> 
> Viewing for learning purposes is permitted. All other rights reserved.
> 
> © 2025 Your Name

A comprehensive, multi-tenant analytics and management platform designed specifically for coffee businesses. Track sales, manage inventory, understand customers, and grow your business with data-driven insights.


## ✨ Features

### 🔐 Authentication & Multi-Tenancy
- **Secure Authentication** - Email/password login with NextAuth.js
- **Multi-Tenant Architecture** - Each user has completely isolated data
- **Session Management** - Secure JWT-based sessions
- **Protected Routes** - Middleware-protected dashboard access
- **Password Hashing** - bcryptjs encryption

### 📊 Dashboard & Analytics
- **Overview Dashboard** - Real-time KPIs and business metrics
- **Revenue Charts** - 30-day revenue trends with interactive visualizations
- **Sales Analytics** - Payment method breakdown and sales insights
- **Financial Reports** - Comprehensive P&L statements and profitability analysis
- **Monthly Growth Tracking** - Compare performance month-over-month

### 👥 Customer Management
- **Full CRUD Operations** - Create, read, update, delete customers
- **Real-time Search** - Instant customer filtering
- **Loyalty Program** - Automatic points calculation
- **Customer Insights** - Track spending, visits, and purchase history
- **VIP Status** - Automatic identification of top customers
- **CSV Import/Export** - Bulk customer data operations

### 📦 Product Management
- **Inventory Tracking** - Real-time stock levels
- **Profit Margin Calculator** - Automatic margin calculations
- **Low Stock Alerts** - Visual indicators for low inventory
- **Product Categories** - Organized product management
- **Stock Management** - Auto-decrement on orders
- **CSV Import/Export** - Bulk product data operations

### 🛒 Order Management
- **Order Creation** - Multi-product orders with quantity selection
- **Status Tracking** - Pending, completed, cancelled states
- **Payment Methods** - Cash, card, mobile payments
- **Auto-calculations** - Automatic total and subtotal calculations
- **Stock Integration** - Automatic stock updates on order creation/deletion
- **Customer Stats Update** - Auto-update loyalty points, visit count, total spent
- **CSV Import/Export** - Bulk order data operations

### 📁 Import/Export System
- **CSV Import** - Bulk upload customers, products, and orders
- **CSV Export** - Download all data for backup or analysis
- **Template Download** - Pre-formatted CSV templates with examples
- **Data Validation** - Real-time validation before import with error reporting
- **Preview Mode** - See data before importing
- **Clear All** - Bulk delete with safety confirmations

### 🎨 User Interface
- **Modern Design** - Beautiful gradient UI with Tailwind CSS
- **Responsive Layout** - Works on desktop, tablet, and mobile
- **Toast Notifications** - Real-time feedback with react-hot-toast
- **Empty States** - Helpful guidance when no data exists
- **Loading States** - Clear loading indicators
- **Interactive Charts** - Hover tooltips and animations

## 🛠️ Tech Stack

### Frontend
- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Recharts](https://recharts.org/)** - Composable charting library
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library
- **[React Hot Toast](https://react-hot-toast.com/)** - Toast notifications

### Backend & Database
- **[Node.js](https://nodejs.org/)** - JavaScript runtime
- **[Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)** - Serverless API endpoints
- **[Prisma](https://www.prisma.io/)** - Next-generation ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Relational database
- **[Railway](https://railway.app/)** - Database hosting

### Authentication & Security
- **[NextAuth.js](https://next-auth.js.org/)** - Authentication for Next.js
- **[bcryptjs](https://www.npmjs.com/package/bcryptjs)** - Password hashing

### Development Tools
- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting (optional)

## 📦 Dependencies

### Core Dependencies
```json
{
  "next": "^14.0.4",
  "react": "^18",
  "react-dom": "^18",
  "typescript": "^5",
  "@prisma/client": "^5.22.0",
  "prisma": "^5.22.0",
  "next-auth": "latest",
  "bcryptjs": "^2.4.3",
  "recharts": "^2.10.0",
  "lucide-react": "latest",
  "react-hot-toast": "^2.4.1",
  "tailwindcss": "^3.4.1",
  "autoprefixer": "^10.0.1",
  "postcss": "^8"
}
```

### Dev Dependencies
```json
{
  "@types/node": "^20",
  "@types/react": "^18",
  "@types/react-dom": "^18",
  "@types/bcryptjs": "^2.4.6",
  "eslint": "^8",
  "eslint-config-next": "14.0.4"
}
```

## 🚀 Getting Started

### Prerequisites
```bash
Node.js 18+
PostgreSQL database
npm or yarn
```

### Installation

1. **Clone the repository** (for authorized collaborators only)
```bash
git clone https://github.com/yourusername/coffee-business-analysis.git
cd coffee-business-analysis
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

4. **Set up the database**
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed sample data
npx prisma db seed
```

5. **Run the development server**
```bash
npm run dev
```

6. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### First Time Setup

1. **Sign Up**
   - Go to the homepage
   - Click "Get Started" or "Sign Up"
   - Enter your name, email, and password
   - Click "Create Account"

2. **Import Data** (Optional but recommended)
   - Navigate to Products page → Click "Import"
   - Download CSV template → Fill with your products → Upload
   - Navigate to Customers page → Click "Import"
   - Download CSV template → Fill with your customers → Upload
   - Navigate to Orders page → Click "Import"
   - Download CSV template → Fill with your orders → Upload

3. **Start Managing**
   - View real-time analytics in Overview
   - Create new orders
   - Track customer loyalty
   - Monitor inventory levels

### Creating Your First Order

1. Go to **Orders** page
2. Click **"Create Order"**
3. Select a customer from dropdown
4. Choose payment method (cash/card/mobile)
5. Add products with quantities
6. Review auto-calculated total
7. Click **"Create Order"**

**The system automatically:**
- ✅ Decreases product stock
- ✅ Updates customer totalSpent
- ✅ Increments customer visitCount
- ✅ Adds loyalty points
- ✅ Updates lastVisit date
- ✅ Refreshes all analytics

### Importing Historical Data

**Important: Import in this order!**

1. **Products first** (they need to exist for orders)
2. **Customers second** (they need to exist for orders)
3. **Orders last** (links customers to products)

**CSV Format Examples:**

**Products CSV:**
```csv
name,description,category,price,cost,stock
Espresso,Rich espresso,Coffee,3.50,0.80,500
Latte,Creamy latte,Coffee,4.50,1.20,400
```

**Customers CSV:**
```csv
name,email,phone,address
John Doe,john@example.com,+1-555-0100,123 Main St
Jane Smith,jane@example.com,+1-555-0101,456 Oak Ave
```

**Orders CSV:**
```csv
customerEmail,productName,quantity,orderDate,paymentMethod,status
john@example.com,Espresso,2,2025-12-20,cash,completed
jane@example.com,Latte,1,2025-12-21,card,completed
```

## 📁 Project Structure

```
coffee-business-analysis/
├── prisma/
│   ├── schema.prisma          # Database schema with User, Customer, Product, Order models
│   └── migrations/            # Database migrations
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/  # NextAuth handler
│   │   │   │   └── signup/         # User registration
│   │   │   ├── customers/
│   │   │   │   ├── route.ts        # CRUD operations
│   │   │   │   ├── import/         # CSV import
│   │   │   │   └── clear/          # Bulk delete
│   │   │   ├── products/
│   │   │   │   ├── route.ts        # CRUD operations
│   │   │   │   ├── import/         # CSV import
│   │   │   │   └── clear/          # Bulk delete
│   │   │   └── orders/
│   │   │       ├── route.ts        # CRUD operations
│   │   │       ├── import/         # CSV import
│   │   │       └── clear/          # Bulk delete
│   │   ├── auth/
│   │   │   ├── login/         # Login page
│   │   │   └── signup/        # Signup page
│   │   ├── dashboard/        # Protected dashboard
│   │   │   ├── layout.tsx    # Dashboard layout with sidebar
│   │   │   ├── overview/     # Overview page with stats
│   │   │   ├── sales/        # Sales analytics
│   │   │   ├── customers/    # Customer management
│   │   │   ├── products/     # Product management
│   │   │   ├── orders/       # Order management
│   │   │   └── reports/      # Financial reports
│   │   ├── layout.tsx        # Root layout with providers
│   │   ├── page.tsx          # Homepage
│   │   ├── providers.tsx     # SessionProvider wrapper
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   ├── charts/
│   │   │   ├── revenue-chart.tsx   # Line chart for revenue
│   │   │   └── payment-chart.tsx   # Pie chart for payments
│   │   └── modals/
│   │       ├── customer-modal.tsx  # Customer form modal
│   │       ├── product-modal.tsx   # Product form modal
│   │       ├── order-modal.tsx     # Order creation modal
│   │       └── import-modal.tsx    # CSV import modal
│   ├── lib/
│   │   ├── prisma.ts         # Prisma client singleton
│   │   ├── auth.ts           # NextAuth configuration
│   │   ├── utils.ts          # Utility functions (formatCurrency, formatDate, etc)
│   │   └── csv-utils.ts      # CSV parsing and validation
│   ├── types/
│   │   └── next-auth.d.ts    # NextAuth type extensions
│   └── middleware.ts         # Auth middleware for protected routes
├── public/                   # Static assets
├── .env                      # Environment variables (not in git)
├── .env.example              # Example environment file
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── postcss.config.js
└── README.md
```

## 🔒 Security Features

### Authentication
- ✅ **NextAuth.js** - Industry-standard authentication
- ✅ **JWT Sessions** - Stateless session management
- ✅ **bcrypt** - Password hashing with salt rounds (10)
- ✅ **Protected Routes** - Middleware guards

### Data Security
- ✅ **Multi-tenant isolation** - userId filter on all queries
- ✅ **Ownership verification** - Users can only modify their data
- ✅ **SQL injection prevention** - Prisma parameterized queries
- ✅ **CSRF protection** - NextAuth built-in protection
- ✅ **Environment variables** - Sensitive data in .env

### Input Validation
- ✅ **Email validation** - Format checking
- ✅ **Password requirements** - Minimum 6 characters
- ✅ **CSV validation** - Pre-import data checking
- ✅ **Type safety** - TypeScript throughout

## 📊 Database Schema

### Tables

**User**
- id, email, password (hashed), name, timestamps
- Owns: customers, products, orders

**Customer**
- id, userId, name, email, phone, address
- Stats: totalSpent, visitCount, loyaltyPoints, lastVisit
- Relations: orders

**Product**
- id, userId, name, description, category
- Pricing: price, cost, profitMargin (calculated)
- Inventory: stock, imageUrl, isActive

**Order**
- id, userId, customerId, orderDate
- Payment: total, status, paymentMethod
- Relations: customer, items

**OrderItem**
- id, orderId, productId, quantity, price
- Relations: order, product

## 🎨 Customization

### Changing Theme Colors
Edit `tailwind.config.ts`:
```typescript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#f8fafc',
        // ... add your color palette
      }
    }
  }
}
```

### Adding New Dashboard Pages
1. Create page: `src/app/dashboard/your-page/page.tsx`
2. Update sidebar: `src/app/dashboard/layout.tsx`
3. Add icon from Lucide React
4. Create API route if needed: `src/app/api/your-feature/route.ts`

### Modifying Charts
Charts use Recharts. Customize:
- Colors: Change `stroke` and `fill` props
- Data: Modify data queries in page.tsx files
- Types: Switch between Line, Bar, Area, Pie charts

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables:
     - `DATABASE_URL`
     - `NEXTAUTH_SECRET`
     - `NEXTAUTH_URL` (your Vercel domain)
   - Click "Deploy"

3. **Run database migrations**
```bash
# After first deployment
npx prisma migrate deploy
```

### Environment Variables for Production
```env
DATABASE_URL="your-railway-postgres-production-url"
NEXTAUTH_SECRET="generate-strong-secret-key-here"
NEXTAUTH_URL="https://your-app.vercel.app"
```

**Generate secret:**
```bash
openssl rand -base64 32
```

## 🐛 Troubleshooting

### Database Issues
```bash
# Connection test
npx prisma db pull

# Reset database (warning: deletes all data)
npx prisma migrate reset

# View data
npx prisma studio
```

### Build Errors
```bash
# Clear cache
rm -rf .next
rm -rf node_modules
npm install

# Regenerate Prisma
npx prisma generate
```

### Authentication Problems
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Clear browser cookies
- Check database connection

### Import/Export Issues
- Verify CSV headers match template
- Check for special characters in data
- Ensure proper encoding (UTF-8)
- Products and customers must exist before importing orders

## 📈 Performance Optimizations

- ✅ **Server-side rendering** for fast initial load
- ✅ **Database indexing** on userId, email, customerId
- ✅ **Optimized Prisma queries** with selective includes
- ✅ **Static asset optimization** via Next.js
- ✅ **API route efficiency** with minimal data transfer
- ✅ **Chart rendering** optimized with memoization

## 🎯 Roadmap

### Planned Features
- [ ] PDF report generation
- [ ] Email notifications for low stock
- [ ] Advanced filtering and search
- [ ] Date range pickers for analytics
- [ ] Sales forecasting with trends
- [ ] Export reports to Excel
- [ ] Mobile responsive improvements
- [ ] Dark mode theme
- [ ] Multi-location support
- [ ] Employee role management
- [ ] Automated backup system
- [ ] Integration with POS systems

## 📄 License

**Copyright © 2025 [Your Name]. All Rights Reserved.**

This project is available for **viewing and reference only**.

### ✅ You CAN:
- View the code on GitHub
- Learn from the implementation
- Reference in technical discussions or interviews
- Read the documentation

### ❌ You CANNOT:
- Clone, copy, or download this code for use
- Use this code in your own projects (personal or commercial)
- Modify, adapt, or create derivative works
- Distribute, publish, or share the code
- Remove copyright notices
- Use for any commercial purpose

**This software is proprietary and confidential.** Any unauthorized use, reproduction, 
or distribution is strictly prohibited and may result in legal action.

For collaboration, licensing inquiries, or questions, please contact: **[your-email@example.com]**

## 👏 Acknowledgments

Built with these amazing technologies:
- [Next.js](https://nextjs.org/) by Vercel
- [Prisma](https://www.prisma.io/) ORM
- [PostgreSQL](https://www.postgresql.org/) Database
- [Recharts](https://recharts.org/) for visualizations
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide](https://lucide.dev/) for icons
- [NextAuth.js](https://next-auth.js.org/) for authentication
- Hosted on [Railway](https://railway.app/) & [Vercel](https://vercel.com/)

## 📞 Contact

**[Your Name]**
- Email: [your-email@example.com]
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- Portfolio: [your-portfolio.com](https://your-portfolio.com)

---

**Built with ☕ and passion by Hurveen Rayford Veloso**

*This project showcases full-stack development skills including authentication, database design, API development, data visualization, and modern UI/UX design.*