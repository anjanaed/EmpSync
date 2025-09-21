# EmpSync - Enterprise Meal Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10+-red.svg)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)

EmpSync is a comprehensive enterprise HR management system designed to streamline employee lifecycle management, payroll processing, biometric authentication, and operational workflows for modern organizations.

## 🌟 Features

### 👥 Employee Management
- **Complete Employee Lifecycle**: Onboarding, profile management, and offboarding
- **Multi-Organization Support**: Manage multiple organizations with isolated data
- **Role-Based Access Control**: Granular permissions and user roles
- **Employee Self-Service**: Portal for employees to manage their information

### 💰 Payroll & Compensation
- **Automated Payroll Processing**: Generate payslips with complex salary calculations
- **Tax Management**: PAYE tax slab configuration and automatic calculations
- **Salary Adjustments**: General and individual allowances/deductions
- **PDF Payslip Generation**: Professional payslip generation with Firebase storage

### 🔐 Biometric Authentication
- **Fingerprint Integration**: R307 fingerprint sensor support
- **Passkey Management**: Secure passkey generation and regeneration
- **IoT Hardware Integration**: ESP32 connectivity for device management
- **Real-time Status Monitoring**: Device health and connectivity tracking

### 🍽️ Meal Management
- **Meal Ordering System**: Employee meal ordering and scheduling
- **Canteen Management**: Menu management and inventory tracking
- **Automated Deductions**: Meal cost integration with payroll
- **Order Tracking**: Real-time order status and history

### 📊 Analytics & Reporting
- **HR Analytics**: Employee demographics, attendance, and performance metrics
- **Payroll Reports**: Comprehensive payroll and compensation reports
- **Audit Trails**: Complete activity logging and compliance tracking
- **Export Capabilities**: Excel/CSV export for external systems

### 🏢 Organization Management
- **Multi-Tenant Architecture**: Complete data isolation between organizations
- **Super Admin Portal**: Centralized management across all organizations
- **Configuration Management**: Flexible system configuration per organization
- **Integration APIs**: RESTful APIs for third-party integrations

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18, Vite, Ant Design, TypeScript
- **Backend**: NestJS, Node.js, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Auth0 OAuth 2.0
- **File Storage**: Firebase Storage
- **IoT Integration**: ESP32, R307 Fingerprint Sensors
- **Containerization**: Docker & Docker Compose
- **Testing**: Jest, Supertest

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │   NestJS API    │    │  PostgreSQL DB  │
│   (Vite)        │◄──►│   (Node.js)     │◄──►│   (Prisma)      │
│                 │    │                 │    │                 │
│ - Employee UI   │    │ - REST API      │    │ - Users         │
│ - Admin Portal  │    │ - Auth0 Auth    │    │ - Organizations │
│ - Reports       │    │ - File Upload   │    │ - Payroll       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Auth0 OAuth   │    │   Firebase      │    │   IoT Devices   │
│   (Identity)    │    │   (Storage)     │    │   (ESP32/R307)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Docker & Docker Compose
- Auth0 Account
- Firebase Project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/anjanaed/EmpSync.git
   cd EmpSync
   ```

2. **Environment Setup**
   ```bash
   # Copy environment files
   cp client/.env.example client/.env
   cp server/.env.example server/.env

   # Configure your environment variables
   # See Environment Configuration section below
   ```

3. **Database Setup**
   ```bash
   cd server
   npm install

   # Start PostgreSQL with Docker
   docker-compose up -d postgres

   # Run database migrations
   npx prisma migrate dev
   npx prisma generate

   # Seed initial data
   npm run seed
   ```

4. **Install Dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

5. **Start Development Servers**
   ```bash
   # Terminal 1: Start the backend
   cd server
   npm run start:dev

   # Terminal 2: Start the frontend
   cd client
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - Database: localhost:5433

## ⚙️ Environment Configuration

