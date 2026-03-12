# Canteen Backend Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Node.js/Express backend for the Canteen Management System with MongoDB Atlas, Cloudflare R2, and Socket.IO.

**Architecture:** Flat Express (routes → controllers → services → models). JWT access token auth. Socket.IO for real-time token updates. Presigned URLs for R2 media uploads. Deployed on AWS EC2 with PM2 + Nginx.

**Tech Stack:** Node.js 20, Express, Mongoose, Socket.IO, jsonwebtoken, bcryptjs, @aws-sdk/client-s3, express-validator

**Spec:** `docs/superpowers/specs/2026-03-12-canteen-backend-design.md`

---

## Chunk 1: Project Scaffold & Core Infrastructure

### Task 1: Initialize project and install dependencies

**Files:**
- Create: `canteen-backend/package.json`
- Create: `canteen-backend/.env.example`
- Create: `canteen-backend/.gitignore`

- [ ] **Step 1: Create project directory and initialize**

```bash
mkdir -p canteen-backend && cd canteen-backend
npm init -y
```

- [ ] **Step 2: Install production dependencies**

```bash
npm install express mongoose socket.io jsonwebtoken bcryptjs @aws-sdk/client-s3 @aws-sdk/s3-request-presigner cors helmet express-rate-limit morgan dotenv express-validator
```

- [ ] **Step 3: Install dev dependencies**

```bash
npm install -D nodemon
```

- [ ] **Step 4: Create .env.example**

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/canteen
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=canteen-media
R2_PUBLIC_URL=https://media.yourdomain.com
FRONTEND_URL=http://localhost:5173
```

- [ ] **Step 5: Create .gitignore**

```
node_modules/
.env
dist/
*.log
```

- [ ] **Step 6: Add scripts to package.json**

Add to `scripts`:
```json
{
  "start": "node server.js",
  "dev": "nodemon server.js",
  "seed": "node seed.js"
}
```

- [ ] **Step 7: Commit**

```bash
git add canteen-backend/
git commit -m "feat: initialize canteen-backend project with dependencies"
```

---

### Task 2: Config files (env, db, r2, socket)

**Files:**
- Create: `canteen-backend/src/config/env.js`
- Create: `canteen-backend/src/config/db.js`
- Create: `canteen-backend/src/config/r2.js`
- Create: `canteen-backend/src/config/socket.js`

- [ ] **Step 1: Create env.js**

```javascript
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  r2: {
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucketName: process.env.R2_BUCKET_NAME,
    publicUrl: process.env.R2_PUBLIC_URL,
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};
```

- [ ] **Step 2: Create db.js**

```javascript
const mongoose = require('mongoose');
const config = require('./env');

const connectDB = async () => {
  const conn = await mongoose.connect(config.mongodbUri);
  console.log(`MongoDB connected: ${conn.connection.host}`);
};

module.exports = connectDB;
```

- [ ] **Step 3: Create r2.js**

```javascript
const { S3Client } = require('@aws-sdk/client-s3');
const config = require('./env');

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${config.r2.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: config.r2.accessKeyId,
    secretAccessKey: config.r2.secretAccessKey,
  },
});

module.exports = r2Client;
```

- [ ] **Step 4: Create socket.js**

```javascript
const { Server } = require('socket.io');
const config = require('./env');

const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: config.frontendUrl,
      credentials: true,
    },
  });

  io.of('/tokens').on('connection', (socket) => {
    console.log('Token client connected:', socket.id);
    socket.on('disconnect', () => {
      console.log('Token client disconnected:', socket.id);
    });
  });

  return io;
};

module.exports = initSocket;
```

- [ ] **Step 5: Commit**

```bash
git add canteen-backend/src/config/
git commit -m "feat: add config files for env, db, r2, and socket.io"
```

---

### Task 3: Middleware (auth, authorize, validate, errorHandler, rateLimiter)

**Files:**
- Create: `canteen-backend/src/middleware/auth.js`
- Create: `canteen-backend/src/middleware/authorize.js`
- Create: `canteen-backend/src/middleware/validate.js`
- Create: `canteen-backend/src/middleware/errorHandler.js`
- Create: `canteen-backend/src/middleware/rateLimiter.js`

- [ ] **Step 1: Create auth.js**

```javascript
const jwt = require('jsonwebtoken');
const config = require('../config/env');

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = auth;
```

- [ ] **Step 2: Create authorize.js**

```javascript
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized for this action' });
    }
    next();
  };
};

module.exports = authorize;
```

- [ ] **Step 3: Create validate.js**

```javascript
const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const fieldErrors = {};
    errors.array().forEach((err) => {
      if (err.path) {
        fieldErrors[err.path] = err.msg;
      }
    });
    return res.status(400).json({ isValid: false, errors: fieldErrors });
  }
  next();
};

module.exports = validate;
```

- [ ] **Step 4: Create errorHandler.js**

```javascript
const errorHandler = (err, req, res, _next) => {
  console.error(err.stack);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = {};
    Object.keys(err.errors).forEach((key) => {
      errors[key] = err.errors[key].message;
    });
    return res.status(400).json({ isValid: false, errors });
  }

  // Mongoose cast error (bad ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid ${err.path}: ${err.value}` });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ message: `${field} already exists` });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: process.env.NODE_ENV === 'production' ? 'Server error' : err.message,
  });
};

module.exports = errorHandler;
```

- [ ] **Step 5: Create rateLimiter.js**

```javascript
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts, try again in 15 minutes' },
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { message: 'Too many requests, try again later' },
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { message: 'Too many upload requests, try again later' },
});

module.exports = { authLimiter, apiLimiter, uploadLimiter };
```

- [ ] **Step 6: Commit**

```bash
git add canteen-backend/src/middleware/
git commit -m "feat: add middleware for auth, authorization, validation, errors, rate limiting"
```

---

### Task 4: Utility files (socketManager, logger, r2Utils, timeUtils)

**Files:**
- Create: `canteen-backend/src/utils/socketManager.js`
- Create: `canteen-backend/src/utils/logger.js`
- Create: `canteen-backend/src/utils/r2Utils.js`
- Create: `canteen-backend/src/utils/timeUtils.js`

- [ ] **Step 1: Create socketManager.js**

```javascript
let io;

const init = (socketIo) => {
  io = socketIo;
};

const emitTokenUpdate = (data) => {
  if (io) io.of('/tokens').emit('token-updated', data);
};

const emitTokenClear = (data) => {
  if (io) io.of('/tokens').emit('token-cleared', data);
};

module.exports = { init, emitTokenUpdate, emitTokenClear };
```

- [ ] **Step 2: Create logger.js**

```javascript
const logger = {
  info: (...args) => console.log(new Date().toISOString(), '[INFO]', ...args),
  error: (...args) => console.error(new Date().toISOString(), '[ERROR]', ...args),
  warn: (...args) => console.warn(new Date().toISOString(), '[WARN]', ...args),
};

