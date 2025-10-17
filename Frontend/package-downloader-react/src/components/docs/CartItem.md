# CartItem Component

## Overview
The `CartItem` component displays a single package in the shopping cart with its details and a delete option.

## Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| packageDetailItem | `PackageDetails` | Yes | Package information to display |

### PackageDetails Interface
```typescript
interface PackageDetails {
  packageID: string;
  packageVersion: string;
  packageIconUrl: string;
  // ... other properties
}
```

## Features
- **Package Icon**: Displays package icon/avatar
- **Package Info**: Shows package ID and version
- **Delete Action**: Allows removing item from cart
- **Visual Separation**: List item with divider for clear separation

## State Management
Uses `cartStore` from MobX:
- `removeCartItem`: Removes the package from cart

## Data Test IDs
- `cart-item`: Main list item wrapper
- `cart-item-avatar`: Package icon/avatar
- `cart-item-text`: Package ID and version text
- `cart-item-delete-button`: Delete button

## Usage Example
```tsx
import CartItem from './CartItem';

const packageDetail = {
  packageID: 'react',
  packageVersion: '18.2.0',
  packageIconUrl: 'https://example.com/icon.png'
};

<CartItem packageDetailItem={packageDetail} />
```

## Dependencies
- Material-UI (ListItem, ListItemText, IconButton, Avatar)
- Material-UI Icons (DeleteIcon)
- MobX (cartStore)

## Accessibility
- ARIA label "delete" on remove button
- Semantic HTML structure with ListItem
- Clear visual hierarchy
