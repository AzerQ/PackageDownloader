import React from 'react';
import { List, ListItem, ListItemText, Button, IconButton, Card, CardContent, Grid } from '@mui/material';
import { AddBox } from '@mui/icons-material';
import { PackageDetails, PackageInfo } from '../services/apiClient';
import PackageSearchResult from './PackageSearchResult';

interface SearchResultsListProps {
    results: PackageInfo[];
    onAddToCart: (packageItem: PackageDetails) => void;
}

const SearchResults: React.FC<SearchResultsListProps> = ({ results, onAddToCart }) => {
    return (
        <Grid container spacing={2}>
            {results.map((packageInfo, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card variant="outlined">
                        <CardContent>
                            <PackageSearchResult packageInfo={packageInfo} onAddToCart={onAddToCart} />
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default SearchResults;
