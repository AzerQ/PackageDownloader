import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {PackageType} from "../../services/apiClient.ts";

export interface CartItemsCountProps {
    count: number,
    repositoryType: PackageType
}

export const CartItemsCount: React.FC<CartItemsCountProps> = ({ count, repositoryType }) => {
    const { t } = useTranslation();

    return (
        <Typography variant="h6" gutterBottom>
            {t("PackagesSelected", { count, repositoryType })}
        </Typography>
    );
};