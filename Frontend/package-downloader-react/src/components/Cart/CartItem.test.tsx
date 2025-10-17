import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CartItem from './CartItem';
import { cartStore } from '../../stores/CartStore';
import { IPackageInfo } from '../../services/apiClient';

// Mock MobX store
vi.mock('../../stores/CartStore', () => ({
  cartStore: {
    removeCartItem: vi.fn(),
  },
}));

describe('CartItem Component', () => {
  const mockPackageDetails: IPackageInfo = {
    id: 'react',
    currentVersion: '18.2.0',
    otherVersions: [],
    description: 'A JavaScript library for building user interfaces',
    tags: ['ui', 'framework'],
    authorInfo: 'Facebook',
    repositoryUrl: 'https://reactjs.org',
    iconUrl: 'https://example.com/react-icon.png',
    packageUrl: 'https://reactjs.org',
    downloadsCount: 100,
    isAddedInCart: false,
    getPackageIconOrStockImage: () => 'https://example.com/react-icon.png',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Positive Scenarios', () => {
    it('should render cart item with correct test ids', () => {
      render(<CartItem packageDetailItem={{
        packageID: mockPackageDetails.id,
        packageVersion: mockPackageDetails.currentVersion,
        packageIconUrl: mockPackageDetails.iconUrl ?? ''
      }} />);
      
      expect(screen.getByTestId('cart-item')).toBeInTheDocument();
      expect(screen.getByTestId('cart-item-avatar')).toBeInTheDocument();
      expect(screen.getByTestId('cart-item-text')).toBeInTheDocument();
      expect(screen.getByTestId('cart-item-delete-button')).toBeInTheDocument();
    });

    it('should display package ID and version', () => {
      render(<CartItem packageDetailItem={{
        packageID: mockPackageDetails.id,
        packageVersion: mockPackageDetails.currentVersion,
        packageIconUrl: mockPackageDetails.iconUrl ?? ''
      }} />);
      
      expect(screen.getByText('react')).toBeInTheDocument();
      expect(screen.getByText('18.2.0')).toBeInTheDocument();
    });

    it('should display package icon with correct src', () => {
      render(<CartItem packageDetailItem={{
        packageID: mockPackageDetails.id,
        packageVersion: mockPackageDetails.currentVersion,
        packageIconUrl: mockPackageDetails.iconUrl ?? ''
      }} />);
      
      const avatar = screen.getByTestId('cart-item-avatar');
      const img = avatar.querySelector('img');
      expect(img).toHaveAttribute('src', 'https://example.com/react-icon.png');
    });

    it('should display package icon with correct alt text', () => {
      render(<CartItem packageDetailItem={{
        packageID: mockPackageDetails.id,
        packageVersion: mockPackageDetails.currentVersion,
        packageIconUrl: mockPackageDetails.iconUrl ?? ''
      }} />);
      
      const avatar = screen.getByTestId('cart-item-avatar');
      const img = avatar.querySelector('img');
      expect(img).toHaveAttribute('alt', 'Package icon');
    });

    it('should call removeCartItem when delete button is clicked', async () => {
      const user = userEvent.setup();
      render(<CartItem packageDetailItem={{
        packageID: mockPackageDetails.id,
        packageVersion: mockPackageDetails.currentVersion,
        packageIconUrl: mockPackageDetails.iconUrl ?? ''
      }} />);
      
      const deleteButton = screen.getByTestId('cart-item-delete-button');
      await user.click(deleteButton);
      
      expect(cartStore.removeCartItem).toHaveBeenCalledWith(expect.objectContaining({
        packageID: mockPackageDetails.id
      }));
      expect(cartStore.removeCartItem).toHaveBeenCalledTimes(1);
    });

    it('should have proper aria-label on delete button', () => {
      render(<CartItem packageDetailItem={{
        packageID: mockPackageDetails.id,
        packageVersion: mockPackageDetails.currentVersion,
        packageIconUrl: mockPackageDetails.iconUrl ?? ''
      }} />);
      
      const deleteButton = screen.getByTestId('cart-item-delete-button');
      expect(deleteButton).toHaveAttribute('aria-label', 'delete');
    });

    it('should render delete icon inside button', () => {
      render(<CartItem packageDetailItem={{
        packageID: mockPackageDetails.id,
        packageVersion: mockPackageDetails.currentVersion,
        packageIconUrl: mockPackageDetails.iconUrl ?? ''
      }} />);
      
      const deleteButton = screen.getByTestId('cart-item-delete-button');
      const icon = deleteButton.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Negative Scenarios', () => {
    it('should handle missing package icon URL gracefully', () => {
      const packageWithoutIcon = {
        ...mockPackageDetails,
        iconUrl: '',
      };
      
      render(<CartItem packageDetailItem={{
        packageID: packageWithoutIcon.id,
        packageVersion: packageWithoutIcon.currentVersion,
        packageIconUrl: packageWithoutIcon.iconUrl ?? ''
      }} />);
      
      const avatar = screen.getByTestId('cart-item-avatar');
      expect(avatar).toBeInTheDocument();
    });

    it('should handle very long package IDs', () => {
      const packageWithLongId = {
        ...mockPackageDetails,
        id: 'very-long-package-name-that-exceeds-normal-length-limits',
      };
      
      render(<CartItem packageDetailItem={{
        packageID: packageWithLongId.id,
        packageVersion: packageWithLongId.currentVersion,
        packageIconUrl: packageWithLongId.iconUrl ?? ''
      }} />);
      
      expect(screen.getByText(packageWithLongId.id)).toBeInTheDocument();
    });

    it('should handle special characters in package ID', () => {
      const packageWithSpecialChars = {
        ...mockPackageDetails,
        id: '@types/react',
      };
      
      render(<CartItem packageDetailItem={{
        packageID: packageWithSpecialChars.id,
        packageVersion: packageWithSpecialChars.currentVersion,
        packageIconUrl: packageWithSpecialChars.iconUrl ?? ''
      }} />);
      
      expect(screen.getByText('@types/react')).toBeInTheDocument();
    });

    it('should handle missing version', () => {
      const packageWithoutVersion = {
        ...mockPackageDetails,
        currentVersion: '',
      };
      
      render(<CartItem packageDetailItem={{
        packageID: packageWithoutVersion.id,
        packageVersion: packageWithoutVersion.currentVersion,
        packageIconUrl: packageWithoutVersion.iconUrl ?? ''
      }} />);
      
      expect(screen.getByTestId('cart-item-text')).toBeInTheDocument();
    });

    it('should not call removeCartItem when item is just rendered', () => {
      render(<CartItem packageDetailItem={{
        packageID: mockPackageDetails.id,
        packageVersion: mockPackageDetails.currentVersion,
        packageIconUrl: mockPackageDetails.iconUrl ?? ''
      }} />);
      
      expect(cartStore.removeCartItem).not.toHaveBeenCalled();
    });

    it('should handle null or undefined packageIconUrl', () => {
      const packageWithNullIcon = {
        ...mockPackageDetails,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        iconUrl: null as any,
      };
      
      expect(() => {
        render(<CartItem packageDetailItem={{
          packageID: packageWithNullIcon.id,
          packageVersion: packageWithNullIcon.currentVersion,
          packageIconUrl: packageWithNullIcon.iconUrl ?? ''
        }} />);
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple rapid clicks on delete button', async () => {
      const user = userEvent.setup();
      render(<CartItem packageDetailItem={{
        packageID: mockPackageDetails.id,
        packageVersion: mockPackageDetails.currentVersion,
        packageIconUrl: mockPackageDetails.iconUrl ?? ''
      }} />);
      
      const deleteButton = screen.getByTestId('cart-item-delete-button');
      await user.tripleClick(deleteButton);
      
      expect(cartStore.removeCartItem).toHaveBeenCalled();
    });

    it('should handle package with beta version', () => {
      const betaPackage = {
        ...mockPackageDetails,
        currentVersion: '1.0.0-beta.1',
      };
      
      render(<CartItem packageDetailItem={{
        packageID: betaPackage.id,
        packageVersion: betaPackage.currentVersion,
        packageIconUrl: betaPackage.iconUrl ?? ''
      }} />);
      
      expect(screen.getByText('1.0.0-beta.1')).toBeInTheDocument();
    });

    it('should handle package with prerelease version', () => {
      const prereleasePackage = {
        ...mockPackageDetails,
        currentVersion: '2.0.0-rc.1',
      };
      
      render(<CartItem packageDetailItem={{
        packageID: prereleasePackage.id,
        packageVersion: prereleasePackage.currentVersion,
        packageIconUrl: prereleasePackage.iconUrl ?? ''
      }} />);
      
      expect(screen.getByText('2.0.0-rc.1')).toBeInTheDocument();
    });

    it('should maintain list item structure with divider', () => {
      render(<CartItem packageDetailItem={{
        packageID: mockPackageDetails.id,
        packageVersion: mockPackageDetails.currentVersion,
        packageIconUrl: mockPackageDetails.iconUrl ?? ''
      }} />);
      
      const listItem = screen.getByTestId('cart-item');
      expect(listItem).toHaveClass('MuiListItem-root');
    });
  });
});
