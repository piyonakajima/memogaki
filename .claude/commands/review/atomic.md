---
description: Review codebase for Atomic Design compliance
allowed-tools: Bash, Glob, Grep, Read, LS
argument-hint: [path]
---

# Atomic Design Review

<background_information>
- **Mission**: Verify React components follow Atomic Design methodology
- **Atomic Design Hierarchy**:
  - **Atoms**: Basic building blocks (Button, Input, Label, Icon, Typography)
  - **Molecules**: Simple combinations of atoms (SearchField, FormField, Card)
  - **Organisms**: Complex UI sections (Header, Footer, Sidebar, Form)
  - **Templates**: Page layouts without real content
  - **Pages**: Templates with actual content/data
</background_information>

<instructions>
## Core Task
Analyze React components and verify Atomic Design structure compliance.

## Execution Steps

### 1. Scan Component Structure

Check for proper directory structure:
```
src/
  components/
    atoms/       # Basic elements
    molecules/   # Atom combinations
    organisms/   # Complex sections
  templates/     # Page layouts (optional)
  pages/         # Actual pages
```

Use Glob/LS to map current structure.

### 2. Analyze Each Component

For each component file found:

#### Classification Check
- Determine if component is correctly categorized (atom/molecule/organism)
- Flag misclassified components

#### Dependency Rules
- **Atoms**: Should NOT import other atoms/molecules/organisms from components/
- **Molecules**: May import atoms only
- **Organisms**: May import atoms and molecules
- **Pages/Templates**: May import any component level

Use Grep to check import statements.

### 3. Naming Convention Check

Verify:
- PascalCase for component names
- Component file matches export name
- Index files for clean exports (optional but recommended)

### 4. Component Complexity Analysis

Flag potential issues:
- Atoms with >50 lines (too complex for atom)
- Molecules with >150 lines (consider splitting)
- Components mixing multiple responsibilities

### 5. Generate Report

## Output Format

```markdown
## Atomic Design Review Report

### Structure Analysis
| Level | Path | Count | Status |
|-------|------|-------|--------|
| Atoms | src/components/atoms/ | X | OK/Missing |
| ... | ... | ... | ... |

### Component Classification
| Component | Current Level | Suggested Level | Issue |
|-----------|---------------|-----------------|-------|

### Dependency Violations
| Component | Imports | Violation |
|-----------|---------|-----------|

### Recommendations
1. ...
2. ...

### Score: X/100
```

## Scoring Criteria
- Structure exists: 20pts
- All components classified: 30pts
- No dependency violations: 30pts
- Naming conventions: 10pts
- Appropriate complexity: 10pts

</instructions>

## Target Path

If `$ARGUMENTS` provided, analyze that path only.
Otherwise, analyze entire `src/` directory.

## Safety

- Read-only analysis, no modifications
- Skip node_modules and build directories
- Report findings without auto-fixing
