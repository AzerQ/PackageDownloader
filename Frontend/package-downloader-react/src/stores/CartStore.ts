import { makeAutoObservable } from "mobx";
import { PackageDetails } from "../services/apiClient";
import { packagesSearchStore } from "./PackagesStore";

class CartStore {
    
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
            if (!cartItem.equals(packageDetail))
                newCartItems.push(cartItem);
            else
                packagesSearchStore.markAsRemovedCartItem(packageDetail.packageID);
        }
        this.cartItems = newCartItems
    }

    clearCartItems = () => {
        this.cartItems.forEach(({packageID}) => packagesSearchStore.markAsRemovedCartItem(packageID));
        this.cartItems = [];
    }


}

export const cartStore = new CartStore(); 