# SearchBar Component

## Overview
The `SearchBar` component provides an autocomplete search input for package searching functionality. It integrates with the MobX store to manage search queries and suggestions.

## Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| handleSearch | `() => Promise<unknown>` | Yes | Callback function triggered when search is initiated |

## Features
- **Autocomplete**: Provides search suggestions as user types
- **Loading State**: Shows loading indicator while fetching suggestions
- **Enter Key Support**: Triggers search when Enter key is pressed
- **Free Solo Mode**: Allows users to enter custom search queries not in suggestions
- **Internationalization**: Label text is localized

## State Management
Uses `packagesSearchStore` from MobX:
- `searchQuery`: Current search input value
- `setSearchQuery`: Updates the search query
- `searchSuggestions`: Async observable containing suggestion results

## Data Test IDs
- `search-bar-autocomplete`: Main autocomplete wrapper
- `search-bar-input`: Text input field
- `search-bar-loading`: Loading indicator (when visible)

## Usage Example
```tsx
import SearchBar from './SearchBar';

const handleSearch = async () => {
  // Perform search logic
};

<SearchBar handleSearch={handleSearch} />
```

## Dependencies
- Material-UI (Autocomplete, TextField, CircularProgress)
- MobX (observer, packagesSearchStore)
- react-i18next (useTranslation)

## Accessibility
- Proper ARIA labels for screen readers
- Keyboard navigation support (Enter key)
- Loading state feedback
