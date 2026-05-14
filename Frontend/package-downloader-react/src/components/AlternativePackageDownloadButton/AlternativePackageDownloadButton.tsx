import React, { FC, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Collapse,
  FormControlLabel,
  IconButton,
  LinearProgress,
  Modal,
  Paper,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import SettingsIcon from '@mui/icons-material/Settings';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReplayIcon from '@mui/icons-material/Replay';
import { useChunkedDownload } from './useChunkedDownload';
import {
  ChunkedDownloadSettings,
  DEFAULT_CHUNKED_DOWNLOAD_SETTINGS,
  loadChunkedDownloadSettings,
  saveChunkedDownloadSettings,
  sanitizeChunkedDownloadSettings,
} from './chunkedDownloadSettings';

interface PackageDownloadAsChunksButtonProps {
  packagesArchiveId: string;
  label?: string;
}

const MODAL_BOX_SX = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: 'calc(100% - 32px)', sm: 460 },
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: 2,
  p: 3,
};

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
};

const formatSettingsSummary = (settings: ChunkedDownloadSettings): string => {
  const chunkSizeLabel = settings.useAutomaticChunkSize
    ? 'авто (10% от архива)'
    : `${Math.round(settings.chunkSizeInBytes / 1024)} KB`;

  return `Чанк: ${chunkSizeLabel} · Параллельно: ${settings.parallelDownloads} · Ретраи: ${settings.retryAttempts}`;
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<ChunkedDownloadSettings>(() => loadChunkedDownloadSettings());

  const settingsSummary = useMemo(() => formatSettingsSummary(settings), [settings]);

  const updateSettings = (patch: Partial<ChunkedDownloadSettings>): void => {
    const nextSettings = sanitizeChunkedDownloadSettings({ ...settings, ...patch });
    setSettings(nextSettings);
    saveChunkedDownloadSettings(nextSettings);
  };

  const handleDownloadClick = (): void => {
    setIsSettingsOpen(true);
  };

  const handleStartDownload = (): void => {
    reset();
    saveChunkedDownloadSettings(settings);
    setIsSettingsOpen(false);
    void download(packagesArchiveId, settings);
  };

  const renderButtonIcon = (): React.ReactNode => {
    if (isDownloading) return <CircularProgress size={18} color="inherit" />;
    if (isCompleted) return <CheckCircleIcon />;
    if (isSupported) return <SettingsIcon />;
    return <DownloadIcon />;
  };

  const renderButtonLabel = (): string => {
    if (isDownloading) return `Загрузка... ${progress?.percent ?? 0}%`;
    if (isCompleted) return 'Загружено!';
    return label;
  };

  return (
    <Stack spacing={1.5} sx={{ width: '100%', maxWidth: 480 }}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Tooltip title="Настроить скачивание чанками" placement="top">
          <span style={{ flex: 1 }}>
            <Button
              variant="contained"
              fullWidth
              disabled={isDownloading}
              onClick={handleDownloadClick}
              color={isCompleted ? 'success' : 'primary'}
              startIcon={renderButtonIcon()}
              data-testid="chunked-download-open-settings"
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
              data-testid="chunked-download-cancel"
            >
              <CancelIcon />
            </IconButton>
          </Tooltip>
        )}

        {isCompleted && (
          <Tooltip title="Сбросить состояние">
            <IconButton onClick={reset} color="primary" data-testid="chunked-download-reset">
              <ReplayIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Typography variant="caption" color="text.secondary" data-testid="chunked-download-settings-summary">
        {settingsSummary}
      </Typography>

      <Collapse in={isDownloading && progress !== null}>
        {progress !== null && (
          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight={500}>
                  Скачивание файла
                </Typography>
                <Typography variant="body2" color="primary" fontWeight={600} data-testid="chunked-download-progress-percent">
                  {progress.percent}%
                </Typography>
              </Box>

              <LinearProgress
                variant="determinate"
                value={progress.percent}
                sx={{ height: 8, borderRadius: 4 }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  {formatBytes(progress.loaded)} / {formatBytes(progress.total)}
                </Typography>
                <Typography variant="caption" color="text.secondary" data-testid="chunked-download-progress-chunks">
                  Чанк {progress.currentChunk} из {progress.totalChunks}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        )}
      </Collapse>

      <Collapse in={isCompleted}>
        <Alert severity="success" onClose={reset} icon={<CheckCircleIcon />} data-testid="chunked-download-success">
          Файл успешно сохранён
        </Alert>
      </Collapse>

      <Collapse in={error !== null}>
        {error !== null && (
          <Alert severity="error" onClose={reset} data-testid="chunked-download-error">
            {error}
          </Alert>
        )}
      </Collapse>

      <Modal open={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}>
        <Box sx={MODAL_BOX_SX}>
          <Stack spacing={2}>
            <Typography variant="h6">
              Настройки скачивания чанками
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={settings.useAutomaticChunkSize}
                  onChange={(_, checked) => updateSettings({ useAutomaticChunkSize: checked })}
                />
              }
              label="Автоматически определить размер чанка на бэкенде"
            />

            <TextField
              label="Размер чанка, KB"
              type="number"
              value={Math.round(settings.chunkSizeInBytes / 1024)}
              onChange={(event) => {
                const chunkSizeInKb = Number(event.target.value);
                updateSettings({
                  chunkSizeInBytes: Math.max(1, Math.round(chunkSizeInKb || 0)) * 1024,
                });
              }}
              disabled={settings.useAutomaticChunkSize}
              inputProps={{ min: 1 }}
              helperText={settings.useAutomaticChunkSize ? 'Размер чанка будет рассчитан на сервере как 10% от архива.' : 'По умолчанию 70 KB.'}
              fullWidth
            />

            <TextField
              label="Одновременных скачиваний"
              type="number"
              value={settings.parallelDownloads}
              onChange={(event) => updateSettings({ parallelDownloads: Number(event.target.value) })}
              inputProps={{ min: 1 }}
              helperText="Сколько запросов на чанки выполнять одновременно."
              fullWidth
            />

            <TextField
              label="Попыток скачивания"
              type="number"
              value={settings.retryAttempts}
              onChange={(event) => updateSettings({ retryAttempts: Number(event.target.value) })}
              inputProps={{ min: 1 }}
              helperText="Максимальное количество попыток для каждого чанка."
              fullWidth
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={() => setIsSettingsOpen(false)} color="inherit">
                Закрыть
              </Button>
              <Button
                onClick={() => {
                  setSettings(DEFAULT_CHUNKED_DOWNLOAD_SETTINGS);
                  saveChunkedDownloadSettings(DEFAULT_CHUNKED_DOWNLOAD_SETTINGS);
                }}
                color="secondary"
                data-testid="chunked-download-reset-settings"
              >
                Сбросить
              </Button>
              <Button
                variant="contained"
                onClick={handleStartDownload}
                data-testid="chunked-download-start"
              >
                Начать скачивание
              </Button>
            </Box>
          </Stack>
        </Box>
      </Modal>
    </Stack>
  );
};
