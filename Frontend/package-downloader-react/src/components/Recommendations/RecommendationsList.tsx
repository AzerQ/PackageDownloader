import React from 'react';
import RecommendationCard from './RecommendationCard';
import { CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {PackageRecommendation} from "../../services/apiClient.ts";

export interface IRecommendationsListProps {
    isRecommendationsLoading: boolean,
    packagesRecommendations: PackageRecommendation[]
}

const RecommendationsList: React.FC<IRecommendationsListProps> = ({isRecommendationsLoading, packagesRecommendations}) => {

    const { t } = useTranslation();

    return (
        <div>
            <h2>{t("RecommendationsList")}</h2>

            {isRecommendationsLoading ? (
                <CircularProgress />
            ) : packagesRecommendations.length > 0 ? (
                packagesRecommendations.map((recommendation) => (
                    <RecommendationCard key={recommendation.id} data={recommendation} />
                ))
            ) : (
                <p>{t("NoRecommendations")}</p>
            )}
        </div>
    );
};

export default RecommendationsList;