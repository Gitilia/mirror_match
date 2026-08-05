# MirrorMatch

A photo guessing game where users upload photos and other users guess who is in the picture to earn points. Built with Next.js, PostgreSQL, and NextAuth.

## Important: Read Documentation First

**Before making code changes, please read:**
- **`.cursor/rules/mirrormatch.mdc`** - Project rules and guidelines
- **`ARCHITECTURE.md`** - System design and data flows
- **`CONTRIBUTING.md`** - Coding conventions and workflow
- **`SECURITY.md`** - Security practices
- **This README** - Setup and usage

**Keep documentation updated:** When you modify code that changes behavior or architecture, update the relevant documentation files to keep them in sync.

## Features

- **User Management**: Admin can create users with email/password authentication
- **Photo Upload**: Users can upload photos with answer names
- **Guessing Game**: Users guess who is in photos to earn points
- **Email Notifications**: Users receive emails when new photos are uploaded
- **Leaderboard**: Track user points and rankings
- **Profile Management**: Users can view their points and change passwords

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js (Credentials Provider)
- **Styling**: Tailwind CSS
- **Email**: Nodemailer (Ethereal in dev, SMTP in production)

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or remote)
- For production: SMTP email server credentials

## Installation

1. **Clone the repository** (if applicable) or navigate to the project directory:
   ```bash
   cd mirrormatch
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/mirrormatch?schema=public"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"

   # Email Configuration (for production)
   SMTP_HOST="smtp.example.com"
   SMTP_PORT="587"
   SMTP_USER="your-email@example.com"
   SMTP_PASSWORD="your-email-password"
   SMTP_FROM="MirrorMatch <noreply@mirrormatch.com>"
   ```

   **Generate NEXTAUTH_SECRET**:
   ```bash
   openssl rand -base64 32
   ```

   **Note**: In development, emails will use Ethereal (test emails) or console logging. No SMTP config is needed for dev mode.

4. **Set up the database**:
   ```bash
   # Generate Prisma Client
   npm run db:generate

   # Run migrations
   npm run db:migrate

   # Or push schema directly (for development)
   npm run db:push
   ```

5. **Seed the database** (creates default admin user):
   ```bash
   npm run db:seed
   ```

   This creates an admin user with:
   - Email: `admin@mirrormatch.com`
   - Password: `admin123`
   - **⚠️ Important**: Change this password after first login!

## Basic Usage

### Workflow Overview

1. **Admin creates users:**
   - Admin logs in and navigates to `/admin`
   - Creates new users with email, password, and role
   - Users receive temporary passwords

2. **Users log in:**
   - Users navigate to `/login`
   - Enter email and password
   - Access the main application

3. **Users upload photos:**
   - Navigate to `/upload`
   - Enter photo URL and answer name (the correct name to guess)
   - Photo is saved and emails are sent to all other users

4. **Users guess photos:**
   - View photos on `/photos` page
   - Click a photo to view details
   - Submit guesses for who is in the photo
   - Earn points for correct guesses (case-insensitive matching)

5. **Leaderboard:**
   - View rankings on `/leaderboard` page
   - See all users sorted by points
   - Track your own position

### Key Features

- **Admin Panel:** Create and manage users, reset passwords
- **Photo Upload:** Upload photos with answer names
- **Guessing System:** Submit guesses and earn points
- **Email Notifications:** Get notified when new photos are uploaded
- **Leaderboard:** Track user rankings by points
- **Profile Management:** View points and change password

## Running the Application

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production

```bash
npm run build
npm start
```

### Deployment Notes

**Important Configuration:**
- Ensure `NODE_ENV=production` is set in production
- Set `NEXTAUTH_URL` to your production domain (e.g., `https://yourdomain.com`)
- Set `AUTH_TRUST_HOST=true` if using reverse proxy
- Ensure `DATABASE_URL` points to your production database
- Files are stored in `public/uploads/` directory - ensure this directory persists across deployments

**File Uploads:**
- Photos are uploaded to `public/uploads/` directory
- Files are served via `/api/uploads/[filename]` API route
- Ensure the uploads directory has proper write permissions

**Upload Endpoints:**
- `POST /api/photos/upload` - Single photo upload (supports both file and URL uploads)
- `POST /api/photos/upload-multiple` - Multiple photo uploads in batch (used by upload page)
- Files are stored on the filesystem (not in database)

**Monitoring Activity:**
- User activity is logged to console/systemd logs
- Watch logs in real-time: `sudo journalctl -u app-backend -f | grep -E "\[ACTIVITY\]|\[PHOTO_UPLOAD\]|\[GUESS_SUBMIT\]"`
- Activity logs include: page visits, photo uploads, guess submissions
- **Note:** For local development, use `./watch-activity.sh` script (if systemd/journalctl is not available, check application logs directly)

## Database Commands

