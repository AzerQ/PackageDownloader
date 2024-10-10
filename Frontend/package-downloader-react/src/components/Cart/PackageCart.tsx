import React from 'react';
import { List, ListItem, ListItemText, IconButton, Box, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { observer } from 'mobx-react-lite';
import { cartStore } from '../../stores/CartStore';
import DownloadPackagesButton from './DownloadButton';
import ClearCartButton from './ClearCartButton';

interface PackageCartProps {

}

const PackageCart: React.FC<PackageCartProps> = observer(({ }) => {
  const { cartItems, removeCartItem } = cartStore;
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0, // Зафиксировать внизу
        right: 0,  // Зафиксировать вправо
        width: '300px', // Ширина корзины
        zIndex: 1000, // Обеспечивает, что корзина выше других элементов
        backgroundColor: 'white', // Цвет фона, чтобы выделить элемент
        boxShadow: 3, // Добавить тень для эффекта
        padding: 2,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Selected Packages
      </Typography>
      <List>
        {cartItems.map((packageItem, index) => (
          <ListItem key={index} divider>
            <ListItemText primary={packageItem.packageID} secondary={packageItem.packageVersion} />
            <IconButton edge="end" aria-label="delete" onClick={() => removeCartItem(packageItem)}>
              <DeleteIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>
      <DownloadPackagesButton />
      <ClearCartButton/>
    </Box>

  );
});

export default PackageCart;
