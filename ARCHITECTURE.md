# MirrorMatch Architecture

## Overview

MirrorMatch is a photo guessing game built with Next.js App Router, PostgreSQL, and NextAuth. Users upload photos with answer names, and other users guess to earn points.

## System Architecture

### Application Structure

```
mirrormatch/
├── app/                    # Next.js App Router
│   ├── api/               # API route handlers (Next.js route handlers)
│   │   ├── admin/        # Admin-only API endpoints
│   │   ├── auth/         # NextAuth routes
│   │   ├── photos/       # Photo-related APIs
│   │   └── profile/      # User profile APIs
│   ├── admin/            # Admin panel (server component)
│   ├── leaderboard/      # Leaderboard page (server component)
│   ├── login/            # Login page (client component)
│   ├── photos/           # Photo listing and detail pages
│   ├── profile/          # User profile page (server component)
│   └── upload/           # Photo upload page (client component)
├── components/            # Reusable React components
│   ├── Navigation.tsx   # Navigation bar (client component)
│   └── [others]         # Form components, UI components
├── lib/                   # Utility libraries and helpers
│   ├── prisma.ts        # Prisma client singleton (lazy initialization)
│   ├── auth.ts          # NextAuth configuration
│   ├── email.ts         # Email sending utilities
│   ├── utils.ts         # Helper functions (hashing, etc.)
│   └── activity-log.ts  # Activity logging utility
├── prisma/                # Database schema and migrations
│   ├── schema.prisma     # Prisma schema definition
│   └── seed.ts          # Database seeding script
├── types/                 # TypeScript type definitions
│   └── next-auth.d.ts   # NextAuth type extensions
├── proxy.ts              # Next.js proxy/middleware for route protection (Next.js 16)
└── lib/
    └── activity-log.ts  # Activity logging utility
```

## Data Model

### Database Schema

#### User Model
```prisma
model User {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  passwordHash String
  role         Role     @default(USER)
  points       Int      @default(0)
  createdAt    DateTime @default(now())
  
  uploadedPhotos Photo[] @relation("PhotoUploader")
  guesses        Guess[]
}
```

**Fields:**
- `id`: Unique identifier (CUID)
- `name`: User's display name
- `email`: Unique email address (used for login)
- `passwordHash`: Bcrypt-hashed password (never exposed)
- `role`: Either "ADMIN" or "USER"
- `points`: Accumulated points from correct guesses
- `createdAt`: Account creation timestamp

**Relations:**
- `uploadedPhotos`: All photos uploaded by this user
- `guesses`: All guesses made by this user

#### Photo Model
```prisma
model Photo {
  id          String   @id @default(cuid())
  uploaderId  String
  uploader    User     @relation("PhotoUploader", fields: [uploaderId], references: [id])
  url         String
  answerName  String
  createdAt   DateTime @default(now())
  
  guesses     Guess[]
}
```

**Fields:**
- `id`: Unique identifier (CUID)
- `uploaderId`: Foreign key to User who uploaded
- `url`: URL to the photo image
- `answerName`: The correct answer users should guess
- `createdAt`: Upload timestamp

**Relations:**
- `uploader`: The User who uploaded this photo
- `guesses`: All guesses made for this photo

#### Guess Model
```prisma
model Guess {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  photoId    String
  photo      Photo    @relation(fields: [photoId], references: [id])
  guessText  String
  correct    Boolean  @default(false)
  createdAt  DateTime @default(now())
  
  @@index([userId])
  @@index([photoId])
}
```

**Fields:**
- `id`: Unique identifier (CUID)
- `userId`: Foreign key to User who made the guess
- `photoId`: Foreign key to Photo being guessed
- `guessText`: The user's guess text
- `correct`: Whether the guess matches the answer (case-insensitive)
- `createdAt`: Guess timestamp

**Relations:**
- `user`: The User who made this guess
- `photo`: The Photo being guessed

**Indexes:**
- Indexed on `userId` for fast user guess queries
- Indexed on `photoId` for fast photo guess queries

## Authentication Flow

### NextAuth Configuration

**Location:** `lib/auth.ts`

**Provider:** Credentials Provider (email + password)