module.exports = logger;
```

- [ ] **Step 3: Create r2Utils.js**

```javascript
const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');
const path = require('path');
const r2Client = require('../config/r2');
const config = require('../config/env');

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4', 'video/webm',
];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const generatePresignedUrl = async (folder, fileName, fileType, fileSize) => {
  if (!ALLOWED_TYPES.includes(fileType)) {
    throw Object.assign(new Error(`File type ${fileType} not allowed`), { statusCode: 400 });
  }
  if (fileSize > MAX_FILE_SIZE) {
    throw Object.assign(new Error('File size exceeds 50MB limit'), { statusCode: 400 });
  }

  const ext = path.extname(fileName);
  const uniqueKey = `${folder}/${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;

  const command = new PutObjectCommand({
    Bucket: config.r2.bucketName,
    Key: uniqueKey,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 600 });
  const fileUrl = `${config.r2.publicUrl}/${uniqueKey}`;

  return { uploadUrl, fileUrl, key: uniqueKey };
};

const deleteFile = async (key) => {
  const command = new DeleteObjectCommand({
    Bucket: config.r2.bucketName,
    Key: key,
  });
  await r2Client.send(command);
};

module.exports = { generatePresignedUrl, deleteFile, ALLOWED_TYPES, MAX_FILE_SIZE };
```

- [ ] **Step 4: Create timeUtils.js** (ported from frontend)

```javascript
const timeToMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

const isTimeInRange = (currentTime, startTime, endTime) => {
  const current = timeToMinutes(currentTime);
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  if (end > start) {
    return current >= start && current < end;
  }
  // Overnight span
  return current >= start || current < end;
};

const getCurrentTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

const getCurrentDayOfWeek = () => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
};

module.exports = { timeToMinutes, isTimeInRange, getCurrentTime, getCurrentDayOfWeek };
```

- [ ] **Step 5: Commit**

```bash
git add canteen-backend/src/utils/
git commit -m "feat: add utility files for socket, logging, R2, and time"
```

---

### Task 5: Express app setup and server entry point

**Files:**
- Create: `canteen-backend/src/app.js`
- Create: `canteen-backend/server.js`
- Create: `canteen-backend/ecosystem.config.js`

- [ ] **Step 1: Create app.js**

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

// Security & parsing
app.use(helmet());
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use('/api/', apiLimiter);

// Health check
app.get('/api/v1/health', async (req, res) => {
  const mongoose = require('mongoose');
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// Routes will be mounted here (added in subsequent tasks)

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
```

- [ ] **Step 2: Create server.js**

```javascript
const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const initSocket = require('./src/config/socket');
const socketManager = require('./src/utils/socketManager');
const config = require('./src/config/env');

const startServer = async () => {
  await connectDB();

  const httpServer = http.createServer(app);
  const io = initSocket(httpServer);
  socketManager.init(io);

  httpServer.listen(config.port, () => {
    console.log(`Server running in ${config.nodeEnv} mode on port ${config.port}`);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
```

- [ ] **Step 3: Create ecosystem.config.js**

```javascript
module.exports = {
  apps: [{
    name: 'canteen-api',
    script: 'server.js',
    instances: 1,
    env_production: { NODE_ENV: 'production' },
  }],
};
```

- [ ] **Step 4: Verify server starts** (requires .env with valid MONGODB_URI)

```bash
cd canteen-backend && node server.js
```
Expected: `MongoDB connected: ...` and `Server running in development mode on port 5000`

- [ ] **Step 5: Commit**

```bash
git add canteen-backend/src/app.js canteen-backend/server.js canteen-backend/ecosystem.config.js
git commit -m "feat: add Express app setup and server entry point"
```

---

## Chunk 2: Models

### Task 6: User model

**Files:**
- Create: `canteen-backend/src/models/User.js`

- [ ] **Step 1: Create User.js**

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, minlength: 2, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      trim: true,
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      required: true,
      enum: ['admin', 'restaurant_user', 'token_operator'],
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

- [ ] **Step 2: Commit**

```bash
git add canteen-backend/src/models/User.js
git commit -m "feat: add User model with bcrypt password hashing"
```

---

### Task 7: Item model

**Files:**
- Create: `canteen-backend/src/models/Item.js`

- [ ] **Step 1: Create Item.js**

```javascript
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, minlength: 2, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0, max: 10000 },
    category: { type: String, default: '', trim: true },
    ingredients: { type: String, default: '', trim: true },
    image: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Item', itemSchema);
```

- [ ] **Step 2: Commit**

```bash
git add canteen-backend/src/models/Item.js
git commit -m "feat: add Item model"
```

---

### Task 8: Menu model

**Files:**
- Create: `canteen-backend/src/models/Menu.js`

- [ ] **Step 1: Create Menu.js**

```javascript
const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Menu', menuSchema);
```

- [ ] **Step 2: Commit**

```bash
git add canteen-backend/src/models/Menu.js
git commit -m "feat: add Menu model with Item refs"
```

---

### Task 9: FoodScreen model

**Files:**
- Create: `canteen-backend/src/models/FoodScreen.js`

- [ ] **Step 1: Create FoodScreen.js**

```javascript
const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['menu', 'media'] },
    menuId: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu' },
    visualStyle: { type: String },
    titleFont: { type: String },
    titleColor: { type: String },
    media: [{ type: String }],
    slideDuration: { type: Number },
    transition: { type: String },
  },
  { _id: false }
);

const timeSlotSchema = new mongoose.Schema({
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  daysOfWeek: [{ type: String }],
  content: contentSchema,
});

const sectionSchema = new mongoose.Schema({
  label: { type: String },
  defaultContent: contentSchema,
  timeSlots: [timeSlotSchema],
});

const foodScreenSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    screenId: { type: String, required: true, unique: true, trim: true },
    type: { type: String, default: 'food' },
    layoutTheme: { type: String },
    backgroundType: { type: String, enum: ['color', 'image', 'video'] },
    backgroundMedia: { type: String },
    backgroundColor: { type: String },
    gap: { type: Number, default: 8 },
    sections: [sectionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('FoodScreen', foodScreenSchema);
```

- [ ] **Step 2: Commit**

```bash
git add canteen-backend/src/models/FoodScreen.js
git commit -m "feat: add FoodScreen model with sections and time slots"
```

---

### Task 10: TokenScreen model

**Files:**
- Create: `canteen-backend/src/models/TokenScreen.js`

- [ ] **Step 1: Create TokenScreen.js**

```javascript
const mongoose = require('mongoose');

const tokenScreenSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    screenId: { type: String, required: true, unique: true, trim: true },
    type: { type: String, default: 'token' },
    titleFont: { type: String },
    titleColor: { type: String },
    backgroundType: { type: String, enum: ['color', 'image', 'video'] },
    backgroundMedia: { type: String },
    backgroundColor: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TokenScreen', tokenScreenSchema);
```

- [ ] **Step 2: Commit**

```bash
git add canteen-backend/src/models/TokenScreen.js
git commit -m "feat: add TokenScreen model"
```

---

### Task 11: TokenState model

**Files:**
- Create: `canteen-backend/src/models/TokenState.js`

- [ ] **Step 1: Create TokenState.js**

```javascript
const mongoose = require('mongoose');

const tokenEntrySchema = new mongoose.Schema(
  {
    number: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const tokenStateSchema = new mongoose.Schema({
  currentToken: tokenEntrySchema,
  history: [tokenEntrySchema],
  archive: [tokenEntrySchema],
});

// Ensure single document pattern
tokenStateSchema.statics.getInstance = async function () {
  let state = await this.findOne();
  if (!state) {
    state = await this.create({ currentToken: null, history: [], archive: [] });
  }
  return state;
};

// Purge archive entries older than 72 hours
tokenStateSchema.methods.purgeExpiredArchive = function () {
  const cutoff = new Date(Date.now() - 72 * 60 * 60 * 1000);
  this.archive = this.archive.filter((entry) => entry.updatedAt > cutoff);
};

module.exports = mongoose.model('TokenState', tokenStateSchema);
```

- [ ] **Step 2: Commit**

```bash
git add canteen-backend/src/models/TokenState.js
git commit -m "feat: add TokenState model with single-document pattern"
```

---

### Task 12: ActivityLog model

**Files:**
- Create: `canteen-backend/src/models/ActivityLog.js`

- [ ] **Step 1: Create ActivityLog.js**

```javascript
const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    action: {
      type: String,
      required: true,
      enum: ['CREATE', 'UPDATE', 'DELETE', 'RESET'],
    },
    resourceType: {
      type: String,
      required: true,
      enum: ['item', 'menu', 'food_screen', 'token_screen', 'user', 'token', 'system'],
    },
    resourceName: { type: String, required: true },
    details: { type: String },
    beforeData: { type: mongoose.Schema.Types.Mixed },
    afterData: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

activityLogSchema.index({ userId: 1 });
activityLogSchema.index({ resourceType: 1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
```

- [ ] **Step 2: Commit**

```bash
git add canteen-backend/src/models/ActivityLog.js
git commit -m "feat: add ActivityLog model with indexes"
```

---

## Chunk 3: Validators

### Task 13: All validators

**Files:**
- Create: `canteen-backend/src/validators/auth.validator.js`
- Create: `canteen-backend/src/validators/item.validator.js`
- Create: `canteen-backend/src/validators/menu.validator.js`
- Create: `canteen-backend/src/validators/user.validator.js`
- Create: `canteen-backend/src/validators/screen.validator.js`

- [ ] **Step 1: Create auth.validator.js**

```javascript
const { body } = require('express-validator');

const loginRules = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

module.exports = { loginRules };
```

- [ ] **Step 2: Create item.validator.js**

```javascript
const { body } = require('express-validator');

const createItemRules = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0, max: 10000 }).withMessage('Price must be between 0 and 10000'),
  body('image').notEmpty().withMessage('Image is required'),
];

const updateItemRules = [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('price').optional().isFloat({ min: 0, max: 10000 }).withMessage('Price must be between 0 and 10000'),
];

module.exports = { createItemRules, updateItemRules };
```

- [ ] **Step 3: Create menu.validator.js**

```javascript
const { body } = require('express-validator');

const createMenuRules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
];

const updateMenuRules = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('items').optional().isArray({ min: 1 }).withMessage('At least one item is required'),
];

module.exports = { createMenuRules, updateMenuRules };
```

- [ ] **Step 4: Create user.validator.js**

```javascript
const { body } = require('express-validator');

const createUserRules = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('username')
    .trim()
    .isLength({ min: 3 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3+ chars, alphanumeric and underscores only'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['admin', 'restaurant_user', 'token_operator']).withMessage('Invalid role'),
];

const updateUserRules = [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().trim().isEmail().withMessage('Valid email is required'),
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3+ chars, alphanumeric and underscores only'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'restaurant_user', 'token_operator']).withMessage('Invalid role'),
];

module.exports = { createUserRules, updateUserRules };
```

- [ ] **Step 5: Create screen.validator.js**

```javascript
const { body } = require('express-validator');

const createFoodScreenRules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('screenId').trim().notEmpty().withMessage('Screen ID is required'),
  body('layoutTheme').notEmpty().withMessage('Layout theme is required'),
];

const updateFoodScreenRules = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('screenId').optional().trim().notEmpty().withMessage('Screen ID cannot be empty'),
];

const createTokenScreenRules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('screenId').trim().notEmpty().withMessage('Screen ID is required'),
];

