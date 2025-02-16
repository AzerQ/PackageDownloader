import React from 'react';
import { List, ListItem, ListItemText, IconButton, Box, Typography, Avatar } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { observer } from 'mobx-react-lite';
import { cartStore } from '../../stores/CartStore';
import DownloadPackagesButton from './DownloadButton';
import ClearCartButton from './ClearCartButton';
import { packagesSearchStore } from '../../stores/PackagesStore';

interface PackageCartProps {

}

const PackageCart: React.FC<PackageCartProps> = observer(({ }) => {
  const { cartItems, removeCartItem } = cartStore;

  if (cartItems.length === 0)
    return <></>



  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0, // Зафиксировать внизу
        right: 0,  // Зафиксировать вправо
        width: '400px', // Ширина корзины
        zIndex: 1000, // Обеспечивает, что корзина выше других элементов
        backgroundColor: 'white', // Цвет фона, чтобы выделить элемент
        boxShadow: 3, // Добавить тень для эффекта
        padding: 2,
      }}
    >
      <Typography variant="h6" gutterBottom>
        {`${cartItems.length} ${packagesSearchStore.repositoryType.toLowerCase()} packages selected`}
      </Typography>
      <List>
        {cartItems.map((packageDetailItem, index) => (
          <ListItem key={index} divider>
            <Avatar
              sx={{ width: 32, height: 32, marginRight: 1 }}
              alt="Package icon"
              src={packagesSearchStore.getPackageIcon(packageDetailItem.packageID)}
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
