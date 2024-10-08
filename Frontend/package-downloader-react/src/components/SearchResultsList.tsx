import React from 'react';
import { List, ListItem, ListItemText, Button, IconButton } from '@mui/material';
import { AddBox } from '@mui/icons-material';

interface SearchResultsListProps {
  results: string[];
  onAddToCart: (packageName: string) => void;
}

const SearchResultsList: React.FC<SearchResultsListProps> = ({ results, onAddToCart }) => {
  return (
    <List>
      {results.map((packageName, index) => (
        <ListItem key={index} divider>
          <ListItemText primary={packageName} />
          <IconButton
            color="primary"
            onClick={() => onAddToCart(packageName)}
          >
            <AddBox/>
          </IconButton>
        </ListItem>
      ))}
    </List>
  );
};

export default SearchResultsList;