- `npm run db:generate` - Generate Prisma Client
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema changes to database (dev only)
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:seed` - Seed database with initial admin user

### Querying the Database

**Get all photo answers:**
```bash
psql "postgresql://user:password@host:5432/database" -c "SELECT \"answerName\" FROM \"Photo\" ORDER BY \"createdAt\" DESC;"
```

**Get answers with uploader info:**
```bash
psql "postgresql://user:password@host:5432/database" -c "SELECT p.\"answerName\", p.url, u.name as uploader, p.\"createdAt\" FROM \"Photo\" p JOIN \"User\" u ON p.\"uploaderId\" = u.id ORDER BY p.\"createdAt\" DESC;"
```

## Creating the First Admin User

The seed script automatically creates an admin user. If you need to create one manually:

1. Run the seed script: `npm run db:seed`
2. Or use Prisma Studio: `npm run db:studio` and create a user with `role: "ADMIN"`

## Project Structure

```
mirrormatch/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── admin/        # Admin API routes
│   │   ├── auth/         # NextAuth routes
│   │   ├── photos/       # Photo-related API routes
│   │   └── profile/      # Profile API routes
│   ├── admin/            # Admin panel page
│   ├── leaderboard/      # Leaderboard page
│   ├── login/            # Login page
│   ├── photos/           # Photos listing and detail pages
│   ├── profile/          # User profile page
│   └── upload/           # Photo upload page
├── components/            # React components
├── lib/                   # Utility libraries
│   ├── auth.ts           # NextAuth configuration
│   ├── email.ts          # Email sending utilities
│   ├── prisma.ts         # Prisma client instance
│   └── utils.ts          # Helper functions
├── prisma/                # Prisma schema and migrations
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seed script
└── types/                 # TypeScript type definitions
```

## Features Overview

### Authentication
- Email/password login via NextAuth
- Protected routes with middleware
- Role-based access control (ADMIN/USER)

### Admin Panel (`/admin`)
- View all users
- Create new users
- Reset user passwords
- View user points and roles

### Photo Upload (`/upload`)
- Upload photos via file upload or URL
- Files are stored in `public/uploads/` directory
- Files are served via `/api/uploads/[filename]` API route
- Set answer name for guessing
- Automatically sends email notifications to all other users
- Duplicate file detection (SHA256 hash)

### Photo Guessing (`/photos/[id]`)
- View photo and uploader info
- Submit guesses
- Get instant feedback (correct/wrong)
- Earn points for correct guesses
- Case-insensitive matching

### Leaderboard (`/leaderboard`)
- View all users ranked by points
- See your own ranking highlighted

### Profile (`/profile`)
- View your points and account info
- Change password (requires current password)

## Email Configuration

### Development
In development mode, the app uses:
- **Ethereal Email** (if available) - provides test email accounts with preview URLs
- **Console transport** (fallback) - logs emails to console

Check the console for email preview URLs when using Ethereal.

### Production
Set up SMTP credentials in `.env`:
- `SMTP_HOST` - Your SMTP server hostname
- `SMTP_PORT` - SMTP port (usually 587 for TLS, 465 for SSL)
- `SMTP_USER` - SMTP username
- `SMTP_PASSWORD` - SMTP password
- `SMTP_FROM` - From address for emails

## Security Notes

- Passwords are hashed using bcrypt
- NextAuth handles session management
- Middleware protects routes
- Admin routes are restricted to ADMIN role
- SQL injection protection via Prisma

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check database exists and user has permissions

### Email Not Sending
- In dev: Check console for Ethereal preview URLs
- In production: Verify SMTP credentials
- Check email service logs

### Authentication Issues
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your app URL
- Set `AUTH_TRUST_HOST=true` if using reverse proxy
- Clear browser cookies if needed
- Check middleware logs: `sudo journalctl -u app-backend | grep "Middleware"`

### Photo Upload Issues
- Verify `public/uploads/` directory exists and has write permissions
- Check file upload logs: `sudo journalctl -u app-backend | grep "UPLOAD"`
- Ensure files are being saved: check `public/uploads/` directory
- Files are served via `/api/uploads/[filename]` - verify API route is accessible

### Build Issues
- If build fails with `DATABASE_URL not set`, this is expected - Prisma initialization is lazy
- Ensure all environment variables are set in production
- Check for TypeScript errors: `npm run type-check`

## Documentation

This project maintains comprehensive documentation:

- **README.md** (this file) - Setup, installation, and basic usage
- **ARCHITECTURE.md** - System architecture, data models, and application flows
- **CONTRIBUTING.md** - Coding conventions and development workflow
- **SECURITY.md** - Security practices and vulnerability reporting
- **.cursor/rules/mirrormatch.mdc** - Project rules for AI tools and developers

**For Developers and AI Tools:**

**⚠️ Important:** Before making code changes, read `.cursor/rules/mirrormatch.mdc`, `ARCHITECTURE.md`, `CONTRIBUTING.md`, `SECURITY.md`, and this README. Keep them updated when behavior or architecture changes.

- Always read the relevant documentation before making changes
- Update documentation when behavior or architecture changes
- Keep all documentation files in sync with code changes
- Follow the guidelines in each document

## License

MIT
