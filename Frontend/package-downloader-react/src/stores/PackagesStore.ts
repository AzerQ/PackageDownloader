import { makeAutoObservable, runInAction } from "mobx";
import { getPackageApiClient, PackageInfo, PackageType } from "../services/apiClient";
import { cartStore } from "./CartStore";
import { cloneObject } from "../utils/objectsTools";
import { notificationStore } from "./NotificationStore";

class PackagesSearchStore {

    fondedPackages: PackageInfo[] = [];
    repositoryType: PackageType = PackageType.Npm;

    searchSuggestions: string[] = [];
    searchQuery: string = '';

    isSearchSuggestionsLoading: boolean = false;
    isSearchResultsLoading: boolean = false;

    isSearchSuggestionsEnabled: boolean = false;

    constructor() {
        makeAutoObservable(this);
    }

    setSearchQuery = (searchQuery: string) => {
        this.searchQuery = searchQuery;
    }

    clearSuggestions = () => {
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
            let packageApiClient = await getPackageApiClient();
            this.isSearchResultsLoading = true;
            const results = await packageApiClient.getSearchResults(this.repositoryType, this.searchQuery);

            runInAction(() => {
                this.fondedPackages = results;
                this.isSearchResultsLoading = false;
            });

        }
        catch (error) {
            this.isSearchResultsLoading = false;
            notificationStore.addError( `Error fetching search results (query='${this.searchQuery}) : ${error}'`);
        }
    }

    getSearchSuggestions = async () => {

        if (!this.isSearchSuggestionsEnabled)
            return;

        try {
            let packageApiClient = await getPackageApiClient();
            this.isSearchSuggestionsLoading = true;
            const results = await packageApiClient.getSearchSuggestions(this.repositoryType, this.searchQuery);

            runInAction(() => {
                this.searchSuggestions = results;
                this.isSearchSuggestionsLoading = false;
            });

        }
        catch (error) {
            this.isSearchSuggestionsLoading = false;
            notificationStore.addError(`Error fetching suggestions (query='${this.searchQuery})': ${error}`);
        }

    }

    setRepositoryType = (packageType: PackageType) => {

        this.repositoryType = packageType;
        this.clearSuggestions();
        this.clearSearchResults();
        this.clearSearchQuery();
        cartStore.clearCartItems();
    }

    getFullPackageItem = (packageId: string) =>
        this.fondedPackages.find(packageItem => packageItem.id === packageId)

    private setIsInCartItemFlag = (packageId: string, isInCartItem: boolean) => {
       
        let packageIndex = this.fondedPackages.findIndex(packageItem => packageItem.id === packageId);

        const NOT_FOUND = -1;
        if (packageIndex === NOT_FOUND)
            return;
        
        let originalPackage = this.getFullPackageItem(packageId);
        let packageItem = cloneObject(originalPackage);

        if (packageItem) {
            packageItem.isAddedInCart = isInCartItem;
            this.fondedPackages[packageIndex] = packageItem;
        }


    }

    markAsAddedCartItem = (packageId: string) => this.setIsInCartItemFlag(packageId, true);

    markAsRemovedCartItem = (packageId: string) => this.setIsInCartItemFlag(packageId, false);

    setSearchSuggestionEnabledFlag = (flagValue: boolean) => {
         this.isSearchSuggestionsEnabled = flagValue;
         if (!flagValue)
            this.clearSuggestions();
    }

}

export const packagesSearchStore = new PackagesSearchStore();