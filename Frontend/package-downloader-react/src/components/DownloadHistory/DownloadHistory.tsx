import React from 'react';
import { observer } from 'mobx-react-lite';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Button,
    Divider,
    Chip,
    Stack,
    Avatar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { downloadHistoryStore } from '../../stores/DownloadHistoryStore';
import { useTranslation } from 'react-i18next';

const DownloadHistory: React.FC = observer(() => {
    const { t } = useTranslation();
    const { history, clearHistory, removeHistoryItem } = downloadHistoryStore;

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    if (history.length === 0) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                    {t('DownloadHistory') || 'Download History'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {t('NoDownloadHistory') || 'No download history yet'}
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                    {t('DownloadHistory') || 'Download History'}
                </Typography>
                <Button
                    size="small"
                    startIcon={<ClearAllIcon />}
                    onClick={clearHistory}
                    color="error"
                >
                    {t('ClearAll') || 'Clear All'}
                </Button>
            </Box>

            <List>
                {history.map((item, index) => (
                    <React.Fragment key={item.timestamp}>
                        <ListItem
                            alignItems="flex-start"
                            secondaryAction={
                                <IconButton
                                    edge="end"
                                    aria-label="delete"
                                    onClick={() => removeHistoryItem(item.timestamp)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            }
                        >
                            <ListItemText
                                primary={
                                    <Box>
                                        <Typography variant="subtitle2" component="span">
                                            {formatDate(item.timestamp)}
                                        </Typography>
                                        <Chip
                                            label={item.packageType}
                                            size="small"
                                            sx={{ ml: 1 }}
                                        />
                                    </Box>
                                }
                                secondary={
                                    <Stack direction="column" spacing={0.5} sx={{ mt: 1 }}>
                                        {item.packages.map((pkg, pkgIndex) => (
                                            <Box
                                                key={pkgIndex}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1
                                                }}
                                            >
                                                <Avatar
                                                    src={pkg.packageIconUrl}
                                                    sx={{ width: 24, height: 24 }}
                                                    variant="square"
                                                />
                                                <Typography variant="body2" component="span">
                                                    {pkg.packageID} @ {pkg.packageVersion}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Stack>
                                }
                            />
                        </ListItem>
                        {index < history.length - 1 && <Divider />}
                    </React.Fragment>
                ))}
            </List>
        </Box>
    );
});

export default DownloadHistory;
