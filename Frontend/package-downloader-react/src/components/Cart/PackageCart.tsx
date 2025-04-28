import React from 'react';
import {List, Box} from '@mui/material';
import {observer} from 'mobx-react-lite';
import {cartStore} from '../../stores/CartStore';
import DownloadPackagesButton from './DownloadButton';
import ClearCartButton from './ClearCartButton';
import SdkVersionSelector from "./SdkVersionSelector.tsx";
import {CartItemsCount} from "./CartItemsCount.tsx";
import CartItem from "./CartItem.tsx";
import {PackagesDownloadModal} from "./PackagesDownloadModal.tsx";
import {packagesSearchStore} from "../../stores/PackagesStore.ts";


const PackageCart: React.FC = observer(() => {

    const {cartItems} = cartStore;

    const {repositoryType} = packagesSearchStore;

    if (cartItems.length === 0)
        return <></>

    const availableSdks = cartStore.getAvailableSdkVersions();

    cartStore.setSdkVersion(availableSdks[0]);

    return (
        <Box
            sx={{
                position: 'fixed',
                bottom: 0,
                right: 0,
                width: '400px',
                zIndex: 1000,
                backgroundColor: 'white',
                boxShadow: 3,
                padding: 2,
            }}
        >

            <CartItemsCount count={cartItems.length} repositoryType={repositoryType} />

            <SdkVersionSelector availableSdks={availableSdks}/>

            <List>
                {cartItems.map((packageDetailItem) => (
                    <CartItem key={packageDetailItem.packageID} packageDetailItem={packageDetailItem}/>
                ))}
            </List>

            <DownloadPackagesButton/>
            <ClearCartButton/>
            <PackagesDownloadModal/>
        </Box>

    );
});

export default PackageCart;
