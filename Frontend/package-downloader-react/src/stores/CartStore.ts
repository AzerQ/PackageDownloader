import { makeAutoObservable } from "mobx";
import { PackageDetails } from "../services/apiClient";

class CartStore {
    
    cartItems: PackageDetails[] = [];

    constructor() {
        makeAutoObservable(this);
    }

    addCartItem = (packageDetail: PackageDetails) => {
        if (this.cartItems.some(element => element.equals(packageDetail)))
            return;

        this.cartItems = [...this.cartItems, packageDetail]
    }

    removeCartItem = (packageDetail: PackageDetails) => {
        this.cartItems =  this.cartItems.filter((item) => !item.equals(packageDetail));
    }

    clearCartItems = () => {
        this.cartItems = [];
    }

}

export const cartStore = new CartStore(); 