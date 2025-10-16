# SearchForm Component

## Overview
The `SearchForm` component is a comprehensive search interface that combines search input, package type selection, and search suggestions toggle. It manages the entire search workflow for package discovery.

## Props
This component does not accept any props. It uses MobX store for state management.

## Features
- **Search Bar**: Autocomplete input with suggestions
- **Search Button**: Manual trigger for search
- **Package Type Selector**: Filter by package type (npm, NuGet, etc.)
- **Search Suggestions Toggle**: Enable/disable autocomplete suggestions
- **Results Display**: Shows search results below the form
- **Loading States**: Visual feedback during search operations
- **Internationalization**: All text is localized

## State Management
Uses `packagesSearchStore` from MobX:
- `searchQuery`: Current search input
- `getSearchSuggestions`: Fetches autocomplete suggestions
- `getSearchResults`: Performs the actual search
- `setSearchSuggestionEnabledFlag`: Toggles suggestions on/off
- `isSearchSuggestionsEnabled`: Current state of suggestions
- `fondedPackages`: Search results (async observable)

## Sub-components
1. **SearchBar**: Autocomplete input field
2. **PackageTypeSelector**: Dropdown for package type
3. **SearchResults**: Displays found packages

## Data Test IDs
- `search-form`: Main container box
- `search-form-paper`: Paper wrapper for search controls
- `search-form-button`: Search icon button
- `search-suggestions-switch`: Toggle for enabling/disabling suggestions
- `search-suggestions-label`: Label for the suggestions toggle

## Usage Example
```tsx
import SearchForm from './SearchForm';

<SearchForm />
```

## Behavior
1. User types in search bar
2. After 2+ characters, suggestions are fetched (if enabled)
3. User can click search button or press Enter
4. Results appear below the form
5. Loading indicator shows during search

## Dependencies
- Material-UI (Box, Paper, IconButton, Switch, FormControlLabel, Tooltip)
- Material-UI Icons (Search)
- MobX (observer, packagesSearchStore)
- react-i18next (useTranslation)
- SearchBar, PackageTypeSelector, SearchResults sub-components

## Side Effects
- `useEffect`: Automatically fetches suggestions when query length > 2

## Accessibility
- Tooltip on search button with description
- ARIA label on search button
- Keyboard support (Enter to search)
- Clear visual feedback for all states
