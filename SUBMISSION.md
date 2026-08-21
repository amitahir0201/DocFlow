# Ajaia LLC — AI-Native Full Stack Developer Assignment

## Candidate Information
* **Name**: Ahir Amit
* **Email**: [amitahir0201@gmail.com](mailto:amitahir0201@gmail.com)
* **Application**: DocFlow — Simple Collaborative Document Editor

---

## 🔗 Important Links

| Resource | URL |
|---|---|
| 🚀 **Live Web App (Frontend)** | [dockflowteam.vercel.app](https://dockflowteam.vercel.app) |
| ⚡ **Production API (Backend)** | [docflow-0m70.onrender.com](https://docflow-0m70.onrender.com) |
| 💚 **API Health Check** | [docflow-0m70.onrender.com/api/health](https://docflow-0m70.onrender.com/api/health) |
| 📦 **GitHub Repository** | [github.com/amitahir0201/DocFlow](https://github.com/amitahir0201/DocFlow) |
| 📁 **Google Drive Submission Folder** | TODO: Add before submission |
| 📹 **Walkthrough Video** | TODO: Add before submission |

---

## 🔑 Reviewer Test Credentials

| Account Role | Email | Password |
|---|---|---|
| **Primary Owner** | `amit@example.com` | `Amit@123` |
| **Collaborator** | `rahul@example.com` | `Rahul@123` |

*(Note: New team members can also register directly via the "Create Team Account" option on the login page).*

---

## 🚀 Quick Reviewer Walkthrough (5-Minute End-to-End Flow)

1. Open [https://dockflowteam.vercel.app](https://dockflowteam.vercel.app).
2. Click **Amit Ahir** on the demo accounts bar (or enter `amit@example.com` / `Amit@123`) and click **Sign In**.
3. On the **Dashboard**, click **+ New Document**.
4. Rename the title to *"Project Roadmap 2026"* and add rich-text formatting (**Bold**, **Italic**, **Underline**, **Heading 1**, **Bullet List**).
5. Click **Save** (Observe status badge update: `Unsaved changes` → `Saving...` → `Saved`).
6. Refresh the browser (`F5`) to verify MongoDB content persistence.
7. Return to Dashboard and click **Upload File** (select any `.txt` or `.md` file to test automatic document import).
8. Open your document, click **Share**, enter `rahul@example.com`, and click **Share**.
9. Log out, then sign in as **Rahul Shah** (`rahul@example.com` / `Rahul@123`).
10. Click the **Shared With Me** tab to view the shared document, open it, edit content, and click **Save**.
11. Observe that owner-restricted actions (**Share** button & **Delete** icon) are hidden for shared users.

---

## ✅ Implemented Feature Checklist

### Core Document Operations
- [x] **Create Document**: Instant creation via REST API and routing to editor.
- [x] **Rename Document**: In-place document title editing with real-time unsaved state indicators.
- [x] **Edit Document Content**: Rich-text editing powered by TipTap engine.
- [x] **Save & Reopen Documents**: Manual save button persisting HTML content string to MongoDB Atlas.
- [x] **Bold Formatting**: Supported (`Ctrl+B` or toolbar button).
- [x] **Italic Formatting**: Supported (`Ctrl+I` or toolbar button).
- [x] **Underline Formatting**: Supported (`Ctrl+U` or toolbar button).
- [x] **Headings**: Heading 1 (`<h1>`) and Heading 2 (`<h2>`) support.
- [x] **Bulleted Lists**: Supported (`<ul>` / `<li>`).
- [x] **Numbered Lists**: Supported (`<ol>` / `<li>`).

### File Upload & Import
- [x] **`.txt` File Import**: Upload plain text files into editable TipTap documents with filename titles.
- [x] **`.md` File Import**: Upload Markdown files automatically parsed to HTML elements (`#` → `<h1>`, `-` → `<li>`).
- [x] **Upload Validation**: File extension validation (`.txt`/`.md`) and 5 MB size limit enforcement.

### Document Sharing & Access Control
- [x] **Document Owner Assignment**: Owner assigned on document creation.
- [x] **Email-Based Sharing**: Owner can share document with team members by email.
- [x] **Shared With Me Dashboard**: Workspace tab filtering team-shared documents with owner attribution.
- [x] **Backend Authorization Matrix**: Strict Express middleware JWT validation blocking unauthorized reads, updates, deletions, or re-shares.

### User Authentication & Team Registration
- [x] **JWT Authentication**: Token generation (`30d` expiry) with persistent local session restoration.
- [x] **Bcrypt Password Hashing**: Passwords hashed before storage; plain passwords never serialized.
- [x] **Team User Registration**: Public `POST /api/auth/register` endpoint supporting self-serve account creation from the login page.
- [x] **Duplicate Email Prevention**: Server responds with `409 Conflict` on duplicate registrations.

### Engineering & Quality
- [x] **Working Production Deployment**: Vercel frontend, Render backend, MongoDB Atlas database.
- [x] **Automated Test Suite**: 32 Vitest + Supertest integration tests covering authentication, CRUD, file uploads, sharing, and authorization.
- [x] **User-Friendly Error Handling**: Graceful loading indicators and human-readable error alerts without stack trace exposure.

---

## 📌 Deprioritized / Non-Implemented Features (Timebox Tradeoffs)

- [ ] **Real-Time WebSocket Collaboration**: Omitted to deliver a rock-solid core CRUD, persistence, and authorization system within the timebox.
- [ ] **Autosave**: Manual saving with explicit status badges (`Saved`, `Unsaved changes`, `Saving...`) was chosen to prevent race conditions and excessive API traffic.
- [ ] **PDF / DOCX File Import**: Plain text and Markdown formats prioritized for reliability.
- [ ] **Comments & Inline Annotations**: Deferred to future roadmap.
- [ ] **Version History & Restoration**: Deferred to future roadmap.

---

## 🛠️ Technical Stack Summary

```text
Frontend: React 19 + Vite 8 + Tailwind CSS v4 + TipTap (@tiptap/react, starter-kit, extension-underline)
Backend: Node.js + Express.js
Database: MongoDB Atlas (Mongoose ODM)
Authentication: JSON Web Tokens (jsonwebtoken) + bcryptjs
File Upload: Multer (Memory Storage)
Testing: Vitest + Supertest
Deployment: Vercel (Client) + Render (Server)
```

---

## 🏗️ Architecture Diagram

```text
React 19 / Vite SPA (Vercel)
  • Host: https://dockflowteam.vercel.app
  • Rewrites all paths to index.html (client/vercel.json)
        │
        │ HTTPS (Axios + Bearer Token)
        ▼
Express.js REST API (Render)
  • Host: https://docflow-0m70.onrender.com
  • Auth Middleware (JWT signature verification)
  • Authorization Matrix (Owner vs Shared User checks)
        │
        │ Mongoose ODM
        ▼
MongoDB Atlas Database
  • Collections: Users, Documents, Shares
```

---

## 💡 Key Engineering Decisions

1. **Simple REST Architecture**: Standard JSON endpoints allow predictable debugging, state handling, and automated integration testing.
2. **HTML Content Format**: TipTap content stored as HTML strings in MongoDB simplifies text file imports and document rendering.
3. **Decoupled API Fetching**: Separated REST API document loading from TipTap initialization to eliminate race conditions on initial route navigation.
4. **Backend Authorization Matrix**: Enforced all access-control boundaries (`req.user._id` vs `document.owner` vs `Share` records) strictly on the server rather than relying on UI hiding.
5. **Stateless Memory Storage**: Using Multer memory buffers for file imports keeps the cloud backend stateless and eliminates temporary disk cleanup routines.

---

## 🤖 AI-Native Workflow

### AI Tools Used
* **Antigravity AI Agent** (Powered by Gemini 3.6 Flash High model)

### Where AI Accelerated Development
- **Scaffolding & Boilerplate**: Rapid generation of Express routes, Mongoose models, and React context boilerplate.
- **TipTap Rich Text Integration**: Quick configuration of `@tiptap/react` StarterKit and Underline extensions.
- **Automated Test Generation**: Scaffolding of 32 Vitest + Supertest integration tests (`auth.test.js`, `document.test.js`, `upload.test.js`, `share.test.js`).
- **UI Styling**: Crafting clean Tailwind CSS v4 components with micro-interactions, responsive sidebars, and clear save status badges.

### AI Output Changed or Rejected
- **Rejected JSON AST Storage**: AI initially suggested storing TipTap AST JSON trees. Storing plain HTML strings was chosen instead for clean text importing and rendering.
- **Rejected Real-Time Collaboration Complexity**: AI suggested complex WebSocket sync libraries. Manual saving with explicit status badges was chosen to prioritize timebox reliability.
- **Rejected Frontend Access Checks**: AI suggested frontend-only document filtering. Backend-enforced query boundaries and JWT checks were implemented for security.

### Verification Process
- **Automated Integration Testing**: Executed `npm test` verifying 32 passing integration test cases.
- **Production Build Check**: Executed `npm run build` ensuring 0 compilation errors.
- **Live E2E Verification**: Manually verified login, document creation, rich-text formatting, file upload, sharing, and authorization across Vercel, Render, and MongoDB Atlas.

---

## 🧪 Automated Test Suite

* **Testing Framework**: Vitest + Supertest
* **Test Command**: `cd server && npm test`
* **Test Suites**:
  - `server/tests/auth.test.js`: Login, Team Registration (`201`), Duplicate Email (`409`), JWT Profile.
  - `server/tests/document.test.js`: Document CRUD, Owner Assignment, Invalid Title Rejection, Forbidden Access checks.
  - `server/tests/upload.test.js`: `.txt` upload, `.md` header/list parsing, invalid extension rejection (`.pdf`), size limits.
  - `server/tests/share.test.js`: Owner sharing, duplicate share prevention, shared document retrieval, shared user edits, delete/reshare prohibition (`403`).

---

## 🚀 What I Would Build Next (2–4 Hours Roadmap)

1. **Real-Time Cursor Presence & Collaborative Sync**: Integrate Yjs and WebSockets for real-time multiplayer editing.
2. **Inline Comments & Document Annotations**: Allow team members to highlight text and leave threaded comments.
3. **Document Export Options**: Add direct header buttons to export documents as `.pdf` or `.md` files.
4. **Version History & Revision Restore**: Track document revisions with restore capabilities.

---

## 📁 Included Submission Materials (Google Drive Folder Structure)

```text
docflow-submission/
├── source-code/
│   ├── client/
│   └── server/
├── README.md
├── ARCHITECTURE.md
├── AI-WORKFLOW.md
├── SUBMISSION.md
└── VIDEO_LINK.txt (TODO: Add before submission)
```

---

## 🔗 Final Summary Links

* **Live Application**: [https://dockflowteam.vercel.app](https://dockflowteam.vercel.app)
* **Backend API**: [https://docflow-0m70.onrender.com](https://docflow-0m70.onrender.com)
* **GitHub Repository**: [https://github.com/amitahir0201/DocFlow.git](https://github.com/amitahir0201/DocFlow.git)
* **Google Drive Submission**: TODO: Add before submission
* **Walkthrough Video**: TODO: Add before submission
