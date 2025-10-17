import {observer} from "mobx-react-lite";
import {FormControl, MenuItem, Select, SelectChangeEvent, Typography} from "@mui/material";
import {PackageType} from "../../services/apiClient.ts";
import React from "react";
import {packagesSearchStore} from "../../stores/PackagesStore.ts";
import {useTranslation} from "react-i18next";
import CodeIcon from '@mui/icons-material/Code';
import {FileDownload, ViewInAr} from "@mui/icons-material";
import DeveloperBoardIcon from '@mui/icons-material/DeveloperBoard';


const iconsMap: Map<PackageType, React.ReactNode> = new Map<PackageType, React.ReactNode>([
    [PackageType.VsCode, <CodeIcon sx={{ color: '#007ACC' }}/>],
    [PackageType.Npm, <FileDownload sx={{ color: '#CB3837' }}/>],
    [PackageType.Nuget, <DeveloperBoardIcon sx={{ color: '#004880' }}/>],
    [PackageType.Docker, <ViewInAr sx={{ color: '#2496ED' }}/>]
])

const PackageTypeSelector: React.FC = observer(() => {

    const {t} = useTranslation();

    const {repositoryType, changeRepositoryType} = packagesSearchStore;

    const onRepositoryTypeChange = (event: SelectChangeEvent<PackageType>) =>
        changeRepositoryType(event.target.value as PackageType);

    const itemVariants = Object.keys(PackageType);

    return (<FormControl sx={{minWidth: 150, flex: 1}}>
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
