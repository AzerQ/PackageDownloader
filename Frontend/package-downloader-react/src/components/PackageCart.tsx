import React from 'react';
import { List, ListItem, ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface PackageCartProps {
  cartItems: string[];
  onRemoveFromCart: (packageName: string) => void;
}

const PackageCart: React.FC<PackageCartProps> = ({ cartItems, onRemoveFromCart }) => {
  return (
    <List>
      {cartItems.map((packageName, index) => (
        <ListItem key={index} divider>
          <ListItemText primary={packageName} />
          <IconButton edge="end" aria-label="delete" onClick={() => onRemoveFromCart(packageName)}>
            <DeleteIcon />
          </IconButton>
        </ListItem>
      ))}
    </List>
  );
};

export default PackageCart;
