import React from 'react';
import { Box, Paper, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close'; // Или ChevronLeftIcon
import { SidebarPanelProps } from './types';

const SidebarPanel: React.FC<SidebarPanelProps> = ({ item, isOpen, onClose, width }) => {
    if (!isOpen || !item) {
        return null; // Не рендерим, если закрыто или нет активного элемента
    }

    return (
        <Paper
            elevation={3}
            sx={{
                width: width,
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden', // Предотвращаем выход контента за пределы
                flexShrink: 0, // Не сжиматься
                borderLeft: '1px solid', // Разделитель
                borderColor: 'divider',
            }}
        >
            {/* Шапка панели */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    flexShrink: 0, // Шапка не должна сжиматься
                }}
            >
                {/* Можно использовать item.label или сделать заголовок частью item.content */}
                <Typography variant="h6" component="div" sx={{ textTransform: 'uppercase', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    {item.label}
                </Typography>
                <IconButton onClick={onClose} size="small" aria-label="Скрыть панель">
                    <CloseIcon />
                </IconButton>
            </Box>

            {/* Контент панели */}
            <Box
                sx={{
                    flexGrow: 1, // Занимает оставшееся пространство
                    overflowY: 'auto', // Включаем скролл, если контента много
                    padding: 2,
                }}
            >
                {item.content}
            </Box>
        </Paper>
    );
};

export default SidebarPanel;

