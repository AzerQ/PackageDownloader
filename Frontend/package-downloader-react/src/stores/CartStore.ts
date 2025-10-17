import { makeAutoObservable } from "mobx";
import {getPackageApiClient, PackageDetails, PackageType} from "../services/apiClient";
import { packagesSearchStore } from "./PackagesStore";
import { objectsAreEqual } from "../utils/objectsTools";
import {fromPromise, IPromiseBasedObservable} from "mobx-utils";
import { downloadHistoryStore } from "./DownloadHistoryStore";

class CartStore {

    sdkVersion: string | null = null;

    cartItems: PackageDetails[] = [];

    packagesDownloadLink?: IPromiseBasedObservable<string>;

    constructor() {
        makeAutoObservable(this);
    }

    addCartItem = (packageDetail: PackageDetails) => {

        const {getFullPackageItem, markAsAddedCartItem} = packagesSearchStore;

        const itemAlreadyAddedInCart = getFullPackageItem(packageDetail.packageID)?.isAddedInCart;

        if (itemAlreadyAddedInCart)
            return;

        this.cartItems = [...this.cartItems, packageDetail];
        markAsAddedCartItem(packageDetail.packageID);
    }

    removeCartItem = (packageDetail: PackageDetails) => {

        const { markAsRemovedCartItem } = packagesSearchStore;

        const newCartItems: PackageDetails[] = [];

        for (const cartItem of this.cartItems) {

            if (!objectsAreEqual(cartItem, packageDetail))
                newCartItems.push(cartItem);
            else
                markAsRemovedCartItem(packageDetail.packageID);
        }
        this.cartItems = newCartItems
    }

    clearCartItems = () => {

        const { markAsRemovedCartItem } = packagesSearchStore;

        this.cartItems.forEach(({ packageID }) => markAsRemovedCartItem(packageID));
        this.cartItems = [];
    }

    getAvailableSdkVersions = (): string[] => {
        const { repositoryType } = packagesSearchStore;
        switch (repositoryType) {
            
            case PackageType.Nuget:
                {
                    return [
                        "netstandard2.0",
                        "netstandard2.1",
                        "net6.0",
                        "net7.0",
                        "net8.0",
                        "net9.0"
                    ];
                }
            
            default: return [];
        }
    }

    setSdkVersion = (sdkVersion: string | null) => {
        this.sdkVersion = sdkVersion;
    }

    getSdkVersion = (): string | null => this.sdkVersion;


    getPackagesDownloadLink = async () => {

        const { preparePackagesDownloadLink } = await getPackageApiClient();
        const { repositoryType } = packagesSearchStore;

        const downloadLinkPromise = preparePackagesDownloadLink({
            packageType: repositoryType,
            packagesDetails: this.cartItems,
            sdkVersion: this.getSdkVersion()
        });

        this.packagesDownloadLink = fromPromise(downloadLinkPromise);

        // Save to history when download link is successfully created
        downloadLinkPromise.then(() => {
            downloadHistoryStore.addToHistory({
                packages: [...this.cartItems],
                packageType: repositoryType
            });
        }).catch(() => {
            // Ignore errors - we don't want to save failed downloads
        });
    }


}

export const cartStore = new CartStore(); 