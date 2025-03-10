import React from 'react';
import { observer } from 'mobx-react-lite';
import RecommendationCard from './RecommendationCard';
import { CircularProgress } from '@mui/material';
import { recommendationsStore } from '../../stores/RecommendationsStore';
import { useTranslation } from 'react-i18next';


const RecommendationsList: React.FC = observer(() => {

    const { t } = useTranslation();

    return (
        <div>
            <h2>{t("RecommendationsList")}</h2>

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