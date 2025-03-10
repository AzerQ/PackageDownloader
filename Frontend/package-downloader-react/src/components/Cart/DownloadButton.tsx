import React, { useState } from 'react';
import {
  Button,
  Modal,
  Box,
  Typography,
  Alert,
  AlertTitle,
  LinearProgress,
  Link,
} from '@mui/material';
import { observer } from 'mobx-react-lite';
import { cartStore } from '../../stores/CartStore';
import { packagesSearchStore } from '../../stores/PackagesStore';
import { FileDownload } from '@mui/icons-material';
import { getPackageApiClient } from '../../services/apiClient';
import { useTranslation } from 'react-i18next';


const DownloadPackagesButton: React.FC = observer(() => {
  const [open, setOpen] = useState(false); 
  const [loading, setLoading] = useState(false); 
  const [success, setSuccess] = useState(false); 
  const [error, setError] = useState<string | null>(null);
  const [downloadLink, setDownloadLink] = useState<string>('');

  const { t } = useTranslation();

  const handleDownload = async () => {
    setOpen(true); 
    setLoading(true); 
    setSuccess(false);
    setError(null);

    try {
    const downloadLink =  await (await getPackageApiClient()).preparePackagesDownloadLink({
        packagesDetails: cartStore.cartItems,
        packageType: packagesSearchStore.repositoryType,
        sdkVersion: cartStore.getSdkVersion()
      });
      setLoading(false);
      setSuccess(true);
      setDownloadLink(downloadLink);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || t("ErrorOccurred"));
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSuccess(false);
    setError(null);
  };

  return (
    <>
      <Button
        startIcon={<FileDownload />}
        variant="contained"
        color="primary"
        onClick={handleDownload}
        sx={{ mr: 1 }}
      >
        {t("Download")}
      </Button>

      {/* Модальное окно */}
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: 'absolute' as const,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
            textAlign: 'center',
          }}
        >
          {loading && (
            <>
              <Typography variant="h6" gutterBottom>
                {t("PreparingPackages")}
              </Typography>
              <LinearProgress color="secondary" />
            </>
          )}
          {success && (
            <>
              <img
                src="https://img.icons8.com/color/96/000000/checkmark.png"
                alt="Success"
                style={{ width: '80px', height: '80px', marginBottom: '16px' }}
              />
              <Typography variant="h6" gutterBottom>
                {t("PackagesLinkCreated")}
              </Typography>

              <Link href={downloadLink}>{t("DownloadPackages")}</Link>
              
            </>
          )}
          {error && (
            <Alert severity="error">
              <AlertTitle>{t("Error")}</AlertTitle>
              {error}
            </Alert>
          )}
          <Button
            variant="contained"
            color="secondary"
            onClick={handleClose}
            sx={{ mt: 2, ml: 2 }}
          >
            {t("Close")}
          </Button>
        </Box>
      </Modal>
    </>
  );
});

export default DownloadPackagesButton;