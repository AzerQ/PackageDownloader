import React from 'react';
import { List, ListItem, ListItemText, Button, IconButton } from '@mui/material';
import { AddBox } from '@mui/icons-material';
import { PackageInfo } from '../services/apiClient';
import PackageSearchResult from './PackageSearchResult';

interface SearchResultsListProps {
  results: PackageInfo[];
  onAddToCart: (packageName: string) => void;
}

const SearchResultsList: React.FC<SearchResultsListProps> = ({ results, onAddToCart }) => {
  return (
    <List>
      {results.map((packageInfo, index) => (
        <ListItem key={index} divider>
          <PackageSearchResult packageInfo={packageInfo}/>
          <IconButton
            color="primary"
            onClick={() => onAddToCart(packageInfo.id ?? "")}
          >
            <AddBox/>
          </IconButton>
        </ListItem>
      ))}
    </List>
  );
};

export default SearchResultsList;
