# Canteen Management System — Full-Stack Architecture Design

**Date:** 2026-02-20
**Status:** Approved
**Stack:** MERN (MongoDB, Express.js, React, Node.js)
**Scope:** Production backend + frontend refactor plan for the existing demo

---

## 1. Overview

The Canteen Management System is a digital menu display platform for restaurants and cafeterias. Managers create food items, organize them into menus, configure display screens with time-based schedules, and the system automatically shows the correct menu on each physical display screen throughout the day.

The current frontend demo runs entirely on localStorage. This design introduces the MongoDB backend, Express.js REST API, real-time WebSocket layer, and cloud media storage to make it production-ready.

### Design Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Tenancy | Single-tenant | One deployment per organization |
| Architecture | Monolithic Express API | Right-sized for 1-2 dev team, single-tenant |
| Database | MongoDB Atlas | Managed, flexible schema, MERN alignment |
| Media storage | AWS S3 + CloudFront | Scalable, CDN delivery, no DB bloat |
| Real-time | **Option A:** Socket.IO (WebSocket) **or Option B:** Short Polling | See Section 6 for both approaches side by side |
| Auth | JWT (access token) | Stateless, simple, fits the use case |
| Scheduling | Per-screen time slots | No separate Schedule entity; simpler model |
| User management | In-app CRUD by admin | Admin creates/manages all accounts |
| Backend deployment | AWS EC2/ECS (Docker) | Production-grade, full control |
| Frontend deployment | Vercel (existing) | Already deployed, no change needed |

---

## 2. Data Model

### 2.1 Users

```js
{
  _id: ObjectId,
  name: String,              // required
  email: String,             // required, unique, indexed
  username: String,          // required, unique, indexed
  passwordHash: String,      // bcrypt hashed
  role: String,              // enum: "admin" | "restaurant_user" | "token_operator"
  isActive: Boolean,         // default: true, soft-disable
  createdAt: Date,
  updatedAt: Date
}
```

### 2.2 Items

```js
{
  _id: ObjectId,
  name: String,              // required
  description: String,
  price: Number,             // required, min: 0
  ingredients: String,
  imageUrl: String,          // S3/CloudFront URL
  isActive: Boolean,         // default: true
  createdAt: Date,
  updatedAt: Date
}
```

### 2.3 Menus

```js
{
  _id: ObjectId,
  title: String,             // required
  description: String,
  items: [ObjectId],         // ref: Item
  createdAt: Date,
  updatedAt: Date
}
```

### 2.4 Screens

Absorbs the Schedule entity from the demo. Each screen owns its time slots directly.

```js
{
  _id: ObjectId,
  title: String,             // required, display name
  screenId: String,          // required, unique, URL slug (e.g., "main-hall")
  defaultMenu: ObjectId,     // ref: Menu, fallback when no slot matches
  timeSlots: [{
    startTime: String,       // "HH:mm" format (e.g., "07:00")
    endTime: String,         // "HH:mm" format (e.g., "11:00")
    menu: ObjectId,          // ref: Menu
    daysOfWeek: [String]     // ["monday", "tuesday", ...], empty = all days
  }],
  backgroundType: String,    // "image" | "video"
  backgroundUrl: String,     // S3/CloudFront URL
  foregroundUrl: String,     // optional overlay media URL
  displaySettings: {
    layoutStyle: String,     // "grid" | "list"
    showPrices: Boolean,     // default: true
    showIngredients: Boolean,// default: true
    transitionDuration: Number // ms, default: 500
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 2.5 ActivityLogs

```js
{
  _id: ObjectId,
  user: ObjectId,            // ref: User
  userName: String,          // denormalized for read performance
  action: String,            // "CREATE" | "UPDATE" | "DELETE"
  resourceType: String,      // "item" | "menu" | "screen" | "user" | "token"
  resourceName: String,
  details: String,
  beforeData: Mixed,         // snapshot before mutation
  afterData: Mixed,          // snapshot after mutation
  createdAt: Date            // indexed for queries and optional TTL
}
```

### 2.6 TokenState (singleton document)

```js
{
  _id: ObjectId,
  currentToken: Number,
  history: [{
    number: Number,
    updatedAt: Date
  }],                        // max 3 entries
  updatedAt: Date
}
```

### Entity Relationships

```
Items ←(many-to-many via array)→ Menus ←(referenced by)→ Screens.timeSlots
                                       ←(referenced by)→ Screens.defaultMenu
