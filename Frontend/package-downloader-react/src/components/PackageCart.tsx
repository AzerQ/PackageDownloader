import React from 'react';
import { List, ListItem, ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { PackageDetails } from '../services/apiClient';

interface PackageCartProps {
  cartItems: PackageDetails[];
  onRemoveFromCart: (packageItem: PackageDetails) => void;
}

const PackageCart: React.FC<PackageCartProps> = ({ cartItems, onRemoveFromCart }) => {
  return (
    <List>
      {cartItems.map((packageItem, index) => (
        <ListItem key={index} divider>
          <ListItemText primary={packageItem.packageID} secondary={packageItem.packageVersion}/>
          <IconButton edge="end" aria-label="delete" onClick={() => onRemoveFromCart(packageItem)}>
            <DeleteIcon />
          </IconButton>
        </ListItem>
      ))}
    </List>
  );
};

export default PackageCart;
