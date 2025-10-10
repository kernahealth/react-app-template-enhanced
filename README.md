# 🚀 Enterprise React App Template - Enhanced

A comprehensive, production-ready React application template with modern development tools, testing frameworks, security scanning, and enhanced state management and API tooling.

## ✨ Features

### Core Features

- **⚛️ React 19** with **TypeScript** and **Vite** for fast development
- **🧪 Complete Testing Suite**: Jest unit tests + Playwright E2E tests
- **🔒 Security Scanning**: Trivy integration for vulnerability detection
- **📝 Code Quality**: ESLint + Prettier with comprehensive rules
- **🎯 Git Hooks**: Automated formatting, linting, testing, and security checks
- **📋 Conventional Commits**: Enforced commit message standards with guided workflow
- **♿ Accessibility**: Built-in a11y linting rules
- **📦 Production Optimized**: Ready for deployment with CDK template

### Enhanced Features (This Branch)

- **🔄 TanStack Query (React Query)**: Powerful data fetching and caching with devtools
- **🪝 Custom Hooks Pattern**: Domain-specific hooks using baseQuery utilities for consistent API patterns
- **🏪 Zustand**: Lightweight state management with persistence and devtools
- **🎭 MSW (Mock Service Worker)**: API mocking for development and testing
- **🌐 React Router DOM**: Client-side routing with example pages
- **🔌 Axios**: Promise-based HTTP client for API requests
- **🔔 Sonner**: Beautiful toast notifications with global error handling
- **📋 React Hook Form + Zod**: Type-safe form validation with excellent DX
- **⚡ Optimized Query Client**: Pre-configured with smart caching and retry strategies

## 🚀 Quick Start

### Using this Template

1. **Create a new repository from this template:**

   ```bash
   # Using GitHub CLI
   gh repo create kernahealth/my-new-app --template=kernahealth/react-app-template --clone --private
   ```

2. **Install dependencies:**

   ```bash
   cd my-new-app
   npm install
   ```

3. **Update project details:**

   ```bash
   # Update package.json
   npm pkg set name="my-new-app"
   npm pkg set description="Description of my new app"

   # Update the app title and content in src/App.tsx
   ```

4. **Start development:**
   ```bash
   npm run dev
   ```

## 📋 Available Scripts

### Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

### Testing

- `npm test` - Run unit tests in watch mode
- `npm run test:ci` - Run unit tests with coverage (CI mode)
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:e2e:ui` - Run E2E tests with UI
- `npm run test:e2e:headed` - Run E2E tests in headed mode

### Code Quality

- `npm run lint` - Lint code and report issues
- `npm run lint:fix` - Fix linting issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Security

- `npm run security:scan` - Run comprehensive security scan
- `npm run security:deps` - Quick dependency vulnerability check
- `npm run security:scan:json` - Generate JSON security report

### Commits

- `npm run commit` - Interactive commit with guided conventional format
- `npm run commit:help` - Show commit types and format help

## 🔧 Git Hooks & Automation

This template includes automated Git hooks that ensure code quality:

### Pre-commit Hook

- ✅ **Format code** with Prettier
- ✅ **Fix linting issues** with ESLint
- ✅ **Security scan** for HIGH/CRITICAL vulnerabilities
- ⚡ Fast execution - only scans staged files

### Pre-push Hook

- ✅ **Run unit tests** with coverage
- ✅ **Run E2E tests** to ensure functionality
- ✅ **Comprehensive security scan** (vulnerabilities + secrets + misconfigurations)
- 🛡️ Prevents pushing broken or insecure code

### Commit Message Hook

- ✅ **Enforces conventional commit format**
- ✅ **Validates commit message structure**
- ✅ **Provides helpful error messages**

## 📝 Commit Message Format

This template enforces [Conventional Commits](https://conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Commit Types

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code formatting (no logic changes)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks
- `ci:` - CI/CD changes
- `build:` - Build system changes

### Examples

```bash
# Good commit messages
git commit -m "feat: add user authentication"
git commit -m "fix: resolve navigation bug on mobile"
git commit -m "docs: update API documentation"