### Client (.env)
```env
VITE_BASE_URL=http://localhost:3000/api
VITE_AUTH0_URL=your-auth0-domain.auth0.com
VITE_AUTH0_ID=your-auth0-client-id
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### Server (.env)
```env
DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5433/mydatabase"
DIRECT_URL="postgresql://postgres:mysecretpassword@localhost:5433/mydatabase"

# Auth0 Configuration
AUTH0_DOMAIN=your-auth0-domain.auth0.com
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# JWT Configuration
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=24h

# Application
NODE_ENV=development
PORT=3000
```

## 🐳 Docker Deployment

### Development with Docker
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Deployment
```bash
# Build for production
cd client
npm run build

# Use production Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /auth/login` - User login via Auth0
- `POST /auth/logout` - User logout
- `GET /auth/profile` - Get user profile

### Employee Management
- `GET /user` - List employees (with organization filter)
- `POST /user` - Create new employee
- `PUT /user/:id` - Update employee
- `DELETE /user/:id` - Delete employee

### Payroll Management
- `GET /payroll` - List payroll records
- `POST /payroll/generate` - Generate payroll for all employees
- `GET /payroll/:id/pdf` - Download payslip PDF

### Organization Management
- `GET /super-admin/organizations` - List all organizations
- `POST /super-admin/organizations` - Create organization
- `PUT /super-admin/organizations/:id` - Update organization

### IoT Integration
- `GET /iot/devices` - List connected IoT devices
- `POST /iot/fingerprint/register` - Register fingerprint
- `GET /iot/status` - Get device status

## 🧪 Testing

### Backend Tests
```bash
cd server
npm run test                    # Run all tests
npm run test:watch             # Watch mode
npm run test:cov               # Coverage report
npm run test:e2e               # End-to-end tests
```

### Frontend Tests
```bash
cd client
npm run test                   # Run tests
npm run test:coverage          # Coverage report
```

### IoT Hardware Tests
```bash
cd server
npm run test:iot               # Run IoT integration tests
```

## 🔧 Development

### Code Quality
```bash
# Backend
cd server
npm run lint                   # ESLint
npm run format                 # Prettier formatting

# Frontend
cd client
npm run lint                   # ESLint
npm run format                 # Prettier formatting
```

### Database Management
```bash
cd server
npx prisma studio              # Open Prisma Studio
npx prisma migrate dev         # Create and apply migration
npx prisma generate            # Generate Prisma client
npx prisma db seed             # Seed database
```

### Building for Production
```bash
# Backend
cd server
npm run build
npm run start:prod

# Frontend
cd client
npm run build
npm run preview
```

## 📁 Project Structure

```
EmpSync/
├── client/                    # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── contexts/          # React contexts
│   │   ├── hooks/            # Custom React hooks
│   │   ├── routes/           # Route definitions
│   │   ├── styles/           # Global styles
│   │   └── utils/            # Utility functions
│   ├── .env                  # Client environment variables
│   └── vite.config.js        # Vite configuration
├── server/                    # NestJS Backend
│   ├── src/
│   │   ├── core/             # Core modules (auth, user, etc.)
│   │   ├── modules/          # Feature modules
│   │   ├── test/             # Test files
│   │   └── main.ts           # Application entry point
│   ├── prisma/               # Database schema and migrations
│   ├── .env                  # Server environment variables
│   └── docker-compose.yml    # Docker services
├── android-serial-alternatives.md
├── fingerprint_ble_tester.html
├── IoT-Hardware-Test-Summary.md
├── PASSKEY_TEST_CASES.md
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests for new features
- Update documentation for API changes
- Use conventional commit messages
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [React](https://reactjs.org/) - JavaScript library for building user interfaces
- [Prisma](https://prisma.io/) - Next-generation ORM
- [Auth0](https://auth0.com/) - Identity and access management
- [Ant Design](https://ant.design/) - React UI library
- [Firebase](https://firebase.google.com/) - Backend-as-a-Service


---

**EmpSync** - Empowering HR management with modern technology.</content>
<parameter name="filePath">c:\Users\user\Documents\EmpSync\README.md
