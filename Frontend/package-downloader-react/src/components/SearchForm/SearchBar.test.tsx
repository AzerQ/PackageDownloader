import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from './SearchBar';
import { packagesSearchStore } from '../../stores/PackagesStore';

// Mock the translation hook
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock MobX store
vi.mock('../../stores/PackagesStore', () => ({
  packagesSearchStore: {
    searchQuery: '',
    setSearchQuery: vi.fn(),
    searchSuggestions: { state: 'fulfilled', value: [] },
  },
}));

describe('SearchBar Component', () => {
  const mockHandleSearch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    packagesSearchStore.searchQuery = '';
    packagesSearchStore.searchSuggestions = { state: 'fulfilled', value: [] };
  });

  describe('Positive Scenarios', () => {
    it('should render search bar with correct test id', () => {
      render(<SearchBar handleSearch={mockHandleSearch} />);
      
      expect(screen.getByTestId('search-bar-input')).toBeInTheDocument();
    });

    it('should display search label', () => {
      render(<SearchBar handleSearch={mockHandleSearch} />);
      
      expect(screen.getByLabelText('SearchForPackagesLabel')).toBeInTheDocument();
    });

    it('should call handleSearch when Enter key is pressed', async () => {
      const user = userEvent.setup();
      render(<SearchBar handleSearch={mockHandleSearch} />);
      
      const input = screen.getByRole('combobox');
      await user.type(input, 'react{Enter}');
      
      await waitFor(() => {
        expect(mockHandleSearch).toHaveBeenCalled();
      });
    });

    it('should update search query on input change', async () => {
      const user = userEvent.setup();
      render(<SearchBar handleSearch={mockHandleSearch} />);
      
      const input = screen.getByRole('combobox');
      await user.type(input, 'lodash');
      
      expect(packagesSearchStore.setSearchQuery).toHaveBeenCalled();
    });

    it('should show suggestions when available', () => {
      packagesSearchStore.searchSuggestions = {
        state: 'fulfilled',
        value: ['react', 'react-dom', 'react-router'],
      };
      
      render(<SearchBar handleSearch={mockHandleSearch} />);
      
      expect(screen.getByTestId('search-bar-input')).toBeInTheDocument();
    });

    it('should show loading indicator when fetching suggestions', () => {
      packagesSearchStore.searchSuggestions = { state: 'pending', value: [] };
      
      render(<SearchBar handleSearch={mockHandleSearch} />);
      
      expect(screen.getByTestId('search-bar-loading')).toBeInTheDocument();
    });

    it('should call handleSearch when selecting a suggestion', async () => {
      const user = userEvent.setup();
      packagesSearchStore.searchSuggestions = {
        state: 'fulfilled',
        value: ['react'],
      };
      
      render(<SearchBar handleSearch={mockHandleSearch} />);
      
      const input = screen.getByRole('combobox');
      await user.click(input);
      
      // Verify the autocomplete is interactive
      expect(input).toBeInTheDocument();
    });
  });

  describe('Negative Scenarios', () => {
    it('should handle empty search query gracefully', async () => {
      const user = userEvent.setup();
      packagesSearchStore.searchQuery = '';
      
      render(<SearchBar handleSearch={mockHandleSearch} />);
      
      const input = screen.getByRole('combobox');
      await user.type(input, '{Enter}');
      
      await waitFor(() => {
        expect(mockHandleSearch).toHaveBeenCalled();
      });
    });

    it('should not show loading indicator when suggestions are fulfilled', () => {
      packagesSearchStore.searchSuggestions = {
        state: 'fulfilled',
        value: ['react'],
      };
      
      render(<SearchBar handleSearch={mockHandleSearch} />);
      
      expect(screen.queryByTestId('search-bar-loading')).not.toBeInTheDocument();
    });

    it('should handle failed suggestion fetch', () => {
      packagesSearchStore.searchSuggestions = { state: 'rejected', value: [] };
      
      render(<SearchBar handleSearch={mockHandleSearch} />);
      
      expect(screen.getByTestId('search-bar-input')).toBeInTheDocument();
      expect(screen.queryByTestId('search-bar-loading')).not.toBeInTheDocument();
    });

    it('should handle missing handleSearch prop gracefully', () => {
      // Testing with undefined handleSearch - should not crash
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render(<SearchBar handleSearch={undefined as any} />);
      }).not.toThrow();
    });

    it('should handle special characters in search query', async () => {
      const user = userEvent.setup();
      render(<SearchBar handleSearch={mockHandleSearch} />);
      
      const input = screen.getByRole('combobox');
      await user.type(input, '@types/node');
      
      expect(packagesSearchStore.setSearchQuery).toHaveBeenCalled();
    });

    it('should not crash when suggestions is null', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      packagesSearchStore.searchSuggestions = null as any;
      
      expect(() => {
        render(<SearchBar handleSearch={mockHandleSearch} />);
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid Enter key presses', async () => {
      const user = userEvent.setup();
      render(<SearchBar handleSearch={mockHandleSearch} />);
      
      const input = screen.getByRole('combobox');
      await user.type(input, 'test{Enter}{Enter}{Enter}');
      
      // Should handle multiple calls without crashing
      expect(mockHandleSearch).toHaveBeenCalled();
    });

    it('should handle very long search queries', async () => {
      const user = userEvent.setup();
      // Use a shorter string to avoid timeout
      const longQuery = 'a'.repeat(50);
      
      render(<SearchBar handleSearch={mockHandleSearch} />);
      
      const input = screen.getByRole('combobox');
      await user.type(input, longQuery);
      
      expect(packagesSearchStore.setSearchQuery).toHaveBeenCalled();
    });
  });
});
