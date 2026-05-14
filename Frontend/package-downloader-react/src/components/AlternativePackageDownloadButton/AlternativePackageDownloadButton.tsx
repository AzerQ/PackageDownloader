// components/PackageDownloadButton/PackageDownloadButton.tsx
import React, { FC } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  LinearProgress,
  Typography,
  Alert,
  Stack,
  Tooltip,
  IconButton,
  Paper,
  Collapse,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReplayIcon from '@mui/icons-material/Replay';
import { useChunkedDownload } from './useChunkedDownload';

interface PackageDownloadAsChunksButtonProps {
  packagesArchiveId: string;
  label?: string;
}

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
};

export const PackageDownloadAsChunksButton: FC<PackageDownloadAsChunksButtonProps> = ({
  packagesArchiveId,
  label = 'Скачать пакеты',
}) => {
  const {
    isSupported,
    isDownloading,
    isCompleted,
    progress,
    error,
    download,
    cancel,
    reset,
  } = useChunkedDownload();

  const handleDownload = (): void => {
    reset();
    download(packagesArchiveId);
  };

  const renderButtonIcon = (): React.ReactNode => {
    if (isDownloading) return <CircularProgress size={18} color="inherit" />;
    if (isCompleted) return <CheckCircleIcon />;
    if (isSupported) return <FolderOpenIcon />;
    return <DownloadIcon />;
  };

  const renderButtonLabel = (): string => {
    if (isDownloading) return `Загрузка... ${progress?.percent ?? 0}%`;
    if (isCompleted) return 'Загружено!';
    return label;
  };

  return (
    <Stack spacing={1.5} sx={{ width: '100%', maxWidth: 480 }}>

      {/* Кнопка скачивания + отмена/сброс */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Tooltip
          title={isSupported ? 'Выбрать папку и скачать чанками' : 'Скачать файл'}
          placement="top"
        >
          <span style={{ flex: 1 }}>
            <Button
              variant="contained"
              fullWidth
              disabled={isDownloading}
              onClick={handleDownload}
              color={isCompleted ? 'success' : 'primary'}
              startIcon={renderButtonIcon()}
            >
              {renderButtonLabel()}
            </Button>
          </span>
        </Tooltip>

        {isDownloading && (
          <Tooltip title="Отменить загрузку">
            <IconButton
              onClick={cancel}
              color="error"
              sx={{ border: 1, borderColor: 'error.main' }}
            >
              <CancelIcon />
            </IconButton>
          </Tooltip>
        )}

        {isCompleted && (
          <Tooltip title="Скачать снова">
            <IconButton onClick={reset} color="primary">
              <ReplayIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Прогресс */}
      <Collapse in={isDownloading && progress !== null}>
        {progress !== null && (
          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight={500}>
                  Скачивание файла
                </Typography>
                <Typography variant="body2" color="primary" fontWeight={600}>
                  {progress?.percent ?? 0}%
                </Typography>
              </Box>

              <LinearProgress
                variant="determinate"
                value={progress?.percent ?? 0}
                sx={{ height: 8, borderRadius: 4 }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">
                  {formatBytes(progress?.loaded ?? 0)} / {formatBytes(progress?.total ?? 0)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Чанк {progress?.currentChunk ?? 0} из {progress?.totalChunks ?? 0}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        )}
      </Collapse>

      {/* Успех */}
      <Collapse in={isCompleted}>
        <Alert severity="success" onClose={reset} icon={<CheckCircleIcon />}>
          Файл успешно сохранён
        </Alert>
      </Collapse>

      {/* Ошибка */}
      <Collapse in={error !== null}>
        {error !== null && (
          <Alert severity="error" onClose={reset}>
            {error}
          </Alert>
        )}
      </Collapse>

    </Stack>
  );
};