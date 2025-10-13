import {FormControl, InputLabel, MenuItem, Select} from "@mui/material";
import {cartStore} from "../../stores/CartStore.ts";
import React from "react";
import {useTranslation} from "react-i18next";
import {observer} from "mobx-react-lite";

export interface  ISdkSelectorProps {
    availableSdks: string[];
}

const SdkVersionSelector: React.FC<ISdkSelectorProps> = observer(({availableSdks}) => {

    const { t } = useTranslation();

    const { setSdkVersion, getSdkVersion } = cartStore;

    if (availableSdks.length === 0)
        return  <></>

    return (
        <FormControl sx={{m: 0, minWidth: 160}} size="small">
            <InputLabel id="selectedPackagesSdk">
                {t("SdkVersion")}
            </InputLabel>
            <Select
                value={getSdkVersion()}
                onChange={(e) => setSdkVersion(e.target.value)}
                labelId="selectedPackagesSdk"
                label="SDK version"
            >
                {
                    availableSdks.map((sdkVer) => (
                        <MenuItem key={sdkVer} value={sdkVer}>
                            {sdkVer}
                        </MenuItem>
                    ))}
            </Select>
        </FormControl>
    );
})

export default SdkVersionSelector;