const updateTokenScreenRules = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('screenId').optional().trim().notEmpty().withMessage('Screen ID cannot be empty'),
];

module.exports = {
  createFoodScreenRules, updateFoodScreenRules,
  createTokenScreenRules, updateTokenScreenRules,
};
```

- [ ] **Step 6: Commit**

```bash
git add canteen-backend/src/validators/
git commit -m "feat: add request validators for all entities"
```

---

## Chunk 4: Auth & Users (Services, Controllers, Routes)

### Task 14: Auth service, controller, and routes

**Files:**
- Create: `canteen-backend/src/services/auth.service.js`
- Create: `canteen-backend/src/controllers/auth.controller.js`
- Create: `canteen-backend/src/routes/auth.routes.js`

- [ ] **Step 1: Create auth.service.js**

```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/env');

const login = async (username, password) => {
  const user = await User.findOne({ username }).select('+password');
  if (!user) {
    throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
  }

  const token = jwt.sign({ id: user._id, role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

  const userObj = user.toObject();
  delete userObj.password;

  return { token, user: userObj };
};

const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw Object.assign(new Error('User not found'), { statusCode: 404 });
  }
  return user;
};

module.exports = { login, getMe };
```

- [ ] **Step 2: Create auth.controller.js**

```javascript
const authService = require('../services/auth.service');

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

module.exports = { login, getMe };
```

- [ ] **Step 3: Create auth.routes.js**

```javascript
const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const { loginRules } = require('../validators/auth.validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/login', authLimiter, loginRules, validate, authController.login);
router.get('/me', auth, authController.getMe);

module.exports = router;
```

- [ ] **Step 4: Mount route in app.js**

Add before the error handler in `src/app.js`:
```javascript
app.use('/api/v1/auth', require('./routes/auth.routes'));
```

- [ ] **Step 5: Commit**

```bash
git add canteen-backend/src/services/auth.service.js canteen-backend/src/controllers/auth.controller.js canteen-backend/src/routes/auth.routes.js canteen-backend/src/app.js
git commit -m "feat: add auth login and me endpoints"
```

---

### Task 15: Users service, controller, and routes

**Files:**
- Create: `canteen-backend/src/services/users.service.js`
- Create: `canteen-backend/src/controllers/users.controller.js`
- Create: `canteen-backend/src/routes/users.routes.js`

- [ ] **Step 1: Create users.service.js**

```javascript
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

const logActivity = async (userId, userName, action, resourceName, details, beforeData, afterData) => {
  await ActivityLog.create({
    userId, userName, action, resourceType: 'user', resourceName, details, beforeData, afterData,
  });
};

const getAll = async (page = 1, limit = 50) => {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    User.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(),
  ]);
  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

const getById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
  return user;
};

const create = async (userData, reqUser) => {
  const existing = await User.findOne({
    $or: [{ username: userData.username }, { email: userData.email }],
  });
  if (existing) {
    const field = existing.username === userData.username ? 'username' : 'email';
    throw Object.assign(new Error(`${field} already exists`), { statusCode: 409 });
  }

  const user = await User.create(userData);
  const userObj = user.toObject();
  delete userObj.password;

  await logActivity(reqUser.id, reqUser.name, 'CREATE', user.name, `Created user ${user.name}`, null, userObj);
  return userObj;
};

const update = async (id, updates, reqUser) => {
  const user = await User.findById(id).select('+password');
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

  const beforeData = user.toObject();
  delete beforeData.password;

  // Check uniqueness against other users
  if (updates.username || updates.email) {
    const query = { _id: { $ne: id } };
    const orConditions = [];
    if (updates.username) orConditions.push({ username: updates.username });
    if (updates.email) orConditions.push({ email: updates.email });
    if (orConditions.length) {
      query.$or = orConditions;
      const conflict = await User.findOne(query);
      if (conflict) {
        const field = conflict.username === updates.username ? 'username' : 'email';
        throw Object.assign(new Error(`${field} already exists`), { statusCode: 409 });
      }
    }
  }

  // Blank password = keep existing
  if (!updates.password || updates.password.trim() === '') {
    delete updates.password;
  }

  Object.assign(user, updates);
  await user.save();

  const afterData = user.toObject();
  delete afterData.password;

  await logActivity(reqUser.id, reqUser.name, 'UPDATE', user.name, `Updated user ${user.name}`, beforeData, afterData);
  return afterData;
};

const remove = async (id, reqUser) => {
  const user = await User.findById(id);
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

  // Prevent deleting last admin
  if (user.role === 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount <= 1) {
      throw Object.assign(new Error('Cannot delete the last admin'), { statusCode: 400 });
    }
  }

  const beforeData = user.toObject();
  await User.findByIdAndDelete(id);

  await logActivity(reqUser.id, reqUser.name, 'DELETE', user.name, `Deleted user ${user.name}`, beforeData, null);
  return { success: true };
};

module.exports = { getAll, getById, create, update, remove };
```

- [ ] **Step 2: Create users.controller.js**

```javascript
const usersService = require('../services/users.service');
const User = require('../models/User');

const getReqUser = async (userId) => {
  const user = await User.findById(userId);
  return { id: userId, name: user.name };
};

const getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const result = await usersService.getAll(page, limit);
    res.json(result);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const user = await usersService.getById(req.params.id);
    res.json(user);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const reqUser = await getReqUser(req.user.id);
    const user = await usersService.create(req.body, reqUser);
    res.status(201).json(user);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const reqUser = await getReqUser(req.user.id);
    const user = await usersService.update(req.params.id, req.body, reqUser);
    res.json(user);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const reqUser = await getReqUser(req.user.id);
    const result = await usersService.remove(req.params.id, reqUser);
    res.json(result);
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, remove };
```

- [ ] **Step 3: Create users.routes.js**

```javascript
const router = require('express').Router();
const usersController = require('../controllers/users.controller');
const { createUserRules, updateUserRules } = require('../validators/user.validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.use(auth, authorize('admin'));

router.get('/', usersController.getAll);
router.get('/:id', usersController.getById);
router.post('/', createUserRules, validate, usersController.create);
router.put('/:id', updateUserRules, validate, usersController.update);
router.delete('/:id', usersController.remove);

module.exports = router;
```

- [ ] **Step 4: Mount route in app.js**

```javascript
app.use('/api/v1/users', require('./routes/users.routes'));
```

- [ ] **Step 5: Commit**

```bash
git add canteen-backend/src/services/users.service.js canteen-backend/src/controllers/users.controller.js canteen-backend/src/routes/users.routes.js canteen-backend/src/app.js
git commit -m "feat: add users CRUD with admin-only access and activity logging"
```

---

## Chunk 5: Items & Menus

### Task 16: Items service, controller, and routes

**Files:**
- Create: `canteen-backend/src/services/items.service.js`
- Create: `canteen-backend/src/controllers/items.controller.js`
- Create: `canteen-backend/src/routes/items.routes.js`

- [ ] **Step 1: Create items.service.js**

```javascript
const Item = require('../models/Item');
const Menu = require('../models/Menu');
const ActivityLog = require('../models/ActivityLog');

const logActivity = async (userId, userName, action, resourceName, details, beforeData, afterData) => {
  await ActivityLog.create({
    userId, userName, action, resourceType: 'item', resourceName, details, beforeData, afterData,
  });
};

const getAll = async ({ search, isActive, page = 1, limit = 50 }) => {
  const filter = {};
  if (search) filter.name = { $regex: search, $options: 'i' };
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    Item.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Item.countDocuments(filter),
  ]);
  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

const getById = async (id) => {
  const item = await Item.findById(id);
  if (!item) throw Object.assign(new Error('Item not found'), { statusCode: 404 });
  return item;
};

const create = async (itemData, reqUser) => {
  const item = await Item.create(itemData);
  await logActivity(reqUser.id, reqUser.name, 'CREATE', item.name, `Created item ${item.name}`, null, item.toObject());
  return item;
};

const update = async (id, updates, reqUser) => {
  const item = await Item.findById(id);
  if (!item) throw Object.assign(new Error('Item not found'), { statusCode: 404 });

  const beforeData = item.toObject();
  Object.assign(item, updates);
  await item.save();

  await logActivity(reqUser.id, reqUser.name, 'UPDATE', item.name, `Updated item ${item.name}`, beforeData, item.toObject());
  return item;
};

const remove = async (id, reqUser) => {
  const item = await Item.findById(id);
  if (!item) throw Object.assign(new Error('Item not found'), { statusCode: 404 });

  // Check if item is used in any menu
  const menuUsingItem = await Menu.findOne({ items: id });
  if (menuUsingItem) {
    throw Object.assign(
      new Error(`Cannot delete: item is used in menu "${menuUsingItem.title}"`),
      { statusCode: 400 }
    );
  }

  const beforeData = item.toObject();
  await Item.findByIdAndDelete(id);

  await logActivity(reqUser.id, reqUser.name, 'DELETE', item.name, `Deleted item ${item.name}`, beforeData, null);
  return { success: true };
};

module.exports = { getAll, getById, create, update, remove };
```

- [ ] **Step 2: Create items.controller.js**

```javascript
const itemsService = require('../services/items.service');
const User = require('../models/User');

const getAll = async (req, res, next) => {
  try {
    const { search, isActive, page, limit } = req.query;
    const result = await itemsService.getAll({
      search, isActive,
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 50,
    });
    res.json(result);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const item = await itemsService.getById(req.params.id);
    res.json(item);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const reqUser = await User.findById(req.user.id);
    const item = await itemsService.create(req.body, { id: req.user.id, name: reqUser.name });
    res.status(201).json(item);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const reqUser = await User.findById(req.user.id);
    const item = await itemsService.update(req.params.id, req.body, { id: req.user.id, name: reqUser.name });
    res.json(item);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const reqUser = await User.findById(req.user.id);
    const result = await itemsService.remove(req.params.id, { id: req.user.id, name: reqUser.name });
    res.json(result);
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, remove };
```

- [ ] **Step 3: Create items.routes.js**

```javascript
const router = require('express').Router();
const itemsController = require('../controllers/items.controller');
const { createItemRules, updateItemRules } = require('../validators/item.validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.get('/', auth, itemsController.getAll);
router.get('/:id', auth, itemsController.getById);
router.post('/', auth, authorize('admin', 'restaurant_user'), createItemRules, validate, itemsController.create);
router.put('/:id', auth, authorize('admin', 'restaurant_user'), updateItemRules, validate, itemsController.update);
router.delete('/:id', auth, authorize('admin', 'restaurant_user'), itemsController.remove);

module.exports = router;
```

- [ ] **Step 4: Mount in app.js**

```javascript
app.use('/api/v1/items', require('./routes/items.routes'));
```

- [ ] **Step 5: Commit**

```bash
git add canteen-backend/src/services/items.service.js canteen-backend/src/controllers/items.controller.js canteen-backend/src/routes/items.routes.js canteen-backend/src/app.js
git commit -m "feat: add items CRUD with menu reference check on delete"
```

---

### Task 17: Menus service, controller, and routes

**Files:**
- Create: `canteen-backend/src/services/menus.service.js`
- Create: `canteen-backend/src/controllers/menus.controller.js`
- Create: `canteen-backend/src/routes/menus.routes.js`

- [ ] **Step 1: Create menus.service.js**

```javascript
const Menu = require('../models/Menu');
const FoodScreen = require('../models/FoodScreen');
const ActivityLog = require('../models/ActivityLog');

const logActivity = async (userId, userName, action, resourceName, details, beforeData, afterData) => {
  await ActivityLog.create({
    userId, userName, action, resourceType: 'menu', resourceName, details, beforeData, afterData,
  });
};

const getAll = async (page = 1, limit = 50) => {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    Menu.find().populate('items').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Menu.countDocuments(),
  ]);
  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

const getById = async (id) => {
  const menu = await Menu.findById(id).populate('items');
  if (!menu) throw Object.assign(new Error('Menu not found'), { statusCode: 404 });
  return menu;
};

const create = async (menuData, reqUser) => {
  const menu = await Menu.create(menuData);
  const populated = await menu.populate('items');
  await logActivity(reqUser.id, reqUser.name, 'CREATE', menu.title, `Created menu ${menu.title} with ${menu.items.length} items`, null, populated.toObject());
  return populated;
};

const update = async (id, updates, reqUser) => {
  const menu = await Menu.findById(id).populate('items');
  if (!menu) throw Object.assign(new Error('Menu not found'), { statusCode: 404 });

  const beforeData = menu.toObject();
  Object.assign(menu, updates);
  await menu.save();
  const populated = await menu.populate('items');

  await logActivity(reqUser.id, reqUser.name, 'UPDATE', menu.title, `Updated menu ${menu.title}`, beforeData, populated.toObject());
  return populated;
};

const remove = async (id, reqUser) => {
  const menu = await Menu.findById(id);
  if (!menu) throw Object.assign(new Error('Menu not found'), { statusCode: 404 });

  // Check if menu is used in any food screen section
  const screenUsingMenu = await FoodScreen.findOne({
    $or: [
      { 'sections.defaultContent.menuId': id },
      { 'sections.timeSlots.content.menuId': id },
    ],
  });
  if (screenUsingMenu) {
    throw Object.assign(
      new Error(`Cannot delete: menu is used in screen "${screenUsingMenu.title}"`),
      { statusCode: 400 }
    );
  }

  const beforeData = menu.toObject();
  await Menu.findByIdAndDelete(id);

  await logActivity(reqUser.id, reqUser.name, 'DELETE', menu.title, `Deleted menu ${menu.title}`, beforeData, null);
  return { success: true };
};

module.exports = { getAll, getById, create, update, remove };
```

- [ ] **Step 2: Create menus.controller.js**

```javascript
const menusService = require('../services/menus.service');
const User = require('../models/User');

const getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const result = await menusService.getAll(page, limit);
    res.json(result);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const menu = await menusService.getById(req.params.id);
    res.json(menu);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const reqUser = await User.findById(req.user.id);
    const menu = await menusService.create(req.body, { id: req.user.id, name: reqUser.name });
    res.status(201).json(menu);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const reqUser = await User.findById(req.user.id);
    const menu = await menusService.update(req.params.id, req.body, { id: req.user.id, name: reqUser.name });
    res.json(menu);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const reqUser = await User.findById(req.user.id);
    const result = await menusService.remove(req.params.id, { id: req.user.id, name: reqUser.name });
    res.json(result);
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, remove };
```

- [ ] **Step 3: Create menus.routes.js**

```javascript
const router = require('express').Router();
const menusController = require('../controllers/menus.controller');
const { createMenuRules, updateMenuRules } = require('../validators/menu.validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.get('/', auth, menusController.getAll);
router.get('/:id', auth, menusController.getById);
router.post('/', auth, authorize('admin', 'restaurant_user'), createMenuRules, validate, menusController.create);
router.put('/:id', auth, authorize('admin', 'restaurant_user'), updateMenuRules, validate, menusController.update);
router.delete('/:id', auth, authorize('admin', 'restaurant_user'), menusController.remove);

module.exports = router;
```

- [ ] **Step 4: Mount in app.js**

```javascript
app.use('/api/v1/menus', require('./routes/menus.routes'));
```

- [ ] **Step 5: Commit**

```bash
git add canteen-backend/src/services/menus.service.js canteen-backend/src/controllers/menus.controller.js canteen-backend/src/routes/menus.routes.js canteen-backend/src/app.js
git commit -m "feat: add menus CRUD with screen reference check on delete"
```

---

## Chunk 6: Screens (Food & Token)

### Task 18: Food screens service, controller, and routes

**Files:**
- Create: `canteen-backend/src/services/foodScreens.service.js`
- Create: `canteen-backend/src/controllers/foodScreens.controller.js`
- Create: `canteen-backend/src/routes/foodScreens.routes.js`

- [ ] **Step 1: Create foodScreens.service.js**

```javascript
const FoodScreen = require('../models/FoodScreen');
const ActivityLog = require('../models/ActivityLog');

const logActivity = async (userId, userName, action, resourceName, details, beforeData, afterData) => {
  await ActivityLog.create({
    userId, userName, action, resourceType: 'food_screen', resourceName, details, beforeData, afterData,
  });
};

const populateScreen = (query) => {
  return query
    .populate({
      path: 'sections.defaultContent.menuId',
      populate: { path: 'items' },
    })
    .populate({
      path: 'sections.timeSlots.content.menuId',
      populate: { path: 'items' },
    });
};

const getAll = async (page = 1, limit = 50) => {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    FoodScreen.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    FoodScreen.countDocuments(),
  ]);
  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

