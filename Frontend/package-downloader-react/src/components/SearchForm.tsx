import React, { useEffect, useState } from 'react';
import { Tabs, Tab, TextField, Box, CircularProgress, Autocomplete } from '@mui/material';
import { packageApiClient, PackageType } from '../services/apiClient';

interface SearchFormProps {
  onSearch: (packageType: string, query: string) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch }) => {
  const [packageType, setPackageType] = useState('Npm');
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Функция для получения подсказок при изменении ввода
  const fetchSuggestions = async (query: string) => {
      try {
          setLoading(true);
          const packageTypeEnumValue = PackageType[packageType as keyof typeof PackageType];
          const results = await packageApiClient.getSearchSuggestions(packageTypeEnumValue, query);
          setSuggestions(results);
      } catch (error) {
          console.error("Error fetching suggestions:", error);
      } finally {
          setLoading(false);
      }
  };

  // Используем эффект для вызова API при изменении inputValue
  useEffect(() => {
      if (query.length > 2) {
          fetchSuggestions(query);
      } else {
          setSuggestions([]);
      }
  }, [query]);

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
    
    <Autocomplete
            freeSolo
            options={suggestions} // Предложения, полученные от API
            loading={loading}
            onInputChange={(event, value) => setQuery(value)} // Обновляем значение при вводе
            renderInput={(params) => (
                <TextField
                    {...params}
                    sx={{ mt: 2 }}
                    label="Search for packages"
                    variant="outlined"
                    fullWidth
                    value={query}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') handleSearch();
                      }}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <>
                                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </>
                        ),
                    }}
                />
            )}
        />

    </Box>
  );
};

export default SearchForm;
