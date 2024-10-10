import React from 'react';
import { Button } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { packageApiClient, PackageRequest } from '../services/apiClient';
import { cartStore } from '../stores/CartStore';
import { packagesSearchStore } from '../stores/PackagesStore';

interface DownloadButtonProps {

}


const DownloadButton: React.FC<DownloadButtonProps> = observer(({ }) => {

  const handleDownload = async () => {
    await packageApiClient.getPackagesAsArchive(new PackageRequest({
      packagesDetails: cartStore.cartItems,
      packageType: packagesSearchStore.repositoryType
    }));
  };


  return (
    <Button
      variant="contained"
      color="primary"
      onClick={handleDownload}
      sx={{ mt: 2, mb: 2 }}
    >
      Generate packages archive
    </Button>
  );
});

export default DownloadButton;
