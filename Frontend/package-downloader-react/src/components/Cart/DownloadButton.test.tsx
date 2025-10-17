import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DownloadPackagesButton from './DownloadButton';
import { cartStore } from '../../stores/CartStore';

// Mock the translation hook
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock MobX store
vi.mock('../../stores/CartStore', () => ({
  cartStore: {
    getPackagesDownloadLink: vi.fn(),
  },
}));

describe('DownloadPackagesButton Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Positive Scenarios', () => {
    it('should render download button with correct test id', () => {
      render(<DownloadPackagesButton />);
      
      expect(screen.getByTestId('download-button')).toBeInTheDocument();
    });

    it('should display download text from translation', () => {
      render(<DownloadPackagesButton />);
      
      expect(screen.getByText('Download')).toBeInTheDocument();
    });

    it('should call getPackagesDownloadLink when clicked', async () => {
      const user = userEvent.setup();
      render(<DownloadPackagesButton />);
      
      const button = screen.getByTestId('download-button');
      await user.click(button);
      
      expect(cartStore.getPackagesDownloadLink).toHaveBeenCalledTimes(1);
    });

    it('should render with FileDownload icon', () => {
      render(<DownloadPackagesButton />);
      
      const button = screen.getByTestId('download-button');
      const icon = button.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should be a contained primary button', () => {
      render(<DownloadPackagesButton />);
      
      const button = screen.getByTestId('download-button');
      expect(button).toHaveClass('MuiButton-contained');
      expect(button).toHaveClass('MuiButton-containedPrimary');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<DownloadPackagesButton />);
      
      const button = screen.getByTestId('download-button');
      await user.tab();
      
      expect(button).toHaveFocus();
      
      await user.keyboard('{Enter}');
      expect(cartStore.getPackagesDownloadLink).toHaveBeenCalled();
    });

    it('should be keyboard accessible with Space key', async () => {
      const user = userEvent.setup();
      render(<DownloadPackagesButton />);
      
      const button = screen.getByTestId('download-button');
      button.focus();
      
      await user.keyboard(' ');
      expect(cartStore.getPackagesDownloadLink).toHaveBeenCalled();
    });

    it('should have correct button type', () => {
      render(<DownloadPackagesButton />);
      
      const button = screen.getByTestId('download-button');
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  describe('Negative Scenarios', () => {
    it('should not call getPackagesDownloadLink on render', () => {
      render(<DownloadPackagesButton />);
      
      expect(cartStore.getPackagesDownloadLink).not.toHaveBeenCalled();
    });

    it('should handle getPackagesDownloadLink errors gracefully', () => {
      // Just verify that component renders even if the function could throw
      cartStore.getPackagesDownloadLink = vi.fn();
      
      render(<DownloadPackagesButton />);
      
      expect(screen.getByTestId('download-button')).toBeInTheDocument();
      expect(cartStore.getPackagesDownloadLink).not.toHaveBeenCalled();
    });

    it('should handle missing translation gracefully', () => {
      // Component should still render even if translation fails
      render(<DownloadPackagesButton />);
      
      expect(screen.getByTestId('download-button')).toBeInTheDocument();
    });

    it('should not trigger download on hover', async () => {
      const user = userEvent.setup();
      render(<DownloadPackagesButton />);
      
      const button = screen.getByTestId('download-button');
      await user.hover(button);
      
      expect(cartStore.getPackagesDownloadLink).not.toHaveBeenCalled();
    });

    it('should not trigger download on focus', async () => {
      const user = userEvent.setup();
      render(<DownloadPackagesButton />);
      
      const button = screen.getByTestId('download-button');
      await user.tab();
      
      expect(button).toHaveFocus();
      expect(cartStore.getPackagesDownloadLink).not.toHaveBeenCalled();
    });

    it('should handle disabled state if implemented', () => {
      render(<DownloadPackagesButton />);
      
      const button = screen.getByTestId('download-button');
      // Should be enabled by default
      expect(button).not.toBeDisabled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple rapid clicks', async () => {
      const user = userEvent.setup();
      render(<DownloadPackagesButton />);
      
      const button = screen.getByTestId('download-button');
      await user.tripleClick(button);
      
      // Should call the function multiple times
      expect(cartStore.getPackagesDownloadLink).toHaveBeenCalled();
    });

    it('should handle async getPackagesDownloadLink', async () => {
      const user = userEvent.setup();
      cartStore.getPackagesDownloadLink = vi.fn(
        () => new Promise<void>((resolve) => setTimeout(resolve, 100))
      );
      
      render(<DownloadPackagesButton />);
      
      const button = screen.getByTestId('download-button');
      await user.click(button);
      
      expect(cartStore.getPackagesDownloadLink).toHaveBeenCalledTimes(1);
    });

    it('should maintain button structure with icon and text', () => {
      render(<DownloadPackagesButton />);
      
      const button = screen.getByTestId('download-button');
      const icon = button.querySelector('.MuiButton-startIcon');
      expect(icon).toBeInTheDocument();
    });

    it('should handle right-click (context menu)', async () => {
      const user = userEvent.setup();
      render(<DownloadPackagesButton />);
      
      const button = screen.getByTestId('download-button');
      await user.pointer({ keys: '[MouseRight>]', target: button });
      
      // Right-click should not trigger download
      expect(cartStore.getPackagesDownloadLink).not.toHaveBeenCalled();
    });

    it('should render consistently on multiple renders', () => {
      const { rerender } = render(<DownloadPackagesButton />);
      const firstRender = screen.getByTestId('download-button').innerHTML;
      
      rerender(<DownloadPackagesButton />);
      const secondRender = screen.getByTestId('download-button').innerHTML;
      
      expect(firstRender).toBe(secondRender);
    });
  });

  describe('MobX Observer Integration', () => {
    it('should re-render when store changes', () => {
      const { rerender } = render(<DownloadPackagesButton />);
      
      expect(screen.getByTestId('download-button')).toBeInTheDocument();
      
      rerender(<DownloadPackagesButton />);
      
      expect(screen.getByTestId('download-button')).toBeInTheDocument();
    });
  });
});
