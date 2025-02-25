import React from 'react';
import { observer } from 'mobx-react-lite';
import RecommendationCard from './RecommendationCard'; // Предполагается, что у нас уже есть компонент RecommendationCard
import { CircularProgress } from '@mui/material'; // Компонент loader из Material-UI
import { recommendationsStore } from '../../stores/RecommendationsStore';
import { useTranslation } from 'react-i18next';

// Компонент для отображения списка рекомендаций
const RecommendationsList: React.FC = observer(() => {

    const { t } = useTranslation();

    return (
        <div>
            <h2>{t("RecommendationsList")}</h2>

            {/* Показываем loader если isLoading === true */}
            {recommendationsStore.isRecommendationsLoading ? (
                <CircularProgress />
            ) : recommendationsStore.packagesRecommendations.length > 0 ? (
                recommendationsStore.packagesRecommendations.map((recommendation) => (
                    <RecommendationCard key={recommendation.id} data={recommendation} />
                ))
            ) : (
                <p>{t("NoRecommendations")}</p>
            )}
        </div>
    );
});

export { RecommendationsList, recommendationsStore };