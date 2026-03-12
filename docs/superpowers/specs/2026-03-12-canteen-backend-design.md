# Canteen Management System — Backend Design Spec

**Date:** 2026-03-12
**Status:** Approved (brainstorming complete, spec review passed)

---

## Decisions Summary

| Decision | Choice |
|----------|--------|
| Deployment | Frontend on Vercel, backend on AWS EC2 (separate) |
| Auth strategy | JWT access token only (stored client-side) |
| Real-time | Socket.IO for token screens only |
| Food screen updates | 60-second REST polling (no WebSocket) |
| Media uploads | Presigned URLs — direct browser-to-R2 upload |
| Activity logging | Mirror current behavior (CRUD actions with before/after data) |
| API versioning | `/api/v1/` prefix |
| Architecture | Flat Express (routes → controllers → services → models) |

---

## 1. Project Structure & Tech Stack

```
canteen-backend/
├── src/
│   ├── config/
│   │   ├── db.js              # MongoDB Atlas connection
│   │   ├── r2.js              # Cloudflare R2 (S3-compatible) client
│   │   ├── socket.js          # Socket.IO setup
│   │   └── env.js             # Environment variable loader
│   ├── models/
│   │   ├── User.js
│   │   ├── Item.js
│   │   ├── Menu.js
│   │   ├── FoodScreen.js
│   │   ├── TokenScreen.js
│   │   ├── ActivityLog.js
│   │   └── TokenState.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── items.routes.js
│   │   ├── menus.routes.js
│   │   ├── foodScreens.routes.js
│   │   ├── tokenScreens.routes.js
│   │   ├── tokens.routes.js
│   │   ├── users.routes.js
│   │   ├── logs.routes.js
│   │   └── upload.routes.js
│   ├── controllers/           # One per route file
│   ├── services/              # One per route file
│   ├── middleware/
│   │   ├── auth.js            # JWT verification
│   │   ├── authorize.js       # Role-based access
│   │   ├── validate.js        # Request validation runner
│   │   ├── errorHandler.js    # Global error handler
│   │   └── rateLimiter.js     # Basic rate limiting
│   ├── validators/
│   │   ├── item.validator.js
│   │   ├── menu.validator.js
│   │   ├── screen.validator.js
│   │   ├── user.validator.js
│   │   └── auth.validator.js
│   ├── utils/
│   │   ├── timeUtils.js       # Port from frontend
│   │   ├── r2Utils.js         # Presigned URL generation
│   │   ├── socketManager.js   # Socket.IO event emitter
│   │   └── logger.js          # Console/file logging
│   └── app.js                 # Express app setup
├── server.js                  # Entry point (HTTP + Socket.IO)
├── seed.js                    # Database seeder (from mockData.js)
├── .env.example
├── package.json
└── ecosystem.config.js        # PM2 config for EC2
```

### Dependencies

**Production:**
- `express`, `mongoose`, `socket.io`, `jsonwebtoken`, `bcryptjs`
- `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`
- `cors`, `helmet`, `express-rate-limit`, `morgan`
- `dotenv`, `express-validator`

**Dev:**
- `nodemon`

---

## 2. MongoDB Data Models

### User
```javascript
{
  name: String,            // required, min 2
  email: String,           // required, unique, lowercase
  username: String,        // required, unique, min 3, alphanumeric + underscore
  password: String,        // required, min 6, bcrypt hashed, select: false
  role: String,            // enum: ['admin', 'restaurant_user', 'token_operator']
  createdAt, updatedAt     // Mongoose timestamps
}
```
- Password hashed via `pre('save')` hook with bcrypt
- Password excluded from queries by default (`select: false`)

### Item
```javascript
{
  name: String,            // required, min 2
  description: String,     // required
  price: Number,           // required, min 0, max 10000
  category: String,        // optional (e.g., 'rice', 'snacks', 'beverages')
  ingredients: String,     // comma-separated
  image: String,           // R2 URL
  isActive: Boolean,       // default: true
  createdAt, updatedAt
}
```

### Menu
```javascript
{
  title: String,           // required
  description: String,     // required
  items: [ObjectId],       // ref: 'Item', min 1
  createdAt, updatedAt
}
```
- Uses Mongoose refs with `.populate()` (replaces frontend `itemIds`)

