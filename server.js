const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'client/build')));

// Ensure data directories exist
const dataDir = path.join(__dirname, 'data');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// File storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Data storage functions
const getUsersData = () => {
  const filePath = path.join(__dirname, 'data/users.json');
  if (!fs.existsSync(filePath)) {
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
    fs.writeFileSync(filePath, JSON.stringify(defaultUsers, null, 2));
    return defaultUsers;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const getLivesData = () => {
  const filePath = path.join(__dirname, 'data/lives.json');
  if (!fs.existsSync(filePath)) {
    const defaultLives = {
      user1: {
        currentLives: 5,
        maxLives: 5,
        lastRefresh: new Date().toISOString(),
        pendingRequests: [],
        sharedLives: 0
      },
      user2: {
        currentLives: 10,
        maxLives: 10,
        lastRefresh: new Date().toISOString(),
        pendingRequests: [],
        sharedLives: 0,
        boosterActive: false,
        boosterStart: null,
        boosterNoes: 0
      }
    };
    fs.writeFileSync(filePath, JSON.stringify(defaultLives, null, 2));
    return defaultLives;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

// Helper to check and lapse booster
function checkAndLapseBooster(livesData) {
  const boosterUser = livesData.user2;
  if (boosterUser.boosterActive && boosterUser.boosterStart) {
    const boosterStart = new Date(boosterUser.boosterStart);
    const now = new Date();
    const diffDays = (now - boosterStart) / (1000 * 60 * 60 * 24);
    if (diffDays >= 7) {
      // Lapse unused booster noes
      boosterUser.currentLives = Math.max(0, boosterUser.currentLives - boosterUser.boosterNoes);
      boosterUser.boosterActive = false;
      boosterUser.boosterStart = null;
      boosterUser.boosterNoes = 0;
    }
  }
}

const saveLivesData = (data) => {
  const filePath = path.join(__dirname, 'data/lives.json');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Check and refresh lives monthly
const checkMonthlyRefresh = () => {
  const livesData = getLivesData();
  const now = new Date();
  let updated = false;

  Object.keys(livesData).forEach(userId => {
    const lastRefresh = new Date(livesData[userId].lastRefresh);
    const monthsDiff = (now.getFullYear() - lastRefresh.getFullYear()) * 12 + 
                      (now.getMonth() - lastRefresh.getMonth());
    
    if (monthsDiff >= 1) {
      livesData[userId].currentLives = livesData[userId].maxLives;
      livesData[userId].lastRefresh = now.toISOString();
      livesData[userId].pendingRequests = [];
      updated = true;
    }
  });

  if (updated) {
    saveLivesData(livesData);
  }
  return livesData;
};

// Routes
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const users = getUsersData();
  
  const user = users.find(u => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, name: user.name },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '7d' }
  );

  res.json({ token, user: { id: user.id, username: user.username, name: user.name } });
});

app.get('/api/lives', authenticateToken, (req, res) => {
  const livesData = checkMonthlyRefresh();
  const users = getUsersData();

  // Lapse booster if needed
  checkAndLapseBooster(livesData);

  // Attach names to livesData
  Object.keys(livesData).forEach(userId => {
    const user = users.find(u => u.id === userId);
    livesData[userId].name = user ? user.name : '';
  });

  saveLivesData(livesData);
  res.json(livesData);
});

app.post('/api/request-life', authenticateToken, (req, res) => {
  const { targetUserId } = req.body;
  const livesData = getLivesData();
  
  if (!livesData[targetUserId]) {
    return res.status(404).json({ error: 'User not found' });
  }

  const requestId = uuidv4();
  const request = {
    id: requestId,
    requesterId: req.user.id,
    requesterName: req.user.name,
    targetUserId,
    message: 'Do you really want to say no to this cute guy?',
    photoUrl: '/uploads/cute-guy.jpg', // Default cute guy image
    timestamp: new Date().toISOString(),
    status: 'pending'
  };

  livesData[targetUserId].pendingRequests.push(request);
  saveLivesData(livesData);

  // Notify the target user via Socket.IO
  io.emit('life-request', request);

  res.json({ success: true, requestId });
});

app.post('/api/approve-life', authenticateToken, (req, res) => {
  const { requestId } = req.body;
  const livesData = getLivesData();
  
  const userData = livesData[req.user.id];
  if (!userData) {
    return res.status(404).json({ error: 'User not found' });
  }

  const requestIndex = userData.pendingRequests.findIndex(r => r.id === requestId);
  if (requestIndex === -1) {
    return res.status(404).json({ error: 'Request not found' });
  }

  const request = userData.pendingRequests[requestIndex];
  
  // Mark this user's approval
  request.approvals = request.approvals || {};
  request.approvals[req.user.id] = true;
  
  // Check if both partners have approved (both must confirm the life was used)
  const otherUserId = req.user.id === 'user1' ? 'user2' : 'user1';
  const otherUserData = livesData[otherUserId];
  
  if (request.approvals[req.user.id] && request.approvals[otherUserId]) {
    // Both confirmed - decrement the no
    if (req.user.id === 'user2' && userData.boosterActive && userData.boosterNoes > 0) {
      userData.boosterNoes -= 1;
      userData.currentLives = Math.max(0, userData.currentLives - 1);
      if (userData.boosterNoes === 0) {
        userData.boosterActive = false;
        userData.boosterStart = null;
      }
    } else {
      userData.currentLives = Math.max(0, userData.currentLives - 1);
    }
    request.status = 'approved';
    
    // Remove from pending requests
    userData.pendingRequests.splice(requestIndex, 1);
    
    // Notify both users
    io.emit('life-used', {
      userId: req.user.id,
      currentLives: userData.currentLives,
      request: request
    });
  } else {
    // Update the request
    userData.pendingRequests[requestIndex] = request;
  }

  saveLivesData(livesData);
  res.json({ success: true, livesData });
});

app.post('/api/deny-life', authenticateToken, (req, res) => {
  const { requestId } = req.body;
  const livesData = getLivesData();
  
  const userData = livesData[req.user.id];
  if (!userData) {
    return res.status(404).json({ error: 'User not found' });
  }

  const requestIndex = userData.pendingRequests.findIndex(r => r.id === requestId);
  if (requestIndex === -1) {
    return res.status(404).json({ error: 'Request not found' });
  }

  // Remove the request
  userData.pendingRequests.splice(requestIndex, 1);
  saveLivesData(livesData);

  io.emit('life-denied', { requestId, deniedBy: req.user.id });
  res.json({ success: true });
});

app.post('/api/share-lives', authenticateToken, (req, res) => {
  const { targetUserId, livesToShare } = req.body;
  const livesData = getLivesData();
  
  if (!livesData[targetUserId] || !livesData[req.user.id]) {
    return res.status(404).json({ error: 'User not found' });
  }

  const userData = livesData[req.user.id];
  if (userData.currentLives < livesToShare) {
    return res.status(400).json({ error: 'Not enough lives to share' });
  }

  // Transfer lives
  userData.currentLives -= livesToShare;
  livesData[targetUserId].sharedLives += livesToShare;
  
  saveLivesData(livesData);

  io.emit('lives-shared', {
    fromUserId: req.user.id,
    toUserId: targetUserId,
    livesShared: livesToShare,
    livesData: livesData
  });

  res.json({ success: true, livesData });
});

app.post('/api/activate-booster', authenticateToken, (req, res) => {
  if (req.user.id !== 'user2') {
    return res.status(403).json({ error: 'Only Anushka can activate the booster.' });
  }
  const livesData = getLivesData();
  const boosterUser = livesData.user2;
  checkAndLapseBooster(livesData);
  if (boosterUser.boosterActive) {
    return res.status(400).json({ error: 'Booster already active.' });
  }
  boosterUser.currentLives += 5;
  boosterUser.boosterActive = true;
  boosterUser.boosterStart = new Date().toISOString();
  boosterUser.boosterNoes = 5;
  saveLivesData(livesData);
  res.json({ success: true, livesData });
});

app.post('/api/upload-photo', authenticateToken, upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const photoUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, photoUrl });
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-room', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Default users:');
  console.log('Saumitr: username=saumitr, password=password1');
  console.log('Anushka: username=anushka, password=password2');
}); 