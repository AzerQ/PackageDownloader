import React from 'react';
import { Button } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { cartStore } from '../../stores/CartStore';
import { ShoppingCart } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const ClearCartButton: React.FC = observer(() => {

  const { t } = useTranslation();

  const {clearCartItems} = cartStore;

  return (
    <Button
      startIcon={<ShoppingCart/>}
      variant="contained"
      color="error"
      onClick={clearCartItems}
      sx={{ mt: 2, mb: 2 }}
    >
      {t("ClearCart")}
    </Button>
  );
});

export default ClearCartButton;
