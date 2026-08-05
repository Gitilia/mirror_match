# Security Policy

## Supported Versions

We actively support security updates for the current version of MirrorMatch. Please report vulnerabilities for the latest codebase.

## Reporting a Vulnerability

If you discover a security vulnerability in MirrorMatch, please report it responsibly:

**Email:** [Add your security contact email here]
**Subject:** Security Vulnerability in MirrorMatch

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if available)

We will acknowledge receipt within 48 hours and provide an update on the status of the vulnerability within 7 days.

**Please do not:**
- Open public GitHub issues for security vulnerabilities
- Discuss vulnerabilities publicly until they are resolved
- Use security vulnerabilities for malicious purposes

## Security Practices

### Secret Management

**Never commit secrets to the repository:**
- Database connection strings
- API keys
- Passwords
- NEXTAUTH_SECRET
- SMTP credentials
- Any other sensitive information

**Use environment variables:**
- Store all secrets in `.env` file (not committed)
- Use `env.example` as a template (no real secrets)
- Never log secrets or include them in error messages

### Password Security

**Password Hashing:**
- All passwords are hashed using **bcrypt** with 10 rounds
- Never store plain text passwords
- Never log passwords or password hashes
- Use the `hashPassword()` function from `lib/utils.ts` for all password hashing

**Password Validation:**
- Require minimum password length (currently 6 characters)
- Consider adding strength requirements in the future
- Always validate passwords on the server side

**Password Exposure:**
- Never return password hashes in API responses
- Never include passwords in logs or error messages
- Use secure password reset flows (if implemented)

### Authentication & Authorization

**Session Management:**
- Use NextAuth.js for session management
- Sessions stored in JWT tokens (no database session table)
- JWT tokens include user ID, email, name, and role
- Never trust client-provided user IDs - always use session data

**Route Protection:**
- All app routes (except `/login`) require authentication
- Admin routes (`/admin/*`) require `role === "ADMIN"`
- Middleware enforces authentication and authorization
- API routes must verify session before processing requests

**Authorization Checks:**
- Users can only modify their own data (except admins)
- Admins can modify any user data
- Photo uploads require authentication
- Guess submissions require authentication
- Always verify user identity from session, not from request body

### Input Validation

**Validate All Inputs:**
- Validate all user inputs on the server side
- Never trust client-side validation alone
- Sanitize inputs before database operations
- Use Prisma's type safety to prevent SQL injection

**Input Sanitization:**
- Trim whitespace from text inputs
- Normalize strings before comparison (case-insensitive matching)
- Validate email formats
- Validate URL formats for photo uploads
- Check for required fields

### Database Security

**SQL Injection Prevention:**
- Use Prisma ORM exclusively - never write raw SQL
- Prisma provides parameterized queries automatically
- Never concatenate user input into SQL queries

**Database Access:**
- Use the Prisma client singleton from `lib/prisma.ts`
- Never expose database credentials
- Use connection pooling (handled by Prisma)
- Limit database user permissions in production

### API Security

**API Route Protection:**
- All API routes must verify user session
- Check authorization before processing mutations
- Return appropriate error messages (don't leak information)
- Use HTTP status codes correctly (401 for unauthorized, 403 for forbidden)

**Error Handling:**
- Don't expose internal errors to clients
- Log errors server-side for debugging
- Return generic error messages to clients
- Never include stack traces in production responses

### Email Security

**Email Content:**
- Don't include sensitive information in emails
- Use secure email transport (TLS/SSL) in production
- Validate email addresses before sending
- Don't expose user emails unnecessarily

### Data Privacy

**User Data:**
- Only collect necessary user data
- Don't expose user emails or personal info unnecessarily
- Respect user privacy in leaderboards and public views
- Consider GDPR compliance for production deployments

**Password Hashes:**
- Never expose password hashes
- Never return password hashes in API responses
- Never log password hashes

## Security Checklist for New Features

When adding new features, ensure:

- [ ] All user inputs are validated
- [ ] Authorization is checked for all mutations
- [ ] Passwords are hashed (if applicable)
- [ ] Secrets are not exposed
- [ ] Error messages don't leak information
- [ ] Database queries use Prisma (no raw SQL)
- [ ] Session is verified for protected routes
- [ ] Role checks are in place for admin features

## Security Updates

**When security practices change:**
- Update this document
- Update `ARCHITECTURE.md` if architecture changes
- Notify the team of security-related changes
- Document any new security requirements

## Known Security Considerations

**Current Implementation:**
- Passwords hashed with bcrypt
- Session management via NextAuth
- Route protection via middleware
- Role-based access control
- Input validation on server side
- SQL injection prevention via Prisma

**Future Considerations:**
- Consider rate limiting for API routes
- Consider CSRF protection for forms
- Consider adding password strength requirements
- Consider adding account lockout after failed login attempts
- Consider adding email verification for new users
- Consider adding audit logging for admin actions

## Important Reminders

- **Always read this document and ARCHITECTURE.md before making security-related changes**
- **Update this document when security practices change**
- **Never commit secrets to the repository**
- **Always validate and authorize user actions**
- **Use Prisma for all database access**
- **Follow authentication and authorization patterns strictly**

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [Prisma Security](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [NextAuth.js Security](https://next-auth.js.org/configuration/options#security)

---

**Last Updated:** When security practices change, update this file and notify the team.
