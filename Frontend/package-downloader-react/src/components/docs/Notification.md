# NotificationBanner Component

## Overview
The `NotificationBanner` component displays toast-style notifications using Material-UI Snackbar and Alert components. It manages multiple notifications in a stack.

## Props
This component does not accept any props. It uses MobX store for state management.

## Features
- **Multiple Notifications**: Displays multiple notifications simultaneously in a stack
- **Auto-dismiss**: Notifications automatically close after 5 seconds
- **Manual Dismiss**: Users can manually close notifications
- **Severity Levels**: Supports success, error, warning, and info notification types
- **Fixed Position**: Positioned at bottom-right of viewport
- **High Z-index**: Ensures notifications appear above other content

## State Management
Uses `notificationStore` from MobX:
- `notifications`: Array of notification objects to display
- `removeNotification`: Removes a notification by ID

### Notification Object
```typescript
interface Notification {
  id: string | number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}
```

## Data Test IDs
- `notification-stack`: Main stack container
- `notification-snackbar-{id}`: Individual snackbar (dynamic ID)
- `notification-alert-{type}`: Alert component (dynamic type)

## Usage Example
```tsx
import NotificationBanner from './Notification';

// Add to app root
<NotificationBanner />
```

## Adding Notifications
```typescript
// From another component
notificationStore.addNotification({
  id: Date.now(),
  type: 'success',
  message: 'Package downloaded successfully!'
});
```

## Dependencies
- Material-UI (Alert, Snackbar, Stack)
- MobX (observer, notificationStore)

## Styling
- Fixed position: bottom 16px, right 16px
- Z-index: 1000 (appears above most content)
- Spacing between notifications: 2 (Material-UI spacing units)

## Accessibility
- Semantic alert roles from Material-UI Alert
- Auto-dismiss for non-critical information
- Manual close option for all notifications
