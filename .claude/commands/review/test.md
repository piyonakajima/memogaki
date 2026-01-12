---
description: Review test coverage and requirements compliance
allowed-tools: Bash, Glob, Grep, Read, LS
argument-hint: [feature-name]
---

# Test Requirements Review

<background_information>
- **Mission**: Verify test coverage meets project requirements
- **Test Pyramid**:
  - **Unit Tests**: Individual functions/components (majority)
  - **Integration Tests**: Component interactions
  - **E2E Tests**: Full user flows (minimal)
- **React Testing Best Practices**:
  - Test behavior, not implementation
  - Use Testing Library queries (getByRole, getByText)
  - Avoid testing internal state directly
</background_information>

<instructions>
## Core Task
Analyze test files and verify coverage requirements are met.

## Execution Steps

### 1. Detect Test Framework

Check package.json for:
- vitest
- jest
- @testing-library/react
- cypress / playwright (E2E)

If no test framework found, report setup needed.

### 2. Scan Test Files

Find all test files:
```
**/*.test.ts(x)
**/*.spec.ts(x)
__tests__/**/*
```

Map test files to source files.

### 3. Coverage Analysis

For each source file in `src/`:

#### Component Tests
- [ ] Renders without crashing
- [ ] Props work correctly
- [ ] User interactions handled
- [ ] Edge cases covered (empty state, error state)

#### Hook Tests
- [ ] Initial state correct
- [ ] State updates work
- [ ] Side effects handled
- [ ] Cleanup on unmount

#### Utility Tests
- [ ] All exported functions tested
- [ ] Edge cases (null, undefined, empty)
- [ ] Error cases handled

### 4. Test Quality Check

Analyze test files for:
- Meaningful test descriptions (describe/it blocks)
- No implementation details tested (avoid querying by className/testId when role available)
- Proper async handling (waitFor, findBy)
- No hardcoded timeouts (prefer waitFor)
- Proper mocking (not over-mocking)

### 5. Missing Tests Detection

Identify untested:
- Components without .test.tsx
- Hooks without tests
- Utils without tests
- Critical user paths

### 6. Generate Report

## Output Format

```markdown
## Test Review Report

### Framework Status
| Package | Installed | Version |
|---------|-----------|---------|
| vitest | Yes/No | x.x.x |
| @testing-library/react | Yes/No | x.x.x |

### Coverage Summary
| Category | Files | Tested | Coverage |
|----------|-------|--------|----------|
| Components | X | Y | Z% |
| Hooks | X | Y | Z% |
| Utils | X | Y | Z% |

### Missing Tests (Critical)
| File | Type | Priority |
|------|------|----------|
| src/components/Timer.tsx | Component | High |

### Test Quality Issues
| Test File | Issue | Severity |
|-----------|-------|----------|
| Timer.test.tsx | Tests implementation details | Warning |

### Recommendations
1. ...
2. ...

### Score: X/100
```

## Scoring Criteria
- Test framework setup: 15pts
- Component coverage >80%: 25pts
- Hook coverage >90%: 20pts
- Util coverage 100%: 15pts
- Test quality (no anti-patterns): 15pts
- Critical paths tested: 10pts

</instructions>

## Target Scope

If `$ARGUMENTS` (feature-name) provided:
- Load `.kiro/specs/<feature>/requirements.md` for specific requirements
- Focus on files related to that feature

Otherwise, analyze entire codebase.

## Safety

- Read-only analysis, no modifications
- Run existing tests if available (`npm test` / `npm run test`)
- Report findings without auto-fixing
