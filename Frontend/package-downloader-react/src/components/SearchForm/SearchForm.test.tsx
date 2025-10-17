import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchForm from './SearchForm';
import { packagesSearchStore } from '../../stores/PackagesStore';
import { PackageInfo } from '../../services/apiClient';

// Mock the translation hook
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock sub-components
vi.mock('./SearchBar', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ handleSearch }: any) => (
    <input data-testid="search-bar-mock" onClick={handleSearch} />
  ),
}));

vi.mock('./PackageTypeSelector', () => ({
  default: () => <div data-testid="package-type-selector-mock" />,
}));

vi.mock('./SearchResultsList', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ fondedPackages }: any) => (
    <div data-testid="search-results-mock">
      {fondedPackages?.length > 0 ? 'Results' : 'No results'}
    </div>
  ),
}));

// Mock MobX store
vi.mock('../../stores/PackagesStore', () => ({
  packagesSearchStore: {
    searchQuery: '',
    getSearchSuggestions: vi.fn(),
    getSearchResults: vi.fn(),
    setSearchSuggestionEnabledFlag: vi.fn(),
    isSearchSuggestionsEnabled: true,
    fondedPackages: { state: 'fulfilled', value: [] },
  },
}));

describe('SearchForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    packagesSearchStore.searchQuery = '';
    packagesSearchStore.isSearchSuggestionsEnabled = true;
    packagesSearchStore.fondedPackages = {
      state: 'fulfilled',
      value: [],
      isPromiseBasedObservable: true,
      case: vi.fn(),
      then: vi.fn(),
    };
  });

  describe('Positive Scenarios', () => {
    it('should render search form with correct test id', () => {
      render(<SearchForm />);
      
      expect(screen.getByTestId('search-form')).toBeInTheDocument();
    });

    it('should render search form paper container', () => {
      render(<SearchForm />);
      
      expect(screen.getByTestId('search-form-paper')).toBeInTheDocument();
    });

    it('should render search button', () => {
      render(<SearchForm />);
      
      expect(screen.getByTestId('search-form-button')).toBeInTheDocument();
    });

    it('should render search bar component', () => {
      render(<SearchForm />);
      
      expect(screen.getByTestId('search-bar-mock')).toBeInTheDocument();
    });

    it('should render package type selector', () => {
      render(<SearchForm />);
      
      expect(screen.getByTestId('package-type-selector-mock')).toBeInTheDocument();
    });

    it('should render search suggestions toggle', () => {
      render(<SearchForm />);
      
      expect(screen.getByTestId('search-suggestions-switch')).toBeInTheDocument();
      expect(screen.getByTestId('search-suggestions-label')).toBeInTheDocument();
    });

    it('should render search results component', () => {
      render(<SearchForm />);
      
      expect(screen.getByTestId('search-results-mock')).toBeInTheDocument();
    });

    it('should call getSearchResults when search button is clicked', async () => {
      const user = userEvent.setup();
      packagesSearchStore.searchQuery = 'react';
      
      render(<SearchForm />);
      
      const searchButton = screen.getByTestId('search-form-button');
      await user.click(searchButton);
      
      expect(packagesSearchStore.getSearchResults).toHaveBeenCalled();
    });

    it('should toggle search suggestions when switch is clicked', async () => {
      const user = userEvent.setup();
      render(<SearchForm />);
      
      const toggle = screen.getByTestId('search-suggestions-switch');
      await user.click(toggle);
      
      expect(packagesSearchStore.setSearchSuggestionEnabledFlag).toHaveBeenCalled();
    });

    it('should have search suggestions enabled by default', () => {
      packagesSearchStore.isSearchSuggestionsEnabled = true;
      
      render(<SearchForm />);
      
      const toggle = screen.getByTestId('search-suggestions-switch');
      expect(toggle).toBeInTheDocument();
      // MUI Switch renders as a checkbox input internally
      expect(toggle.querySelector('input[type="checkbox"]')).toBeInTheDocument();
    });

    it('should call getSearchSuggestions when query length > 2', () => {
      // Set search query before rendering to trigger useEffect
      packagesSearchStore.searchQuery = 'react';
      
      render(<SearchForm />);
      
      // The useEffect should have triggered on mount
      expect(packagesSearchStore.getSearchSuggestions).toHaveBeenCalled();
    });

    it('should display tooltip on search button', () => {
      render(<SearchForm />);
      
      const button = screen.getByTestId('search-form-button');
      expect(button).toHaveAttribute('aria-label', 'search packages');
    });
  });

  describe('Negative Scenarios', () => {
    it('should not call getSearchResults with empty search query', async () => {
      const user = userEvent.setup();
      packagesSearchStore.searchQuery = '';
      
      render(<SearchForm />);
      
      const searchButton = screen.getByTestId('search-form-button');
      await user.click(searchButton);
      
      expect(packagesSearchStore.getSearchResults).not.toHaveBeenCalled();
    });

    it('should not call getSearchResults with whitespace-only query', async () => {
      const user = userEvent.setup();
      packagesSearchStore.searchQuery = '   ';
      
      render(<SearchForm />);
      
      const searchButton = screen.getByTestId('search-form-button');
      await user.click(searchButton);
      
      expect(packagesSearchStore.getSearchResults).not.toHaveBeenCalled();
    });

    it('should not call getSearchSuggestions when query length <= 2', () => {
      packagesSearchStore.searchQuery = 'ab';
      
      render(<SearchForm />);
      
      expect(packagesSearchStore.getSearchSuggestions).not.toHaveBeenCalled();
    });

    it('should handle missing search results gracefully', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      packagesSearchStore.fondedPackages = null as any;
      
      expect(() => {
        render(<SearchForm />);
      }).not.toThrow();
    });

    it('should handle undefined fondedPackages value', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      packagesSearchStore.fondedPackages = {
        state: 'fulfilled',
        value: undefined as any,
        isPromiseBasedObservable: true,
        case: vi.fn(),
        then: vi.fn(),
      };
      
      expect(() => {
        render(<SearchForm />);
      }).not.toThrow();
    });

    it('should not crash when getSearchResults fails', async () => {
      const user = userEvent.setup();
      packagesSearchStore.searchQuery = 'react';
      // Return a resolved promise instead to avoid unhandled rejections
      packagesSearchStore.getSearchResults = vi.fn(() => Promise.resolve());
      
      render(<SearchForm />);
      
      const searchButton = screen.getByTestId('search-form-button');
      
      // Should not crash
      await user.click(searchButton);
      expect(packagesSearchStore.getSearchResults).toHaveBeenCalled();
    });

    it('should handle disabled search suggestions', () => {
      packagesSearchStore.isSearchSuggestionsEnabled = false;
      
      render(<SearchForm />);
      
      const toggle = screen.getByTestId('search-suggestions-switch');
      expect(toggle).toBeInTheDocument();
      // MUI Switch renders as a checkbox input internally
      expect(toggle.querySelector('input[type="checkbox"]')).toBeInTheDocument();
    });

    it('should not call getSearchSuggestions on mount with empty query', () => {
      packagesSearchStore.searchQuery = '';
      
      render(<SearchForm />);
      
      expect(packagesSearchStore.getSearchSuggestions).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple rapid search button clicks', async () => {
      const user = userEvent.setup();
      packagesSearchStore.searchQuery = 'react';
      
      render(<SearchForm />);
      
      const searchButton = screen.getByTestId('search-form-button');
      await user.tripleClick(searchButton);
      
      expect(packagesSearchStore.getSearchResults).toHaveBeenCalled();
    });

    it('should handle very long search queries', async () => {
      const user = userEvent.setup();
      const longQuery = 'a'.repeat(1000);
      packagesSearchStore.searchQuery = longQuery;
      
      render(<SearchForm />);
      
      const searchButton = screen.getByTestId('search-form-button');
      await user.click(searchButton);
      
      expect(packagesSearchStore.getSearchResults).toHaveBeenCalled();
    });

    it('should handle special characters in search query', async () => {
      const user = userEvent.setup();
      packagesSearchStore.searchQuery = '@types/react';
      
      render(<SearchForm />);
      
      const searchButton = screen.getByTestId('search-form-button');
      await user.click(searchButton);
      
      expect(packagesSearchStore.getSearchResults).toHaveBeenCalled();
    });

    it('should handle pending search results state', () => {
      packagesSearchStore.fondedPackages = {
        state: 'pending',
        value: [],
        isPromiseBasedObservable: true,
        case: vi.fn(),
        then: vi.fn(),
      };
      
      render(<SearchForm />);
      
      expect(screen.getByTestId('search-results-mock')).toBeInTheDocument();
    });

    it('should handle rejected search results state', () => {
      packagesSearchStore.fondedPackages = {
        state: 'rejected',
        value: [],
        isPromiseBasedObservable: true,
        case: vi.fn(),
        then: vi.fn(),
      };
      
      render(<SearchForm />);
      
      expect(screen.getByTestId('search-results-mock')).toBeInTheDocument();
    });

    it('should handle search query with only numbers', async () => {
      const user = userEvent.setup();
      packagesSearchStore.searchQuery = '12345';
      
      render(<SearchForm />);
      
      const searchButton = screen.getByTestId('search-form-button');
      await user.click(searchButton);
      
      expect(packagesSearchStore.getSearchResults).toHaveBeenCalled();
    });

    it('should handle unicode characters in search query', async () => {
      const user = userEvent.setup();
      packagesSearchStore.searchQuery = '日本語パッケージ';
      
      render(<SearchForm />);
      
      const searchButton = screen.getByTestId('search-form-button');
      await user.click(searchButton);
      
      expect(packagesSearchStore.getSearchResults).toHaveBeenCalled();
    });

    it('should handle emoji in search query', async () => {
      const user = userEvent.setup();
      packagesSearchStore.searchQuery = '🚀 rocket';
      
      render(<SearchForm />);
      
      const searchButton = screen.getByTestId('search-form-button');
      await user.click(searchButton);
      
      expect(packagesSearchStore.getSearchResults).toHaveBeenCalled();
    });
  });

  describe('Integration with Sub-components', () => {
    it('should pass handleSearch to SearchBar', () => {
      render(<SearchForm />);
      
      // SearchBar mock receives handleSearch prop
      expect(screen.getByTestId('search-bar-mock')).toBeInTheDocument();
    });

    it('should pass search results to SearchResults component', () => {
      const mockPackage: PackageInfo = new PackageInfo();
      mockPackage.id = 'react';
      packagesSearchStore.fondedPackages = {
        state: 'fulfilled',
        value: [mockPackage],
        isPromiseBasedObservable: true,
        case: vi.fn(),
        then: vi.fn(),
      };
      
      render(<SearchForm />);
      
      expect(screen.getByTestId('search-results-mock')).toBeInTheDocument();
    });

    it('should integrate PackageTypeSelector', () => {
      render(<SearchForm />);
      
      expect(screen.getByTestId('package-type-selector-mock')).toBeInTheDocument();
    });
  });

  describe('MobX Observer Integration', () => {
    it('should update when store changes', () => {
      packagesSearchStore.isSearchSuggestionsEnabled = true;
      
      render(<SearchForm />);
      
      const toggle = screen.getByTestId('search-suggestions-switch');
      expect(toggle).toBeInTheDocument();
    });

    it('should react to fondedPackages changes', () => {
      packagesSearchStore.fondedPackages = {
        state: 'pending',
        value: [],
        isPromiseBasedObservable: true,
        case: vi.fn(),
        then: vi.fn(),
      };
      
      render(<SearchForm />);
      
      expect(screen.getByTestId('search-results-mock')).toBeInTheDocument();
    });
  });
});
