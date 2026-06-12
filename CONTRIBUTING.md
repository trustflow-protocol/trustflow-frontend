# Contributing to TrustFlow Frontend

Thank you for your interest in contributing to TrustFlow! 🎉

## Getting Started

### Prerequisites

- Node.js >= 18.14.2
- npm >= 9.5.0
- [Freighter Wallet](https://www.freighter.app/) browser extension (for testing)

### Setup

```bash
# Clone the repository
git clone https://github.com/trustflow-protocol/trustflow-frontend.git
cd trustflow-frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## Development Workflow

### 1. Find an Issue

- Check the [Issues page](https://github.com/trustflow-protocol/trustflow-frontend/issues)
- Look for issues labeled `good first issue` if you're new
- Comment on the issue to let others know you're working on it

### 2. Create a Branch

```bash
git checkout -b feature/issue-number-short-description
# Example: git checkout -b feature/22-app-router
```

### 3. Make Your Changes

- Follow the existing code style
- Use TypeScript for all new files
- Follow the Atomic Design pattern (atoms → molecules → organisms)
- Keep components small and focused

### 4. Test Your Changes

```bash
# Run linter
npm run lint

# Type-check
npm run typecheck

# Build for production
npm run build
```

### 5. Commit Your Changes

We follow conventional commits:

```bash
git commit -m "feat: add dark mode toggle"
git commit -m "fix: resolve toast notification timing issue"
git commit -m "docs: update README with setup instructions"
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### 6. Push and Create PR

```bash
git push origin feature/issue-number-short-description
```

Then create a Pull Request on GitHub with:

- Clear description of changes
- Link to the related issue
- Screenshots (for UI changes)

## Code Style Guidelines

### TypeScript

- Use TypeScript for all new files
- Define interfaces for component props
- Avoid `any` types - use proper typing

### Components

```tsx
// Good: Typed props with interface
interface ButtonProps {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  // Component implementation
}
```

### Styling

- Use Tailwind CSS utility classes for styling
- Use CSS Modules for complex component-specific styles
- Follow the existing dark mode pattern with `dark:` variants

```tsx
// Using Tailwind classes
<button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600">
  Click me
</button>
```

### Hooks

- Use custom hooks for reusable logic
- Follow the `use` prefix convention
- Export hooks from `hooks/index.ts`

## Project Structure

```
├── components/
│   ├── atoms/        # Basic UI primitives (Button, Input, etc.)
│   ├── molecules/    # Composed components (FormPledge, WalletData)
│   └── organisms/    # Page-level sections (Navbar, Campaign)
├── hooks/            # Custom React hooks
├── pages/            # Next.js pages (routing)
├── shared/           # Shared utilities and constants
├── styles/           # Global styles and CSS modules
└── public/           # Static assets
```

## CI/CD Pipeline

All PRs must pass automated checks:

- ✅ ESLint (code quality)
- ✅ TypeScript compilation (type safety)
- ✅ Production build (no build errors)

The CI runs automatically on every PR. Fix any failures before requesting review.

## Getting Help

- 💬 Comment on the issue you're working on
- 📖 Check the [README](./README.md) for project overview
- 🌐 Visit [Stellar Community Forum](https://stellar.org/community)

## Code of Conduct

- Be respectful and inclusive
- Help others learn and grow
- Focus on constructive feedback
- Celebrate contributions of all sizes

Thank you for contributing to TrustFlow! 🚀
