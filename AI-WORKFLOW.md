# AI Workflow

## 1. AI Tools Used
* **Antigravity AI Agent** (Powered by Gemini 3.6 Flash High model)

---

## 2. How AI Was Used

AI was utilized throughout the development lifecycle to accelerate building the DocFlow MVP:
- **Full-Stack Scaffolding**: Fast generation of Express routes, Mongoose models, and React components.
- **TipTap Engine Setup**: Configuration of `@tiptap/react` StarterKit and Underline extensions.
- **File Parsing Utilities**: Development of `.txt` and `.md` buffer text parsing and HTML conversion.
- **Automated Testing Suite**: Scaffolding of 30 Vitest/Supertest integration tests (`auth.test.js`, `document.test.js`, `upload.test.js`, `share.test.js`).
- **UI Aesthetics & Styling**: Crafting clean Tailwind CSS v4 components with micro-interactions, responsive sidebars, and clear save status badges.
- **Debugging & Error Handling**: Diagnosing route collisions and CORS configuration.

---

## 3. Human Verification Protocol

AI output was never accepted blindly. All code was subjected to manual and automated verification:

```text
Requirement
     ↓
Decompose into small step
     ↓
AI implementation proposal
     ↓
Code inspection & syntax review
     ↓
Run backend & frontend locally
     ↓
Observe empirical output & logs
     ↓
Automated Vitest integration test execution
     ↓
Verify persistence & deployment
```

---

## 4. AI Output That Was Changed or Rejected

1. **AI Suggestion**: Store editor state as complex TipTap JSON ASTs in MongoDB.
   - **Decision**: **Rejected**. Storing standard HTML strings simplifies file imports, document rendering, and persistence verification.
2. **AI Suggestion**: Add WebSocket collaboration and debounced autosave on every keystroke.
   - **Decision**: **Rejected**. Explicitly out-of-scope for the MVP timebox; manual saving with clear status badges (`Saved`, `Unsaved changes`, `Saving...`) provides greater reliability.
3. **AI Suggestion**: Perform document filtering on the frontend.
   - **Decision**: **Rejected**. Enforced strict database-level query boundaries (`GET /api/documents` vs `GET /api/documents/shared`) and backend JWT authorization checks.

---

## 5. Correctness Verification

Correctness was verified empirically across 6 key layers:
1. **Automated Unit & Integration Tests**: 30 passing Vitest/Supertest test cases covering authentication, CRUD, file uploads, and authorization boundaries.
2. **MongoDB Persistence Verification**: Confirmed document changes persist across database restarts.
3. **Frontend Production Build**: Tested Vite production build (`npm run build`) ensuring zero compiler or syntax errors.
4. **Security & Authorization Verification**: Verified non-owners receive HTTP 403 Forbidden on unauthorized single document reads, edits, shares, or deletes.
5. **Vercel SPA Routing**: Verified direct browser page refreshes on `/login`, `/dashboard`, and `/document/:id` load correctly without 404 errors.
6. **Live Production Testing**: End-to-end execution of user login, document creation, rich text formatting, file importing, and document sharing on deployed Vercel and Render environments.

---

## 6. AI Philosophy

AI served as a development accelerator and pair programming assistant. All generated code was thoroughly inspected, executed, tested, and modified before being integrated into the codebase.
