import { makeAutoObservable, runInAction } from "mobx";
import { packageApiClient, PackageInfo, PackageType } from "../services/apiClient";
import { cartStore } from "./CartStore";

class PackagesSearchStore {

    fondedPackages: PackageInfo[] = [];
    repositoryType: PackageType = PackageType.Npm;

    searchSuggestions: string[] = [];
    searchQuery: string = '';

    isSearchSuggestionsLoading: boolean = false;
    isSearchResultsLoading: boolean = false;

    constructor() {
        makeAutoObservable(this);
    }

    setSearchQuery = (searchQuery: string) => {
        this.searchQuery = searchQuery;
    }

    clearSuggestions= () => {
        this.searchSuggestions = [];
    }

    clearSearchQuery = () => {
        this.searchQuery = '';
    }

    clearSearchResults = () => {
        this.fondedPackages = [];
    }

    getSearchResults = async () => {
        try {
            this.isSearchResultsLoading = true;
            const results = await packageApiClient.getSearchResults(this.repositoryType, this.searchQuery);

            runInAction(() => {
                this.fondedPackages = results;
                this.isSearchResultsLoading = false;
            });

        }
        catch (error) {
            this.isSearchResultsLoading = false;
            console.error(`Error fetching search results (query='${this.searchQuery})':`, error);
        }
    }

    getSearchSuggestions = async () => {

        try {
            this.isSearchSuggestionsLoading = true;
            const results = await packageApiClient.getSearchSuggestions(this.repositoryType, this.searchQuery);

            runInAction(() => {
                this.searchSuggestions = results;
                this.isSearchSuggestionsLoading = false;
            });

        }
        catch (error) {
            this.isSearchSuggestionsLoading = false;
            console.error(`Error fetching suggestions (query='${this.searchQuery})':`, error);
        }

    }

    setRepositoryType= (packageType: PackageType) => {

        this.repositoryType = packageType;
        this.clearSuggestions();
        this.clearSearchResults();
        this.clearSearchQuery();
        cartStore.clearCartItems();
    }

}

export const packagesSearchStore = new PackagesSearchStore();