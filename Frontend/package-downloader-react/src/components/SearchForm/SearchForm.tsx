import React, { useEffect } from 'react';
import {
  Tabs,
  Tab,
  TextField,
  Box,
  CircularProgress,
  Autocomplete,
  IconButton,
  Paper,
  Tooltip,
} from '@mui/material';
import { PackageType } from '../../services/apiClient';
import { observer } from 'mobx-react-lite';
import { packagesSearchStore } from '../../stores/PackagesStore';
import { Search, SmartToy } from '@mui/icons-material';
import SearchResults from './SearchResultsList';
import { recommendationsStore } from '../Recommendations/RecommendationsList';

const SearchForm: React.FC = observer(() => {
  const {
    searchQuery,
    setSearchQuery,
    getSearchSuggestions,
    setRepositoryType,
    repositoryType,
    searchSuggestions,
    isSearchSuggestionsLoading,
    getSearchResults,
  } = packagesSearchStore;

  // Используем эффект для вызова API при изменении inputValue
  useEffect(() => {
    if (searchQuery.length > 2) {
      getSearchSuggestions();
    }
  }, [searchQuery]);

  const onRepositoryTypeChange = (e: React.SyntheticEvent, newValue: PackageType) =>
    setRepositoryType(newValue);

  const handleSearch = async () => {
    if (searchQuery.trim() !== '') {
      await getSearchResults();
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Tabs value={repositoryType} onChange={onRepositoryTypeChange} centered>
        <Tab label="NPM" value={PackageType.Npm} />
        <Tab label="NuGet" value={PackageType.Nuget} />
      </Tabs>
      <Paper component="div" sx={{ p: '2px 4px', display: 'flex', alignItems: 'center' }}>

        <Tooltip title="Начать поиск" aria-label="search">
          <IconButton color="primary" aria-label="search packages" onClick={handleSearch}>
            <Search />
          </IconButton>
        </Tooltip>

        <Tooltip title="Порекомендовать пакеты" aria-label="aiRecommendations">
          <IconButton color="primary" aria-label="ai recommendations" onClick={() => recommendationsStore.openRecommendationsForm()}>
            <SmartToy />
          </IconButton>
        </Tooltip>

        <Autocomplete
          freeSolo
          value={searchQuery}
          options={searchSuggestions} // Предложения, полученные от API
          loading={isSearchSuggestionsLoading}
          onInputChange={(event, value) => setSearchQuery(value)} // Обновляем значение при вводе
          onChange={async (_, value) => {
            if (value !== null) {
              setSearchQuery(value as string);
              await handleSearch(); // Выполняем поиск при выборе подсказки
            }
          }}
          onKeyDown={async (e) => {
            if (e.key === 'Enter') {
              e.preventDefault(); // Предотвращаем стандартное поведение
              await handleSearch(); // Выполняем поиск при нажатии Enter
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              sx={{ mt: 2, ml: 2, mb: 3, flex: 1, width: 1000 }}
              label="Search for packages"
              variant="standard"
              fullWidth
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {isSearchSuggestionsLoading ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
      </Paper>
      <SearchResults />
    </Box>
  );
});

export default SearchForm;