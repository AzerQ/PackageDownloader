import {
    Card,
    CardContent,
    Typography,
    Chip,
    Link,
    CardActions,
    Button,
    CardHeader,
    Avatar,
    Stack,
    Select,
    MenuItem,
    FormControl,
    Box
} from "@mui/material";
import {PackageInfo} from "../../services/apiClient";
import {cartStore} from "../../stores/CartStore";
import DownloadIcon from '@mui/icons-material/Download'; // Импортируем иконку загрузки
import {Add, GitHub, LibraryBooks, Public} from "@mui/icons-material";
import {packagesSearchStore} from "../../stores/PackagesStore";
import {compareVersions} from "../../utils/versionsComparer";
import {useState} from "react";
import {useTranslation} from "react-i18next";
import {packageInfoStore} from "../../stores/PackageInfoStore.ts";
import {sideNavigationStore} from "../../stores/SideNavigationStore.ts";
import {AdditionalPanel} from "../SideNavigationLayout/PanelsContext/additionalPanel.ts";

interface PackageSearchResultsProps {
    packageInfo: PackageInfo;
}

const PackageSearchResult: React.FC<PackageSearchResultsProps> = ({
                                                                      packageInfo: {
                                                                          currentVersion,
                                                                          getPackageIconOrStockImage,
                                                                          id,
                                                                          downloadsCount,
                                                                          description,
                                                                          authorInfo,
                                                                          tags,
                                                                          repositoryUrl,
                                                                          packageUrl,
                                                                          otherVersions,
                                                                          isAddedInCart,
                                                                          defaultIcon
                                                                      }
                                                                  }) => {

    const {t} = useTranslation();

    const [selectedVersion, setSelectedVersion] = useState<string>(currentVersion);

    const {fetchReadmeContent} = packageInfoStore;

    const {repositoryType} = packagesSearchStore;

    return (
        <Card variant="outlined">

            <CardHeader
                avatar={
                    <Avatar
                        sx={{width: 64, height: 64}}
                        alt="Package icon"
                        src={getPackageIconOrStockImage()}
                        variant="square"
                    >
                        <img alt="package icon not loaded" style={{background: 'white'}} src={defaultIcon}/>
                    </Avatar>
                }
                title={id}
                subheader={t("LatestVersion", {version: currentVersion})}
            />


            <Stack direction="row" alignItems="center" spacing={1} sx={{px: 2, pt: 1}}>
                <DownloadIcon color="primary" fontSize="small"/> {/* Иконка загрузки */}
                <Typography variant="subtitle2" color="text.secondary">
                    {t("Downloads", {num: downloadsCount.toLocaleString()})} {/* Форматированное число */}
                </Typography>
            </Stack>


            <CardContent>
                <Typography variant="body1" gutterBottom>
                    {description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {t("Author", {authorInfo})}
                </Typography>
                <div>
                    {tags?.map((tag) => (
                        <Chip key={id + tag} label={tag} style={{margin: '4px'}}/>
                    ))}
                </div>
                {repositoryUrl && (
                    <>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{px: 2, pt: 1}}>
                            <Button size="small" startIcon={<LibraryBooks/>}
                                    onClick={async () => {
                                        await fetchReadmeContent(repositoryUrl ?? '');
                                        sideNavigationStore.openPanel(AdditionalPanel.Readme);
                                    }}>
                                {t("ViewReadmeFile")}
                            </Button>
                            <GitHub color="primary" fontSize="small"/>
                            <Link href={repositoryUrl} target="_blank" rel="noopener">
                                {t("ViewSourceRepository")}
                            </Link>
                        </Stack>

                    </>
                )}
                {packageUrl && (
                    <Stack direction="row" alignItems="center" spacing={1} sx={{px: 2, pt: 1}}>
                        <Public color="primary" fontSize="small"/>
                        <Link href={packageUrl} target="_blank" rel="noopener">
                            {t("ViewOnPackageRepositorySite", {repositoryType})}
                        </Link>
                    </Stack>
                )}
            </CardContent>


            <CardActions>
                <Stack spacing={1}>
                    <Typography variant="overline" sx={{display: 'block'}}>
                        {t("ChoseVersion")}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                        <FormControl sx={{minWidth: 120}} size="small">
                            <Select
                                value={selectedVersion}
                                onChange={(e) => setSelectedVersion(e.target.value)}
                            >
                                <MenuItem key={id + currentVersion} value={currentVersion}>
                                    {currentVersion}
                                </MenuItem>
                                {otherVersions && otherVersions.length > 0 &&
                                    otherVersions
                                        .filter(ver => ver !== currentVersion)
                                        .sort((a, b) => compareVersions(a, b, "DESC"))
                                        .map((ver) => (
                                            <MenuItem key={id + ver} value={ver}>
                                                {ver}
                                            </MenuItem>
                                        ))}
                            </Select>
                        </FormControl>
                        {!isAddedInCart && (
                            <Button
                                startIcon={<Add/>}
                                color="primary"
                                onClick={() => {
                                    cartStore.addCartItem({
                                        packageID: id,
                                        packageVersion: selectedVersion,
                                        packageIconUrl: getPackageIconOrStockImage()
                                    });
                                }}
                                variant="contained"
                            >
                                {t("Add")}
                            </Button>
                        )}
                    </Stack>
                </Stack>
            </CardActions>
        </Card>
    );
};

export default PackageSearchResult;