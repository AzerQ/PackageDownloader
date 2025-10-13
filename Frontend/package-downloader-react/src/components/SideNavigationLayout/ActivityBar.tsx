import React from 'react';
import { Box, IconButton, Tooltip, Stack } from '@mui/material';
import { ActivityBarProps } from './types';

const ActivityBar: React.FC<ActivityBarProps> = ({
                                                     items,
                                                     activeItemId,
                                                     onItemClick,
                                                     width,
                                                     backgroundColor = 'grey.900', // Темный фон по умолчанию
                                                 }) => {
    return (
        <Box
            sx={{
                width: width,
                height: '100vh', // Занимает всю высоту
                bgcolor: backgroundColor,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                paddingY: 1, // Небольшой вертикальный отступ
                flexShrink: 0, // Не сжиматься
            }}
        >
            <Stack spacing={1} alignItems="center">
                {items.map((item) => (
                    <Tooltip title={item.label} placement="right" key={item.id}>
                        {/* Обертка нужна, чтобы Tooltip работал на disabled IconButton */}
                        <span>
              <IconButton
                  onClick={() => onItemClick(item.id)}
                  sx={{
                      color: activeItemId === item.id ? 'primary.main' : 'common.white', // Цвет иконки
                      // Дополнительный стиль для активной иконки (например, border)
                      borderLeft: activeItemId === item.id ? `3px solid` : 'none',
                      borderColor: activeItemId === item.id ? 'primary.main' : 'transparent',
                      borderRadius: 0, // Убираем скругление для border
                      padding: 1.5, // Увеличим паддинг для лучшего вида border'а
                      '&:hover': {
                          bgcolor: 'action.hover',
                      }
                  }}
                  aria-label={item.label}
              >
                {item.icon}
              </IconButton>
            </span>
                    </Tooltip>
                ))}
            </Stack>
        </Box>
    );
};

export default ActivityBar;

