---
description: Add a new feature to TruthMeter with proper architecture
---

You are helping to add a new feature to the TruthMeter project. Follow this structured approach:

## Step 1: Understand the Feature Request
Ask the user clarifying questions about the feature:
- What is the goal of this feature?
- Is it frontend, backend, or full-stack?
- Any specific UI/UX requirements?
- Any external APIs or services needed?
- Any performance considerations?
- Should this be behind a feature flag?

## Step 2: Plan the Implementation
Create a detailed plan using the TodoWrite tool that includes:
- Files to create or modify
- Database schema changes (if needed)
- API endpoints (if needed)
- Components to build (if frontend)
- Services to implement (if backend)
- Integration points with existing code
- Potential breaking changes
- Rollback strategy

Present the plan to the user for approval before proceeding.

## Step 3: Update Documentation
Before coding, determine if CLAUDE.md needs updates for:
- New features section
- API endpoint documentation
- Data models changes
- Environment variables
- New dependencies
- Configuration changes

If updates needed, update CLAUDE.md first so future sessions have context.

## Step 4: Implement
Execute the plan step by step:

### Backend (if needed)
1. Add types in `backend/src/types/index.ts`
2. Create service in `backend/src/services/`
3. Add route in `backend/src/routes/`
4. Update database schema in `backend/src/db/`
5. Add validation (Zod schema)
6. Implement error handling

### Frontend (if needed)
1. Add types in `frontend/src/types/index.ts`
2. Create API service in `frontend/src/api/`
3. Build components in `frontend/src/components/`
4. Add custom hooks if needed in `frontend/src/hooks/`
5. Style with Tailwind CSS
6. Add loading/error states

### Integration
- Test frontend-backend integration
- Verify types match on both sides
- Test error scenarios
- Check edge cases

Follow existing patterns in the codebase. Use @code-reviewer to review as you go.

## Step 5: Testing
After implementation, ask user to test:

### Manual Testing Steps
Provide specific steps like:
```
1. Navigate to http://localhost:3000
2. Click on [button/link]
3. Expected result: [describe]
4. Test edge case: [describe]
```

### API Testing (if backend changes)
Provide curl commands:
```bash
curl -X POST http://localhost:3001/api/endpoint \
  -H "Content-Type: application/json" \
  -d '{"field": "value"}'
```

### Automated Tests
Suggest test scenarios for:
- Happy path
- Error cases
- Edge cases
- Boundary conditions

Offer to call @test-writer to implement tests.

## Step 6: Git Workflow
After testing passes:
1. Stage changes: `git add .`
2. Commit with conventional commit format:
   - `feat: [description]` for new features
   - `fix: [description]` for bug fixes
   - `refactor: [description]` for refactoring
   - `docs: [description]` for documentation
3. Suggest: `git commit -m "feat: add [feature name]"`
4. Offer to push: `git push origin [branch]`

## Step 7: Documentation Update
After successful implementation:
- Update README.md with new feature
- Add to CHANGELOG.md
- Update API documentation
- Add code examples if complex

## Architecture Guidelines

### Backend (Node.js + Express)
```
backend/
├── src/
│   ├── routes/        # API endpoints (thin, delegate to services)
│   ├── services/      # Business logic (thick, testable)
│   ├── types/         # TypeScript interfaces/types
│   ├── db/            # Database queries & schema
│   ├── utils/         # Helper functions
│   └── middleware/    # Express middleware
```

**Patterns:**
- Routes are thin, delegate to services
- Services contain business logic
- Use dependency injection where possible
- Async/await for all async operations
- Proper error handling with try/catch

### Frontend (React + TypeScript)
```
frontend/
├── src/
│   ├── components/    # React components (one per file)
│   ├── hooks/         # Custom hooks (useAnalysis, etc.)
│   ├── api/           # API client functions
│   ├── types/         # TypeScript types
│   ├── utils/         # Helper functions
│   └── pages/         # Page components
```

**Patterns:**
- Functional components with hooks
- Custom hooks for shared logic
- Props typed with interfaces
- Tailwind for styling (no inline styles)
- Error boundaries for error handling

### Database (SQLite)
- Migrations in `backend/src/db/migrations/`
- Use parameterized queries (prevent SQL injection)
- Index frequently queried columns
- Keep schema normalized

### Best Practices
✅ **DO:**
- Maintain TypeScript type safety
- Add proper error handling
- Follow existing naming conventions
- Add loading states for async operations
- Validate user input (frontend + backend)
- Update types in both frontend and backend
- Use environment variables for config
- Log important events
- Handle edge cases

❌ **DON'T:**
- Use `any` type
- Commit console.logs
- Hardcode URLs or credentials
- Skip error handling
- Ignore TypeScript errors
- Copy-paste without understanding
- Create god functions (keep functions small)

## Common TruthMeter Features

You might be asked to implement:

### Core Features
- ✅ Analyze tweet URL
- ✅ Display factual score
- ✅ Show sentiment breakdown
- ⬜ User authentication
- ⬜ Save analysis history
- ⬜ Export results (PDF/CSV)
- ⬜ Share analysis via link
- ⬜ Compare multiple tweets

### Advanced Features
- ⬜ Batch analysis (multiple URLs)
- ⬜ Custom source filtering
- ⬜ Real-time progress updates (WebSockets)
- ⬜ Browser extension
- ⬜ Trending misinformation dashboard
- ⬜ API rate limiting per user
- ⬜ Caching layer (Redis)
- ⬜ Email notifications

### Admin Features
- ⬜ Usage analytics
- ⬜ Source credibility management
- ⬜ User management
- ⬜ Content moderation

## Integration with Subagents

During implementation, leverage other agents:
- **@code-reviewer**: Review code quality as you build
- **@test-writer**: Generate comprehensive tests
- **@doc-writer**: Update documentation

Example workflow:
```
1. Implement feature
2. "@code-reviewer please review the AnalysisService"
3. Fix issues found
4. "@test-writer please add tests for AnalysisService"
5. "@doc-writer please document the new API endpoint"
```

## Troubleshooting

Common issues and solutions:

### TypeScript Errors
- Ensure types match between frontend/backend
- Check for missing imports
- Verify interface definitions

### API Connection Issues
- Check CORS configuration
- Verify backend is running (port 3001)
- Check environment variables
- Inspect network tab in DevTools

### Database Errors
- Run migrations: `npm run migrate`
- Check database file exists
- Verify connection string
- Check for schema mismatches

### Build Errors
- Clear node_modules and reinstall
- Check for TypeScript errors
- Verify all imports resolve
- Check for circular dependencies

## Completion Checklist

Before marking feature complete:
- [ ] Feature works as expected
- [ ] Types are properly defined
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Edge cases handled
- [ ] Code reviewed (@code-reviewer)
- [ ] Tests added (@test-writer)
- [ ] Documentation updated (@doc-writer)
- [ ] Manual testing completed
- [ ] Git commit created
- [ ] CLAUDE.md updated if needed
- [ ] No console.logs or debug code
- [ ] Performance acceptable

## Getting Started

Start by asking: "What feature would you like to add to TruthMeter?"

Then follow steps 1-7 systematically. Take your time, be thorough, and leverage the subagents!