### FoodScreen
```javascript
{
  title: String,
  screenId: String,        // unique, display identifier
  type: { default: 'food' },
  layoutTheme: String,
  backgroundType: String,  // 'color' | 'image' | 'video'
  backgroundMedia: String, // R2 URL
  backgroundColor: String, // hex
  sections: [{
    label: String,
    defaultContent: {
      type: String,        // 'menu' | 'media'
      menuId: ObjectId,    // ref: 'Menu'
      visualStyle: String,
      titleFont: String,
      titleColor: String,
      media: [String],     // R2 URLs
      slideDuration: Number,
      transition: String
    },
    timeSlots: [{
      startTime: String,   // 'HH:MM'
      endTime: String,
      daysOfWeek: [String],
      content: {           // same shape as defaultContent
        type: String,
        menuId: ObjectId,
        visualStyle: String,
        titleFont: String,
        titleColor: String,
        media: [String],
        slideDuration: Number,
        transition: String
      }
    }]
  }],
  createdAt, updatedAt
}
```

### TokenScreen
```javascript
{
  title: String,
  screenId: String,        // unique
  type: { default: 'token' },
  titleFont: String,
  titleColor: String,
  backgroundType: String,  // 'color' | 'image' | 'video'
  backgroundMedia: String, // R2 URL
  backgroundColor: String,
  createdAt, updatedAt
}
```

### TokenState (single document pattern)
```javascript
{
  currentToken: {
    number: String,
    updatedAt: Date
  },
  history: [{             // last 10, most recent first
    number: String,
    updatedAt: Date
  }],
  archive: [{             // 3-day rolling, auto-purged
    number: String,
    updatedAt: Date
  }]
}
```
- Only one TokenState document exists in the collection
- Archive entries older than 72 hours purged on read/write

### ActivityLog
```javascript
{
  userId: ObjectId,        // ref: 'User'
  userName: String,        // denormalized
  action: String,          // enum: ['CREATE', 'UPDATE', 'DELETE', 'RESET']
  resourceType: String,    // enum: ['item', 'menu', 'food_screen', 'token_screen', 'user', 'token', 'system']
  resourceName: String,
  details: String,
  beforeData: Mixed,
  afterData: Mixed,
  createdAt               // Mongoose timestamp
}
```
- Indexed on: `userId`, `resourceType`, `action`, `createdAt`

---

## 3. API Endpoints

### Health Check
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/health` | Public | Returns `{ status: 'ok', uptime, dbStatus }` |

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/v1/auth/login` | Public | Login, returns JWT + user object |
| GET | `/api/v1/auth/me` | Authenticated | Get current user from JWT |

**Note:** No server-side logout endpoint. With JWT-only auth (no token blacklist), logout is handled client-side by discarding the token.

### Items
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/items` | Authenticated | List all items (`?search=`, `?isActive=`) |
| GET | `/api/v1/items/:id` | Authenticated | Get single item |
| POST | `/api/v1/items` | Admin, Manager | Create item |
| PUT | `/api/v1/items/:id` | Admin, Manager | Update item |
| DELETE | `/api/v1/items/:id` | Admin, Manager | Delete (fails if used in menus) |

### Menus
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/menus` | Authenticated | List all menus |
| GET | `/api/v1/menus/:id` | Authenticated | Get menu with populated items |
| POST | `/api/v1/menus` | Admin, Manager | Create menu |
| PUT | `/api/v1/menus/:id` | Admin, Manager | Update menu |
| DELETE | `/api/v1/menus/:id` | Admin, Manager | Delete (fails if used in screens) |

### Food Screens
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/food-screens` | Authenticated | List all food screens |
| GET | `/api/v1/food-screens/:id` | Public | Get single (gallery needs no auth) |
| POST | `/api/v1/food-screens` | Admin, Manager | Create food screen |
| PUT | `/api/v1/food-screens/:id` | Admin, Manager | Update food screen |
| DELETE | `/api/v1/food-screens/:id` | Admin, Manager | Delete food screen |
| POST | `/api/v1/food-screens/:id/duplicate` | Admin, Manager | Duplicate a food screen |

### Token Screens
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/token-screens` | Authenticated | List all token screens |
| GET | `/api/v1/token-screens/:id` | Public | Get single (gallery display) |
| POST | `/api/v1/token-screens` | Admin, Manager | Create token screen |
| PUT | `/api/v1/token-screens/:id` | Admin, Manager | Update token screen |
| DELETE | `/api/v1/token-screens/:id` | Admin, Manager | Delete token screen |

### Screens (unified lookup for gallery)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/screens/:id` | Public | Find by MongoDB `_id` across both collections. Returns deeply populated response: screen → sections → menuId populated with menu → menu.items populated with full item objects. This is the primary endpoint for gallery displays — a single call returns all data needed to render the screen. |

