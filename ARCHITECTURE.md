# DocFlow — Architecture & Technical Design

DocFlow is architected as a decoupled, multi-tier web application built for reliability, security, and developer clarity.

---

## 🏗️ 1. Multi-Tier System Architecture

```text
+-------------------------------------------------------------------------+
|                         React 19 / Vite SPA                             |
|  • Hosted on Vercel: https://dockflowteam.vercel.app                    |
|  • Single Page Navigation & React Router DOM v7                         |
|  • TipTap Rich Text Engine (@tiptap/react, starter-kit, underline)      |
|  • Axios HTTP Client with Bearer Token & 401 Interceptors               |
+-------------------------------------------------------------------------+
                                     │
                                     │ HTTPS / REST (JSON)
                                     ▼
+-------------------------------------------------------------------------+
|                        Node.js / Express.js API                         |
|  • Hosted on Render: https://docflow-0m70.onrender.com                  |
|  • JWT Authentication Middleware                                        |
|  • Strict Authorization Matrix (Owner vs Shared User Verification)      |
|  • Multer MemoryStorage File Parser (.txt / .md)                        |
+-------------------------------------------------------------------------+
                                     │
                                     │ Mongoose ODM
                                     ▼
+-------------------------------------------------------------------------+
|                         MongoDB Atlas Database                          |
|  • Collections: Users, Documents, Shares                                |
+-------------------------------------------------------------------------+
```

---

## 🎨 2. Frontend Component Architecture

### Page Components
- **`Login.jsx`**: Handles authentication form submission, demo account auto-filling, and Team Registration toggle.
- **`Dashboard.jsx`**: Main workspace hub rendering **"My Documents"** and **"Shared With Me"** tabs, document creation, file upload triggers, and card navigation.
- **`DocumentEditor.jsx`**: TipTap rich-text editing environment featuring inline title renaming, toolbar formatting, save status management (`Saved`, `Unsaved changes`, `Saving...`), delete, and email sharing modal.

### State & Services
- **`AuthContext.jsx`**: Manages global user authentication state (`user`, `token`, `loading`, `login`, `register`, `logout`) and auto-validates sessions on app startup via `GET /api/auth/me`.
- **`services/api.js`**: Configures Axios base URL (`VITE_API_URL`) and injects JWT Bearer tokens in request headers. Automatically catches `401 Unauthorized` responses to clear expired local tokens.
- **`ProtectedRoute.jsx`**: Route guard preventing unauthenticated access and displaying loading indicators during session restoration.

---

## ⚙️ 3. Backend Architecture

### Directory Responsibilities
```text
server/
├── config/          # Database connection setup (connectDB)
├── controllers/     # Business logic handlers (auth, document, share, upload)
├── middleware/      # JWT protection (protect) & Multer upload config
├── models/          # Mongoose schemas (User, Document, Share)
├── routes/          # Express route definitions
├── tests/           # Automated integration test suites (Vitest + Supertest)
└── server.js        # Express application entrypoint & server listener
```

---

## 📊 4. Database Schema Design

### User Model (`models/User.js`)
```javascript
{
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}
```
*Note: Passwords are automatically hashed using `bcryptjs` via Mongoose pre-save hooks and excluded from JSON output via `toJSON` transforms.*

### Document Model (`models/Document.js`)
```javascript
{
  title: { type: String, required: true, trim: true, default: 'Untitled Document' },
  content: { type: String, default: '' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### Share Model (`models/Share.js`)
```javascript
{
  document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sharedWith: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
}
```
*Note: A unique compound index on `{ document: 1, sharedWith: 1 }` prevents duplicate document sharing.*

---

## 🔒 5. Security & Authorization Matrix

Authorization is strictly enforced on the server (`req.user._id`), never relying solely on frontend UI hiding:

| Action | Document Owner | Shared User | Unrelated User |
|---|---|---|---|
| **View List** | ✅ Allowed (`GET /api/documents`) | ✅ Allowed (`GET /api/documents/shared`) | ❌ Excluded |
| **Get Document** | ✅ Allowed (`GET /api/documents/:id`) | ✅ Allowed (`GET /api/documents/:id`) | 🛑 Blocked (HTTP 403) |
| **Update / Save** | ✅ Allowed (`PUT /api/documents/:id`) | ✅ Allowed (`PUT /api/documents/:id`) | 🛑 Blocked (HTTP 403) |
| **Share Document**| ✅ Allowed (`POST /api/documents/:id/share`)| 🛑 Blocked (HTTP 403) | 🛑 Blocked (HTTP 403) |
| **Delete Document**| ✅ Allowed (`DELETE /api/documents/:id`)| 🛑 Blocked (HTTP 403) | 🛑 Blocked (HTTP 403) |

---

## 📥 6. File Import Pipeline

```text
Browser File Selection (.txt / .md)
                 │
                 ▼
FormData sent via POST /api/upload
                 │
                 ▼
uploadMiddleware (Multer MemoryStorage)
  • Validates extension (.txt / .md)
  • Enforces 5 MB size limit
                 │
                 ▼
uploadController
  • Converts buffer text to UTF-8
  • Parses Markdown headers (# → <h1>) & lists (- → <li>) into HTML
  • Creates Document model in MongoDB with filename title
                 │
                 ▼
Returns Created Document & Navigates to Editor
```

---

## 💡 7. Architectural Decisions & Tradeoffs

1. **Manual Save with Status Badges**: Manual saving with explicit status badges (`Saved`, `Unsaved changes`, `Saving...`) provides complete user control, eliminates race conditions while typing, and prevents excessive database writes.
2. **HTML String Persistence**: Storing TipTap document content as standard HTML strings in MongoDB simplifies text file importing, document rendering, and data verification compared to raw node AST trees.
3. **Decoupled API Fetching**: Document fetching (`api.get('/documents/' + id)`) was decoupled from TipTap editor initialization in React to eliminate race conditions on initial route navigation.
4. **Stateless Memory Storage**: Using Multer memory buffers for file imports keeps backend server deployments completely stateless and eliminates temporary disk cleanup code.
