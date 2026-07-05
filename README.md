# Angular CRUD System - Full Stack Assessment

This repository contains a full-stack CRUD application built with Angular 18 (standalone, reactive forms) and a Node.js/Express backend backed by PostgreSQL (using Sequelize ORM).

## Project Structure

- `/frontend`: Angular 18 application (standalone components, strictly typed).
- `/backend`: Node.js Express API (plain JS).
- `/postman`: Postman collection for testing the API.

## Design Decisions

1. **Angular v18 vs v22**: Used v18 to ensure stability and compatibility, avoiding brand new v22 APIs (Zoneless, signals) which lack deep community troubleshooting history. 
2. **Sequelize over Prisma**: As requested, switched to Sequelize ORM using plain `define()` API rather than decorators.
3. **Dual Pool Strategy**: Used Sequelize for standard CRUD, but bypassed it for raw `pg` queries combined with `pg-query-stream` and `exceljs` streams for report generation to maintain O(1) memory usage regardless of dataset size.
4. **Async Bulk Upload**: Instead of blocking the HTTP response while parsing a large CSV/Excel file, the endpoint immediately returns `202 Accepted` with a Job ID. Background processing uses an `EventEmitter` based queue. The frontend polls for status updates via a separate endpoint using RxJS `switchMap` and `takeWhile`.
5. **Server-Side Pagination & Search**: To ensure performance at scale, the backend implements proper `LIMIT/OFFSET` pagination with cross-table search capabilities (`ILIKE`) that the frontend consumes.

## Setup Instructions

### 1. Database Setup
Ensure PostgreSQL is installed and running. Create a database named `augmont_crud`:
\`\`\`bash
createdb augmont_crud
\`\`\`

### 2. Startup Servers
You can easily start both the backend and frontend at the exact same time using the root directory command:
\`\`\`bash
cd d:\augmont-sumit
npm run dev
\`\`\`

- The backend will run on http://localhost:3000
- The frontend will run on http://localhost:4200 (Open this in your browser!)

*(If this is a fresh clone, you can run `npm run install:all` from the root folder first to install dependencies for the root, backend, and frontend all at once).*

### 3. Database Setup (If not already done)

### 4. Running Tests
**Backend Tests:**
\`\`\`bash
cd backend
npm test
\`\`\`

## Features

- **Auth:** JWT-based login and registration.
- **Categories:** Full CRUD. Deleting a category with associated products is blocked.
- **Products:** Full CRUD with image upload via `multer`.
- **Bulk Upload:** Async CSV/Excel product upload with background processing and polling.
- **Reports:** Streaming CSV and XLSX report generation with O(1) memory footprint.
