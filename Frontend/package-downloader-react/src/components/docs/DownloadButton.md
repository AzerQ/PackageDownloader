# DownloadButton Component

## Overview
The `DownloadPackagesButton` component provides a button to download all packages in the cart.

## Props
This component does not accept any props. It uses MobX store for state management.

## Features
- **Download Icon**: Visual indicator with FileDownload icon
- **Internationalization**: Button text is localized
- **MobX Integration**: Observes cart store for reactive updates
- **Primary Action**: Styled as primary contained button

## State Management
Uses `cartStore` from MobX:
- `getPackagesDownloadLink`: Initiates the download process

## Data Test IDs
- `download-button`: Main download button

## Usage Example
```tsx
import DownloadPackagesButton from './DownloadButton';

<DownloadPackagesButton />
```

## Behavior
- Clicking the button triggers `getPackagesDownloadLink` from the cart store
- The function handles the download logic (API calls, file generation, etc.)
- Button appearance may change based on cart state (handled by store)

## Dependencies
- Material-UI (Button)
- Material-UI Icons (FileDownload)
- MobX (observer, cartStore)
- react-i18next (useTranslation)

## Styling
- Uses Material-UI theme primary color
- Contained variant for emphasis
- Right margin for spacing (sx={{mr: 1}})

## Accessibility
- Clear visual icon indicating download action
- Localized text for international users
- Keyboard accessible as standard button
