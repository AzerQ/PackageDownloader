import {Autocomplete, CircularProgress, TextField} from "@mui/material";
import React from "react";
import {packagesSearchStore} from "../../stores/PackagesStore.ts";
import { observer } from "mobx-react-lite";
import {useTranslation} from "react-i18next";


const SearchBar: React.FC<{handleSearch: () => Promise<unknown>}> = observer(({handleSearch}) => {

    const {
        searchQuery,
        setSearchQuery,
        searchSuggestions,
    } = packagesSearchStore;

    const suggestionsOptions = {
        options: searchSuggestions?.state === "fulfilled" ? searchSuggestions?.value : [],
        loading: searchSuggestions?.state === "pending"
    }



    const {t} = useTranslation();

    return  (<Autocomplete
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
    />)
})

export default SearchBar;