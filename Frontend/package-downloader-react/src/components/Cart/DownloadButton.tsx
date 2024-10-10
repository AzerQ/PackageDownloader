import React from 'react';
import { Button } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { packageApiClient, PackageRequest } from '../../services/apiClient';
import { cartStore } from '../../stores/CartStore';
import { packagesSearchStore } from '../../stores/PackagesStore';
import { FileDownload } from '@mui/icons-material';


const DownloadPackagesButton: React.FC = observer(() => {

  const handleDownload = async () => {
    await packageApiClient.getPackagesAsArchive(new PackageRequest({
      packagesDetails: cartStore.cartItems,
      packageType: packagesSearchStore.repositoryType
    }));
  };


  return (
    <Button
      startIcon={<FileDownload/>}
      variant="contained"
      color="primary"
      onClick={handleDownload}
      sx={{ mr: 1 }}
    >
      Download
    </Button>
  );
});

export default DownloadPackagesButton;
