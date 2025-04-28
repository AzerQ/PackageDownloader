import {observer} from "mobx-react-lite";
import {FormControl, MenuItem, Select, SelectChangeEvent, Typography} from "@mui/material";
import {PackageType} from "../../services/apiClient.ts";
import React from "react";
import {packagesSearchStore} from "../../stores/PackagesStore.ts";
import {useTranslation} from "react-i18next";


const iconsMap: Map<PackageType, React.ReactNode> = new Map<PackageType, React.ReactNode>([
    [PackageType.VsCode, <img width="24" height="24" src="https://img.icons8.com/color/24/visual-studio-code-2019.png" alt="visual-studio-code-2019"/>],
    [PackageType.Npm, <img width="24" height="24" src="https://img.icons8.com/color/24/npm.png" alt="npm"/>],
    [PackageType.Nuget, <img width="24" height="24" src="https://img.icons8.com/external-tal-revivo-color-tal-revivo/24/external-nuget-a-free-and-open-source-package-manager-designed-for-the-microsoft-development-platform-logo-color-tal-revivo.png" alt="nuget"/>]
])

const PackageTypeSelector: React.FC = observer(() => {

    const {t} = useTranslation();

    const {repositoryType, changeRepositoryType} = packagesSearchStore;

    const onRepositoryTypeChange = (event: SelectChangeEvent<PackageType>) =>
        changeRepositoryType(event.target.value as PackageType);

    const itemVariants = Object.keys(PackageType);

    return (<FormControl sx={{width: '30%', marginLeft: 3, marginBottom: 3}}>
        <Typography variant="subtitle2" gutterBottom>
            {t("PackagesRepositoryType")}
        </Typography>
        <Select
            id="package-type"
            value={repositoryType}
            onChange={onRepositoryTypeChange}
        >
            {
                itemVariants.map(variant =>
                    <MenuItem key={variant} value={variant}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {iconsMap.get(variant as PackageType)}
                            <div style={{marginLeft: '10px'}}>{variant}</div>
                        </div>
                    </MenuItem>)
            }
        </Select>
    </FormControl>)
})

export default PackageTypeSelector
