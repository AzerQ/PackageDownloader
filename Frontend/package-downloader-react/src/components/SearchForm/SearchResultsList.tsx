import React, {memo} from 'react';
import {Card, CardContent, CircularProgress, Grid, Typography} from '@mui/material';
import PackageSearchResult from './PackageSearchResult';
import {useTranslation} from 'react-i18next';
import {PackageInfo} from "../../services/apiClient.ts";

export interface ISearchResultsProps {
    fondedPackages: PackageInfo[],
    isSearchResultsLoading: boolean
}

const SearchResults: React.FC<ISearchResultsProps> = memo(({fondedPackages, isSearchResultsLoading}) => {

    const {t} = useTranslation();

    if (!fondedPackages || fondedPackages.length === 0)
        return <></>

    if (isSearchResultsLoading)
        return (
            <>
                <CircularProgress title={t("LoadingData")} color="secondary" size="3rem"/>
            </>);

    return (
        <>
            <Typography sx={{mt: 2}} variant="h6" gutterBottom>
                {t("SearchResults")}
            </Typography>

            <Grid container spacing={2}>
                {fondedPackages.map((packageInfo, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card variant="outlined">
                            <CardContent>
                                <PackageSearchResult packageInfo={packageInfo}/>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </>
    );
});

export default SearchResults;
