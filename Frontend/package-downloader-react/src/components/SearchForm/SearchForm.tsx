import React, {useEffect} from 'react';
import {
    Box,
    IconButton,
    Paper,
    Tooltip,
    FormControlLabel,
    Switch,
} from '@mui/material';
import {PackageInfo} from '../../services/apiClient';
import {observer} from 'mobx-react-lite';
import {packagesSearchStore} from '../../stores/PackagesStore';
import {Search, SmartToy} from '@mui/icons-material';
import SearchResults from './SearchResultsList';
import {useTranslation} from 'react-i18next';
import {recommendationsStore} from "../../stores/RecommendationsStore.ts";
import SearchBar from "./SearchBar.tsx";
import PackageTypeSelector from "./PackageTypeSelector.tsx";

const SearchForm: React.FC = observer(() => {

    const {t} = useTranslation();

    const {
        searchQuery,
        getSearchSuggestions,
        getSearchResults,
        setSearchSuggestionEnabledFlag,
        isSearchSuggestionsEnabled,
        fondedPackages
    } = packagesSearchStore;


    useEffect(() => {
        if (searchQuery.length > 2) {
            getSearchSuggestions();
        }
    }, [searchQuery]);


    const {openRecommendationsForm} = recommendationsStore;

    const handleSearch = async () => {
        if (searchQuery.trim() !== '') {
            await getSearchResults();
        }
    };


    return (
        <Box sx={{mb: 3}}>



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


                <SearchBar handleSearch={handleSearch} />

                <PackageTypeSelector/>

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