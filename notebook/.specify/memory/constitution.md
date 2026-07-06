# Capstone Project Constitution

## Core Principles

### I. Code Quality & SOLID Principles (NON-NEGOTIABLE)
Every module must adhere to SOLID:
- **Single Responsibility**: Each class/function does exactly one thing; if you need "and" to describe it, split it
- **Open/Closed**: Extend behavior through composition and interfaces, not by modifying stable code
- **Liskov Substitution**: Subtypes must be fully substitutable for their base types without altering correctness
- **Interface Segregation**: Depend on narrow, role-specific interfaces; no caller should import methods it doesn't use
- **Dependency Inversion**: High-level modules depend on abstractions (protocols/ABCs), never on concrete implementations

Code conventions: Max function length 30 lines; max cyclomatic complexity 10; no magic numbers — use named constants; all public APIs must have type annotations.

### II. Modularity & Separation of Concerns
Every feature is a self-contained module with a clear boundary:
- Modules expose a public interface and hide implementation details
- No circular dependencies between modules; dependency graph must be a DAG
- Business logic, data access, and presentation layers are strictly separated
- Shared utilities live in a `common/` package; nothing in `common/` may import from feature modules
- Configuration is injected, never hardcoded or imported from a sibling module

### III. Test-First Development (NON-NEGOTIABLE)
TDD is mandatory — no production code exists without a preceding failing test:
- Red-Green-Refactor cycle strictly enforced; skipping Red is a violation
- Unit test coverage floor: **90%** on all non-trivial modules; coverage reports generated on every CI run
- Tests are co-located with the module they test (e.g., `tests/unit/test_<module>.py`)
- Test names follow `test_<what>_<condition>_<expected_outcome>` convention
- Mocks are used at module boundaries only; never mock internals of the unit under test
- Flaky tests must be fixed or quarantined within one sprint — they may not stay in the main suite

### IV. Integration & Contract Testing
Integration tests verify the seams between modules and external systems:
- Every cross-module interface has at least one contract test
- External service calls (APIs, databases, file I/O) are tested via integration tests with real or containerized dependencies
- Integration tests live in `tests/integration/` and are tagged so they can be run independently of unit tests
- Breaking a public interface requires a new contract test before merging
- End-to-end smoke tests cover all critical user paths and run on every PR

### V. User Experience Consistency
All user-facing surfaces follow a single interaction model:
- CLI output: structured JSON by default; human-readable with `--human` flag; errors to stderr with actionable messages
- Error messages include: what went wrong, why, and how to fix it — no raw exception tracebacks exposed to users
- Progress indicators for operations >2 seconds; silent for fast operations
- Exit codes are semantic: `0` success, `1` user error, `2` system/internal error
- Breaking UX changes (flags, output schema) require a deprecation cycle of at least one minor version

### VI. Performance Requirements
Performance is a feature, not an afterthought:
- Baseline benchmarks are defined and committed for all critical paths; regressions >10% block merging
- No synchronous blocking I/O on the main thread; use async or thread pools for I/O-bound work
- Memory allocations inside hot loops are prohibited; profile before optimizing
- Cold-start time for CLI commands must remain under 500ms
- Database queries must be reviewed for N+1 patterns; queries with no index hint on large tables are rejected

### VII. Simplicity & YAGNI
Build what is needed today, designed to be extended tomorrow:
- No speculative abstractions; every layer of indirection must earn its existence
- Prefer the standard library over third-party dependencies for trivial tasks
- When two designs have equal correctness, choose the one with fewer moving parts
- Delete dead code immediately; commented-out code is not allowed in the main branch

## Quality Gates

All the following gates must pass before a PR is merged:
- **Linting**: `ruff` (or project linter) reports zero errors and zero warnings
- **Type checking**: `mypy --strict` passes with zero errors on changed modules
- **Unit tests**: All pass; coverage ≥ 90% on changed files
- **Integration tests**: All pass on CI against containerized dependencies
- **Security scan**: `bandit` or equivalent reports no HIGH/CRITICAL findings
- **Performance**: No benchmark regressions >10% vs. `main`
- **Dependency audit**: No new transitive dependencies with known CVEs

## Development Workflow

- **Branching**: `feature/<ticket>`, `fix/<ticket>`, `chore/<ticket>` off `main`
- **Commits**: Conventional Commits format (`feat:`, `fix:`, `test:`, `refactor:`, `chore:`)
- **PRs**: Require at least one peer review and all quality gates green; author may not self-approve
- **Releases**: `MAJOR.MINOR.PATCH` (SemVer); breaking changes only on MAJOR bumps
- **Dependency updates**: Reviewed weekly via automated PR; merged only after full test suite passes

## Governance

This Constitution supersedes all other written or verbal practices. Any conflict defaults to these principles.

Amendments require:
1. A written proposal explaining the rationale
2. Approval from the full team
3. A migration plan for existing code that violates the new principle
4. Update to this document with the amendment date

All code reviews must verify Constitution compliance. Deviations must be explicitly justified in the PR description and are granted as time-limited exceptions only.

**Version**: 1.0.0 | **Ratified**: 2026-07-06 | **Last Amended**: 2026-07-06
