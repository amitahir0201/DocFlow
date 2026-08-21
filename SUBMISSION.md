# DocFlow — Ajaia LLC Assignment Submission

## Candidate Information
* **Name**: Ahir Amit
* **Assignment**: AI-Native Full Stack Developer Assignment
* **Application**: DocFlow (Simple collaborative documents for teams)

---

## Live Production URLs

* **Frontend (Vercel)**: `https://docflow-client.vercel.app`
* **Backend (Render)**: `https://docflow-server.onrender.com`
* **Health Check**: `https://docflow-server.onrender.com/api/health`

---

## Repository & Video Walkthrough

* **GitHub Repository**: To be added
* **Walkthrough Video**: To be added

---

## Demo Test Credentials

| Account | Email | Password |
|---|---|---|
| **User 1 (Primary Owner)** | `amit@example.com` | `Amit@123` |
| **User 2 (Collaborator)** | `rahul@example.com` | `Rahul@123` |

---

## Implemented Feature Checklist

- [x] **Authentication System**: JWT-based login, bcrypt password hashing, session restoration.
- [x] **Dashboard Workspace**: "My Documents" vs "Shared With Me" views, document cards, updated date formatting.
- [x] **Document CRUD**: Full creation, reading, updating, title renaming, and deletion.
- [x] **TipTap Rich Text Editor**: Bold, Italic, Underline, H1, H2, Bullet List, Numbered List formatting.
- [x] **Persistence**: Manual save button with real-time status badges (`Saved`, `Unsaved changes`, `Saving...`), persisting content HTML to MongoDB.
- [x] **File Import**: `.txt` and `.md` file upload via Multer, parsing text into rich-text documents with filename titles.
- [x] **Document Sharing**: Owner-managed document sharing by email, preventing duplicate or self-shares.
- [x] **Security & Access Control**: Enforced authorization matrix on backend for views, edits, shares, and deletes.
- [x] **Automated Testing**: 30 passing Vitest integration tests covering API endpoints and authorization boundaries.
- [x] **Production Deployment**: Vercel frontend, Render backend, and MongoDB Atlas database.

---

## Technical Stack Summary

```text
Frontend: React 19 + Vite 8 + Tailwind CSS v4 + TipTap
Backend: Node.js + Express.js
Database: MongoDB Atlas
Authentication: JWT + bcryptjs
File Upload: Multer (Memory Storage)
Testing: Vitest + Supertest
Deployment: Vercel + Render
```

---

## Key Engineering Decisions

1. **Simple REST Architecture**: Lightweight JSON API endpoints for predictability and ease of testing.
2. **HTML Content Format**: HTML strings simplify file importing, TipTap initialization, and database storage.
3. **Manual Save with Status Badges**: Provides explicit user control and avoids race conditions during typing.
4. **Backend Authorization Enforcement**: All security boundaries (`owner` vs `sharedWith`) are enforced strictly on the Express backend via verified JWT user IDs.
5. **Memory Buffer File Processing**: Multer memory storage eliminates temporary server disk cleanup while maintaining stateless cloud backend deployments.

---

## Known Scope Limitations

- **No Real-Time Collaboration**: Omitted per assignment timebox guidelines.
- **No Autosave**: Manual saving with status indicators is used to ensure stability and deterministic database writes.
- **No PDF/DOCX Export**: Import is focused exclusively on `.txt` and `.md` plain text formats.

---

## Future Improvements (With 2–4 Additional Hours)

1. Add real-time cursor presence and collaborative editing via WebSockets / Yjs.
2. Add inline comment threads and document version history restoration.
3. Add PDF and Markdown file export options directly from the editor header.
