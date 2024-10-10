import React from 'react';
import { Card, CardContent, Grid } from '@mui/material';
import { PackageInfo } from '../../services/apiClient';
import PackageSearchResult from './PackageSearchResult';
import { observer } from 'mobx-react-lite';
import { packagesSearchStore } from '../../stores/PackagesStore';

interface SearchResultsListProps {
    
}

const SearchResults: React.FC<SearchResultsListProps> = observer(() => {
    const {fondedPackages} = packagesSearchStore;
    return (
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
    );
});

export default SearchResults;
