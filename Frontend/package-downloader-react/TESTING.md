# Testing Guide

This document provides comprehensive information about the testing infrastructure for the Package Downloader React application.

## Test Stack

- **Test Framework**: [Vitest](https://vitest.dev/) - Fast unit test framework powered by Vite
- **Testing Library**: [@testing-library/react](https://testing-library.com/react) - React component testing utilities
- **DOM Testing**: [@testing-library/jest-dom](https://github.com/testing-library/jest-dom) - Custom matchers for DOM testing
- **User Interactions**: [@testing-library/user-event](https://testing-library.com/docs/user-event/intro) - Simulates user interactions
- **Test Environment**: [jsdom](https://github.com/jsdom/jsdom) - JavaScript implementation of web standards

## Running Tests

```bash
# Run tests in watch mode (development)
npm run test

# Run tests once (CI/CD)
npm run test:run

# Run tests with UI interface
npm run test:ui
```

## Test Coverage

Currently, we have **111 passing tests** across 5 test suites:

| Component | Tests | Coverage Areas |
|-----------|-------|----------------|
| SearchBar | 15 | Input handling, autocomplete, keyboard events |
| CartItem | 17 | Display, deletion, edge cases |
| DownloadButton | 20 | Click handling, state management, accessibility |
| Notification | 26 | Multiple notifications, severity levels, auto-dismiss |
| SearchForm | 33 | Complete search workflow, integration |

## Test Structure

Each test file follows this structure:

```typescript
describe('Component Name', () => {
  describe('Positive Scenarios', () => {
    // Happy path tests - normal expected behavior
    it('should render correctly', () => { ... });
    it('should handle user interaction', () => { ... });
  });

  describe('Negative Scenarios', () => {
    // Error handling and edge cases
    it('should handle missing props', () => { ... });
    it('should handle errors gracefully', () => { ... });
  });

  describe('Edge Cases', () => {
    // Boundary conditions
    it('should handle very long input', () => { ... });
    it('should handle rapid interactions', () => { ... });
  });

  describe('Integration Tests', () => {
    // Component interaction with others
    it('should work with sub-components', () => { ... });
  });

  describe('MobX Observer Integration', () => {
    // Reactive state updates
    it('should update when store changes', () => { ... });
  });
});
```

## Testing Best Practices

### 1. Use Data Test IDs

All components have `data-testid` attributes for reliable element selection:

```tsx
// Component
<button data-testid="download-button">Download</button>

// Test
const button = screen.getByTestId('download-button');
```

### 2. Test User Behavior, Not Implementation

```typescript
// ✅ Good - tests user behavior
it('should download packages when button is clicked', async () => {
  const user = userEvent.setup();
  render(<DownloadButton />);
  await user.click(screen.getByTestId('download-button'));
  expect(mockDownload).toHaveBeenCalled();
});

// ❌ Bad - tests implementation details
it('should call onClick handler', () => {
  const onClick = vi.fn();
  render(<DownloadButton onClick={onClick} />);
  // Testing internal prop instead of user behavior
});
```

### 3. Mock External Dependencies

```typescript
// Mock MobX stores
vi.mock('../../stores/CartStore', () => ({
  cartStore: {
    removeCartItem: vi.fn(),
  },
}));

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));
```

### 4. Test Accessibility

```typescript
it('should have proper ARIA labels', () => {
  render(<SearchButton />);
  const button = screen.getByTestId('search-button');
  expect(button).toHaveAttribute('aria-label', 'search packages');
});
```

### 5. Handle Async Operations

```typescript
it('should handle async search', async () => {
  const user = userEvent.setup();
  render(<SearchBar handleSearch={mockSearch} />);
  
  await user.type(screen.getByRole('combobox'), 'react');
  await user.keyboard('{Enter}');
  
  await waitFor(() => {
    expect(mockSearch).toHaveBeenCalled();
  });
});
```

## Test Scenarios Covered

### Positive Scenarios ✅
- Component renders correctly
- User interactions work as expected
- Props are handled properly
- Data displays correctly
- State updates trigger re-renders

### Negative Scenarios ❌
- Missing or invalid props
- Empty or null data
- Error conditions
- Network failures (mocked)
- Invalid user input

### Edge Cases 🔄
- Very long strings
- Special characters
- Unicode and emoji
- Rapid user interactions
- Boundary values
- Duplicate data

### Integration Tests 🔗
- Components work together
- Store updates propagate
- Events bubble correctly
- Context is provided

## Common Testing Patterns

### Rendering Components

```typescript
import { render, screen } from '@testing-library/react';

it('should render component', () => {
  render(<MyComponent />);
  expect(screen.getByTestId('my-component')).toBeInTheDocument();
});
```

### User Interactions

```typescript
import userEvent from '@testing-library/user-event';

it('should handle click', async () => {
  const user = userEvent.setup();
  render(<Button />);
  await user.click(screen.getByTestId('button'));
});
```

### Async Queries

```typescript
import { waitFor } from '@testing-library/react';

it('should load data', async () => {
  render(<DataComponent />);
  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  });
});
```

### Testing Forms

```typescript
it('should submit form', async () => {
  const user = userEvent.setup();
  render(<Form />);
  
  await user.type(screen.getByTestId('input'), 'value');
  await user.click(screen.getByTestId('submit'));
  
  expect(mockSubmit).toHaveBeenCalledWith({ value: 'value' });
});
```

## Debugging Tests

### View rendered output

```typescript
import { screen } from '@testing-library/react';

screen.debug(); // Prints entire DOM
screen.debug(element); // Prints specific element
```

### Check available queries

```typescript
screen.logTestingPlaygroundURL(); // Opens Testing Playground
```

### Run specific test

```bash
npm run test SearchBar.test.tsx
```

## Continuous Integration

Tests run automatically on:
- Pull requests
- Commits to main branch
- Before deployment

## Adding New Tests

1. Create test file next to component: `Component.test.tsx`
2. Add `data-testid` attributes to component
3. Write tests covering:
   - Positive scenarios
   - Negative scenarios
   - Edge cases
   - Integration (if applicable)
4. Run tests: `npm run test:run`
5. Update documentation

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [User Event API](https://testing-library.com/docs/user-event/intro)
- [Component Documentation](./src/components/docs/README.md)

## Troubleshooting

### Tests timing out
- Increase timeout in test: `{ timeout: 10000 }`
- Check for unresolved promises
- Verify async operations complete

### Element not found
- Check `data-testid` is correct
- Use `screen.debug()` to see rendered output
- Verify component actually renders element

### Mock not working
- Ensure mock is defined before import
- Check mock path is correct
- Clear mocks between tests with `vi.clearAllMocks()`

### State not updating
- Use `await` for async operations
- Wrap updates in `waitFor()`
- Check MobX observer is applied
