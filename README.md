# DocFlow
### AI-Native Collaborative Document Editor

DocFlow is a lightweight, modern SaaS document editor inspired by Google Docs, built as an AI-Native Full Stack MVP. It enables team members to create, edit, format, save, import, and share rich-text documents cleanly and securely.

---

## Overview

Users of DocFlow can:
* **Authentication**: Login securely using seeded team credentials with JWT and bcrypt.
* **Dashboard**: Organize documents into "My Documents" and "Shared With Me".
* **Document Creation & Editing**: Instantly create, rename, and edit rich-text documents.
* **TipTap Rich Text Engine**: Apply Bold, Italic, Underline, Headings (H1, H2), Bullet Lists, and Numbered Lists.
* **Persistence**: Perform in-place title renaming and manual document saving persisted to MongoDB.
* **File Import**: Import `.txt` and `.md` files directly into editable rich-text documents with filename titles.
* **Document Sharing**: Share documents with team members via email and access shared documents with role-based owner/editor privileges.
* **Access Control & Authorization**: Enforce strict backend authorization matrix blocking unauthorized single document reads, updates, deletions, or share operations.

---

## Features

- JWT authentication with secure session restoration
- Secure password hashing with bcryptjs
- Protected client-side routing
- Full Document CRUD (Create, Read, Update, Delete)
- Rich-text editing powered by TipTap
- Bold / Italic / Underline formatting
- Heading 1 / Heading 2 formatting
- Bullet list and ordered list formatting
- Manual document saving with real-time status badges (`Saved`, `Unsaved changes`, `Saving...`)
- In-place document renaming
- `.txt` and `.md` file upload / import with HTML parsing
- Document sharing by recipient email
- "Shared With Me" workspace dashboard tab
- Owner vs Shared User authorization model
- Loading indicators and user-friendly error banners
- 30 automated API & authorization integration tests
- Production MongoDB persistence
- Deployed to Vercel and Render

---

## Tech Stack

### Frontend
* **Core**: React 19 + Vite 8 (JavaScript / JSX)
* **Styling**: Tailwind CSS v4 + Lucide React Icons
* **Routing**: React Router DOM v7
* **Rich Text Editor**: TipTap (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-underline`)
* **HTTP Client**: Axios with Bearer token request interceptor and 401 response interceptor

### Backend
* **Runtime**: Node.js + Express.js
* **Database**: MongoDB + Mongoose ODM (Atlas compatible)
* **Authentication**: JSON Web Tokens (`jsonwebtoken`) + `bcryptjs`
* **File Upload**: Multer (Memory Storage)
* **Testing**: Vitest + Supertest

### Deployment
* **Frontend**: Vercel (`https://docflow-client.vercel.app`)
* **Backend**: Render (`https://docflow-server.onrender.com`)
* **Database**: MongoDB Atlas

---

## Project Structure

```text
docflow/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DocumentEditor.jsx
│   │   │   └── DocumentPlaceholder.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json
│
├── server/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── documentController.js
│   │   ├── shareController.js
│   │   └── uploadController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Document.js
│   │   └── Share.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── documentRoutes.js
│   │   └── uploadRoutes.js
│   ├── tests/
│   │   ├── auth.test.js
│   │   ├── document.test.js
│   │   ├── upload.test.js
│   │   └── share.test.js
│   ├── seed.js
│   ├── server.js
│   └── package.json
│
├── README.md
├── ARCHITECTURE.md
├── AI-WORKFLOW.md
└── SUBMISSION.md
```

---

## Local Setup

### 1. Clone & Navigate
```bash
git clone <repository-url>
cd docflow
```

### 2. Backend Setup
```bash
cd server
npm install
npm run seed
npm run dev
```

### 3. Frontend Setup
```bash
cd ../client
npm install
npm run dev
```

---

## Environment Variables

#### Backend (`server/.env`):
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/docflow
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=https://docflow-client.vercel.app
```

#### Frontend (`client/.env`):
```env
VITE_API_URL=https://docflow-server.onrender.com/api
```

*(Note: Never commit `.env` files to source repositories. `.env.example` templates are provided).*

---

## Demo Accounts

| User | Name | Email | Password |
|---|---|---|---|
| **User 1 (Primary Owner)** | Amit Ahir | `amit@example.com` | `Amit@123` |
| **User 2 (Collaborator)** | Rahul Shah | `rahul@example.com` | `Rahul@123` |

---

## API Overview

```text
POST   /api/auth/login            # Login user & issue JWT
GET    /api/auth/me               # Return authenticated user profile

POST   /api/documents             # Create new document
GET    /api/documents             # List user owned documents
GET    /api/documents/shared      # List documents shared with current user
GET    /api/documents/:id         # Get document details (Owner or Shared user)
PUT    /api/documents/:id         # Update document title/content (Owner or Shared user)
DELETE /api/documents/:id         # Delete document (Owner ONLY)

POST   /api/documents/:id/share   # Share document with user by email (Owner ONLY)
GET    /api/documents/:id/shares  # List shared users for document (Owner ONLY)

POST   /api/upload                # Upload .txt / .md file and convert to document
GET    /api/health                # Health check monitoring endpoint
```

---

## Testing

Execute the automated Vitest test suite covering 30 API, authentication, file upload, and authorization matrix tests:
```bash
cd server
npm test
```

---

## Production Deployment URLs

* **Frontend App**: `https://docflow-client.vercel.app`
* **Backend API**: `https://docflow-server.onrender.com`
* **Health Check**: `https://docflow-server.onrender.com/api/health`

---

## Known Scope Limitations

- **No Real-Time WebSocket Collaboration**: Intentionally excluded to focus on a rock-solid core user journey within the MVP timebox.
- **No Autosave**: Manual saving with explicit status badges (`Saved`, `Unsaved changes`, `Saving...`) prevents race conditions and unnecessary database writes.
- **No PDF/DOCX Export**: Import is focused exclusively on `.txt` and `.md` plain text formats.
