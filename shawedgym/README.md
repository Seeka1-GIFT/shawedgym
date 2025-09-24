# ShawedGym - Full Stack Gym Management System

A modern, full-stack gym management system built with React (Vite + Tailwind) frontend and Node.js + Express + PostgreSQL backend.

## 🚀 Features

### Frontend (React + Vite + Tailwind)
- **Modern Dashboard** - Real-time statistics and analytics
- **Member Management** - Complete CRUD operations for gym members
- **Payment System** - Track payments and generate receipts
- **Class Scheduling** - Manage fitness classes and bookings
- **Trainer Management** - Manage trainer profiles and schedules
- **Asset Management** - Track gym equipment and assets
- **Expense Tracking** - Monitor gym expenses and categories
- **Attendance System** - Member check-in/check-out functionality
- **Reports & Analytics** - Financial and membership reports
- **Authentication** - JWT-based login/register system
- **Responsive Design** - Mobile-first responsive UI
- **Dark/Light Theme** - Theme switching capability

### Backend (Node.js + Express + PostgreSQL)
- **RESTful API** - Complete REST API with all CRUD operations
- **JWT Authentication** - Secure token-based authentication
- **PostgreSQL Database** - Robust relational database
- **Password Hashing** - Bcrypt for secure password storage
- **Input Validation** - Comprehensive request validation
- **Error Handling** - Centralized error handling
- **CORS Support** - Cross-origin resource sharing
- **Environment Configuration** - Secure environment variables

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Lucide React** - Beautiful icons
- **Recharts** - Charts and data visualization

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **PostgreSQL** - Relational database
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v12 or higher)
- **Git**

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd shawedgym
```

### 2. Database Setup

#### Create PostgreSQL Database
1. Open PostgreSQL (pgAdmin or command line)
2. Create a new database named `shawedgym`
3. Run the database setup script:

```sql
-- Connect to your PostgreSQL instance and run:
-- File: backend/database_setup.sql
```

Or import the SQL file:
```bash
psql -U postgres -d shawedgym -f backend/database_setup.sql
```

### 3. Backend Setup

#### Install Backend Dependencies
```bash
cd backend
npm install
```

#### Environment Variables
Create a `.env` file in the backend directory:
```env
DB_HOST=localhost
DB_NAME=shawedgym
DB_USER=postgres
DB_PASSWORD=postgres123
PORT=5000
JWT_SECRET=shawedgym_super_secret_key_2024
NODE_ENV=development
```

#### Start Backend Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The backend server will run on `http://localhost:5000`

### 4. Frontend Setup

#### Install Frontend Dependencies
```bash
# From the root directory
npm install
```

#### Start Frontend Development Server
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🚦 Running the Application

### Development Mode
1. **Start Backend**: `cd backend && npm run dev` (Port 5000)
2. **Start Frontend**: `npm run dev` (Port 5173)
3. **Access Application**: Open `http://localhost:5173`

### Production Mode
1. **Build Frontend**: `npm run build`
2. **Start Backend**: `cd backend && npm start`
3. **Access Application**: Backend serves both API and frontend

## 🔐 Default Login Credentials

Use these credentials to log in:
- **Email**: `admin@shawedgym.com`
- **Password**: `admin123`

## 📁 Project Structure

```
shawedgym/
├── backend/                    # Backend API server
│   ├── src/
│   │   ├── config/            # Database configuration
│   │   ├── controllers/       # Route controllers
│   │   ├── middleware/        # Custom middleware
│   │   ├── models/           # Database models (if using ORM)
│   │   ├── routes/           # API routes
│   │   └── server.js         # Main server file
│   ├── database_setup.sql    # Database schema and sample data
│   └── package.json
├── src/                      # Frontend React app
│   ├── components/           # Reusable components
│   ├── pages/               # Page components
│   ├── services/            # API services
│   └── data/               # Static data and constants
├── public/                  # Static assets
├── dist/                   # Built frontend (after build)
└── package.json            # Frontend dependencies
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Members
- `GET /api/members` - Get all members
- `GET /api/members/:id` - Get member by ID
- `POST /api/members` - Create new member
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member
- `POST /api/members/:id/checkin` - Check in member

### Payments
- `GET /api/payments` - Get all payments
- `GET /api/payments/:id` - Get payment by ID
- `POST /api/payments` - Create new payment
- `PUT /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Delete payment

### Plans
- `GET /api/plans` - Get all plans
- `POST /api/plans` - Create new plan
- `PUT /api/plans/:id` - Update plan
- `DELETE /api/plans/:id` - Delete plan

### Classes
- `GET /api/classes` - Get all classes
- `POST /api/classes` - Create new class
- `PUT /api/classes/:id` - Update class
- `DELETE /api/classes/:id` - Delete class
- `POST /api/classes/:id/book` - Book class

### Additional Endpoints
- Assets: `/api/assets/*`
- Trainers: `/api/trainers/*`
- Attendance: `/api/attendance/*`
- Expenses: `/api/expenses/*`
- Reports: `/api/reports/*`

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Bcrypt with salt rounds
- **Protected Routes** - Frontend and backend route protection
- **CORS Configuration** - Proper cross-origin setup
- **Input Validation** - Server-side request validation
- **SQL Injection Prevention** - Parameterized queries

## 🎨 UI Features

- **Modern Design** - Clean, professional interface
- **Responsive Layout** - Mobile-first design
- **Dark/Light Theme** - Theme switching
- **Loading States** - Proper loading indicators
- **Error Handling** - User-friendly error messages
- **Form Validation** - Client and server-side validation
- **Charts & Analytics** - Data visualization with Recharts

## 🚀 Deployment

### Backend Deployment
1. Set up PostgreSQL database on your server
2. Configure environment variables
3. Deploy to your preferred platform (Heroku, DigitalOcean, AWS, etc.)

### Frontend Deployment
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder to your web server
3. Configure your web server to serve the React app

### Full-Stack Deployment
The backend can serve both API and frontend:
1. Build frontend: `npm run build`
2. Backend automatically serves frontend from `dist` folder
3. Deploy backend with built frontend

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:
1. Check the console for error messages
2. Ensure database is running and accessible
3. Verify environment variables are set correctly
4. Check that all dependencies are installed

## 🎯 Future Enhancements

- [ ] Email notifications
- [ ] SMS integration
- [ ] Mobile app (React Native)
- [ ] Advanced reporting
- [ ] Payment gateway integration
- [ ] Inventory management
- [ ] Workout tracking
- [ ] Nutrition planning

---

**Made with ❤️ for ShawedGym**