Users ←(referenced by)→ ActivityLogs
```

**Referential integrity rules (enforced in service layer):**
- Cannot delete an Item that is referenced by any Menu
- Cannot delete a Menu that is referenced by any Screen (default or time slot)
- Cannot delete a User that is the only admin

---

## 3. API Design

Base URL: `/api`

### 3.1 Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | Public | Returns JWT + user object |
| POST | `/auth/logout` | Required | Optional token blacklist |
| GET | `/auth/me` | Required | Current user profile |
| PUT | `/auth/change-password` | Required | Change own password |

### 3.2 Users (Admin only)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users` | Admin | List all users |
| POST | `/users` | Admin | Create user account |
| GET | `/users/:id` | Admin | Get user details |
| PUT | `/users/:id` | Admin | Update user |
| DELETE | `/users/:id` | Admin | Deactivate user (soft delete) |

### 3.3 Items

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/items` | Required | List items (`?isActive=true&page=1&limit=20`) |
| POST | `/items` | Admin, Restaurant | Create item |
| GET | `/items/:id` | Required | Get single item |
| PUT | `/items/:id` | Admin, Restaurant | Update item |
| DELETE | `/items/:id` | Admin | Delete (blocked if in menus) |

### 3.4 Menus

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/menus` | Required | List menus |
| POST | `/menus` | Admin, Restaurant | Create menu |
| GET | `/menus/:id` | Required | Get menu (populates items) |
| PUT | `/menus/:id` | Admin, Restaurant | Update menu |
| DELETE | `/menus/:id` | Admin | Delete (blocked if in screens) |

### 3.5 Screens

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/screens` | Required | List screens |
| POST | `/screens` | Admin | Create screen |
| GET | `/screens/:id` | Required | Get screen details |
| PUT | `/screens/:id` | Admin, Restaurant | Update screen |
| DELETE | `/screens/:id` | Admin | Delete screen |

### 3.6 Public Display

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/display/:screenId` | **Public** | Resolves current menu for screen based on time |

This is the endpoint gallery/display screens call. Returns the screen config, resolved current menu, and populated items for immediate rendering.

### 3.7 Token

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/token` | Required | Current token + history |
| PUT | `/token` | Token Operator, Admin | Update serving token number |
| DELETE | `/token` | Admin | Clear token history |

### 3.8 Media Upload

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/upload` | Required | Upload file, returns URL |
| DELETE | `/upload/:key` | Admin | Delete media from S3 |

### 3.9 Activity Logs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/logs` | Admin | Query logs (`?userId=&resourceType=&action=&startDate=&endDate=&page=&limit=`) |

### Response Format

All API responses follow a standard envelope:

```json
{
  "success": true,
  "data": { ... },
  "message": "Item created successfully",
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

Error responses:

```json
{
  "success": false,
  "error": "Cannot delete item. Used in 2 menu(s): Breakfast Menu, Lunch Menu",
  "statusCode": 400
}
```

---

## 4. Backend Project Structure

```
server/
├── src/
│   ├── config/
│   │   ├── db.js                 # Mongoose connection to MongoDB Atlas
│   │   ├── cloudStorage.js       # AWS S3 client setup
│   │   └── env.js                # Environment variable validation + defaults
│   │
│   ├── middleware/
│   │   ├── auth.js               # JWT verification, attaches req.user
│   │   ├── authorize.js          # Role check: authorize('admin', 'restaurant_user')
│   │   ├── validate.js           # Request body validation (Joi or Zod schemas)
│   │   ├── upload.js             # Multer config (memory storage for S3 passthrough)
│   │   ├── activityLogger.js     # Wraps route handlers to auto-log mutations
│   │   └── errorHandler.js       # Global error handler (catches + formats errors)
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Item.js
│   │   ├── Menu.js
│   │   ├── Screen.js
│   │   ├── ActivityLog.js
│   │   └── TokenState.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── item.routes.js
│   │   ├── menu.routes.js
│   │   ├── screen.routes.js
│   │   ├── display.routes.js     # Public display endpoint
│   │   ├── token.routes.js
│   │   ├── upload.routes.js
│   │   └── log.routes.js
│   │
│   ├── services/
│   │   ├── auth.service.js       # Login, JWT sign/verify, bcrypt
│   │   ├── user.service.js       # User CRUD
│   │   ├── item.service.js       # Item CRUD + ref integrity checks
│   │   ├── menu.service.js       # Menu CRUD + ref integrity checks
│   │   ├── screen.service.js     # Screen CRUD
│   │   ├── display.service.js    # Time-based menu resolution (core business logic)
│   │   ├── token.service.js      # Token CRUD + Socket.IO broadcast
│   │   ├── upload.service.js     # S3 upload/delete operations
│   │   └── log.service.js        # Activity log queries with filters + pagination
│   │
│   ├── sockets/                      # Only if using Option A (WebSocket)
│   │   ├── index.js              # Socket.IO server init, connection handling
│   │   ├── display.socket.js     # Screen room management, menu update broadcasts
│   │   └── token.socket.js       # Token update broadcasts
│   │
│   └── utils/
│       ├── timeResolver.js       # Port of frontend timeUtils.js to Node.js
│       ├── apiResponse.js        # Helper: success(), error() response builders
│       └── validators.js         # Joi/Zod schemas for all request bodies
│
├── app.js                        # Express app + middleware chain + Socket.IO attach
├── server.js                     # HTTP server entry, listens on PORT
├── seed.js                       # Database seeder (creates admin + sample data)
├── .env.example                  # Environment variable template
├── Dockerfile                    # Production container image
├── docker-compose.yml            # Local dev: Express + MongoDB
└── package.json
```

### Request Flow

```
Client Request
    │
    ▼
