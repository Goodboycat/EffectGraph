# Contributing to EffectGraph

Thank you for your interest in contributing to EffectGraph! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful, inclusive, and constructive. We're all here to build something great together.

## Getting Started

1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/yourusername/effectgraph.git
   cd effectgraph
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npx vitest run tests/unit/validator.test.ts
```

### Building

```bash
# Build library
npm run build

# Type checking
npm run typecheck
```

### Linting & Formatting

```bash
# Run ESLint
npm run lint

# Format code
npm run format
```

### Running Examples

```bash
# Start dev server
npm run dev

# Open in browser
open http://localhost:5173/examples/gpu.html
```

## Project Structure

```
effectgraph/
├── src/
│   ├── api/          # Public API, validation, presets
│   ├── core/         # Particle pool, physics, RNG
│   ├── rendering/    # GPU & CPU renderers
│   ├── shaders/      # GLSL snippets & templates
│   ├── util/         # Utilities
│   ├── types.ts      # TypeScript type definitions
│   └── index.ts      # Main entry point
├── presets/          # Effect presets (JSON)
├── tests/            # Unit tests
├── examples/         # Example HTML pages
├── docs/             # GitHub Pages demo
└── schema/           # JSON schema
```

## Adding a New Feature

1. **Write tests first** (TDD approach)
2. **Implement the feature**
3. **Update types** if needed
4. **Add documentation**
5. **Update CHANGELOG.md**

Example:

```typescript
// 1. Write test in tests/unit/newfeature.test.ts
describe('NewFeature', () => {
  it('should do something', () => {
    expect(newFeature()).toBe(expected);
  });
});

// 2. Implement in src/core/newfeature.ts
export function newFeature() {
  // implementation
}

// 3. Export from src/index.ts
export { newFeature } from './core/newfeature.js';
```

## Adding a New Preset

1. Create JSON file in `presets/`:
   ```json
   {
     "name": "my-preset",
     "description": "Description of effect",
     "tags": ["tag1", "tag2"],
     "emitters": [...],
     "physics": {...},
     "renderer": {...}
   }
   ```

2. Add to `presets/index.json`

3. Import in `src/api/presets.ts`:
   ```typescript
   import myPreset from '../../presets/my-preset.json';
   
   const presets: Map<string, EffectSpec> = new Map([
     // ...
     ['my-preset', myPreset as EffectSpec],
   ]);
   ```

4. Validate it works:
   ```bash
   npm test
   ```

## Coding Guidelines

### TypeScript

- Use strict mode (already configured)
- Prefer interfaces over types for public APIs
- Add JSDoc comments for public functions
- Avoid `any` - use `unknown` and type guards

### Naming Conventions

- **Files**: camelCase (e.g., `particlePool.ts`)
- **Classes**: PascalCase (e.g., `ParticlePool`)
- **Functions**: camelCase (e.g., `getPreset`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_PARTICLES`)
- **Types**: PascalCase (e.g., `EffectSpec`)

### Code Style

- Use Prettier for formatting (configured)
- 100 character line limit
- Single quotes for strings
- No semicolons (Prettier handles this)
- Trailing commas in objects/arrays

### Comments

- Explain **why**, not **what**
- Use JSDoc for public APIs
- Keep comments concise

Good:
```typescript
// Clamp delta to prevent instability during frame drops
deltaTime = Math.min(deltaTime, 0.033);
```

Bad:
```typescript
// Set deltaTime to minimum of deltaTime and 0.033
deltaTime = Math.min(deltaTime, 0.033);
```

## Testing Guidelines

- **Test public APIs**, not internal implementation
- Use **descriptive test names**
- **Arrange, Act, Assert** pattern
- Mock external dependencies (Three.js, canvas)
- Aim for >80% coverage

Example:
```typescript
describe('validateEffectSpec', () => {
  it('should reject spec with negative particle count', () => {
    // Arrange
    const invalidSpec = { ...validSpec, emitters: [{ ...emitter, maxParticles: -100 }] };
    
    // Act
    const result = validateEffectSpec(invalidSpec);
    
    // Assert
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('maxParticles');
  });
});
```

## Documentation

- Update README.md for user-facing changes
- Update inline JSDoc for API changes
- Add examples for new features
- Keep CHANGELOG.md up to date

## Pull Request Process

1. **Update tests** and ensure they pass
2. **Update documentation**
3. **Update CHANGELOG.md**
4. **Ensure CI passes**
5. **Request review**

### PR Title Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat: add new particle emitter type`
- `fix: correct velocity calculation`
- `docs: update API documentation`
- `test: add tests for validator`
- `refactor: simplify RNG logic`
- `perf: optimize particle update loop`

### PR Description Template

```markdown
## Description
Brief description of changes

## Motivation
Why is this change needed?

## Changes
- Change 1
- Change 2

## Testing
How was this tested?

## Screenshots (if applicable)

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] CI passing
```

## Performance Considerations

- **Minimize allocations** in hot paths (use object pools)
- **Batch operations** when possible
- **Profile before optimizing** (`npm run perf`)
- **Test on low-end devices**

## Shader Development

When adding/modifying shaders:

1. **Keep shaders small** and modular
2. **Comment complex math**
3. **Test on multiple GPUs**
4. **Provide CPU fallback** if needed

## Release Process

(For maintainers)

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create git tag: `git tag v1.0.0`
4. Push: `git push --tags`
5. Publish: `npm publish`
6. Create GitHub release with notes

## Questions?

- Open an issue with the `question` label
- Join discussions in GitHub Discussions
- Check existing issues and PRs

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🎉
