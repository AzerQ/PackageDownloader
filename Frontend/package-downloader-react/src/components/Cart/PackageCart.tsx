import React from 'react';
import { List, ListItem, ListItemText, IconButton, Box, Typography, Avatar, FormControl, Select, MenuItem, InputLabel } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { observer } from 'mobx-react-lite';
import { cartStore } from '../../stores/CartStore';
import DownloadPackagesButton from './DownloadButton';
import ClearCartButton from './ClearCartButton';
import { packagesSearchStore } from '../../stores/PackagesStore';
import { useTranslation } from 'react-i18next';



const PackageCart: React.FC = observer( () => {
  
  const { t } = useTranslation();

  const { cartItems, removeCartItem } = cartStore;

  if (cartItems.length === 0)
    return <></>

  const availableSdks = cartStore.getAvailableSdkVersions();

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        width: '400px',
        zIndex: 1000,
        backgroundColor: 'white',
        boxShadow: 3,
        padding: 2,
      }}
    >
      <Typography variant="h6" gutterBottom>
        {t("PackagesSelected", {count: cartItems.length, repositoryType: packagesSearchStore.repositoryType})}
      </Typography>

      {availableSdks.length > 0 &&
        (
          <FormControl sx={{ m: 0, minWidth: 160 }} size="small">
            <InputLabel id="selectedPackagesSdk">
              {t("SdkVersion")}
            </InputLabel>
            <Select
              value={cartStore.getSdkVersion()}
              onChange={(e) => cartStore.setSdkVersion(e.target.value)}
              labelId="selectedPackagesSdk"
              label="SDK version"
            >
              {
                availableSdks.map((sdkVer) => (
                  <MenuItem key={sdkVer} value={sdkVer}>
                    {sdkVer}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        )}

      <List>
        {cartItems.map((packageDetailItem, index) => (
          <ListItem key={index} divider>
            <Avatar
              sx={{ width: 32, height: 32, marginRight: 1 }}
              alt="Package icon"
              src={packageDetailItem.packageIconUrl}
              variant="square"
            />
            <ListItemText primary={packageDetailItem.packageID} secondary={packageDetailItem.packageVersion} />
            <IconButton edge="end" aria-label="delete" onClick={() => removeCartItem(packageDetailItem)}>
              <DeleteIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>
      <DownloadPackagesButton />
      <ClearCartButton />
    </Box>

  );
});

export default PackageCart;
