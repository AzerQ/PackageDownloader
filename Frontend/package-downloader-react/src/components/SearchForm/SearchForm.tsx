import React, { useEffect } from 'react';
import { Tabs, Tab, TextField, Box, CircularProgress, Autocomplete, IconButton, Container, Paper, Typography } from '@mui/material';
import { PackageType } from '../../services/apiClient';
import { observer } from 'mobx-react-lite';
import { packagesSearchStore } from '../../stores/PackagesStore';
import { Search } from '@mui/icons-material';
import SearchResults from './SearchResultsList';



const SearchForm: React.FC = observer(() => {


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

      <Paper
        component="form"
        sx={{ p: '2px 4px', display: 'flex', alignItems: 'center' }}
      >

        <IconButton color="primary" aria-label="search packages" onClick={ async () => await getSearchResults()}>
          <Search />
        </IconButton>


        <Autocomplete
          freeSolo
          options={searchSuggestions} // Предложения, полученные от API
          loading={isSearchSuggestionsLoading}
          onInputChange={(event, value) => setSearchQuery(value)} // Обновляем значение при вводе
          renderInput={(params) => (
            <TextField
              {...params}
              sx={{ mt: 2, ml: 2, mb: 3, flex: 1, width: 1000 }}
              label="Search for packages"
              variant="standard"
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

      </Paper>

      <SearchResults/>


    </Box>
  );
});

export default SearchForm;