**Flow:**
1. User submits email and password on `/login`
2. NextAuth calls `authorize` function
3. System looks up user by email in database
4. Compares provided password with stored `passwordHash` using bcrypt
5. If valid, creates JWT session with user data (id, email, name, role)
6. Session stored in JWT (no database session table)

**Session Data:**
- `id`: User ID
- `email`: User email
- `name`: User name
- `role`: User role (ADMIN | USER)

### Route Protection

**Location:** `proxy.ts` (Next.js 16 uses `proxy.ts` instead of `middleware.ts`)

**Public Routes:**
- `/login`
- `/api/auth/*` (NextAuth endpoints)
- `/uploads/*` (uploaded files - legacy, now served via API)
- `/api/uploads/*` (uploaded files served via API route)

**Protected Routes:**
- All other routes require authentication
- `/admin/*` routes additionally require `role === "ADMIN"`

**Implementation:**
- Uses NextAuth `getToken` from `next-auth/jwt` in Edge runtime
- Checks JWT token on each request via `proxy.ts`
- Explicitly specifies cookie name: `__Secure-authjs.session-token`
- Redirects unauthenticated users to `/login` with `callbackUrl`
- Redirects non-admin users trying to access admin routes to home
- Logs all user activity (page visits, API calls)

**Activity Logging:**
- All authenticated requests are logged with user info, IP, path, method
- Unauthenticated access attempts are also logged
- Photo uploads and guess submissions have dedicated activity logs
- Logs format: `[ACTIVITY] timestamp | method path | User: email (role) | IP: ip`

## Application Flows

### 1. Admin Creates User

**Flow:**
1. Admin navigates to `/admin`
2. Fills out user creation form (name, email, password, role)
3. Form submits to `POST /api/admin/users`
4. API route:
   - Verifies admin session
   - Checks if email already exists
   - Hashes password with bcrypt
   - Creates User record in database
5. Admin sees new user in user list

**API Route:** `app/api/admin/users/route.ts`
**Component:** `components/CreateUserForm.tsx`

### 2. User Login

**Flow:**
1. User navigates to `/login`
2. Enters email and password
3. Client calls NextAuth `signIn("credentials", ...)`
4. NextAuth validates credentials via `lib/auth.ts`
5. On success, redirects to `/photos`
6. Session stored in JWT cookie

**Page:** `app/login/page.tsx` (client component)

### 3. User Changes Password

**Flow:**
1. User navigates to `/profile`
2. Enters current password and new password
3. Form submits to `POST /api/profile/change-password`
4. API route:
   - Verifies session
   - Validates current password against stored hash
   - Hashes new password
   - Updates User record
5. User sees success message

**API Route:** `app/api/profile/change-password/route.ts`
**Component:** `components/ChangePasswordForm.tsx`

### 4. Photo Upload

**Flow:**
1. User navigates to `/upload`
2. Uploads photo file or enters photo URL and answer name
3. Form submits to `POST /api/photos/upload` (file upload) or `POST /api/photos` (URL)
4. API route:
   - Verifies session
   - For file uploads:
     - Validates file type and size (max 10MB)
     - Calculates SHA256 hash for duplicate detection
     - Generates unique filename: `timestamp-randomstring.extension`
     - Saves file to `public/uploads/` directory
     - Sets photo URL to `/api/uploads/[filename]`
   - For URL uploads:
     - Validates URL format
     - Checks for duplicate URLs
     - Uses provided URL directly
   - Creates Photo record with `uploaderId`, `url`, `answerName`, `fileHash`
   - Queries all other users (excluding uploader)
   - Sends email notifications to all other users (async, non-blocking)
   - Logs activity: `[PHOTO_UPLOAD]`
5. User redirected to photo detail page

**API Routes:**
- `app/api/photos/upload/route.ts` - File upload endpoint
- `app/api/photos/route.ts` - URL upload endpoint (legacy)
- `app/api/uploads/[filename]/route.ts` - Serves uploaded files

**File Storage:**
- Files stored in `public/uploads/` directory
- Served via `/api/uploads/[filename]` API route
- Files verified after write to ensure successful save
- Duplicate detection via SHA256 hash