**Gallery URL identifier:** The frontend gallery route `/gallery/:screenId` uses the MongoDB `_id` (auto-generated) as the URL parameter, NOT the user-set `screenId` field. The `screenId` field on screen models is a human-readable label (e.g., "Main Hall Display") for admin UI only. All gallery lookups use `_id`.

### Tokens
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/tokens/current` | Public | Current token + history |
| PUT | `/api/v1/tokens/update` | Admin, Manager, Operator | Update token → Socket.IO emit |
| DELETE | `/api/v1/tokens/clear` | Admin, Manager, Operator | Clear token → Socket.IO emit |
| GET | `/api/v1/tokens/archive` | Authenticated | 3-day archive (`?search=`, `?date=`) |

### Users
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/users` | Admin | List all users |
| GET | `/api/v1/users/:id` | Admin | Get single user |
| POST | `/api/v1/users` | Admin | Create user (unique check) |
| PUT | `/api/v1/users/:id` | Admin | Update user (blank password = keep) |
| DELETE | `/api/v1/users/:id` | Admin | Delete (fails if last admin) |

### Activity Logs
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/logs` | Authenticated | List logs (admin: all, others: own). `?userId=`, `?resourceType=`, `?action=`, `?startDate=`, `?endDate=`, `?page=1`, `?limit=50` |

### Pagination

All list endpoints support `?page=` and `?limit=` query parameters:
- Default: `page=1`, `limit=50`
- Response includes: `{ data: [...], pagination: { page, limit, total, totalPages } }`
- Applies to: items, menus, food-screens, token-screens, users, logs
- Logs endpoint defaults to `limit=50` and sorts by `createdAt` descending

### Upload (R2 Presigned URLs)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/v1/upload/presign` | Admin, Manager | Generate presigned PUT URL. Body: `{ fileName, fileType, fileSize }`. Returns `{ uploadUrl, fileUrl }` |
| DELETE | `/api/v1/upload/:key` | Admin, Manager | Delete file from R2 |

---

## 4. Socket.IO Token System

**Namespace:** `/tokens`

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `token-updated` | Server → All | `{ currentToken, history }` | Broadcast on token update |
| `token-cleared` | Server → All | `{ currentToken: null, history }` | Broadcast on token clear |

### Flow
1. Gallery token screen connects to `/tokens` namespace on mount
2. Token operator updates/clears token via REST API (with auth)
3. Controller saves to MongoDB, then calls `socketManager.emitTokenUpdate(data)`
4. All connected token screen clients receive the event instantly
5. Voice announcement triggered client-side on receiving `token-updated`

**Note:** Since there is a single global token state (one `TokenState` document), all token screen displays show the same token. Broadcasting goes to all clients on the `/tokens` namespace — no room filtering needed.

### socketManager utility
```javascript
let io;
const init = (socketIo) => { io = socketIo; };
const emitTokenUpdate = (data) => {
  io.of('/tokens').emit('token-updated', data);
};
const emitTokenClear = (data) => {
  io.of('/tokens').emit('token-cleared', data);
};
```

- No auth on socket namespace — gallery screens are public (read-only)
- Mutations stay REST-only (with JWT auth)
- Socket.IO client handles reconnection automatically
- CORS configured on Socket.IO server: `cors: { origin: process.env.FRONTEND_URL, credentials: true }`

---

## 5. R2 Presigned Upload Flow

### Sequence
1. Frontend calls `POST /api/v1/upload/presign` with `{ fileName, fileType, fileSize }`
2. Backend validates type/size, generates unique key: `{folder}/{timestamp}-{random}.{ext}`
3. Backend creates presigned PUT URL (10-minute expiry) via `@aws-sdk/s3-request-presigner`
4. Returns `{ uploadUrl, fileUrl }` to frontend
5. Frontend PUTs file bytes directly to `uploadUrl` (browser → R2, bypasses backend)
6. Frontend saves `fileUrl` in entity creation/update payload

### R2 Bucket Structure
```
canteen-media/
├── items/           # Food item images
├── backgrounds/     # Screen background videos/images
└── sections/        # Section media (slideshows)
```

