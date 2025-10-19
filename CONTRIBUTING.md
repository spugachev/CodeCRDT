# Contributing to CodeCRDT

Thank you for your interest in contributing to CodeCRDT! We welcome contributions from the community and are excited to work with you to make this project even better.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Submitting Changes](#submitting-changes)
- [Issue Guidelines](#issue-guidelines)
- [Pull Request Process](#pull-request-process)
- [Community](#community)

## Code of Conduct

Please note that this project is released with a [Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

## Getting Started

Before you begin contributing, please:

1. Fork the repository on GitHub
2. Read the [README.md](README.md) for project overview
3. Check the [Issues](https://github.com/spugachev/collaborative-agents/issues) page for existing bugs or feature requests
4. Join our [Discord community](https://discord.gg/codecrdt) for discussions

## Development Setup

### Prerequisites

- **Node.js** 18.0 or higher
- **npm** 9.0 or higher
- **Git** 2.0 or higher
- **Python** 3.10 or higher (for evaluation framework)
- **AWS credentials** (for AI features)

### Initial Setup

1. **Fork and clone the repository:**

   ```bash
   git clone https://github.com/YOUR_USERNAME/collaborative-agents.git
   cd collaborative-agents
   ```

2. **Install backend dependencies:**

   ```bash
   cd backend
   npm install
   cp .env.example .env  # Configure environment variables
   ```

3. **Install frontend dependencies:**

   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up evaluation framework (optional):**
   ```bash
   cd ../evaluation
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

### Running the Development Environment

1. **Start the backend server:**

   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend development server:**

   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - WebSocket: ws://localhost:3001/crdt

## How to Contribute

### Types of Contributions

We welcome various types of contributions:

- **Bug Fixes**: Help us identify and fix bugs
- **Features**: Implement new features or enhance existing ones
- **Documentation**: Improve documentation, add examples, or fix typos
- **Tests**: Write unit tests, integration tests, or E2E tests
- **Performance**: Optimize code for better performance
- **Refactoring**: Improve code quality and maintainability
- **Translations**: Help translate the application to other languages

### Finding Something to Work On

- Check issues labeled [`good first issue`](https://github.com/spugachev/collaborative-agents/labels/good%20first%20issue) for beginner-friendly tasks
- Look for [`help wanted`](https://github.com/spugachev/collaborative-agents/labels/help%20wanted) labels for tasks where we need assistance
- Review the [Roadmap](README.md#roadmap) for planned features
- Propose your own ideas by creating a new issue

## Development Workflow

### Branch Naming Convention

Use descriptive branch names following this pattern:

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation changes
- `refactor/description` - Code refactoring
- `test/description` - Test additions or fixes
- `perf/description` - Performance improvements

Examples:

- `feature/multi-file-support`
- `fix/websocket-reconnection`
- `docs/api-documentation`

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test additions or fixes
- `build`: Build system changes
- `ci`: CI/CD configuration changes
- `chore`: Maintenance tasks

Examples:

```bash
feat(editor): add vim keybindings support
fix(websocket): handle reconnection on network failure
docs: update API documentation for v2 endpoints
```

## Coding Standards

### TypeScript Guidelines

- **No `any` types**: Use proper type definitions
- **File naming**: Use kebab-case for file names
- **Interfaces over types**: Prefer interfaces for object shapes
- **Explicit return types**: Always specify function return types
- **No unused variables**: Remove or prefix with underscore

### Code Style

- **Formatting**: Use Prettier with project configuration
- **Linting**: Follow ESLint rules
- **Indentation**: 2 spaces for TypeScript/JavaScript
- **Line length**: Maximum 100 characters
- **Imports**: Group and sort imports (React, third-party, local)

### Best Practices

- **DRY**: Don't Repeat Yourself
- **SOLID**: Follow SOLID principles
- **Error handling**: Always handle errors appropriately
- **Security**: Never expose sensitive data
- **Performance**: Consider performance implications
- **Accessibility**: Ensure UI components are accessible

## Documentation

### Code Documentation

- Add JSDoc comments for public APIs
- Include examples in complex functions
- Document non-obvious code behavior
- Keep comments up-to-date with code changes

### README Updates

Update the README when:

- Adding new features
- Changing installation steps
- Modifying API endpoints
- Adding new dependencies

## Submitting Changes

### Before Submitting

1. **Update your fork:**

   ```bash
   git remote add upstream https://github.com/spugachev/collaborative-agents.git
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create a feature branch:**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes:**

   - Write clean, maintainable code
   - Add tests for new functionality
   - Update documentation as needed

4. **Run linting:**

   ```bash
   npm run typecheck
   npm run lint
   ```

5. **Commit your changes:**

   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

6. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

## Issue Guidelines

### Reporting Bugs

When reporting bugs, please include:

- **Description**: Clear description of the issue
- **Steps to reproduce**: Detailed steps to reproduce the bug
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Environment**: Browser, OS, Node.js version
- **Screenshots**: If applicable
- **Error messages**: Full error messages and stack traces

### Feature Requests

For feature requests, please provide:

- **Use case**: Why is this feature needed?
- **Description**: Detailed description of the feature
- **Alternatives**: Have you considered alternatives?
- **Implementation ideas**: Any implementation suggestions

## Pull Request Process

### Creating a Pull Request

1. **Ensure your code follows the project standards**
2. **Update documentation** if needed
3. **Add tests** for new functionality
4. **Verify all tests pass**
5. **Create a pull request** with a clear title and description

### Pull Request Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No new warnings
```

### Recognition

Contributors are recognized in:

- [Contributors list](https://github.com/spugachev/collaborative-agents/graphs/contributors)
- Release notes
- Project documentation

## License

By contributing to CodeCRDT, you agree that your contributions will be licensed under the [MIT License](LICENSE).

## Questions?

If you have questions about contributing, please:

1. Check this guide and project documentation
2. Search existing issues and discussions
3. Ask in our Discord community
4. Create a new discussion on GitHub

Thank you for contributing to CodeCRDT! Your efforts help make collaborative coding better for everyone.
