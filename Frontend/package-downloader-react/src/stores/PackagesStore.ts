import {makeAutoObservable} from "mobx";
import {getPackageApiClient, PackageInfo, PackageType} from "../services/apiClient";
import {cartStore} from "./CartStore";
import {cloneObject} from "../utils/objectsTools";
import {packageInfoStore} from "./PackageInfoStore";
import {fromPromise, IPromiseBasedObservable} from "mobx-utils";

class PackagesSearchStore {

    fondedPackages?: IPromiseBasedObservable<PackageInfo[]>;
    repositoryType: PackageType = PackageType.Npm;

    searchSuggestions?: IPromiseBasedObservable<string[]>;
    searchQuery: string = '';

    isSearchSuggestionsEnabled: boolean = false;

    constructor() {
        makeAutoObservable(this);
    }

    setSearchQuery = (searchQuery: string) => {
        this.searchQuery = searchQuery;
    }

    clearSuggestions = () => {
        this.searchSuggestions = undefined;
    }

    clearSearchQuery = () => {
        this.searchQuery = '';
    }

    clearSearchResults = () => {
        this.fondedPackages = undefined;
    }

    getSearchResults = async () => {
        const {getSearchResults} = await getPackageApiClient();
        this.fondedPackages = fromPromise(getSearchResults(this.repositoryType, this.searchQuery));
    }

    getSearchSuggestions = async () => {
        if (!this.isSearchSuggestionsEnabled)
            return;

        const {getSearchSuggestions} = await getPackageApiClient();
        this.searchSuggestions = fromPromise(getSearchSuggestions(this.repositoryType, this.searchQuery));
    }

    changeRepositoryType = (packageType: PackageType) => {
        this.repositoryType = packageType;
        this.clearSuggestions();
        this.clearSearchResults();
        this.clearSearchQuery();
        cartStore.clearCartItems();
        packageInfoStore.clearPackageInfo();
    }

    getFullPackageItem = (packageId: string) =>
        this.fondedPackages?.case(
            {
                fulfilled: data => data.find(packageItem => packageItem.id === packageId),
                pending: () => undefined,
                rejected: () => undefined
            }
        );


    private setIsInCartItemFlag = (packageId: string, isInCartItem: boolean) => {

        const NOT_FOUND = -1;

        this.fondedPackages?.case({

           fulfilled:  data => {

               const packageIndex = data.findIndex(packageItem => packageItem.id === packageId);

               if (packageIndex !== NOT_FOUND) {
                   const newPackageItem = cloneObject(this.getFullPackageItem(packageId)!);
                   newPackageItem.isAddedInCart = isInCartItem;
                   data[packageIndex] = newPackageItem;
               }

           }
        });
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