### Constraints
- **Allowed types:** `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `video/mp4`, `video/webm`
- **Max file size:** 50MB
- **Presigned URL expiry:** 10 minutes
- **Public read:** R2 bucket with public read access via `R2_PUBLIC_URL`
- **Cleanup:** Service layer deletes R2 files when parent entities are deleted

### Frontend Change Required
Replace all `fileToBase64()` calls:
1. Call presign endpoint → get `uploadUrl` + `fileUrl`
2. PUT file directly to `uploadUrl`
3. Store `fileUrl` (URL string) instead of base64 string

---

## 6. Middleware & Cross-Cutting Concerns

### Authentication (`auth.js`)
- Extracts JWT from `Authorization: Bearer <token>` header
- Verifies with `jsonwebtoken`, attaches `req.user` (id, role)
- Returns 401 if missing/invalid/expired

### Authorization (`authorize.js`)
- Factory: `authorize('admin', 'restaurant_user')` returns middleware
- Checks `req.user.role` against allowed roles
- Returns 403 if unauthorized

### Validation (`validate.js`)
- `express-validator` chains per endpoint (e.g., `createItemRules`, `updateItemRules`)
- `validate` middleware collects errors, returns 400 with field-keyed error object

### Error Handler (`errorHandler.js`)
- Mongoose validation errors → 400 with field errors
- Mongoose cast errors (bad ObjectId) → 400
- Duplicate key (11000) → 409 with field name
- JWT errors → 401
- Everything else → 500 (no stack trace in production)

### Rate Limiter (`rateLimiter.js`)
- Auth endpoints: 10 attempts / 15 min / IP
- General API: 100 requests / min / IP
- Upload presign: 20 requests / min / IP

### CORS
- Allows Vercel frontend origin (`FRONTEND_URL` env var)
- Credentials enabled

### Activity Logging
- Called within service functions after successful mutations
- Mirrors current `addActivityLog()` pattern from DataContext

---

## 7. Environment & Deployment

### Environment Variables
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/canteen
JWT_SECRET=<random-256-bit-string>
JWT_EXPIRES_IN=7d
R2_ACCOUNT_ID=<cloudflare-account-id>
R2_ACCESS_KEY_ID=<r2-access-key>
R2_SECRET_ACCESS_KEY=<r2-secret-key>
R2_BUCKET_NAME=canteen-media
R2_PUBLIC_URL=https://media.yourdomain.com
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### EC2 Setup
- **Instance:** t3.small (2 vCPU, 2GB RAM)
- **OS:** Ubuntu 24.04 LTS
- **Node.js:** v20 LTS via nvm
- **Process manager:** PM2 (single instance — Socket.IO state)
- **Reverse proxy:** Nginx with WebSocket upgrade headers
- **SSL:** Let's Encrypt via Certbot
- **Firewall:** Security group: 80, 443, 22

### PM2 Config
```javascript
module.exports = {
  apps: [{
    name: 'canteen-api',
    script: 'server.js',
    instances: 1,
    env_production: { NODE_ENV: 'production' }
  }]
};
```

### Nginx Config (key parts)
```nginx
server {
    listen 443 ssl;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Database Seeding
- `seed.js` populates MongoDB with data from `mockData.js`
- 3 users (bcrypt-hashed passwords), 16 items (images uploaded to R2), 4 menus, 2 food screens, 1 token screen, sample logs
- Run once: `node seed.js`

---

## 8. Business Rules (Carried from Frontend)

These rules must be enforced server-side:

1. **Item deletion blocked** if item is referenced by any menu
2. **Menu deletion blocked** if menu is referenced by any screen section
3. **User deletion blocked** if user is the last admin
4. **Username and email uniqueness** enforced at DB level (unique index) and validated in service
5. **Blank password on user update** means keep existing password
6. **Token archive auto-purge** entries older than 72 hours on read/write
7. **Token history** capped at 10 entries (most recent first)
8. **Activity logs** record every CRUD mutation with before/after snapshots
9. **Gallery endpoints are public** — no auth for `GET /food-screens/:id`, `GET /token-screens/:id`, `GET /screens/:screenId`, `GET /tokens/current`
10. **Role access:** Admin = full access, Manager (restaurant_user) = items/menus/screens/tokens, Operator (token_operator) = tokens only

---

## 9. Deprecated / Dropped Features

### Schedules Entity — DROPPED
The frontend has a `schedules` entity (hidden in demo UI) with its own CRUD in DataContext. The backend **does not include a schedules collection**. Time slots are now embedded directly within `FoodScreen.sections[].timeSlots[]`. The old `deleteMenu` check against schedules is replaced by checking `FoodScreen` sections for menu references.

### Frontend Migration Notes
- `deleteMenu` service must scan `FoodScreen.sections[].defaultContent.menuId` AND `FoodScreen.sections[].timeSlots[].content.menuId` to check for menu references (the frontend currently checks the deprecated `schedules` array — this is a frontend bug to fix during migration)
- `displaySettings` fields (`showPrices`, `foregroundMediaDisplay`) are screen-level settings that exist in the frontend. If still in active use, they should be added to the FoodScreen model. Currently omitted as they appear to be superseded by section-level content settings.