const getById = async (id) => {
  const screen = await populateScreen(FoodScreen.findById(id));
  if (!screen) throw Object.assign(new Error('Food screen not found'), { statusCode: 404 });
  return screen;
};

const create = async (screenData, reqUser) => {
  const screen = await FoodScreen.create(screenData);
  await logActivity(reqUser.id, reqUser.name, 'CREATE', screen.title, `Created food screen ${screen.title}`, null, screen.toObject());
  return screen;
};

const update = async (id, updates, reqUser) => {
  const screen = await FoodScreen.findById(id);
  if (!screen) throw Object.assign(new Error('Food screen not found'), { statusCode: 404 });

  const beforeData = screen.toObject();
  Object.assign(screen, updates);
  await screen.save();

  await logActivity(reqUser.id, reqUser.name, 'UPDATE', screen.title, `Updated food screen ${screen.title}`, beforeData, screen.toObject());
  return screen;
};

const remove = async (id, reqUser) => {
  const screen = await FoodScreen.findById(id);
  if (!screen) throw Object.assign(new Error('Food screen not found'), { statusCode: 404 });

  const beforeData = screen.toObject();
  await FoodScreen.findByIdAndDelete(id);

  await logActivity(reqUser.id, reqUser.name, 'DELETE', screen.title, `Deleted food screen ${screen.title}`, beforeData, null);
  return { success: true };
};

const duplicate = async (id, reqUser) => {
  const original = await FoodScreen.findById(id);
  if (!original) throw Object.assign(new Error('Food screen not found'), { statusCode: 404 });

  const data = original.toObject();
  delete data._id;
  delete data.createdAt;
  delete data.updatedAt;
  data.title = `${data.title} (Copy)`;
  data.screenId = `${data.screenId}-copy-${Date.now()}`;
  // Remove _id from nested subdocuments
  if (data.sections) {
    data.sections.forEach((s) => {
      delete s._id;
      if (s.timeSlots) s.timeSlots.forEach((ts) => delete ts._id);
    });
  }

  const screen = await FoodScreen.create(data);
  await logActivity(reqUser.id, reqUser.name, 'CREATE', screen.title, `Duplicated food screen from ${original.title}`, null, screen.toObject());
  return screen;
};

module.exports = { getAll, getById, create, update, remove, duplicate };
```

- [ ] **Step 2: Create foodScreens.controller.js**

```javascript
const foodScreensService = require('../services/foodScreens.service');
const User = require('../models/User');

const getReqUser = async (userId) => {
  const user = await User.findById(userId);
  return { id: userId, name: user.name };
};

const getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    res.json(await foodScreensService.getAll(page, limit));
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try { res.json(await foodScreensService.getById(req.params.id)); }
  catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const reqUser = await getReqUser(req.user.id);
    res.status(201).json(await foodScreensService.create(req.body, reqUser));
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const reqUser = await getReqUser(req.user.id);
    res.json(await foodScreensService.update(req.params.id, req.body, reqUser));
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const reqUser = await getReqUser(req.user.id);
    res.json(await foodScreensService.remove(req.params.id, reqUser));
  } catch (err) { next(err); }
};

