import { makeAutoObservable } from "mobx";
import { PackageDetails, PackageType } from "../services/apiClient";
import { packagesSearchStore } from "./PackagesStore";
import { objectsAreEqual } from "../utils/objectsTools";

class CartStore {

    sdkVersion: string | null = null;

    cartItems: PackageDetails[] = [];

    constructor() {
        makeAutoObservable(this);
    }

    addCartItem = (packageDetail: PackageDetails) => {
        let itemAlreadyAddedInCart = packagesSearchStore.getFullPackageItem(packageDetail.packageID)?.isAddedInCart;
        if (itemAlreadyAddedInCart)
            return;

        this.cartItems = [...this.cartItems, packageDetail];
        packagesSearchStore.markAsAddedCartItem(packageDetail.packageID);
    }

    removeCartItem = (packageDetail: PackageDetails) => {
        let newCartItems: PackageDetails[] = [];
        for (const cartItem of this.cartItems) {

            if (!objectsAreEqual(cartItem, packageDetail))
                newCartItems.push(cartItem);
            else
                packagesSearchStore.markAsRemovedCartItem(packageDetail.packageID);
        }
        this.cartItems = newCartItems
    }

    clearCartItems = () => {
        this.cartItems.forEach(({ packageID }) => packagesSearchStore.markAsRemovedCartItem(packageID));
        this.cartItems = [];
    }

    getAvailableSdkVersions = (): string[] => {
        let packageType: PackageType = packagesSearchStore.repositoryType;
        switch (packageType) {
            
            case PackageType.Nuget:
                {
                    return [
                        "netstandard2.0",
                        "netstandard2.1",
                        "net6.0",
                        "net7.0",
                        "net8.0"
                    ];
                }
            
            default: return [];
        }
    }

    setSdkVersion = (sdkVersion: string | null) => {
        this.sdkVersion = sdkVersion;
    }

    getSdkVersion = (): string | null => this.sdkVersion;


}

export const cartStore = new CartStore(); 