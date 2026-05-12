# Grafenda Backend API

Backend API untuk platform marketplace jasa kreatif mahasiswa Grafenda, dibangun dengan Node.js, Express.js, dan MySQL.

## Fitur Utama

- **Authentication & Authorization**: JWT-based authentication dengan role management (User, Seller, Admin)
- **Service Management**: CRUD operasi untuk jasa kreatif dengan paket harga
- **Order Management**: Sistem pemesanan dengan status tracking
- **Payment System**: Upload bukti pembayaran dengan verifikasi admin
- **Real-time Chat**: Komunikasi real-time menggunakan Socket.io
- **Notification System**: Notifikasi real-time untuk semua aktivitas
- **File Upload**: Upload gambar dan dokumen dengan multer
- **Review & Rating**: Sistem review dan rating untuk seller
- **Withdraw System**: Sistem penarikan saldo untuk seller
- **Admin Dashboard**: Panel admin untuk mengelola platform

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **File Upload**: multer
- **Real-time**: Socket.io
- **Validation**: express-validator
- **Rate Limiting**: express-rate-limit
- **Logging**: Winston
- **PDF Generation**: PDFKit

## Struktur Folder

```
backend/
├── config/
│   └── database.js          # Database configuration
├── controllers/
│   ├── AuthController.js    # Authentication logic
│   ├── ServiceController.js # Service management
│   ├── OrderController.js   # Order management
│   ├── PaymentController.js # Payment handling
│   └── ...                  # Other controllers
├── middleware/
│   ├── auth.js             # Authentication middleware
│   ├── errorHandler.js     # Error handling
│   ├── rateLimiter.js      # Rate limiting
│   └── upload.js           # File upload middleware
├── models/
│   ├── User.js             # User model
│   ├── Service.js          # Service model
│   ├── Order.js            # Order model
│   ├── Payment.js          # Payment model
│   └── ...                 # Other models
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── services.js         # Service routes
│   ├── orders.js           # Order routes
│   ├── payments.js         # Payment routes
│   └── ...                 # Other routes
├── services/
│   ├── AuthService.js      # Authentication service
│   ├── NotificationService.js # Notification service
│   └── ChatService.js      # Chat service
├── utils/
│   ├── helpers.js          # Utility functions
│   └── pdfGenerator.js     # PDF generation
├── uploads/                # Uploaded files
├── logs/                   # Application logs
├── app.js                  # Express app setup
├── server.js               # Server startup
├── package.json
├── .env                    # Environment variables
└── database_schema.sql     # Database schema
```

## Setup & Installation

### Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. **Clone repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   Copy `.env` file and configure:
   ```env
   DB_HOST=localhost
   DB_USER=your_mysql_user
   DB_PASSWORD=your_mysql_password
   DB_NAME=grafenda_db
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

4. **Setup database**
   ```bash
   # Import schema
   mysql -u your_user -p your_database < database_schema.sql
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Start production server**
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Services
- `GET /api/services` - Get all services (with filters)
- `GET /api/services/:id` - Get service details
- `POST /api/services` - Create new service (seller only)
- `PUT /api/services/:id` - Update service (seller only)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status

### Payments
- `POST /api/payments/upload-proof` - Upload payment proof
- `GET /api/payments/order/:orderId` - Get payment details
- `PUT /api/payments/:id/verify` - Verify payment (admin only)

## Database Schema

Database menggunakan MySQL dengan tabel utama:

- `users` - User accounts
- `seller_profiles` - Seller information
- `services` - Service listings
- `service_packages` - Service pricing packages
- `orders` - Order records
- `payments` - Payment records
- `chats` - Chat messages
- `notifications` - User notifications
- `reviews` - Service reviews
- `withdraws` - Withdrawal requests
- `reports` - User reports

## Real-time Features

### Socket.io Events

**Chat Events:**
- `send_message` - Send chat message
- `new_message` - Receive new message
- `join_order` - Join order chat room

**Notification Events:**
- `notification` - Receive notification
- `join` - Join user notification room

## Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- Input validation
- CORS configuration
- File upload restrictions
- SQL injection prevention

## Error Handling

API menggunakan format response konsisten:

```json
{
  "success": true|false,
  "message": "Response message",
  "data": {} // Optional data
}
```

## Logging

Aplikasi menggunakan Winston untuk logging dengan level:
- Error logs: `logs/error.log`
- Combined logs: `logs/combined.log`
- Console logs (development only)

## File Upload

- **Destination**: `uploads/` directory
- **Allowed types**: Images, PDFs, documents
- **Max size**: 5MB per file
- **Subdirectories**: `avatars/`, `portfolios/`, `payments/`, `chats/`

## Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests

### Code Style

- Use ES6+ features
- Async/await for asynchronous operations
- Consistent error handling
- JSDoc comments for functions
- Clean, readable code structure

## Deployment

1. Set `NODE_ENV=production` in environment
2. Configure production database
3. Set up process manager (PM2 recommended)
4. Configure reverse proxy (nginx)
5. Set up SSL certificate
6. Configure file storage (AWS S3 for production)

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

This project is licensed under the ISC License.