import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CartItem from './CartItem';
import { cartStore } from '../../stores/CartStore';
import { PackageDetails } from '../../services/apiClient';

// Mock MobX store
vi.mock('../../stores/CartStore', () => ({
  cartStore: {
    removeCartItem: vi.fn(),
  },
}));

describe('CartItem Component', () => {
  const mockPackageDetails: PackageDetails = {
    packageID: 'react',
    packageVersion: '18.2.0',
    packageIconUrl: 'https://example.com/react-icon.png',
    packageDescription: 'A JavaScript library for building user interfaces',
    packageAuthors: 'Facebook',
    packageProjectUrl: 'https://reactjs.org',
    packageLicenseUrl: 'https://example.com/license',
    packageTags: ['ui', 'framework'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Positive Scenarios', () => {
    it('should render cart item with correct test ids', () => {
      render(<CartItem packageDetailItem={mockPackageDetails} />);
      
      expect(screen.getByTestId('cart-item')).toBeInTheDocument();
      expect(screen.getByTestId('cart-item-avatar')).toBeInTheDocument();
      expect(screen.getByTestId('cart-item-text')).toBeInTheDocument();
      expect(screen.getByTestId('cart-item-delete-button')).toBeInTheDocument();
    });

    it('should display package ID and version', () => {
      render(<CartItem packageDetailItem={mockPackageDetails} />);
      
      expect(screen.getByText('react')).toBeInTheDocument();
      expect(screen.getByText('18.2.0')).toBeInTheDocument();
    });

    it('should display package icon with correct src', () => {
      render(<CartItem packageDetailItem={mockPackageDetails} />);
      
      const avatar = screen.getByTestId('cart-item-avatar');
      const img = avatar.querySelector('img');
      expect(img).toHaveAttribute('src', 'https://example.com/react-icon.png');
    });

    it('should display package icon with correct alt text', () => {
      render(<CartItem packageDetailItem={mockPackageDetails} />);
      
      const avatar = screen.getByTestId('cart-item-avatar');
      const img = avatar.querySelector('img');
      expect(img).toHaveAttribute('alt', 'Package icon');
    });

    it('should call removeCartItem when delete button is clicked', async () => {
      const user = userEvent.setup();
      render(<CartItem packageDetailItem={mockPackageDetails} />);
      
      const deleteButton = screen.getByTestId('cart-item-delete-button');
      await user.click(deleteButton);
      
      expect(cartStore.removeCartItem).toHaveBeenCalledWith(mockPackageDetails);
      expect(cartStore.removeCartItem).toHaveBeenCalledTimes(1);
    });

    it('should have proper aria-label on delete button', () => {
      render(<CartItem packageDetailItem={mockPackageDetails} />);
      
      const deleteButton = screen.getByTestId('cart-item-delete-button');
      expect(deleteButton).toHaveAttribute('aria-label', 'delete');
    });

    it('should render delete icon inside button', () => {
      render(<CartItem packageDetailItem={mockPackageDetails} />);
      
      const deleteButton = screen.getByTestId('cart-item-delete-button');
      const icon = deleteButton.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Negative Scenarios', () => {
    it('should handle missing package icon URL gracefully', () => {
      const packageWithoutIcon = {
        ...mockPackageDetails,
        packageIconUrl: '',
      };
      
      render(<CartItem packageDetailItem={packageWithoutIcon} />);
      
      const avatar = screen.getByTestId('cart-item-avatar');
      expect(avatar).toBeInTheDocument();
    });

    it('should handle very long package IDs', () => {
      const packageWithLongId = {
        ...mockPackageDetails,
        packageID: 'very-long-package-name-that-exceeds-normal-length-limits',
      };
      
      render(<CartItem packageDetailItem={packageWithLongId} />);
      
      expect(screen.getByText(packageWithLongId.packageID)).toBeInTheDocument();
    });

    it('should handle special characters in package ID', () => {
      const packageWithSpecialChars = {
        ...mockPackageDetails,
        packageID: '@types/react',
      };
      
      render(<CartItem packageDetailItem={packageWithSpecialChars} />);
      
      expect(screen.getByText('@types/react')).toBeInTheDocument();
    });

    it('should handle missing version', () => {
      const packageWithoutVersion = {
        ...mockPackageDetails,
        packageVersion: '',
      };
      
      render(<CartItem packageDetailItem={packageWithoutVersion} />);
      
      expect(screen.getByTestId('cart-item-text')).toBeInTheDocument();
    });

    it('should not call removeCartItem when item is just rendered', () => {
      render(<CartItem packageDetailItem={mockPackageDetails} />);
      
      expect(cartStore.removeCartItem).not.toHaveBeenCalled();
    });

    it('should handle null or undefined packageIconUrl', () => {
      const packageWithNullIcon = {
        ...mockPackageDetails,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        packageIconUrl: null as any,
      };
      
      expect(() => {
        render(<CartItem packageDetailItem={packageWithNullIcon} />);
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple rapid clicks on delete button', async () => {
      const user = userEvent.setup();
      render(<CartItem packageDetailItem={mockPackageDetails} />);
      
      const deleteButton = screen.getByTestId('cart-item-delete-button');
      await user.tripleClick(deleteButton);
      
      expect(cartStore.removeCartItem).toHaveBeenCalled();
    });

    it('should handle package with beta version', () => {
      const betaPackage = {
        ...mockPackageDetails,
        packageVersion: '1.0.0-beta.1',
      };
      
      render(<CartItem packageDetailItem={betaPackage} />);
      
      expect(screen.getByText('1.0.0-beta.1')).toBeInTheDocument();
    });

    it('should handle package with prerelease version', () => {
      const prereleasePackage = {
        ...mockPackageDetails,
        packageVersion: '2.0.0-rc.1',
      };
      
      render(<CartItem packageDetailItem={prereleasePackage} />);
      
      expect(screen.getByText('2.0.0-rc.1')).toBeInTheDocument();
    });

    it('should maintain list item structure with divider', () => {
      render(<CartItem packageDetailItem={mockPackageDetails} />);
      
      const listItem = screen.getByTestId('cart-item');
      expect(listItem).toHaveClass('MuiListItem-root');
    });
  });
});
