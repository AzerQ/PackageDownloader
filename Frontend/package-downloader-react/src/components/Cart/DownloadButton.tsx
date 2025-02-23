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
import { packageApiClient } from '../../services/apiClient';


const DownloadPackagesButton: React.FC = observer(() => {
  const [open, setOpen] = useState(false); // Открыто ли модальное окно
  const [loading, setLoading] = useState(false); // Состояние загрузки
  const [success, setSuccess] = useState(false); // Успешная загрузка
  const [error, setError] = useState<string | null>(null); // Ошибка
  const [downloadLink, setDownloadLink] = useState<string>('');

  const handleDownload = async () => {
    setOpen(true); // Открываем модальное окно
    setLoading(true); // Начинаем загрузку
    setSuccess(false); // Сбрасываем флаг успеха
    setError(null); // Сбрасываем ошибку

    try {
    let downloadLink =  await packageApiClient.preparePackagesDownloadLink({
        packagesDetails: cartStore.cartItems,
        packageType: packagesSearchStore.repositoryType,
        sdkVersion: cartStore.getSdkVersion()
      });
      setLoading(false); // Завершаем загрузку
      setSuccess(true); // Устанавливаем флаг успеха
      setDownloadLink(downloadLink);
    } catch (err: any) {
      setLoading(false); // Завершаем загрузку
      setError(err.message || 'An unexpected error occurred'); // Устанавливаем ошибку
    }
  };

  const handleClose = () => {
    setOpen(false); // Закрываем модальное окно
    setSuccess(false); // Сбрасываем флаг успеха
    setError(null); // Сбрасываем ошибку
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
        Download
      </Button>

      {/* Модальное окно */}
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: 'absolute' as 'absolute',
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
                Preparing packages...
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
                Packages link created successfully!
              </Typography>

              <Link href={downloadLink}>Download prepared packages</Link>
              
            </>
          )}
          {error && (
            <Alert severity="error">
              <AlertTitle>Error</AlertTitle>
              {error}
            </Alert>
          )}
          <Button
            variant="contained"
            color="secondary"
            onClick={handleClose}
            sx={{ mt: 2, ml: 2 }}
          >
            Close
          </Button>
        </Box>
      </Modal>
    </>
  );
});

export default DownloadPackagesButton;