const duplicate = async (req, res, next) => {
  try {
    const reqUser = await getReqUser(req.user.id);
    res.status(201).json(await foodScreensService.duplicate(req.params.id, reqUser));
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, remove, duplicate };
```

- [ ] **Step 3: Create foodScreens.routes.js**

```javascript
const router = require('express').Router();
const ctrl = require('../controllers/foodScreens.controller');
const { createFoodScreenRules, updateFoodScreenRules } = require('../validators/screen.validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Public: gallery display
router.get('/:id', ctrl.getById);

// Protected
router.get('/', auth, ctrl.getAll);
router.post('/', auth, authorize('admin', 'restaurant_user'), createFoodScreenRules, validate, ctrl.create);
router.put('/:id', auth, authorize('admin', 'restaurant_user'), updateFoodScreenRules, validate, ctrl.update);
router.delete('/:id', auth, authorize('admin', 'restaurant_user'), ctrl.remove);
router.post('/:id/duplicate', auth, authorize('admin', 'restaurant_user'), ctrl.duplicate);

module.exports = router;
```

**Note:** `GET /:id` is public (no auth) for gallery displays. `GET /` is protected (requires auth). Express matches `/` exactly before `/:id`, so the order is safe.

**Frontend migration note:** Token archive entries use `recordedAt` in the frontend but `updatedAt` in the backend `TokenState.archive[]`. The frontend will need to map this field when consuming the archive API.

- [ ] **Step 4: Mount in app.js**

```javascript
app.use('/api/v1/food-screens', require('./routes/foodScreens.routes'));
```

- [ ] **Step 5: Commit**

```bash
git add canteen-backend/src/services/foodScreens.service.js canteen-backend/src/controllers/foodScreens.controller.js canteen-backend/src/routes/foodScreens.routes.js canteen-backend/src/app.js
git commit -m "feat: add food screens CRUD with deep population and duplicate"
```

---

### Task 19: Token screens service, controller, and routes

**Files:**
- Create: `canteen-backend/src/services/tokenScreens.service.js`
- Create: `canteen-backend/src/controllers/tokenScreens.controller.js`
- Create: `canteen-backend/src/routes/tokenScreens.routes.js`

- [ ] **Step 1: Create tokenScreens.service.js**

```javascript
const TokenScreen = require('../models/TokenScreen');
const ActivityLog = require('../models/ActivityLog');

const logActivity = async (userId, userName, action, resourceName, details, beforeData, afterData) => {
  await ActivityLog.create({
    userId, userName, action, resourceType: 'token_screen', resourceName, details, beforeData, afterData,
  });
};

const getAll = async (page = 1, limit = 50) => {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    TokenScreen.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    TokenScreen.countDocuments(),
  ]);
  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

const getById = async (id) => {
  const screen = await TokenScreen.findById(id);
  if (!screen) throw Object.assign(new Error('Token screen not found'), { statusCode: 404 });
  return screen;
};

const create = async (screenData, reqUser) => {
  const screen = await TokenScreen.create(screenData);
  await logActivity(reqUser.id, reqUser.name, 'CREATE', screen.title, `Created token screen ${screen.title}`, null, screen.toObject());
  return screen;
};

const update = async (id, updates, reqUser) => {
  const screen = await TokenScreen.findById(id);
  if (!screen) throw Object.assign(new Error('Token screen not found'), { statusCode: 404 });

  const beforeData = screen.toObject();
  Object.assign(screen, updates);
  await screen.save();

  await logActivity(reqUser.id, reqUser.name, 'UPDATE', screen.title, `Updated token screen ${screen.title}`, beforeData, screen.toObject());
  return screen;
};

const remove = async (id, reqUser) => {
  const screen = await TokenScreen.findById(id);
  if (!screen) throw Object.assign(new Error('Token screen not found'), { statusCode: 404 });

  const beforeData = screen.toObject();
  await TokenScreen.findByIdAndDelete(id);

  await logActivity(reqUser.id, reqUser.name, 'DELETE', screen.title, `Deleted token screen ${screen.title}`, beforeData, null);
  return { success: true };
};

module.exports = { getAll, getById, create, update, remove };
```

- [ ] **Step 2: Create tokenScreens.controller.js**

```javascript
const tokenScreensService = require('../services/tokenScreens.service');
const User = require('../models/User');

const getReqUser = async (userId) => {
  const user = await User.findById(userId);
  return { id: userId, name: user.name };
};

const getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    res.json(await tokenScreensService.getAll(page, limit));
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try { res.json(await tokenScreensService.getById(req.params.id)); }
  catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const reqUser = await getReqUser(req.user.id);
    res.status(201).json(await tokenScreensService.create(req.body, reqUser));
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const reqUser = await getReqUser(req.user.id);
    res.json(await tokenScreensService.update(req.params.id, req.body, reqUser));
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const reqUser = await getReqUser(req.user.id);
    res.json(await tokenScreensService.remove(req.params.id, reqUser));
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, remove };
```

- [ ] **Step 3: Create tokenScreens.routes.js**

```javascript
const router = require('express').Router();
const ctrl = require('../controllers/tokenScreens.controller');
const { createTokenScreenRules, updateTokenScreenRules } = require('../validators/screen.validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Public
router.get('/:id', ctrl.getById);

// Protected
router.get('/', auth, ctrl.getAll);
router.post('/', auth, authorize('admin', 'restaurant_user'), createTokenScreenRules, validate, ctrl.create);
router.put('/:id', auth, authorize('admin', 'restaurant_user'), updateTokenScreenRules, validate, ctrl.update);
router.delete('/:id', auth, authorize('admin', 'restaurant_user'), ctrl.remove);

module.exports = router;
```

- [ ] **Step 4: Mount in app.js**

```javascript
app.use('/api/v1/token-screens', require('./routes/tokenScreens.routes'));
```

- [ ] **Step 5: Commit**

```bash
git add canteen-backend/src/services/tokenScreens.service.js canteen-backend/src/controllers/tokenScreens.controller.js canteen-backend/src/routes/tokenScreens.routes.js canteen-backend/src/app.js
git commit -m "feat: add token screens CRUD"
```

---

### Task 20: Unified screens lookup route

**Files:**
- Create: `canteen-backend/src/routes/screens.routes.js`

- [ ] **Step 1: Create screens.routes.js**

```javascript
const router = require('express').Router();
const FoodScreen = require('../models/FoodScreen');
const TokenScreen = require('../models/TokenScreen');

// Public: unified lookup by _id for gallery displays
router.get('/:id', async (req, res, next) => {
  try {
    // Try food screen first (with deep population)
    let screen = await FoodScreen.findById(req.params.id)
      .populate({
        path: 'sections.defaultContent.menuId',
        populate: { path: 'items' },
      })
      .populate({
        path: 'sections.timeSlots.content.menuId',
        populate: { path: 'items' },
      });

    if (!screen) {
      screen = await TokenScreen.findById(req.params.id);
    }

    if (!screen) {
      return res.status(404).json({ message: 'Screen not found' });
    }

    res.json(screen);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
```

- [ ] **Step 2: Mount in app.js**

```javascript
app.use('/api/v1/screens', require('./routes/screens.routes'));
```

- [ ] **Step 3: Commit**

```bash
git add canteen-backend/src/routes/screens.routes.js canteen-backend/src/app.js
git commit -m "feat: add unified screen lookup for gallery displays"
```

---

## Chunk 7: Tokens, Upload, Logs

### Task 21: Tokens service, controller, and routes (with Socket.IO)

**Files:**
- Create: `canteen-backend/src/services/tokens.service.js`
- Create: `canteen-backend/src/controllers/tokens.controller.js`
- Create: `canteen-backend/src/routes/tokens.routes.js`

- [ ] **Step 1: Create tokens.service.js**

```javascript
const TokenState = require('../models/TokenState');
const ActivityLog = require('../models/ActivityLog');
const socketManager = require('../utils/socketManager');

const logActivity = async (userId, userName, action, resourceName, details, beforeData, afterData) => {
  await ActivityLog.create({
    userId, userName, action, resourceType: 'token', resourceName, details, beforeData, afterData,
  });
};

const getCurrent = async () => {
  const state = await TokenState.getInstance();
  state.purgeExpiredArchive();
  await state.save();
  return { currentToken: state.currentToken, history: state.history };
};

const updateToken = async (tokenNumber, reqUser) => {
  const state = await TokenState.getInstance();

  const beforeData = { currentToken: state.currentToken };
  const now = new Date();

  // Push current to history if exists
  if (state.currentToken) {
    state.history.unshift(state.currentToken);
    state.history = state.history.slice(0, 10);
  }

  state.currentToken = { number: tokenNumber, updatedAt: now };

  // Add to archive
  state.archive.push({ number: tokenNumber, updatedAt: now });
  state.purgeExpiredArchive();

  await state.save();

  const payload = { currentToken: state.currentToken, history: state.history };
  socketManager.emitTokenUpdate(payload);

  await logActivity(reqUser.id, reqUser.name, 'UPDATE', tokenNumber, `Updated serving token to ${tokenNumber}`, beforeData, { currentToken: state.currentToken });

  return payload;
};

const clearToken = async (reqUser) => {
  const state = await TokenState.getInstance();

  const beforeData = { currentToken: state.currentToken };

  if (state.currentToken) {
    state.history.unshift(state.currentToken);
    state.history = state.history.slice(0, 10);
  }
  state.currentToken = null;

  await state.save();

  const payload = { currentToken: null, history: state.history };
  socketManager.emitTokenClear(payload);

  await logActivity(reqUser.id, reqUser.name, 'DELETE', 'token', 'Cleared serving token', beforeData, { currentToken: null });

  return payload;
};

const getArchive = async ({ search, date, page = 1, limit = 50 }) => {
  const state = await TokenState.getInstance();
  state.purgeExpiredArchive();
  await state.save();

  let entries = [...state.archive].reverse(); // most recent first

  if (search) {
    entries = entries.filter((e) => e.number.includes(search));
  }
  if (date) {
    const filterDate = new Date(date).toDateString();
    entries = entries.filter((e) => new Date(e.updatedAt).toDateString() === filterDate);
  }

  const total = entries.length;
  const skip = (page - 1) * limit;
  const data = entries.slice(skip, skip + limit);

  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

module.exports = { getCurrent, updateToken, clearToken, getArchive };
```

- [ ] **Step 2: Create tokens.controller.js**

```javascript
const tokensService = require('../services/tokens.service');
const User = require('../models/User');

const getReqUser = async (userId) => {
  const user = await User.findById(userId);
  return { id: userId, name: user.name };
};

const getCurrent = async (req, res, next) => {
  try { res.json(await tokensService.getCurrent()); }
  catch (err) { next(err); }
};

const updateToken = async (req, res, next) => {
  try {
    const reqUser = await getReqUser(req.user.id);
    const { number } = req.body;
    if (!number) return res.status(400).json({ message: 'Token number is required' });
    res.json(await tokensService.updateToken(number, reqUser));
  } catch (err) { next(err); }
};

const clearToken = async (req, res, next) => {
  try {
    const reqUser = await getReqUser(req.user.id);
    res.json(await tokensService.clearToken(reqUser));
  } catch (err) { next(err); }
};

const getArchive = async (req, res, next) => {
  try {
    const { search, date } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    res.json(await tokensService.getArchive({ search, date, page, limit }));
  } catch (err) { next(err); }
};

module.exports = { getCurrent, updateToken, clearToken, getArchive };
```

- [ ] **Step 3: Create tokens.routes.js**

```javascript
const router = require('express').Router();
const ctrl = require('../controllers/tokens.controller');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Public
router.get('/current', ctrl.getCurrent);

// Protected
router.put('/update', auth, authorize('admin', 'restaurant_user', 'token_operator'), ctrl.updateToken);
router.delete('/clear', auth, authorize('admin', 'restaurant_user', 'token_operator'), ctrl.clearToken);
router.get('/archive', auth, ctrl.getArchive);

module.exports = router;
```

- [ ] **Step 4: Mount in app.js**

```javascript
app.use('/api/v1/tokens', require('./routes/tokens.routes'));
```

- [ ] **Step 5: Commit**

```bash
git add canteen-backend/src/services/tokens.service.js canteen-backend/src/controllers/tokens.controller.js canteen-backend/src/routes/tokens.routes.js canteen-backend/src/app.js
git commit -m "feat: add token management with Socket.IO broadcast"
```

---

### Task 22: Upload routes (R2 presigned URLs)

**Files:**
- Create: `canteen-backend/src/routes/upload.routes.js`

- [ ] **Step 1: Create upload.routes.js**

```javascript
const router = require('express').Router();
const { generatePresignedUrl, deleteFile } = require('../utils/r2Utils');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { uploadLimiter } = require('../middleware/rateLimiter');

router.post(
  '/presign',
  auth,
  authorize('admin', 'restaurant_user'),
  uploadLimiter,
  async (req, res, next) => {
    try {
      const { fileName, fileType, fileSize, folder = 'items' } = req.body;
      if (!fileName || !fileType || !fileSize) {
        return res.status(400).json({ message: 'fileName, fileType, and fileSize are required' });
      }

      const validFolders = ['items', 'backgrounds', 'sections'];
      const targetFolder = validFolders.includes(folder) ? folder : 'items';

      const result = await generatePresignedUrl(targetFolder, fileName, fileType, fileSize);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/:key(*)',
  auth,
  authorize('admin', 'restaurant_user'),
  async (req, res, next) => {
    try {
      await deleteFile(req.params.key);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
```

- [ ] **Step 2: Mount in app.js**

```javascript
app.use('/api/v1/upload', require('./routes/upload.routes'));
```

- [ ] **Step 3: Commit**

```bash
git add canteen-backend/src/routes/upload.routes.js canteen-backend/src/app.js
git commit -m "feat: add R2 presigned URL upload and delete endpoints"
```

---

### Task 23: Activity logs route

**Files:**
- Create: `canteen-backend/src/routes/logs.routes.js`

- [ ] **Step 1: Create logs.routes.js**

```javascript
const router = require('express').Router();
const ActivityLog = require('../models/ActivityLog');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res, next) => {
  try {
    const { userId, resourceType, action, startDate, endDate } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const filter = {};

    // Non-admins can only see their own logs
    if (req.user.role !== 'admin') {
      filter.userId = req.user.id;
    } else if (userId) {
      filter.userId = userId;
    }

    if (resourceType) filter.resourceType = resourceType;
    if (action) filter.action = action;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      ActivityLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ActivityLog.countDocuments(filter),
    ]);

    res.json({
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
```

- [ ] **Step 2: Mount in app.js**

```javascript
app.use('/api/v1/logs', require('./routes/logs.routes'));
```

- [ ] **Step 3: Commit**

```bash
git add canteen-backend/src/routes/logs.routes.js canteen-backend/src/app.js
git commit -m "feat: add activity logs endpoint with filtering and pagination"
```

---

## Chunk 8: Seed Script & Deployment Config

### Task 24: Database seed script

**Files:**
- Create: `canteen-backend/seed.js`

- [ ] **Step 1: Create seed.js**

```javascript
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./src/config/db');
const User = require('./src/models/User');
const Item = require('./src/models/Item');
const Menu = require('./src/models/Menu');
const FoodScreen = require('./src/models/FoodScreen');
const TokenScreen = require('./src/models/TokenScreen');
const TokenState = require('./src/models/TokenState');

const seed = async () => {
  await connectDB();
  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Item.deleteMany({}),
    Menu.deleteMany({}),
    FoodScreen.deleteMany({}),
    TokenScreen.deleteMany({}),
    TokenState.deleteMany({}),
  ]);

  // Users (password hashing handled by pre-save hook)
  console.log('Seeding users...');
  const users = await User.create([
    { name: 'Admin User', email: 'admin@canteen.com', username: 'admin', password: 'admin123', role: 'admin' },
    { name: 'Restaurant Manager', email: 'manager@canteen.com', username: 'manager', password: 'manager123', role: 'restaurant_user' },
    { name: 'Token Operator', email: 'operator@canteen.com', username: 'operator', password: 'operator123', role: 'token_operator' },
  ]);
  console.log(`  Created ${users.length} users`);

  // Items (use placeholder image URLs — replace with R2 URLs after uploading)
  console.log('Seeding items...');
  const itemsData = [
    { name: 'Chicken Biryani', description: 'Fragrant rice with chicken', price: 180, category: 'rice', ingredients: 'Rice, Chicken, Spices', image: 'placeholder', isActive: true },
    { name: 'Kacchi Biryani', description: 'Special kacchi-style biryani', price: 250, category: 'rice', ingredients: 'Rice, Mutton, Spices, Potato', image: 'placeholder', isActive: true },
    { name: 'Bhuna Khichuri', description: 'Roasted khichuri', price: 100, category: 'rice', ingredients: 'Rice, Lentils, Spices', image: 'placeholder', isActive: true },
    { name: 'Chicken Curry with Rice', description: 'Classic chicken curry', price: 120, category: 'rice', ingredients: 'Rice, Chicken, Curry', image: 'placeholder', isActive: true },
    { name: 'Beef Curry with Rice', description: 'Rich beef curry', price: 140, category: 'rice', ingredients: 'Rice, Beef, Spices', image: 'placeholder', isActive: true },
    { name: 'Chinese Noodles', description: 'Stir-fried noodles', price: 90, category: 'snacks', ingredients: 'Noodles, Vegetables', image: 'placeholder', isActive: true },
    { name: 'Chicken Fried Rice', description: 'Fried rice with chicken', price: 95, category: 'rice', ingredients: 'Rice, Chicken, Egg', image: 'placeholder', isActive: true },
    { name: 'Pasta', description: 'Creamy pasta', price: 110, category: 'snacks', ingredients: 'Pasta, Cream, Cheese', image: 'placeholder', isActive: true },
    { name: 'Fried Chicken', description: 'Crispy fried chicken', price: 130, category: 'snacks', ingredients: 'Chicken, Flour, Spices', image: 'placeholder', isActive: true },
    { name: 'Singara', description: 'Savory pastry', price: 15, category: 'snacks', ingredients: 'Flour, Potato, Peas', image: 'placeholder', isActive: true },
    { name: 'Samucha', description: 'Crispy samosa', price: 15, category: 'snacks', ingredients: 'Flour, Meat, Spices', image: 'placeholder', isActive: true },
    { name: 'Cha/Tea', description: 'Hot tea', price: 12, category: 'beverages', ingredients: 'Tea Leaves, Milk, Sugar', image: 'placeholder', isActive: true },
    { name: 'Coffee', description: 'Fresh coffee', price: 60, category: 'beverages', ingredients: 'Coffee Beans, Milk', image: 'placeholder', isActive: true },
    { name: 'Borhani', description: 'Traditional yogurt drink', price: 30, category: 'beverages', ingredients: 'Yogurt, Spices, Mint', image: 'placeholder', isActive: true },
    { name: 'Pizza', description: 'Cheesy pizza', price: 120, category: 'snacks', ingredients: 'Dough, Cheese, Toppings', image: 'placeholder', isActive: true },
    { name: 'Firni', description: 'Rice pudding dessert', price: 50, category: 'desserts', ingredients: 'Rice, Milk, Sugar, Cardamom', image: 'placeholder', isActive: true },
  ];
  const items = await Item.create(itemsData);
  console.log(`  Created ${items.length} items`);

  // Menus
  console.log('Seeding menus...');
  const menus = await Menu.create([
    { title: 'Breakfast Menu', description: 'Morning items', items: items.slice(9, 13).map((i) => i._id) },
    { title: 'Lunch Menu', description: 'Lunch specials', items: items.slice(0, 4).map((i) => i._id) },
    { title: 'Dinner Menu', description: 'Evening items', items: items.slice(4, 8).map((i) => i._id) },
    { title: 'All Items', description: 'Complete menu', items: items.map((i) => i._id) },
  ]);
  console.log(`  Created ${menus.length} menus`);

  // Food screens
  console.log('Seeding screens...');
  const foodScreens = await FoodScreen.create([
    {
      title: 'Main Dining Hall Display', screenId: 'main-hall', layoutTheme: 'layout-4',
      backgroundType: 'color', backgroundColor: '#1a1a2e', gap: 8,
      sections: [
        { label: 'Main', defaultContent: { type: 'menu', menuId: menus[3]._id, visualStyle: 'card-grid' }, timeSlots: [
          { startTime: '07:00', endTime: '10:00', daysOfWeek: ['monday','tuesday','wednesday','thursday','friday'], content: { type: 'menu', menuId: menus[0]._id, visualStyle: 'card-grid' } },
          { startTime: '12:00', endTime: '15:00', daysOfWeek: ['monday','tuesday','wednesday','thursday','friday'], content: { type: 'menu', menuId: menus[1]._id, visualStyle: 'card-grid' } },
          { startTime: '18:00', endTime: '21:00', daysOfWeek: ['monday','tuesday','wednesday','thursday','friday'], content: { type: 'menu', menuId: menus[2]._id, visualStyle: 'card-grid' } },
        ]},
      ],
    },
    {
      title: 'Cafeteria Display', screenId: 'cafeteria', layoutTheme: 'layout-1',
      backgroundType: 'color', backgroundColor: '#0f3460', gap: 8,
      sections: [
        { label: 'Full', defaultContent: { type: 'menu', menuId: menus[3]._id, visualStyle: 'menu-board' }, timeSlots: [] },
      ],
    },
  ]);
  console.log(`  Created ${foodScreens.length} food screens`);

  const tokenScreens = await TokenScreen.create([
    { title: 'Main Counter Token Display', screenId: 'counter-token', backgroundType: 'color', backgroundColor: '#1a1a2e', titleFont: 'font-heading', titleColor: '#ffffff' },
  ]);
  console.log(`  Created ${tokenScreens.length} token screens`);

  // Token state
  await TokenState.create({ currentToken: null, history: [], archive: [] });
  console.log('  Created token state');

  // Sample activity logs
  const ActivityLog = require('./src/models/ActivityLog');
  await ActivityLog.create([
    { userId: users[0]._id, userName: users[0].name, action: 'CREATE', resourceType: 'system', resourceName: 'System', details: 'System initialized with seed data', beforeData: null, afterData: null },
  ]);
  console.log('  Created sample activity logs');

  console.log('\nSeed complete!');
  console.log('Login credentials:');
  console.log('  admin / admin123');
  console.log('  manager / manager123');
  console.log('  operator / operator123');

  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
```

- [ ] **Step 2: Run seed (requires valid MONGODB_URI in .env)**

```bash
cd canteen-backend && node seed.js
```
Expected: "Seed complete!" with user/item/menu counts

- [ ] **Step 3: Commit**

```bash
git add canteen-backend/seed.js
git commit -m "feat: add database seed script with demo data"
```

---

### Task 25: Final app.js with all routes mounted

**Files:**
- Modify: `canteen-backend/src/app.js`

- [ ] **Step 1: Verify app.js has all route mounts**

Ensure the route section of `app.js` (before `app.use(errorHandler)`) contains:
```javascript
// Routes
app.use('/api/v1/auth', require('./routes/auth.routes'));
app.use('/api/v1/users', require('./routes/users.routes'));
app.use('/api/v1/items', require('./routes/items.routes'));
app.use('/api/v1/menus', require('./routes/menus.routes'));
app.use('/api/v1/food-screens', require('./routes/foodScreens.routes'));
app.use('/api/v1/token-screens', require('./routes/tokenScreens.routes'));
app.use('/api/v1/screens', require('./routes/screens.routes'));
app.use('/api/v1/tokens', require('./routes/tokens.routes'));
app.use('/api/v1/upload', require('./routes/upload.routes'));
app.use('/api/v1/logs', require('./routes/logs.routes'));
```

- [ ] **Step 2: Start server and test health endpoint**

```bash
cd canteen-backend && node server.js
# In another terminal:
curl http://localhost:5000/api/v1/health
```
Expected: `{"status":"ok","uptime":...,"dbStatus":"connected"}`

- [ ] **Step 3: Commit final app.js**

```bash
git add canteen-backend/src/app.js
git commit -m "feat: mount all routes in app.js — backend API complete"
```

---

## Task Dependencies

```
Task 1 (scaffold) → Task 2 (config) → Task 3 (middleware) → Task 4 (utils) → Task 5 (app/server)
                                                                                       ↓
Tasks 6-12 (models) — can run in parallel after Task 5
                                                                                       ↓
Task 13 (validators) — after models
                                                                                       ↓
Tasks 14-23 (services/controllers/routes) — after models + validators + middleware
                                                                                       ↓
Task 24 (seed) — after all models
Task 25 (final verification) — after all routes
```

Tasks 6-12 (all models) are independent of each other and can be implemented in parallel.
Tasks 14-23 (all CRUD modules) depend on their respective models but are independent of each other.