Express Router (routes/)
    │
    ▼
auth.js middleware ── Verify JWT, attach req.user
    │
    ▼
authorize.js middleware ── Check role against allowed roles
    │
    ▼
validate.js middleware ── Validate request body against schema
    │
    ▼
Route Handler (thin) ── Extract params, call service
    │
    ▼
Service Layer (services/) ── Business logic, DB operations, ref integrity
    │
    ├──▶ Mongoose Model ──▶ MongoDB
    │
    ├──▶ Activity Logger ──▶ ActivityLog collection
    │
    └──▶ Socket.IO emit ──▶ Affected display screen rooms
    │
    ▼
API Response ── Standardized { success, data, message } envelope
```

---

## 5. Authentication & Authorization

### JWT Strategy

- **Access token**: 7-day expiry (configurable via `JWT_EXPIRES_IN`)
- **Payload**: `{ userId, role, iat, exp }`
- **Storage**: Frontend stores in `localStorage` (same as demo pattern)
- **No refresh token** in Phase 1
- **Password reset**: Admin resets passwords for users directly (no email flow)

### Role Permissions Matrix

| Resource | Admin | Restaurant User | Token Operator |
|----------|-------|-----------------|----------------|
| Users | Full CRUD | Read self | Read self |
| Items | Full CRUD | Create, Read, Update | Read |
| Menus | Full CRUD | Create, Read, Update | Read |
| Screens | Full CRUD | Read, Update | Read |
| Logs | Read | No access | No access |
| Token | Read, Update, Clear | Read | Read, Update |
| Upload | Upload, Delete | Upload | No access |

### Display Screen Auth

The `/api/display/:screenId` endpoint and WebSocket connections from display screens require **no user authentication**. Display screens identify themselves by `screenId` only. This matches the demo behavior where gallery URLs are public.

---

## 6. Real-Time Update Strategy

Two approaches are documented. Choose one based on deployment constraints and team capacity.

### Comparison

| Factor | Option A: WebSocket (Socket.IO) | Option B: Short Polling |
|--------|-------------------------------|------------------------|
| **Latency** | Instant (< 100ms) | 5-30 seconds depending on interval |
| **Server complexity** | Higher — room management, connection lifecycle, reconnection, heartbeats | Lower — standard REST endpoints only |
| **AWS deployment** | ALB WebSocket config, sticky sessions, idle timeout tuning | Standard HTTP — no special config |
| **Client complexity** | Socket.IO client, event handlers, reconnection logic | Simple `setInterval` + `fetch()` |
| **TV browser support** | Inconsistent on cheap smart TVs | `fetch()` works everywhere |
| **Extra dependencies** | `socket.io` (server) + `socket.io-client` (frontend) | None |
| **Debugging** | Harder (persistent connections, state) | Easy (standard HTTP request/response) |
| **Bandwidth** | Efficient (push only on change) | Slightly higher (periodic requests even when no change) |
| **Best for** | Chat apps, stock tickers, gaming | Dashboards, display boards, moderate-frequency updates |

**Recommendation:** Option B (Short Polling) is the pragmatic choice for a canteen system where data changes infrequently. Option A is better if you later add features like live order tracking or real-time kitchen-to-counter communication.

---

### 6A. Option A: WebSocket (Socket.IO)

#### Socket.IO Configuration

Socket.IO runs on the same HTTP server as Express. CORS configured to allow the frontend origin.

#### Room Structure

| Room | Who Joins | Purpose |
|------|-----------|---------|
| `screen:{screenId}` | Display screens | Receive menu/screen updates for that specific screen |
| `token` | All display screens showing tokens | Receive token number changes |

#### Server-to-Client Events

| Event | Payload | Trigger |
|-------|---------|---------|
| `menu:updated` | `{ screenId, menu, items }` | Item or menu modified that affects a screen's current display |
| `screen:updated` | `{ screen }` | Screen config changed (background, time slots, settings) |
| `token:updated` | `{ currentToken, history }` | Token number changed |

#### Client-to-Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `screen:join` | `{ screenId }` | Display screen registers for updates |
| `screen:leave` | `{ screenId }` | Display disconnects from room |

#### Update Propagation Logic

When a service mutates data:

1. **Item updated/deleted** → Find all Menus containing this Item → Find all Screens referencing those Menus → Emit `menu:updated` to each screen room
2. **Menu updated/deleted** → Find all Screens referencing this Menu → Emit `menu:updated` to each screen room
3. **Screen updated** → Emit `screen:updated` to that screen's room
4. **Token updated** → Emit `token:updated` to the `token` room

#### Backend Structure (WebSocket)

```
server/src/sockets/
├── index.js              # Socket.IO server init, connection handling, auth
├── display.socket.js     # Screen room management, menu update broadcasts
└── token.socket.js       # Token update broadcasts
```

#### AWS Deployment Notes (WebSocket)

- ALB must enable WebSocket support (enabled by default, but idle timeout must be increased to 300s+)
- If using multiple EC2 instances: requires sticky sessions or a Redis adapter for Socket.IO
- Health checks must account for long-lived connections

---

### 6B. Option B: Short Polling

#### Polling Strategy

Display screens and the token page periodically fetch data from existing REST endpoints. No new server infrastructure needed — the same REST API serves both direct requests and polling.

#### Polling Intervals

| Client | Endpoint | Interval | Rationale |
|--------|----------|----------|-----------|
| Display Screen (TV) | `GET /api/display/:screenId` | **30 seconds** | Menus change a few times daily. 30s is imperceptible |
| Token Display | `GET /api/token` | **5 seconds** | Most time-sensitive. 5s is fast enough for serving counters |
| Admin Dashboard | No polling | — | Fetch on page load + refetch after own mutations |
| Manager Pages | No polling | — | Fetch on page load + refetch after own mutations |

#### How Polling Works

```
Display Screen:
  1. On mount: GET /api/display/:screenId → render menu
  2. Start 30s interval → re-fetch → compare with current data → re-render if changed
  3. Start 5s interval → GET /api/token → update token display if changed
  4. On unmount: clear all intervals
