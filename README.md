# Collaborative Editor

A production-minded coding assignment slice for a lightweight collaborative document editor inspired by Google Docs.

## Features

- Create, rename, edit, and persist rich-text documents with TipTap JSON content
- Debounced autosave after 2 seconds
- Import `.txt` and `.md` files into new documents and store the uploaded file locally in `/uploads`
- Simulated user switching with seeded users
- Share documents by email with `viewer` or `editor` access
- Typed API routes backed by a service layer and Prisma/PostgreSQL
- Zod validation and consistent JSON API responses
- Jest coverage for `documentService.createDocument()`

## Stack

- Next.js App Router
- TypeScript
- PostgreSQL
- Prisma ORM
- Tailwind CSS
- TipTap
- Zod
- Jest

## Architecture

The app follows this flow throughout the product:

`UI -> API Route -> Service Layer -> Prisma -> PostgreSQL`

The UI never talks directly to the database.

## Local Setup

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Then open `http://localhost:3000`.

## Seeded Users

- `user1@example.com`
- `user2@example.com`

Use the user selector in the header to simulate authentication.

## Key Routes

- `/documents`
- `/documents/new`
- `/documents/[id]`
- `/shared`

## API Routes

- `GET /api/documents`
- `POST /api/documents`
- `GET /api/documents/:id`
- `PUT /api/documents/:id`
- `POST /api/upload`
- `POST /api/share`
- `GET /api/users`

## Testing

```bash
npm test
```

## Notes

- Uploads are stored on the local filesystem in `/uploads`
- Supported imports are `.txt` and `.md`
- Real auth, realtime collaboration, and advanced permissions are intentionally out of scope for this assignment
