import React from 'react';
import { Card, CardContent, CircularProgress, Grid, Typography } from '@mui/material';
import PackageSearchResult from './PackageSearchResult';
import { observer } from 'mobx-react-lite';
import { packagesSearchStore } from '../../stores/PackagesStore';
import { useTranslation } from 'react-i18next';


const SearchResults: React.FC = observer(() => {

    const { t } = useTranslation();

    const { fondedPackages, isSearchResultsLoading } = packagesSearchStore;

    if (isSearchResultsLoading)
        return (
        <>
        <CircularProgress title={t("LoadingData")} color="secondary" size="3rem" />
        </>);

    return (
        <>
            <Typography sx={{ mt: 2 }} variant="h6" gutterBottom>
                {t("SearchResults")}
            </Typography>

            <Grid container spacing={2}>
                {fondedPackages.map((packageInfo, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card variant="outlined">
                            <CardContent>
                                <PackageSearchResult packageInfo={packageInfo} />
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </>
    );
});

export default SearchResults;
