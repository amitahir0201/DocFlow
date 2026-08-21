# DocFlow Architecture

## System Overview

DocFlow is architected as a decoupled, multi-tier web application:

```text
React / Vite Frontend (Vercel)
        ↓ HTTPS (Axios + JWT)
Express REST API (Render)
        ↓ Mongoose ODM
MongoDB Atlas Database
```

---

## Frontend Architecture

The frontend is a single-page application built with React 19, Vite, and Tailwind CSS.

### Pages & Responsibilities
- **`Login.jsx`**: Handles authentication form submission, error messaging, and quick demo account filling.
- **`Dashboard.jsx`**: Main workspace hub rendering "My Documents" and "Shared With Me" tabs, handling document creation, file upload triggers, and card navigation.
- **`DocumentEditor.jsx`**: TipTap rich text editing environment featuring inline title renaming, toolbar formatting, save status management, delete, and sharing modal.

### Context & State Management
- **`AuthContext.jsx`**: Manages global user authentication state (`user`, `token`, `loading`, `login`, `logout`) and auto-validates sessions on app startup via `/api/auth/me`.

### HTTP Services
- **`services/api.js`**: Configures Axios base URL (`VITE_API_URL`) and injects JWT Bearer tokens in request headers. Also handles 401 Unauthorized response redirects.

### Guards
- **`ProtectedRoute.jsx`**: Restricts unauthorized route access and displays loading indicator during initial auth checks.

---

## Backend Architecture

The backend follows an Express.js MVC pattern:

```text
HTTP Request
     ↓
Routes (authRoutes, documentRoutes, uploadRoutes)
     ↓
Middleware (authMiddleware, uploadMiddleware)
     ↓
Controllers (authController, documentController, shareController, uploadController)
     ↓
Models (User, Document, Share)
     ↓
MongoDB Atlas Database
```

---

## Database Models

### 1. User (`models/User.js`)
```text
name: String (Required)
email: String (Required, Unique, Lowercase)
password: String (Required, Bcrypt Hashed)
createdAt: Date (Default: Date.now)
```
*Note: Passwords are automatically hashed via Mongoose pre-save hook and omitted from JSON output via `toJSON` transform.*

### 2. Document (`models/Document.js`)
```text
title: String (Required, Default: "Untitled Document")
content: String (Default: "")
owner: ObjectId (Ref: User, Required)
createdAt: Date (Timestamp)
updatedAt: Date (Timestamp)
```

### 3. Share (`models/Share.js`)
```text
document: ObjectId (Ref: Document, Required)
owner: ObjectId (Ref: User, Required)
sharedWith: ObjectId (Ref: User, Required)
createdAt: Date (Timestamp)
```
*Note: Unique compound index on `{ document: 1, sharedWith: 1 }` prevents duplicate document sharing.*

---

## Authentication Flow

```text
Login Request (POST /api/auth/login)
     ↓
Validate email & password
     ↓
Bcrypt compare hashed password
     ↓
Sign JWT token with user ID
     ↓
Return token & user info to Client
     ↓
Client stores token in localStorage
     ↓
Subsequent requests include 'Authorization: Bearer <JWT>'
     ↓
authMiddleware verifies JWT & attaches req.user
```

---

## Authorization Matrix

| Action | Document Owner | Shared User | Unrelated User |
|---|---|---|---|
| **View List** | Yes (`GET /api/documents`) | Yes (`GET /api/documents/shared`) | No |
| **Get Document** | Yes (`GET /api/documents/:id`) | Yes (`GET /api/documents/:id`) | Blocked (HTTP 403) |
| **Update / Save** | Yes (`PUT /api/documents/:id`) | Yes (`PUT /api/documents/:id`) | Blocked (HTTP 403) |
| **Share Document**| Yes (`POST /api/documents/:id/share`)| Blocked (HTTP 403) | Blocked (HTTP 403) |
| **Delete Document**| Yes (`DELETE /api/documents/:id`)| Blocked (HTTP 403) | Blocked (HTTP 403) |

---

## Document Flow

```text
Create Document
     ↓
POST /api/documents → MongoDB Document Created
     ↓
Open Editor (/document/:id)
     ↓
GET /api/documents/:id → Returns document & sets TipTap content
     ↓
Edit Title & Formatting
     ↓
Save Document
     ↓
PUT /api/documents/:id → Content HTML & Title updated in MongoDB
```

---

## File Import Architecture

```text
User selects .txt or .md file
     ↓
FormData sent via POST /api/upload
     ↓
uploadMiddleware (Multer MemoryStorage) validates file type & 5MB size limit
     ↓
uploadController parses file buffer text to UTF-8
     ↓
Convert text / markdown elements (headings, lists) to TipTap HTML
     ↓
Create Document model with filename as title
     ↓
Return created document & navigate to editor
```

---

## Document Sharing Flow

```text
Owner enters recipient email in Share Modal
     ↓
POST /api/documents/:id/share
     ↓
Backend validates owner permission, target user existence, and self/duplicate checks
     ↓
Create Share record in MongoDB
     ↓
Recipient logs in → GET /api/documents/shared populates shared documents
     ↓
Recipient opens & edits document (Backend allows PUT /api/documents/:id for shared users)
```

---

## Deployment Architecture

```text
Vercel (Client SPA)
  • Host: https://docflow-client.vercel.app
  • Rewrites all paths to index.html (vercel.json)

Render (Backend Server)
  • Host: https://docflow-server.onrender.com
  • Listens on process.env.PORT
  • Health Endpoint: /api/health

MongoDB Atlas (Database)
  • Network access configured for Render cluster connection
```

---

## Engineering Tradeoffs

1. **Manual Save vs Autosave**: Manual saving with explicit status badges (`Saved`, `Unsaved changes`, `Saving...`) was chosen to provide determinism, eliminate race conditions while typing, and prevent excessive API traffic.
2. **HTML Content Storage**: Storing standard HTML strings simplifies file importing, document rendering, and persistence verification compared to raw node AST trees.
3. **Memory Storage for Multer**: Using memory buffers for `.txt`/`.md` imports keeps server execution stateless, cloud-ready, and eliminates temporary disk cleanup code.
4. **No Real-Time WebSockets**: Intentionally omitted to prioritize robust core document functionality, sharing, and authorization within the 3-hour MVP timebox.

---

## Security Considerations

- Passwords are bcrypt-hashed before storage and stripped from JSON serialization.
- JWT tokens are signed using environment secrets (`JWT_SECRET`).
- Authorization is strictly enforced on the backend (`req.user._id`), never relying solely on frontend UI hiding.
- Uploaded files are validated by extension and size (5 MB limit) with HTML special characters escaped.
