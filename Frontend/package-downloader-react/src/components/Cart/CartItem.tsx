import React from 'react';
import { ListItem, ListItemText, IconButton, Avatar } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { cartStore } from '../../stores/CartStore';
import { PackageDetails } from '../../services/apiClient';

interface CartItemProps {
    packageDetailItem: PackageDetails;
}

const CartItem: React.FC<CartItemProps> = ({ packageDetailItem }) => {
    const { removeCartItem } = cartStore;

    return (
        <ListItem key={packageDetailItem.packageID} divider data-testid="cart-item">
            <Avatar
                sx={{ width: 32, height: 32, marginRight: 1 }}
                alt="Package icon"
                src={packageDetailItem.packageIconUrl}
                variant="square"
                data-testid="cart-item-avatar"
            />
            <ListItemText 
                primary={packageDetailItem.packageID}
                secondary={packageDetailItem.packageVersion}
                data-testid="cart-item-text"
            />
            <IconButton 
                edge="end" 
                aria-label="delete" 
                onClick={() => removeCartItem(packageDetailItem)}
                data-testid="cart-item-delete-button"
            >
                <DeleteIcon />
            </IconButton>
        </ListItem>
    );
};

export default CartItem;
