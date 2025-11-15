# Contributing to Spin-Kitty

Thank you for considering contributing to Spin-Kitty! This document provides guidelines and instructions for contributing.

## 🤝 How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:

1. **Clear title** describing the issue
2. **Steps to reproduce** the problem
3. **Expected behavior** vs actual behavior
4. **Environment details** (OS, browser, Node version)
5. **Screenshots** if applicable

### Suggesting Features

Feature requests are welcome! Please:

1. Check if the feature has already been requested
2. Describe the feature and its use case
3. Explain why it would be valuable
4. Consider implementation details (optional)

### Pull Requests

1. **Fork** the repository
2. **Create a branch** for your feature (`git checkout -b feature/amazing-feature`)
3. **Make your changes** following our coding standards
4. **Test thoroughly** - ensure nothing breaks
5. **Commit** with clear messages (`git commit -m 'Add amazing feature'`)
6. **Push** to your branch (`git push origin feature/amazing-feature`)
7. **Open a Pull Request** with a clear description

## 📝 Coding Standards

### TypeScript

- Use TypeScript for all new code
- Avoid `any` types - use proper typing
- Use interfaces for object shapes
- Document complex functions with JSDoc comments

### React/Next.js

- Use functional components with hooks
- Keep components focused and single-purpose
- Use proper prop typing
- Prefer composition over inheritance

### Styling

- Use Tailwind CSS utility classes
- Follow the existing color scheme (`terminal-*` and `rave-*`)
- Ensure mobile responsiveness
- Test on multiple screen sizes

### Code Formatting

We use ESLint and Prettier. Before committing:

```bash
npm run lint
```

## 🧪 Testing

Before submitting a PR:

1. Test the feature manually
2. Test on different browsers (Chrome, Firefox, Safari)
3. Test on mobile devices
4. Verify WebSocket connections work
5. Check database operations complete successfully

## 🏗️ Development Workflow

1. **Set up development environment**
   ```bash
   npm install
   cp .env.example .env
   npx prisma migrate dev
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Make changes and test**

4. **Check for issues**
   ```bash
   npm run lint
   npm run build  # Ensure it builds
   ```

## 📂 Project Areas

### Frontend Components
- Located in `/components`
- Use Framer Motion for animations
- Follow accessibility guidelines

### API Routes
- Located in `/app/api`
- Return proper HTTP status codes
- Implement rate limiting
- Validate input data

### Database
- Schema in `/prisma/schema.prisma`
- Create migrations for schema changes
- Use Prisma best practices

### WebSocket
- Server logic in `server.js`
- Client hooks in `/lib/socket-client.ts`
- Type definitions in `/lib/websocket.ts`

## 🎨 Asset Guidelines

### Images
- Use SVG for icons and graphics when possible
- Optimize images before committing
- Provide alt text for accessibility

### Audio
- Use compressed formats (MP3, OGG)
- Keep file sizes reasonable (< 1MB)
- Ensure proper licensing

## 🔒 Security

- Never commit API keys or secrets
- Use environment variables for sensitive data
- Validate and sanitize all user input
- Implement rate limiting for public endpoints
- Report security issues privately

## 📄 Documentation

When adding features:

- Update README.md if it affects setup or usage
- Add JSDoc comments for complex functions
- Update SETUP_GUIDE.md if it changes setup process
- Include inline comments for non-obvious code

## 🐛 Debugging Tips

### Database Issues
```bash
# View database
npx prisma studio

# Reset database
npx prisma migrate reset
```

### Redis Issues
```bash
# Connect to Redis
redis-cli

# View all keys
KEYS *

# Clear all data
FLUSHALL
```

### WebSocket Issues
- Check browser console for connection errors
- Verify `NEXT_PUBLIC_WS_URL` is correct
- Ensure custom server is running

## 💬 Communication

- Be respectful and constructive
- Keep discussions focused and on-topic
- Help others when you can
- Ask questions if something is unclear

## 📜 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to Spin-Kitty! 🐱✨