**Email:** `lib/email.ts` - `sendNewPhotoEmail()`
**Page:** `app/upload/page.tsx` (client component)

### 5. Email Notifications

**Implementation:** `lib/email.ts`

**Development Mode:**
- Uses Ethereal Email (test SMTP service)
- Provides preview URLs in console
- Falls back to console transport if Ethereal unavailable

**Production Mode:**
- Uses SMTP server (configured via env vars)
- Sends HTML and plaintext emails
- Includes link to photo guess page

**Email Content:**
- Subject: "New Photo Ready to Guess!"
- Body: Includes uploader name, link to `/photos/[id]`
- Sent asynchronously (doesn't block photo creation)

### 6. Guess Submission

**Flow:**
1. User views photo at `/photos/[id]`
2. User enters guess text
3. Form submits to `POST /api/photos/[photoId]/guess`
4. API route:
   - Verifies session
   - Checks if user already has correct guess (prevent duplicate points)
   - Prevents users from guessing their own photos
   - Normalizes guess text and answer (trim, lowercase)
   - Compares normalized strings
   - Creates Guess record with `correct` boolean
   - If correct: increments user's points by photo's `points` value
   - If wrong and penalty enabled: deducts penalty points
   - Logs activity: `[GUESS_SUBMIT]` with result
5. Page refreshes to show feedback

**API Route:** `app/api/photos/[photoId]/guess/route.ts`
**Component:** `components/GuessForm.tsx`
**Page:** `app/photos/[id]/page.tsx` (server component)

**Guess Matching:**
- Case-insensitive comparison
- Trims whitespace
- Exact match required (no fuzzy matching)
- Points awarded based on photo's `points` field (default: 1)

### 7. Leaderboard

**Flow:**
1. User navigates to `/leaderboard`
2. Server component queries all users
3. Orders by `points DESC`
4. Renders table with rank, name, email, points
5. Highlights current user's row

**Page:** `app/leaderboard/page.tsx` (server component)
**Query:** `prisma.user.findMany({ orderBy: { points: "desc" } })`

## Code Organization Guidelines

### Where to Put Code

**Server Actions:**
- Use Next.js route handlers (`app/api/*/route.ts`) for API endpoints
- Consider server actions (`app/actions.ts`) for form submissions if preferred pattern

**Route Handlers:**
- All API endpoints in `app/api/*/route.ts`
- Use `GET`, `POST`, `PUT`, `DELETE` exports as needed
- Always verify session and authorization
- Return JSON responses

**Shared Utilities:**
- Database access: `lib/prisma.ts` (Prisma client singleton)
- Auth config: `lib/auth.ts`
- Email: `lib/email.ts`
- General helpers: `lib/utils.ts` (hashing, string normalization, etc.)

**Components:**
- Reusable UI components: `components/`
- Page-specific components can live in `app/[page]/` if not reused
- Prefer server components, use `"use client"` only when needed

**Type Definitions:**
- NextAuth types: `types/next-auth.d.ts`
- Shared types: `types/` directory
- Component prop types: inline or in component file

## Database Access Pattern

**Always use Prisma:**
```typescript
import { prisma } from "@/lib/prisma"

// Example query
const user = await prisma.user.findUnique({
  where: { email: "user@example.com" }
})
```

**Never:**
- Use raw SQL queries
- Use other ORMs
- Access database directly without Prisma

## Security Considerations

### Password Security
- All passwords hashed with bcrypt (10 rounds)
- Password hashes never exposed in API responses
- Password changes require current password verification

### Authorization
- All mutations check user session
- Admin routes verify `role === "ADMIN"`
- Users can only modify their own data (except admins)
- Photo uploads require authentication
- Guess submissions require authentication

### Input Validation
- Validate all user inputs
- Sanitize before database operations
- Use Prisma's type safety to prevent SQL injection
- Normalize guess text before comparison

## Important Notes

- **Always read this document and README.md before making architectural changes**
- **Update this document when adding new features or changing data flows**
- **Keep documentation in sync with code changes**
- **Follow established patterns for consistency**

---

**Last Updated:** When architecture changes, update this file and notify the team.
