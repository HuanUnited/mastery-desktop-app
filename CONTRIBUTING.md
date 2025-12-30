# Contributing to Mastery Learning App

Thank you for your interest in contributing! This project is built by learners, for learners.

---

## 🎯 Philosophy

This app solves a **specific problem**: learning complex technical material in a foreign language. All contributions should align with this core mission.

---

## 📋 Licensing Agreement

**By contributing to this project, you agree that:**

1. Your contributions will be licensed under the project's **Non-Commercial License**
2. You grant the project maintainer the right to **relicense your contributions** for commercial purposes
3. Your contributions are your **original work** or properly licensed from third parties
4. You have the **right to contribute** the code/content

This dual-licensing approach allows:
- ✓ The community to use and improve the software freely (non-commercial)
- ✓ The original author to offer commercial licenses and fund development

---

## 🛠️ How to Contribute

### Reporting Bugs

1. Check [existing issues](https://github.com/yourusername/mastery-learning-app/issues) first
2. Create a new issue with:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)
   - OS/version information

### Suggesting Features

1. Open a [Discussion](https://github.com/yourusername/mastery-learning-app/discussions) first
2. Explain:
   - The problem it solves
   - How it aligns with the app's mission
   - Your proposed solution
3. Wait for feedback before implementing

### Submitting Code

1. **Fork** the repository
2. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**:
   - Follow existing code style
   - Add comments for complex logic
   - Test thoroughly on your OS
4. **Commit with clear messages**:
   ```bash
   git commit -m "Add: feature description"
   git commit -m "Fix: bug description"
   git commit -m "Refactor: what you improved"
   ```
5. **Push and open a Pull Request**:
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Fill out the PR template** with:
   - What problem it solves
   - How you tested it
   - Screenshots (if UI changes)

---

## 🎨 Code Style Guidelines

### JavaScript/React
- Use **functional components** with hooks
- Prefer **named exports** over default exports
- Keep components **small and focused** (<200 lines)
- Use **descriptive variable names** (`attemptNumber` not `an`)

### CSS/Tailwind
- Follow existing **Tailwind conventions**
- Use **custom classes** only when necessary
- Ensure **dark mode compatibility** (test both themes)

### Database
- Never expose **raw SQL** to renderer process
- Always use **parameterized queries** (SQL injection prevention)
- Add **indexes** for frequently queried columns

### File Organization
```
New feature should include:
├── Component file (.jsx)
├── CSS (if needed, .css)
├── Hook (if needed, useFeature.jsx)
└── Tests (coming soon)
```

---

## 🧪 Testing

Currently manual testing is required:

1. **Run in dev mode**: `npm run electron:dev`
2. **Test all workflows**:
   - Create error entry
   - Start/stop timer
   - Export data
   - Switch themes
3. **Test on your OS** (Windows/Mac/Linux)
4. **Check database** integrity after operations

**Automated tests coming soon** — contributions welcome!

---

## 🚫 What We Don't Accept

- **Telemetry or tracking** (violates privacy promise)
- **Network requests** (must stay offline)
- **Heavy dependencies** (keep bundle size small)
- **UI frameworks** other than React (consistency)
- **Database migrations** without backward compatibility
- **Breaking changes** without discussion

---

## 💡 Priority Contribution Areas

High-impact improvements:

- [ ] **Spaced repetition algorithm** (SM-2, Leitner, custom)
- [ ] **Statistics/analytics dashboard** (charts, trends, insights)
- [ ] **Export formats** (PDF reports, Markdown, CSV import)
- [ ] **Keyboard shortcuts** (power user workflows)
- [ ] **Batch operations** (bulk edit, delete, export)
- [ ] **Data backup/restore** (automated backups)
- [ ] **Performance optimization** (large datasets)
- [ ] **Accessibility** (screen reader support, ARIA labels)
- [ ] **Unit tests** (Jest, React Testing Library)
- [ ] **i18n** (internationalization framework)

---

## 📞 Communication

- **Questions**: [GitHub Discussions](https://github.com/yourusername/mastery-learning-app/discussions)
- **Bugs**: [GitHub Issues](https://github.com/yourusername/mastery-learning-app/issues)
- **Features**: Start with a Discussion, then create an Issue
- **Security**: Email [your-email@example.com] privately

---

## 🎓 Learning Resources

New to the stack?

- [Electron Docs](https://www.electronjs.org/docs/latest)
- [React Hooks](https://react.dev/reference/react)
- [better-sqlite3 API](https://github.com/WiseLibs/better-sqlite3/wiki/API)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## ⚖️ Code of Conduct

Be respectful, inclusive, and constructive:

✓ Help newcomers learn  
✓ Give constructive feedback  
✓ Assume good intentions  
✗ No harassment or discrimination  
✗ No spam or self-promotion  
✗ No unconstructive criticism  

---

## 🙏 Recognition

Contributors will be:
- Listed in [CONTRIBUTORS.md](CONTRIBUTORS.md)
- Mentioned in release notes
- Credited in the app's About section (for significant features)

---

**Thank you for making learning better for everyone! 🚀**
