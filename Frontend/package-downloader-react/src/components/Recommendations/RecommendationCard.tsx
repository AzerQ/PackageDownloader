import * as React from 'react';
import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import { PackageRecommendation } from '../../services/apiClient';
import { observer } from 'mobx-react-lite';
import { packagesSearchStore } from '../../stores/PackagesStore';
import { recommendationsStore } from './RecommendationsList';

// Определяем интерфейс для входных данных
interface RecommendationCardProps {
  data: PackageRecommendation;
}

const searchPackageRecommendation = async (packageId: string) => {
  recommendationsStore.closeRecommendationsForm();
  packagesSearchStore.setSearchQuery(packageId);
  await packagesSearchStore.getSearchResults();
};

// Компонент карточки рекомендации
const RecommendationCard: React.FC<RecommendationCardProps> = observer(({ data }) => {
  // Состояние для управления видимостью блока кода
  const [isCodeExpanded, setIsCodeExpanded] = React.useState(false);

  return (
    <Card sx={{ minWidth: 275, marginBottom: 2 }}>
      <CardContent>
        {/* Заголовок карточки */}
        <Typography variant="h6" component="div" gutterBottom>
          {data.name}
        </Typography>

        {/* ID пакета */}
        <Typography variant="subtitle1" color="text.secondary">
          ID: {data.id}
        </Typography>

        {/* Описание выбора */}
        <Box sx={{ marginTop: 1 }}>
          <Typography variant="body1" gutterBottom>
            {data.choiceDescription}
          </Typography>
        </Box>

        {/* Пример кода */}
        <Box sx={{ marginTop: 1 }}>
          <Typography variant="caption" gutterBottom>
            Пример кода:
          </Typography>
          {/* Кнопка для разворачивания/сворачивания блока кода */}
          <Button
            size="small"
            onClick={() => setIsCodeExpanded((prev) => !prev)} // Переключение состояния
            sx={{ textTransform: 'none', display: 'block' }}
          >
            {isCodeExpanded ? 'Свернуть код' : 'Показать код'}
          </Button>
          {/* Блок кода, видимый только если isCodeExpanded === true */}
          {isCodeExpanded && (
            <Box
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                padding: 1,
                marginTop: 1,
              }}
            >
              <Typography
                variant="body2"
                component="pre"
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {data.codeExample}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Кнопка "Найти пакет" */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
          <Button variant="contained" onClick={async () => await searchPackageRecommendation(data.id)}>
            Найти пакет
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
});

export default RecommendationCard;