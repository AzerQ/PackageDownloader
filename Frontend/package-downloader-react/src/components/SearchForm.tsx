import React, { useState } from 'react';
import { Tabs, Tab, TextField, Box } from '@mui/material';

interface SearchFormProps {
  onSearch: (packageType: string, query: string) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch }) => {
  const [packageType, setPackageType] = useState('Npm');
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(packageType, query);
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Tabs value={packageType} onChange={(e, newValue) => setPackageType(newValue)} centered>
        <Tab label="NPM" value="Npm" />
        <Tab label="NuGet" value="Nuget" />
      </Tabs>

      <TextField
        fullWidth
        label="Search for a package"
        variant="outlined"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') handleSearch();
        }}
        sx={{ mt: 2 }}
      />
    </Box>
  );
};

export default SearchForm;
