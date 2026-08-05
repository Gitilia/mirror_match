# Contributing to MirrorMatch

Thank you for your interest in contributing to MirrorMatch! This document outlines the coding conventions, development workflow, and expectations for contributors.

## Getting Started

### Local Development Setup

1. **Clone the repository** (if applicable) or navigate to the project directory
2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Copy `env.example` to `.env`
   - Configure `DATABASE_URL`, `NEXTAUTH_SECRET`, and email settings
   - See `README.md` for detailed setup instructions

4. **Set up the database:**
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open the app:**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - Login with default admin: `admin@mirrormatch.com` / `admin123`

## Coding Conventions

### TypeScript

- **Use TypeScript for all code** - no JavaScript files
- **Strict mode enabled** - follow TypeScript best practices
- **Avoid `any` types** - use proper types or `unknown` when necessary
- **Define types explicitly** - don't rely on type inference when it reduces clarity

### Code Style

- **Follow existing patterns** - maintain consistency with the codebase
- **Use meaningful names** - variables, functions, and components should be self-documenting
- **Keep functions focused** - single responsibility principle
- **Prefer small components** - break down large components into smaller, composable pieces

### Folder Structure

Follow the established structure:
```
app/              # Next.js App Router routes
components/       # Reusable React components
lib/             # Utility functions and helpers
prisma/           # Database schema and migrations
types/            # TypeScript type definitions
```

### Naming Conventions

- **Components:** PascalCase (e.g., `Navigation.tsx`, `GuessForm.tsx`)
- **Files:** Match component/function names (e.g., `lib/utils.ts`)
- **Variables/Functions:** camelCase (e.g., `getUserById`, `photoUrl`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `MAX_POINTS`)
- **Types/Interfaces:** PascalCase (e.g., `User`, `PhotoData`)

### Linting and Formatting

- **ESLint** is configured - run `npm run lint` to check for issues
- **Fix linting errors** before committing
- **Follow Next.js ESLint rules** - the project uses `eslint-config-next`

## Development Workflow

### Before Making Changes

1. **Read the documentation:**
   - `README.md` - Project overview and setup
   - `ARCHITECTURE.md` - System design and data flows
   - `.cursor/rules/mirrormatch.mdc` - Project rules and guidelines
   - `CONTRIBUTING.md` (this file) - Coding conventions
   - `SECURITY.md` - Security practices

2. **Understand the codebase:**
   - Review related files before modifying
   - Understand the data model in `prisma/schema.prisma`
   - Check existing patterns for similar features

3. **Plan your changes:**
   - Break down large changes into smaller, incremental steps
   - Consider impact on existing features
   - Think about security implications

### Making Changes

1. **Create a focused change:**
   - One feature or fix per commit when possible
   - Keep changes small and reviewable
   - Test your changes locally

2. **Follow established patterns:**
   - Use existing component patterns
   - Follow the same structure for new API routes
   - Maintain consistency with existing code style

3. **Write clear code:**
   - Add comments for complex logic
   - Use descriptive variable names
   - Keep functions and components focused

### Adding New Features

When adding new features:

1. **Update documentation:**
   - Update `README.md` if user-facing behavior changes
   - Update `ARCHITECTURE.md` if system design changes
   - Update `.cursor/rules/mirrormatch.mdc` if rules change
   - Update `SECURITY.md` if security practices change

2. **Follow security guidelines:**
   - Validate all user inputs
   - Check authorization for all mutations
   - Never expose sensitive data
   - See `SECURITY.md` for details

3. **Test your changes:**
   - Test the feature manually
   - Verify error handling
   - Check edge cases
   - Ensure no regressions

4. **Update types:**
   - Add TypeScript types for new data structures
   - Update Prisma schema if database changes needed
   - Run `npm run db:generate` after schema changes

### Commit Messages

Write clear, descriptive commit messages:

- **Format:** Use imperative mood (e.g., "Add photo upload validation")
- **Be specific:** Describe what changed and why
- **Reference issues:** If applicable, reference issue numbers

**Examples:**
- "Add password strength validation to change password form"
- "Fix case-insensitive guess matching bug"
- "Update README with new environment variables"
- "Fixed stuff"
- "Updates"

### Code Review Checklist

Before submitting changes, ensure:

- [ ] Code follows TypeScript and style conventions
- [ ] All linting errors are fixed
- [ ] Documentation is updated (if needed)
- [ ] Security considerations are addressed
- [ ] Changes are tested locally
- [ ] Commit messages are clear and descriptive

## Testing

### Manual Testing

- Test all user flows:
  - User login and authentication
  - Photo upload and email notifications
  - Guess submission and point awarding
  - Admin user management
  - Password changes

- Test edge cases:
  - Invalid inputs
  - Unauthorized access attempts
  - Missing data
  - Network errors

### Database Testing

- Test with fresh database migrations
- Verify seed script works correctly
- Test with various data states

## Adding Tests (Future)

If tests are added to the project:

- **Unit tests:** Test utility functions and helpers
- **Integration tests:** Test API routes and database operations
- **E2E tests:** Test complete user flows
- **Update test coverage** when adding new features

## Documentation Updates

### When to Update Documentation

- **README.md:** When setup steps, features, or usage changes
- **ARCHITECTURE.md:** When system design, data flows, or patterns change
- **CONTRIBUTING.md:** When coding conventions or workflow changes
- **SECURITY.md:** When security practices or vulnerabilities change
- **.cursor/rules:** When project rules or guidelines change

### Documentation Standards

- **Keep docs up to date** - outdated docs are worse than no docs
- **Be clear and concise** - use examples when helpful
- **Cross-reference** - link to related documentation
- **Update all relevant docs** - don't update just one file

## Guidelines for AI Tools (Cursor)

If you're using AI tools like Cursor to help with development:

1. **Respect these conventions:**
   - Follow the coding style and patterns outlined here
   - Use the established folder structure
   - Maintain consistency with existing code

2. **Prefer incremental changes:**
   - Make small, focused changes rather than large refactors
   - Test each change before moving to the next
   - Keep commits focused and reviewable

3. **Update documentation:**
   - When AI generates code that changes behavior, update relevant docs
   - Keep architecture docs in sync with code changes
   - Document any new patterns or conventions

4. **Security awareness:**
   - Never generate code that exposes sensitive data
   - Always include authorization checks
   - Validate all user inputs
   - Follow security guidelines in `SECURITY.md`

5. **Read before generating:**
   - Always read relevant documentation first
   - Understand existing patterns before creating new code
   - Check similar features for consistency

## Questions?

If you have questions about:
- **Setup issues:** Check `README.md`
- **Architecture questions:** Check `ARCHITECTURE.md`
- **Security concerns:** Check `SECURITY.md`
- **Coding conventions:** Check this file and `.cursor/rules/mirrormatch.mdc`

## Important Reminders

- **Always read documentation before making large changes**
- **Keep documentation updated when behavior changes**
- **Follow security guidelines strictly**
- **Test your changes before committing**
- **Write clear commit messages**
- **Maintain consistency with existing code**

---

**Last Updated:** When conventions or workflow change, update this file and notify contributors.
