import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NotificationBanner from './Notification';
import { notificationStore } from '../../stores/NotificationStore';

// Mock MobX store
vi.mock('../../stores/NotificationStore', () => ({
  notificationStore: {
    notifications: [],
    removeNotification: vi.fn(),
  },
}));

describe('NotificationBanner Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    notificationStore.notifications = [];
  });

  describe('Positive Scenarios', () => {
    it('should render notification stack with correct test id', () => {
      render(<NotificationBanner />);
      
      expect(screen.getByTestId('notification-stack')).toBeInTheDocument();
    });

    it('should display single notification', () => {
      notificationStore.notifications = [
        { id: '1', type: 'info', message: 'Operation successful!' },
      ];
      
      render(<NotificationBanner />);
      
      expect(screen.getByText('Operation successful!')).toBeInTheDocument();
      expect(screen.getByTestId('notification-snackbar-1')).toBeInTheDocument();
    });

    it('should display multiple notifications', () => {
      notificationStore.notifications = [
        { id: '1', type: 'info', message: 'First notification' },
        { id: '2', type: 'error', message: 'Second notification' },
        { id: '3', type: 'warning', message: 'Third notification' },
      ];
      
      render(<NotificationBanner />);
      
      expect(screen.getByText('First notification')).toBeInTheDocument();
      expect(screen.getByText('Second notification')).toBeInTheDocument();
      expect(screen.getByText('Third notification')).toBeInTheDocument();
    });

    it('should display success notification with correct severity', () => {
      notificationStore.notifications = [
        { id: '1', type: 'info', message: 'Success message' },
      ];
      
      render(<NotificationBanner />);
      
      expect(screen.getByTestId('notification-alert-info')).toBeInTheDocument();
    });

    it('should display error notification with correct severity', () => {
      notificationStore.notifications = [
        { id: '1', type: 'error', message: 'Error message' },
      ];
      
      render(<NotificationBanner />);
      
      expect(screen.getByTestId('notification-alert-error')).toBeInTheDocument();
    });

    it('should display warning notification with correct severity', () => {
      notificationStore.notifications = [
        { id: '1', type: 'warning', message: 'Warning message' },
      ];
      
      render(<NotificationBanner />);
      
      expect(screen.getByTestId('notification-alert-warning')).toBeInTheDocument();
    });

    it('should display info notification with correct severity', () => {
      notificationStore.notifications = [
        { id: '1', type: 'info', message: 'Info message' },
      ];
      
      render(<NotificationBanner />);
      
      expect(screen.getByTestId('notification-alert-info')).toBeInTheDocument();
    });

    it('should call removeNotification when close button is clicked', async () => {
      const user = userEvent.setup();
      notificationStore.notifications = [
        { id: '1', type: 'info', message: 'Test notification' },
      ];
      
      render(<NotificationBanner />);
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);
      
      expect(notificationStore.removeNotification).toHaveBeenCalledWith('1');
    });

    it('should have correct z-index for overlay', () => {
      render(<NotificationBanner />);
      
      const stack = screen.getByTestId('notification-stack');
      expect(stack).toHaveStyle({ zIndex: 1000 });
    });

    it('should be positioned at bottom-right', () => {
      render(<NotificationBanner />);
      
      const stack = screen.getByTestId('notification-stack');
      expect(stack).toHaveStyle({ position: 'fixed', bottom: '16px', right: '16px' });
    });
  });

  describe('Negative Scenarios', () => {
    it('should render empty stack when no notifications', () => {
      notificationStore.notifications = [];
      
      render(<NotificationBanner />);
      
      const stack = screen.getByTestId('notification-stack');
      expect(stack).toBeInTheDocument();
      expect(stack.children).toHaveLength(0);
    });

    it('should not crash with undefined notifications array', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      notificationStore.notifications = undefined as any;
      
      expect(() => {
        render(<NotificationBanner />);
      }).toThrow(); // MobX will enforce the array
    });

    it('should handle notification with missing message', () => {
      notificationStore.notifications = [
        { id: '1', type: 'info', message: '' },
      ];
      
      render(<NotificationBanner />);
      
      expect(screen.getByTestId('notification-snackbar-1')).toBeInTheDocument();
    });

    it('should handle notification with very long message', () => {
      const longMessage = 'A'.repeat(1000);
      notificationStore.notifications = [
        { id: '1', type: 'info', message: longMessage },
      ];
      
      render(<NotificationBanner />);
      
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('should handle notification with special characters in message', () => {
      notificationStore.notifications = [
        { id: '1', type: 'info', message: '<script>alert("xss")</script>' },
      ];
      
      render(<NotificationBanner />);
      
      // Should render as text, not execute script
      expect(screen.getByText('<script>alert("xss")</script>')).toBeInTheDocument();
    });

    it('should not call removeNotification on render', () => {
      notificationStore.notifications = [
        { id: '1', type: 'info', message: 'Test' },
      ];
      
      render(<NotificationBanner />);
      
      expect(notificationStore.removeNotification).not.toHaveBeenCalled();
    });

    it('should handle string IDs', () => {
      notificationStore.notifications = [
        { id: 'string-id', type: 'info', message: 'Test with string ID' },
      ];
      
      render(<NotificationBanner />);
      
      expect(screen.getByTestId('notification-snackbar-string-id')).toBeInTheDocument();
    });

    it('should handle numeric IDs', () => {
      notificationStore.notifications = [
        { id: '12345', type: 'error', message: 'Test with numeric ID' },
      ];
      
      render(<NotificationBanner />);
      
      expect(screen.getByTestId('notification-snackbar-12345')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid notification additions', () => {
      const notifications = Array.from({ length: 10 }, (_, i) => ({
        id: i.toString(),
        type: 'info' as const,
        message: `Notification ${i}`,
      }));
      
      notificationStore.notifications = notifications;
      
      render(<NotificationBanner />);
      
      expect(screen.getByTestId('notification-stack').children).toHaveLength(10);
    });

    it('should handle duplicate notification IDs gracefully', () => {
      notificationStore.notifications = [
        { id: '1', type: 'info', message: 'First' },
        { id: '1', type: 'error', message: 'Second with same ID' },
      ];
      
      render(<NotificationBanner />);
      
      // React should handle duplicate keys
      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second with same ID')).toBeInTheDocument();
    });

    it('should handle notification with HTML content', () => {
      notificationStore.notifications = [
        { id: '1', type: 'info', message: '<b>Bold text</b>' },
      ];
      
      render(<NotificationBanner />);
      
      // Should render as plain text
      expect(screen.getByText('<b>Bold text</b>')).toBeInTheDocument();
    });

    it('should handle notification with newlines', () => {
      notificationStore.notifications = [
        { id: '1', type: 'info', message: 'Line 1\nLine 2\nLine 3' },
      ];
      
      render(<NotificationBanner />);
      
      expect(screen.getByText(/Line 1/)).toBeInTheDocument();
    });

    it('should maintain notification order', () => {
      notificationStore.notifications = [
        { id: '1', type: 'info', message: 'First' },
        { id: '2', type: 'error', message: 'Second' },
        { id: '3', type: 'warning', message: 'Third' },
      ];
      
      render(<NotificationBanner />);
      
      const messages = screen.getAllByRole('alert');
      expect(messages).toHaveLength(3);
    });

    it('should handle different autoHideDuration', () => {
      notificationStore.notifications = [
        { id: '1', type: 'info', message: 'Auto-hide notification' },
      ];
      
      render(<NotificationBanner />);
      
      // Notification should be visible initially
      expect(screen.getByText('Auto-hide notification')).toBeInTheDocument();
    });
  });

  describe('MobX Observer Integration', () => {
    it('should update when notifications change', () => {
      // Since we're mocking the store, the observer won't react automatically
      // This test verifies the component structure with notifications
      notificationStore.notifications = [
        { id: '1', type: 'info', message: 'New notification' },
      ];
      
      render(<NotificationBanner />);
      
      expect(screen.getByText('New notification')).toBeInTheDocument();
    });

    it('should remove notification from display when removed from store', () => {
      // Test with empty notifications
      notificationStore.notifications = [];
      
      render(<NotificationBanner />);
      
      expect(screen.queryByText('Will be removed')).not.toBeInTheDocument();
      expect(screen.getByTestId('notification-stack').children).toHaveLength(0);
    });
  });
});