```

#### Server-Side Optimization (ETag / Last-Modified)

To reduce unnecessary processing when data hasn't changed, the API supports conditional requests:

```
Client request:
  GET /api/display/main-hall
  If-None-Match: "abc123"          ← ETag from previous response

Server response (no change):
  304 Not Modified                  ← No body, no DB query for serialization

Server response (data changed):
  200 OK
  ETag: "def456"
  Body: { screen, menu, items }
```

Implementation: Each entity has an `updatedAt` timestamp. The display service hashes the latest `updatedAt` across the screen + its menu + its items to generate an ETag. If unchanged, return 304.

#### Backend Structure (Polling)

No additional server code needed beyond the existing REST API. The `sockets/` directory is not created.

```
server/src/
├── (no sockets/ directory)
├── middleware/
│   └── conditionalRequest.js    # ETag / If-None-Match handler (optional optimization)
└── ...rest of existing structure unchanged
```

#### Frontend Structure (Polling)

```
frontend/src/hooks/
├── usePolling.js              # Generic polling hook: usePolling(fetchFn, intervalMs)
└── useDisplayPolling.js       # Combines 30s menu poll + 5s token poll for display screens
```

#### AWS Deployment Notes (Polling)

- Standard HTTP only — no special ALB configuration
- Works behind any reverse proxy or CDN without modification
- Stateless — scales horizontally with zero session affinity concerns
- ETag support reduces bandwidth and server load

---

## 7. Media Storage (AWS S3)

### Upload Flow

```
Frontend ──(multipart form)──▶ POST /api/upload
    │
    ▼
Multer (memory storage) ── Buffer in memory
    │
    ▼
upload.service.js ── Upload buffer to S3 bucket
    │
    ▼
