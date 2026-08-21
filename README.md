# DocFlow 📄
> **Simple, fast, and collaborative rich-text document editing for modern teams.**

DocFlow is a lightweight, modern SaaS document editor inspired by Google Docs, built as an AI-Native Full Stack MVP. It enables team members to create, edit, format, save, import, and share rich-text documents cleanly and securely.

---

## 🔗 Quick Links

| Resource | Link |
|---|---|
| 🚀 **Live Web App** | [dockflowteam.vercel.app](https://dockflowteam.vercel.app) |
| ⚡ **Production Backend** | [docflow-0m70.onrender.com](https://docflow-0m70.onrender.com) |
| 💚 **API Health Check** | [docflow-0m70.onrender.com/api/health](https://docflow-0m70.onrender.com/api/health) |
| 📦 **GitHub Repository** | [github.com/amitahir0201/DocFlow](https://github.com/amitahir0201/DocFlow) |

---

## ✨ Features at a Glance

### 🔐 Authentication & Team Access
* **JWT Authentication**: Persistent local session restoration (`30d` expiry).
* **Bcrypt Password Security**: Passwords hashed before database insertion; plain passwords never serialized.
* **Team Registration**: Self-serve account creation (`POST /api/auth/register`) with client and server validation.

### 📝 Document Workspace & Editor
* **Workspace Tabs**: Separate views for **"My Documents"** and **"Shared With Me"**.
* **TipTap Rich Text Engine**: Full support for **Bold**, *Italic*, <u>Underline</u>, `Heading 1`, `Heading 2`, Bullet Lists, and Numbered Lists.
* **In-Place Title Renaming**: Live document title updates with real-time status indicators.
* **Persistence & Saving**: Manual save button with status badges (`Saved`, `Unsaved changes`, `Saving...`), persisting content HTML to MongoDB Atlas.

### 📁 File Import & Document Sharing
* **`.txt` & `.md` Upload**: Import plain text and Markdown files directly into editable TipTap documents.
* **Email-Based Sharing**: Document owners can share documents with registered teammates by email.
* **Backend Authorization Matrix**: Server-enforced permissions blocking unauthorized single document reads, updates, deletions, or re-shares.

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, Tailwind CSS v4, TipTap (`@tiptap/react`, `starter-kit`, `extension-underline`), Axios, Lucide Icons |
| **Backend** | Node.js, Express.js, Mongoose ODM |
| **Database** | MongoDB Atlas |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` |
| **File Upload** | Multer (Memory Storage) |
| **Testing** | Vitest, Supertest |
| **Deployment** | Vercel (Frontend), Render (Backend) |

---

## 📁 Repository Structure

```text
docflow/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── DocumentEditor.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
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
│   ├── server.js
│   └── package.json
│
├── README.md
├── ARCHITECTURE.md
├── AI-WORKFLOW.md
└── SUBMISSION.md
```

---

## 🚀 Local Setup & Installation

### 1. Clone Repository
```bash
git clone https://github.com/amitahir0201/DocFlow.git
cd DocFlow
```

### 2. Backend Setup
```bash
cd server
npm install
npm run dev
```

### 3. Frontend Setup
```bash
cd ../client
npm install
npm run dev
```

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Primary Owner** | `amit@example.com` | `Amit@123` |
| **Collaborator** | `rahul@example.com` | `Rahul@123` |

> [!TIP]
> You can also register a new team member directly using the **"Create Team Account"** option on the login page!

---

## 🌐 API Overview

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT |
| `POST` | `/api/auth/register` | Public | Register a new team account |
| `GET` | `/api/auth/me` | Private | Return current user profile |
| `POST` | `/api/documents` | Private | Create a new document |
| `GET` | `/api/documents` | Private | List user's owned documents |
| `GET` | `/api/documents/shared` | Private | List documents shared with current user |
| `GET` | `/api/documents/:id` | Private | Retrieve single document (Owner or Shared User) |
| `PUT` | `/api/documents/:id` | Private | Update document title/content (Owner or Shared User) |
| `DELETE` | `/api/documents/:id` | Private | Delete document (Owner ONLY) |
| `POST` | `/api/documents/:id/share` | Private | Share document by email (Owner ONLY) |
| `GET` | `/api/documents/:id/shares` | Private | List shared users for document (Owner ONLY) |
| `POST` | `/api/upload` | Private | Upload `.txt` / `.md` file and convert to document |
| `GET` | `/api/health` | Public | Health check monitoring endpoint |

---

## 🧪 Automated Testing

DocFlow includes 32 automated integration tests covering authentication, CRUD, file uploads, sharing, and authorization boundaries:

```bash
cd server
npm test
```

---

## 📌 Known Scope Limitations

> [!NOTE]
> To deliver a rock-solid, production-grade core document editing and sharing experience within the assignment timebox:
> - **Real-Time WebSockets**: Excluded in favor of robust CRUD, persistence, and authorization.
> - **Manual Saving**: Chosen over autosave to prevent race conditions during typing.
> - **Plain Text & Markdown Upload**: Prioritized over `.pdf`/`.docx` for file parsing stability.
