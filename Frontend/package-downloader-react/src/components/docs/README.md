# Component Documentation

This directory contains comprehensive documentation for all React components in the package-downloader-react application.

## Available Documentation

### Cart Components
- **[CartItem](./CartItem.md)** - Individual cart item display with package details and remove functionality
- **[DownloadButton](./DownloadButton.md)** - Primary action button for downloading all packages in cart

### Search Components
- **[SearchBar](./SearchBar.md)** - Autocomplete search input with suggestions
- **[SearchForm](./SearchForm.md)** - Complete search interface with filters and results

### Notification Components
- **[Notification](./Notification.md)** - Toast-style notification banner system

## Documentation Standards

Each component documentation includes:

1. **Overview** - Brief description of the component's purpose
2. **Props** - Detailed prop interface with types and descriptions
3. **Features** - List of key capabilities
4. **State Management** - MobX store integration details
5. **Data Test IDs** - All `data-testid` attributes for testing
6. **Usage Examples** - Code examples showing how to use the component
7. **Dependencies** - Required libraries and imports
8. **Accessibility** - ARIA labels and keyboard navigation support

## Testing

All documented components have comprehensive unit tests with:
- ✅ Positive scenarios (happy path testing)
- ❌ Negative scenarios (error handling)
- 🔄 Edge cases (boundary conditions)
- 🔗 Integration tests (component interaction)
- 📊 MobX observer integration

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests once (CI mode)
npm run test:run
```

## Data Test IDs Convention

All components use semantic `data-testid` attributes following this pattern:
- Main component: `{component-name}`
- Sub-elements: `{component-name}-{element-type}`
- Dynamic elements: `{component-name}-{element-type}-{id}`

Example:
```tsx
<div data-testid="cart-item">
  <Avatar data-testid="cart-item-avatar" />
  <Button data-testid="cart-item-delete-button" />
</div>
```

## Component Architecture

Components follow these principles:
1. **Modular** - Each component has a single, well-defined responsibility
2. **Observable** - MobX observer pattern for reactive updates
3. **Testable** - All components have semantic test IDs and comprehensive tests
4. **Accessible** - Proper ARIA labels and keyboard navigation
5. **Documented** - Clear documentation with examples

## Contributing

When adding new components:
1. Add `data-testid` attributes to all interactive elements
2. Create comprehensive unit tests (positive, negative, edge cases)
3. Write documentation following the template above
4. Ensure accessibility standards are met
5. Use MobX observer pattern for reactive state
