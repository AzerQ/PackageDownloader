import React from 'react';
import { observer } from 'mobx-react-lite';
import RecommendationCard from './RecommendationCard'; // Предполагается, что у нас уже есть компонент RecommendationCard
import { CircularProgress } from '@mui/material'; // Компонент loader из Material-UI
import { recommendationsStore } from '../../stores/RecommendationsStore';

// Компонент для отображения списка рекомендаций
const RecommendationsList: React.FC = observer(() => {
    return (
        <div>
            <h2>Список рекомендаций</h2>

            {/* Показываем loader если isLoading === true */}
            {recommendationsStore.isRecommendationsLoading ? (
                <CircularProgress />
            ) : recommendationsStore.packagesRecommendations.length > 0 ? (
                recommendationsStore.packagesRecommendations.map((recommendation) => (
                    <RecommendationCard key={recommendation.id} data={recommendation} />
                ))
            ) : (
                <p>Рекомендаций пока нет.</p>
            )}
        </div>
    );
});

export { RecommendationsList, recommendationsStore };