# Testing Guide for MirrorMatch

This guide will help you set up and test the MirrorMatch application locally.

## Prerequisites Check

Before starting, ensure you have:

- **Node.js 18+** installed (`node --version`)
- **npm** installed (`npm --version`)
- **PostgreSQL** installed and running (`psql --version`)
- **Git** (if cloning the repository)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd mirrormatch
npm install
```

This installs all required packages including Next.js, Prisma, NextAuth, etc.

### 2. Set Up PostgreSQL Database

**Option A: Using Docker (Recommended for Quick Testing)**

```bash
# Start PostgreSQL in Docker
docker run --name mirrormatch-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=mirrormatch \
  -p 5432:5432 \
  -d postgres:15

# Wait a few seconds for PostgreSQL to start
```

**Option B: Local PostgreSQL Installation**

```bash
# Create database (if not exists)
createdb mirrormatch

# Or using psql
psql -U postgres -c "CREATE DATABASE mirrormatch;"
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp env.example .env
```

Then edit `.env` and update the following:

```env
# Database - Update with your PostgreSQL credentials
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mirrormatch?schema=public"

# NextAuth - Generate a secret key
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Email (optional for dev - uses Ethereal by default)
# Leave SMTP settings empty for development
```

**Generate NEXTAUTH_SECRET:**

```bash
openssl rand -base64 32
```

Copy the output and paste it as the `NEXTAUTH_SECRET` value in `.env`.

### 4. Set Up Database Schema

```bash
# Generate Prisma Client
npm run db:generate

# Create database tables (choose one method)
npm run db:migrate    # Creates migration files (recommended)
# OR
npm run db:push       # Pushes schema directly (faster for dev)
```

### 5. Seed Initial Data

```bash
npm run db:seed
```

This creates the default admin user:
- **Email:** `admin@mirrormatch.com`
- **Password:** `admin123`

 **Important:** Change this password after first login!

### 6. Start the Development Server

```bash
npm run dev
```

The app should start at [http://localhost:3000](http://localhost:3000)

## Testing the Application

### Initial Login

1. Open [http://localhost:3000](http://localhost:3000)
2. You'll be redirected to `/login`
3. Login with:
   - Email: `admin@mirrormatch.com`
   - Password: `admin123`

### Test Admin Features

1. **Navigate to Admin Panel:**
   - Click "Admin" in the navigation bar
   - You should see the admin panel

2. **Create a Test User:**
   - Fill in the form:
     - Name: `Test User`
     - Email: `test@example.com`
     - Password: `test123`
     - Role: `USER`
   - Click "Create User"
   - Verify the user appears in the user list

3. **Reset Password:**
   - In the user list, enter a new password for any user
   - Click "Reset"
   - Verify success message

### Test User Features

1. **Logout and Login as Test User:**
   - Click "Logout"
   - Login with `test@example.com` / `test123`

2. **Upload a Photo:**
   - Navigate to "Upload" in the navigation
   - Enter a photo URL (e.g., `https://via.placeholder.com/800x600`)
   - Enter an answer name (e.g., `John Doe`)
   - Click "Upload Photo"
   - Check the console for email notification logs (dev mode)

3. **View Photos:**
   - Navigate to "Photos"
   - You should see the uploaded photo
   - Click on a photo to view details

4. **Submit a Guess:**
   - On a photo detail page, enter a guess
   - Try wrong guess first (e.g., `Jane Doe`)
   - See "Wrong guess" message
   - Try correct guess (e.g., `John Doe`)
   - See "Correct!" message and points increment

5. **Check Leaderboard:**
   - Navigate to "Leaderboard"
   - Verify users are ranked by points
   - Your user should be highlighted

6. **Change Password:**
   - Navigate to "Profile"
   - Scroll to "Change Password"
   - Enter current password and new password
   - Verify success message

### Test Email Notifications (Development)

In development mode, emails use Ethereal Email:

1. **Upload a photo** as one user
2. **Check the console** for email logs
3. Look for a message like:
   ```
   Email sent (dev mode):
   Preview URL: https://ethereal.email/message/...
   ```
4. **Open the preview URL** to see the email

## Common Issues and Solutions

### Database Connection Error

**Error:** `Can't reach database server`

**Solutions:**
- Verify PostgreSQL is running: `pg_isready` or `docker ps`
- Check `DATABASE_URL` in `.env` matches your PostgreSQL setup
- Ensure database exists: `psql -l | grep mirrormatch`

### Prisma Client Not Generated

**Error:** `@prisma/client did not initialize yet`

**Solution:**
```bash
npm run db:generate
```

### Migration Errors

**Error:** `Migration failed`

**Solutions:**
- Reset database ( deletes all data):
  ```bash
  npm run db:push -- --force-reset
  ```
- Or create fresh migration:
  ```bash
  npm run db:migrate
  ```

### NextAuth Secret Missing

**Error:** `NEXTAUTH_SECRET is not set`

**Solution:**
- Generate secret: `openssl rand -base64 32`
- Add to `.env`: `NEXTAUTH_SECRET="generated-secret"`

### Port Already in Use

**Error:** `Port 3000 is already in use`

**Solutions:**
- Kill the process using port 3000:
  ```bash
  lsof -ti:3000 | xargs kill -9
  ```
- Or change port in `package.json` dev script

## Testing Checklist

Use this checklist to verify all features:

- [ ] Admin can login
- [ ] Admin can create users
- [ ] Admin can reset user passwords
- [ ] Regular user can login
- [ ] User can upload photos
- [ ] Email notifications are sent (check console)
- [ ] User can view photos list
- [ ] User can view photo details
- [ ] User can submit guesses
- [ ] Wrong guesses show error message
- [ ] Correct guesses award points
- [ ] Leaderboard shows users ranked by points
- [ ] User can change password
- [ ] User can logout
- [ ] Protected routes require authentication
- [ ] Admin routes require ADMIN role

## Database Management

### View Database in Prisma Studio

```bash
npm run db:studio
```

Opens a GUI at [http://localhost:5555](http://localhost:5555) to browse and edit data.

### Reset Database

 **Warning:** This deletes all data!

```bash
npm run db:push -- --force-reset
npm run db:seed
```

### View Database Schema

```bash
cat prisma/schema.prisma
```

## Development Tips

1. **Hot Reload:** Next.js automatically reloads on file changes
2. **Console Logs:** Check browser console and terminal for errors
3. **Database Changes:** After modifying `schema.prisma`, run:
   ```bash
   npm run db:generate
   npm run db:push
   ```
4. **Email Testing:** In dev mode, emails are logged to console or use Ethereal preview URLs

## Next Steps

After testing locally:

1. Review the codebase structure
2. Read `ARCHITECTURE.md` for system design
3. Read `CONTRIBUTING.md` for coding conventions
4. Read `SECURITY.md` for security practices
5. Start developing new features!

## Getting Help

- Check `README.md` for general setup
- Check `ARCHITECTURE.md` for system design questions
- Check `CONTRIBUTING.md` for development workflow
- Check console/terminal for error messages

---

**Happy Testing! **
