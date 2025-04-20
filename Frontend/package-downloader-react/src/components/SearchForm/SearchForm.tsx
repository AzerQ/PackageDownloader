import React, {useEffect} from 'react';
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
    FormControlLabel,
    Switch,
} from '@mui/material';
import {PackageInfo, PackageType} from '../../services/apiClient';
import {observer} from 'mobx-react-lite';
import {packagesSearchStore} from '../../stores/PackagesStore';
import {Search, SmartToy} from '@mui/icons-material';
import SearchResults from './SearchResultsList';
import {useTranslation} from 'react-i18next';
import {recommendationsStore} from "../../stores/RecommendationsStore.ts";

const SearchForm: React.FC = observer(() => {

    const {t} = useTranslation();

    const {
        searchQuery,
        setSearchQuery,
        getSearchSuggestions,
        changeRepositoryType,
        repositoryType,
        getSearchResults,
        setSearchSuggestionEnabledFlag,
        isSearchSuggestionsEnabled,
        fondedPackages,
        searchSuggestions
    } = packagesSearchStore;


    useEffect(() => {
        if (searchQuery.length > 2) {
            getSearchSuggestions();
        }
    }, [searchQuery]);

    const onRepositoryTypeChange = (_e: React.SyntheticEvent, newValue: PackageType) =>
        changeRepositoryType(newValue);

    const handleSearch = async () => {
        if (searchQuery.trim() !== '') {
            await getSearchResults();
        }
    };

    const {openRecommendationsForm} = recommendationsStore;

    const suggestionsOptions = {
        options: searchSuggestions?.state === "fulfilled" ? searchSuggestions?.value : [],
        loading: searchSuggestions?.state === "pending"
    }

    return (
        <Box sx={{mb: 3}}>
            <Tabs value={repositoryType} onChange={onRepositoryTypeChange} centered>
                <Tab label="NPM" value={PackageType.Npm}/>
                <Tab label="NuGet" value={PackageType.Nuget}/>
                <Tab label="VsCode" value={PackageType.VsCode}/>
            </Tabs>
            <Paper component="div" sx={{p: '2px 4px', display: 'flex', alignItems: 'center'}}>

                <Tooltip title={t("StartSearchTooltip")} aria-label="search">
                    <IconButton color="primary" aria-label="search packages" onClick={handleSearch}>
                        <Search/>
                    </IconButton>
                </Tooltip>

                <Tooltip title={t("RecommendPackagesTooltip")} aria-label="aiRecommendations">
                    <IconButton color="primary" aria-label="ai recommendations" onClick={openRecommendationsForm}>
                        <SmartToy/>
                    </IconButton>
                </Tooltip>

                <Autocomplete
                    freeSolo
                    value={searchQuery}
                    {...suggestionsOptions}
                    onInputChange={(_event, value) => setSearchQuery(value)} // Обновляем значение при вводе
                    onChange={async (_, value) => {
                        if (value !== null) {
                            setSearchQuery(value as string);
                            await handleSearch();
                        }
                    }}
                    onKeyDown={async (e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            await handleSearch();
                        }
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            sx={{mt: 2, ml: 2, mb: 3, flex: 1, width: 400}}
                            label={t("SearchForPackagesLabel")}
                            variant="standard"
                            fullWidth
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <>
                                        {suggestionsOptions.loading ? (
                                            <CircularProgress color="inherit" size={20}/>
                                        ) : null}
                                        {params.InputProps.endAdornment}
                                    </>
                                ),
                            }}
                        />
                    )}
                />
                <FormControlLabel sx={{marginLeft: 3}}
                                  control={<Switch checked={isSearchSuggestionsEnabled}
                                                   onChange={(_, checked) => setSearchSuggestionEnabledFlag(checked)}/>}
                                  label={t("SearchSuggestionsEnabled")}/>
            </Paper>
            <SearchResults isSearchResultsLoading={fondedPackages?.state === "pending"} fondedPackages={fondedPackages?.value as PackageInfo[]}/>
        </Box>
    );
});

export default SearchForm;