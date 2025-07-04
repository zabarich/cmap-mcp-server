# Contributing to CMAP MCP Server

Thank you for your interest in contributing to the CMAP MCP Server! This document provides guidelines for contributing to the project.

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/cmap-mcp-server.git`
3. Install dependencies: `npm install`
4. Copy environment template: `cp env.example .env`
5. Add your CMAP credentials to `.env`

## Development Workflow

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Run tests: `npm test`
4. Run build: `npm run build`
5. Commit your changes: `git commit -m "feat: description of your changes"`
6. Push to your fork: `git push origin feature/your-feature-name`
7. Create a Pull Request

## Commit Message Convention

We use conventional commits:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

## Pull Request Process

1. Ensure your code follows the existing style
2. Update documentation if needed
3. Add tests for new functionality
4. Ensure all tests pass
5. Update README.md if needed

## Reporting Issues

- Use the issue templates provided
- Include steps to reproduce
- Provide environment details
- Include error messages and logs

## CMAP Credentials

- Never commit real CMAP credentials
- Use sandbox environment for testing
- Follow the security guidelines in SECURITY.md

## Questions?

Feel free to open an issue for questions or join our discussions.