# Or use the guided workflow
npm run commit
```

## 🧪 Testing Strategy

### Unit Tests (Jest + Testing Library)

- Located in `src/` alongside components
- Filename pattern: `*.test.tsx`
- Run with `npm test`
- Configured for 100% coverage reporting

### E2E Tests (Playwright)

- Located in `e2e/` directory
- Filename pattern: `*.spec.ts`
- Run with `npm run test:e2e`
- Tests critical user workflows

### Test Coverage

- Minimum coverage thresholds enforced
- Coverage reports in `coverage/` directory
- CI mode generates coverage artifacts

## 🔒 Security Features

### Trivy Integration

- **Vulnerability scanning** for dependencies
- **Secret detection** to prevent credential leaks
- **Misconfiguration detection** for security issues
- **Automated scanning** in Git hooks

### Security Policies

- Dependencies scanned on every commit
- HIGH/CRITICAL vulnerabilities block commits
- Comprehensive scans before pushes
- Regular security updates recommended

## 🏗️ Project Structure

```
├── src/
│   ├── App.tsx              # Main application component with routes
│   ├── App.test.tsx         # Unit tests
│   ├── main.tsx             # Application entry point with providers
│   ├── setupTests.ts        # Test configuration
│   ├── components/
│   │   ├── ErrorBoundary.tsx  # Error boundary components
│   │   ├── Layout.tsx       # Layout wrapper with navigation
│   │   └── Navbar.tsx       # Navigation bar component
│   ├── hooks/
│   │   └── useUsers.ts      # Custom hooks for user management (uses baseQuery)
│   ├── lib/
│   │   ├── queryClient.ts   # TanStack Query configuration
│   │   └── baseQuery.ts     # Base query/mutation hooks and utilities
│   ├── mocks/
│   │   ├── handlers/        # Organized MSW handlers by domain
│   │   │   ├── userHandlers.ts   # User CRUD endpoints
│   │   │   ├── orderHandlers.ts  # Order CRUD endpoints
│   │   │   ├── miscHandlers.ts   # Utility endpoints
│   │   │   ├── user.types.ts     # User type definitions
│   │   │   ├── order.types.ts    # Order type definitions
│   │   │   ├── common.types.ts   # Shared type definitions
│   │   │   ├── types.ts          # Re-exports all types
│   │   │   ├── utils.ts          # Handler utilities
│   │   │   ├── index.ts          # Handler exports
│   │   │   └── README.md         # Handler documentation
│   │   ├── handlers.ts      # Re-exports all handlers
│   │   └── browser.ts       # MSW browser setup
│   ├── pages/
│   │   ├── Home.tsx         # Home page with Zustand counter
│   │   ├── About.tsx        # About page
│   │   ├── Users.tsx        # Users management page (uses useUsers hooks)
│   │   ├── Contact.tsx      # Contact page with form validation (react-hook-form + Zod)
│   │   └── NotFound.tsx     # 404 page component
│   ├── schemas/
│   │   └── contactSchema.ts # Zod validation schemas for forms
│   ├── services/
│   │   ├── apiClient.ts     # Axios HTTP client wrapper
│   │   └── userService.ts   # User CRUD operations service
│   ├── stores/
│   │   └── exampleStore.ts  # Zustand example store (counter)
│   ├── types/
│   │   └── user.ts          # User type definitions and interfaces
│   └── ...
├── e2e/
│   └── app.spec.ts          # E2E test specs
├── public/
│   └── mockServiceWorker.js # MSW service worker
├── .husky/
│   ├── pre-commit           # Pre-commit hook
│   ├── pre-push            # Pre-push hook
│   └── commit-msg          # Commit message validation
├── coverage/                # Test coverage reports
├── playwright-report/       # E2E test reports
├── commitlint.config.js     # Commit message rules
├── eslint.config.js         # Linting configuration (includes TanStack Query plugin)
├── jest.config.js           # Unit test configuration
├── playwright.config.ts     # E2E test configuration
├── .prettierrc             # Code formatting rules
└── package.json            # Dependencies and scripts
```

## 🛠️ Customization

### Adding New Features

1. Implement the feature (`src/ComponentName.tsx`)
2. Write unit tests (`src/ComponentName.test.tsx`)
3. Add E2E tests if needed (`e2e/feature.spec.ts`)
4. Update documentation

### Modifying Git Hooks

- Edit files in `.husky/` directory
- Test hooks with `git commit` and `git push`
- Hooks are automatically installed on `npm install`

### Changing Code Quality Rules

- **ESLint**: Edit `eslint.config.js`
- **Prettier**: Edit `.prettierrc`
- **Commitlint**: Edit `commitlint.config.js`
- **TypeScript**: Edit `tsconfig.json`

### Security Configuration

- **Trivy rules**: Modify `npm run security:*` scripts in `package.json`
- **Severity levels**: Adjust in pre-commit and pre-push hooks
- **Scan scope**: Configure in `.husky/` hook files

## 🚀 Deployment

This template is optimized for deployment with:

- **Production builds** with `npm run build`
- **CDK templates** for AWS deployment
- **Container-ready** structure
- **Environment variable** support

### Build Output

- Optimized bundles in `dist/` directory
- Tree-shaken JavaScript
- Minified CSS and assets
- Source maps for debugging

## 🤝 Contributing to Template

To improve this template for your organization:

1. **Fork and clone** this repository
2. **Make improvements** following the established patterns
3. **Test thoroughly** with all hooks and scripts
4. **Document changes** in this README
5. **Submit pull request** with conventional commits

### Template Maintenance

- Regular dependency updates
- Security vulnerability patches
- Tool configuration updates
- Documentation improvements

## 📚 Additional Resources

### Core

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Jest Testing Framework](https://jestjs.io/)
- [Playwright Testing](https://playwright.dev/)
- [Conventional Commits](https://conventionalcommits.org/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Trivy Security Scanner](https://trivy.dev/)

### Enhanced Features

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [MSW Documentation](https://mswjs.io/)
- [React Router Documentation](https://reactrouter.com/)
- [Axios Documentation](https://axios-http.com/)
- [Sonner Toast Library](https://sonner.emilkowal.ski/)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)

## 🆘 Troubleshooting

### Common Issues

**Git hooks not running:**

```bash
npx husky install
chmod +x .husky/*
```

**TypeScript errors:**

```bash
npm run build
# Check tsconfig.json configuration
```

**Test failures:**

```bash
npm run test:ci
npm run test:e2e
# Check test files and configuration
```

**Security scan failures:**

```bash
npm run security:scan
# Review and address vulnerabilities
```

**Commit message rejected:**

```bash
npm run commit:help
# Use conventional commit format or npm run commit
```

---

**💡 Happy coding with your new React app! This template provides everything needed for professional development workflows.**
