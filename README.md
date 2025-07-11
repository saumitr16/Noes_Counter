# Lives Counter - Secure Partner Application

A secure web application for two partners to manage their lives with real-time synchronization, dual confirmation, and life sharing features.

## Features

### 🔐 Security
- JWT-based authentication
- Rate limiting to prevent abuse
- Secure file uploads with validation
- HTTPS-ready configuration
- Input sanitization and validation

### 💖 Lives Management
- **Monthly Refresh**: Lives automatically refresh every month
- **Dual Confirmation**: Both partners must approve before using a life
- **Life Sharing**: Partners can share their lives with each other
- **Real-time Updates**: Live synchronization using Socket.IO
- **Custom Messages**: Add personal messages when requesting life usage
- **Photo Attachments**: Upload photos with life requests

### 🎨 Modern UI
- Beautiful gradient design
- Responsive layout for mobile and desktop
- Smooth animations and transitions
- Intuitive user interface
- Real-time notifications

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone and install dependencies:**
   ```bash
   # Install server dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

2. **Set up environment variables:**
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit .env with your configuration
   # Make sure to change the JWT_SECRET and SESSION_SECRET
   ```

3. **Start the application:**
   ```bash
   # Development mode (starts both server and client)
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

4. **Access the application:**
   - Open your browser and go to `http://localhost:3000`
       - Use the default credentials:
      - **Saumitr**: username=`saumitr`, password=`password1`
      - **Anushka**: username=`anushka`, password=`password2`

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Security (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
SESSION_SECRET=your-session-secret-key-change-this-too

# Database (using file-based storage for simplicity)
DATA_FILE=./data/users.json
LIVES_DATA_FILE=./data/lives.json

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

### Customizing Users

Edit the default users in `server.js` or modify the `getUsersData()` function:

```javascript
const defaultUsers = [
  {
    id: 'user1',
    username: 'saumitr',
    password: bcrypt.hashSync('password1', 10),
    name: 'Saumitr'
  },
  {
    id: 'user2',
    username: 'anushka',
    password: bcrypt.hashSync('password2', 10),
    name: 'Anushka'
  }
];
```

## How It Works

### Life Usage Process
1. **Request**: One partner requests to use a life (their own or their partner's)
2. **Message & Photo**: They can add a message and upload a photo
3. **Notification**: The other partner receives a real-time notification
4. **Approval**: Both partners must approve the request
5. **Deduction**: Only after dual approval is the life deducted

### Life Sharing
- Partners can share their lives with each other
- Shared lives are tracked separately
- Maximum of 5 lives can be shared at once
- Real-time updates when lives are shared

### Monthly Refresh
- Lives automatically refresh to maximum on the first of each month
- All pending requests are cleared during refresh
- Refresh date is displayed in the dashboard

## Security Features

### Authentication
- JWT tokens with 7-day expiration
- Secure password hashing with bcrypt
- Automatic token refresh

### Rate Limiting
- 100 requests per 15 minutes per IP
- Prevents brute force attacks
- Configurable limits

### File Upload Security
- File type validation (images only)
- File size limits (5MB max)
- Secure file naming with UUIDs
- Upload directory isolation

### Data Protection
- Input validation and sanitization
- SQL injection prevention (file-based storage)
- XSS protection with helmet
- CORS configuration

## Production Deployment

### Security Checklist
- [ ] Change default JWT_SECRET and SESSION_SECRET
- [ ] Set NODE_ENV=production
- [ ] Configure HTTPS
- [ ] Set up proper firewall rules
- [ ] Use environment variables for all secrets
- [ ] Configure proper CORS origins
- [ ] Set up monitoring and logging

### Deployment Options
- **Heroku**: Easy deployment with Procfile
- **Vercel**: Frontend deployment with serverless functions
- **DigitalOcean**: VPS deployment with PM2
- **AWS**: EC2 with load balancer

### Example Production Commands
```bash
# Build the application
npm run build

# Start production server
NODE_ENV=production npm start

# Using PM2 for process management
pm2 start server.js --name "lives-counter"
```

## API Endpoints

### Authentication
- `POST /api/login` - User login
- `GET /api/lives` - Get lives data (authenticated)

### Life Management
- `POST /api/request-life` - Request life usage
- `POST /api/approve-life` - Approve life request
- `POST /api/deny-life` - Deny life request
- `POST /api/share-lives` - Share lives with partner

### File Upload
- `POST /api/upload-photo` - Upload photo for life request

## Socket.IO Events

### Client to Server
- `join-room` - Join user's notification room

### Server to Client
- `life-request` - New life request notification
- `life-used` - Life successfully used
- `life-denied` - Life request denied
- `lives-shared` - Lives shared successfully

## Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Change port in .env file
PORT=3001
```

**File upload errors:**
```bash
# Ensure uploads directory exists
mkdir uploads
```

**Socket.IO connection issues:**
```bash
# Check CORS configuration in server.js
# Ensure client proxy is set correctly
```

**Authentication errors:**
```bash
# Clear browser localStorage
# Check JWT_SECRET in .env
# Verify user credentials in data/users.json
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the configuration
3. Open an issue on GitHub

---

**Note**: This application is designed for personal use between two partners. For production use, consider implementing additional security measures and using a proper database. 