import React from 'react';
import { List, ListItem, ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { observer } from 'mobx-react-lite';
import { cartStore } from '../stores/CartStore';

interface PackageCartProps {
  
}

const PackageCart: React.FC<PackageCartProps> = observer(({  }) => {
 const {cartItems, removeCartItem} = cartStore;
  return (
    <List>
      {cartItems.map((packageItem, index) => (
        <ListItem key={index} divider>
          <ListItemText primary={packageItem.packageID} secondary={packageItem.packageVersion}/>
          <IconButton edge="end" aria-label="delete" onClick={() => removeCartItem(packageItem)}>
            <DeleteIcon />
          </IconButton>
        </ListItem>
      ))}
    </List>
  );
});

export default PackageCart;
