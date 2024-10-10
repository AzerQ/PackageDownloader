import React, { useEffect } from 'react';
import { Tabs, Tab, TextField, Box, CircularProgress, Autocomplete } from '@mui/material';
import { PackageType } from '../../services/apiClient';
import { observer } from 'mobx-react-lite';
import { packagesSearchStore } from '../../stores/PackagesStore';

interface SearchFormProps {

}

const SearchForm: React.FC<SearchFormProps> = observer(({ }) => {


  const { searchQuery, setSearchQuery, getSearchSuggestions, setRepositoryType,
          repositoryType, searchSuggestions, isSearchSuggestionsLoading, getSearchResults } = packagesSearchStore;


  // Используем эффект для вызова API при изменении inputValue
  useEffect(() => {
    if (searchQuery.length > 2) {
      getSearchSuggestions();
    }
  }, [searchQuery]);


  const onRepositoryTypeChange = (e: React.SyntheticEvent, newValue: PackageType) => setRepositoryType(newValue);

  return (
    <Box sx={{ mb: 3 }}>
      <Tabs value={repositoryType} onChange={onRepositoryTypeChange} centered>
        <Tab label="NPM" value={PackageType.Npm} />
        <Tab label="NuGet" value={PackageType.Nuget} />
      </Tabs>

      <Autocomplete
        freeSolo
        options={searchSuggestions} // Предложения, полученные от API
        loading={isSearchSuggestionsLoading}
        onInputChange={(event, value) => setSearchQuery(value)} // Обновляем значение при вводе
        renderInput={(params) => (
          <TextField
            {...params}
            sx={{ mt: 2 }}
            label="Search for packages"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onKeyPress={async (e) => {
              if (e.key === 'Enter') await getSearchResults();
            }}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {isSearchSuggestionsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />

      

    </Box>
  );
});

export default SearchForm;
