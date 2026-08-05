# MirrorMatch

Photo guessing game: upload a photo, others guess who is in it, points on
the leaderboard. Next.js, PostgreSQL, Prisma, NextAuth.

Status: active. MIT. See [LICENSE](LICENSE).

## Setup

```bash
cd mirrormatch   # or mirror_match
npm install
cp .env.example .env   # if present; otherwise create .env
```

Required env (placeholders):

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mirrormatch?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
# Production email:
# SMTP_HOST= SMTP_PORT= SMTP_USER= SMTP_PASSWORD= SMTP_FROM=
```

```bash
npm run db:generate
npm run db:migrate   # or npm run db:push for quick local
npm run db:seed      # default admin: admin@mirrormatch.com / admin123 — change it
npm run dev          # http://localhost:3000
```

Dev mail can use Ethereal or console; SMTP is for production.

## What it does

- Admin creates users (email/password)
- Users upload photos with an answer name
- Others guess for points; leaderboard ranks scores
- Optional email when new photos land
- Profile: view points, change password

## Docs

| Doc | Purpose |
|-----|---------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Design |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Conventions |
| [SECURITY.md](SECURITY.md) | Security practices |
| [TESTING.md](TESTING.md) | Tests |
| `.cursor/rules/mirrormatch.mdc` | Agent rules |

## Production

```bash
NODE_ENV=production npm run build && npm start
```

Set real `NEXTAUTH_SECRET`, SMTP, and rotate the seeded admin password.