Return CloudFront CDN URL ── e.g., https://cdn.example.com/items/abc123.jpg
```

### S3 Bucket Structure

```
canteen-media-bucket/
├── items/           # Food item images
├── screens/         # Screen background images/videos
└── temp/            # Temporary uploads (cleaned periodically)
```

### Constraints

- **Max file size**: 5MB for images, 50MB for videos
- **Allowed types**: JPEG, PNG, WebP, MP4, WebM
- **Naming**: `{category}/{uuid}.{ext}` (prevents collisions)

---

## 8. Deployment Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                        AWS Infrastructure                       │
│                                                                 │
│  ┌──────────────┐    HTTPS     ┌─────────────────────────┐     │
│  │  React App   │────────────▶│  EC2 / ECS Container     │     │
│  │  (Vercel)    │             │                           │     │
│  │              │◀────────────│  Express.js               │     │
│  └──────────────┘  REST(+WS)  │  + Socket.IO (Option A)   │     │
│                                │    or polling (Option B)  │     │
│  ┌──────────────┐             │         │                 │     │
│  │  Display     │◀──WS or ───│    Mongoose               │     │
│  │  Screens     │   polling   └─────────┬───────────────┘     │
│  │  (TVs)       │                       │                      │
│  └──────────────┘                       ▼                      │
│                               ┌──────────────────┐             │
│                               │  MongoDB Atlas    │             │
│                               │  (Managed DB)     │             │
│                               └──────────────────┘             │
│                                                                 │
│  ┌──────────────┐             ┌──────────────────┐             │
│  │  S3 Bucket   │────────────▶│  CloudFront CDN  │             │
│  │  (Media)     │             │  (Fast delivery)  │             │
│  └──────────────┘             └──────────────────┘             │
└────────────────────────────────────────────────────────────────┘
```

### Environment Variables

```bash
# Server
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/canteen

# Authentication
JWT_SECRET=<random-256-bit-string>
JWT_EXPIRES_IN=7d

# AWS S3
AWS_ACCESS_KEY_ID=<key>
AWS_SECRET_ACCESS_KEY=<secret>
AWS_S3_BUCKET=canteen-media-bucket
AWS_S3_REGION=ap-south-1
CLOUDFRONT_URL=https://cdn.example.com

# CORS
FRONTEND_URL=https://your-app.vercel.app
```

---

## 9. Frontend Refactoring Plan

When integrating the frontend with the backend, these are the key changes:

### Replace localStorage with API calls
- `DataContext.jsx` → Replace all `localStorage` reads/writes with `fetch()` calls to REST API
- `AuthContext.jsx` → Replace mock login with `POST /api/auth/login`, store JWT

### Replace base64 media with URLs
- `fileUtils.js` → Replace base64 conversion with `POST /api/upload`, use returned URL
- `ImageUpload.jsx` → Upload to API, display from CDN URL

### Add API client layer
- Create `src/api/` directory with modules per resource (items, menus, screens, etc.)
- Central `apiClient.js` with JWT header injection and error handling

### Add real-time update client (choose one)
- **Option A (WebSocket):** Create `src/sockets/` with Socket.IO client. `GalleryDisplay.jsx` and `TokenManagementPage.jsx` listen for push events.
- **Option B (Polling):** Create `src/hooks/usePolling.js`. `GalleryDisplay.jsx` polls display endpoint every 30s. `TokenManagementPage.jsx` polls token endpoint every 5s.

### Remove Schedule entity references
- Remove `SchedulesPage.jsx` and schedule components
- Screen form absorbs time slot configuration directly

### Remove mock data dependency
- `mockData.js` → Replaced by `seed.js` on the backend
- `DataContext.jsx` → No longer falls back to mock data

---

## 10. Key Business Logic: Time-Based Menu Resolution

This is the core algorithm, ported from `src/utils/timeUtils.js` to the backend `display.service.js`:

```
resolveCurrentMenu(screen):
  1. Get current time (HH:mm) and day of week
  2. Filter screen.timeSlots to those where:
     - daysOfWeek includes current day (or daysOfWeek is empty = all days)
     - startTime <= currentTime < endTime
  3. If matching slot found → return slot.menu (populated with items)
  4. If no match → return screen.defaultMenu (populated with items)
  5. If no defaultMenu → return null (screen shows "no menu available")
```

This logic runs:
- On `GET /api/display/:screenId` (HTTP request from display screen)
- When the server pushes updates via WebSocket (resolves before emitting)

---

## 11. Database Seeding

`seed.js` creates initial data for a fresh deployment:

1. Admin user: `admin / admin123`
2. Sample food items (from current `mockData.js`)
3. Sample menus (Breakfast, Lunch, Dinner)
4. One sample screen with time slots
5. Empty token state

Run once: `node seed.js` or via npm script `npm run seed`.
