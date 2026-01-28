# TypeScript Unit Test Skill

Write unit tests following the project's established patterns and conventions.

## Test Framework

- Use **Vitest** as the test framework
- Import from `vitest`: `describe`, `it`, `expect`, `vi`

## File Location

- Place unit tests in `src/tests/unit/`
- Mirror the source file structure (e.g., `src/services/http.ts` → `src/tests/unit/services/http.spec.ts`)
- Use `.spec.ts` extension for test files

## Test Structure

### AAA Pattern with Comments

Every test MUST include AAA (Arrange, Act, Assert) comments:

```typescript
it('should do something', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = doSomething(input);

    // Assert
    expect(result).toBe('expected');
});
```

For tests where Act and Assert are combined (e.g., testing exceptions):

```typescript
it('should throw an error', async () => {
    // Arrange
    const service = createService();

    // Act & Assert
    await expect(service.doSomething()).rejects.toThrow();
});
```

### Test Naming

- Test descriptions MUST start with "should"
- Use descriptive names that explain the expected behavior

```typescript
// Good
it('should return user data when valid id is provided', () => {});
it('should throw error when user is not found', () => {});

// Bad
it('returns user data', () => {});
it('test error case', () => {});
```

### Self-Contained Tests

- Each test should be fully self-contained
- Avoid `beforeEach`/`afterEach` for shared mutable state
- Set up and tear down within each test

```typescript
// Good - self-contained
it('should make a GET request', async () => {
    // Arrange
    const mock = new MockAdapter(axios);
    const service = createService();
    mock.onGet('/users').reply(200, { id: 1 });

    // Act
    const result = await service.getUsers();

    // Assert
    expect(result.data).toEqual({ id: 1 });

    mock.restore();
});

// Avoid - shared state
let mock: MockAdapter;
beforeEach(() => {
    mock = new MockAdapter(axios);
});
```

## Mocking

### HTTP Requests with axios-mock-adapter

```typescript
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

it('should fetch data', async () => {
    // Arrange
    const mock = new MockAdapter(axios);
    mock.onGet(`${baseURL}/endpoint`).reply(200, { data: 'value' });

    // Act
    const result = await service.getData();

    // Assert
    expect(result.data).toEqual({ data: 'value' });

    mock.restore();
});
```

### Function Mocks

Use `vi.fn()` for mock functions:

```typescript
const middleware = vi.fn();
```

### Spying on Methods

Use `vi.spyOn()` to spy on existing methods:

```typescript
const createSpy = vi.spyOn(axios, 'create');
```

### Type-Safe Mock Access

Use `vi.mocked()` for type-safe access to mocked functions:

```typescript
vi.mocked(axios.create).mockReturnValue(mockInstance);
```

## Code Style

- Use `const` instead of `let` wherever possible
- Use arrow function notation
- No type assertions (`as unknown as`) unless absolutely necessary

## Coverage

- Tests must maintain 100% code coverage
- Run `npm run test:coverage` to verify

## Running Tests

```bash
# Run all tests
npm run test:unit

# Run tests in watch mode
npm run test:unit -- --watch

# Run tests with coverage
npm run test:coverage
```
