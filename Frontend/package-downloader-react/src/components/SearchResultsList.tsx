import React from 'react';
import { List, ListItem, ListItemText, Button } from '@mui/material';

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
          <Button
            variant="contained"
            color="primary"
            onClick={() => onAddToCart(packageName)}
          >
            Add to Cart
          </Button>
        </ListItem>
      ))}
    </List>
  );
};

export default SearchResultsList;
