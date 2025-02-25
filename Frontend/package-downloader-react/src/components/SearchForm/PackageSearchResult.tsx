import { Card, CardContent, Typography, Chip, Link, CardActions, Button, CardHeader, Avatar, Stack, Select, MenuItem, FormControl, Box } from "@mui/material";
import { PackageInfo } from "../../services/apiClient";
import { observer } from "mobx-react-lite";
import { cartStore } from "../../stores/CartStore";
import DownloadIcon from '@mui/icons-material/Download'; // Импортируем иконку загрузки
import { Add, GitHub, Public } from "@mui/icons-material";
import { packagesSearchStore } from "../../stores/PackagesStore";
import { compareVersions } from "../../utils/versionsComparer";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface PackageSearchResultsProps {
    packageInfo: PackageInfo;
}

const PackageSearchResult: React.FC<PackageSearchResultsProps> = observer(({ packageInfo }) => {

    const { t } = useTranslation();

    let [selectedVersion, setSelectedVersion] = useState<string>(packageInfo.currentVersion);

    return (
        <Card variant="outlined">
            {/* Заголовок карточки */}
            <CardHeader
                avatar={
                    <Avatar
                        sx={{ width: 64, height: 64 }}
                        alt="Package icon"
                        src={packageInfo.getPackageIconOrStockImage()}
                        variant="square"
                    />
                }
                title={packageInfo.id}
                subheader={t("LatestVersion", {version: packageInfo.currentVersion})}
            />

            {/* Блок с количеством скачиваний */}
            <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 2, pt: 1 }}>
                <DownloadIcon color="primary" fontSize="small" /> {/* Иконка загрузки */}
                <Typography variant="subtitle2" color="text.secondary">
                    {t("Downloads", {num: packageInfo.downloadsCount.toLocaleString()})}  {/* Форматированное число */}
                </Typography>
            </Stack>

            {/* Основное содержимое карточки */}
            <CardContent>
                <Typography variant="body1" gutterBottom>
                    {packageInfo.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {`${t("Author")}: ${packageInfo.authorInfo}`}
                </Typography>
                <div>
                    {packageInfo.tags?.map((tag) => (
                        <Chip key={packageInfo.id + tag} label={tag} style={{ margin: '4px' }} />
                    ))}
                </div>
                {packageInfo.repositoryUrl && (
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 2, pt: 1 }}>
                        <GitHub color="primary" fontSize="small" /> {/* Иконка загрузки */}
                        <Link href={packageInfo.repositoryUrl} target="_blank" rel="noopener">
                            {t("ViewSourceRepository")}
                        </Link>
                    </Stack>
                )}
                {packageInfo.packageUrl && (
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 2, pt: 1 }}>
                        <Public color="primary" fontSize="small" /> {/* Иконка загрузки */}
                        <Link href={packageInfo.packageUrl} target="_blank" rel="noopener">
                            {t("ViewOnPackageRepositorySite", {repositoryType: packagesSearchStore.repositoryType})}
                        </Link>
                    </Stack>
                )}
            </CardContent>

            {/* Действия с карточкой */}
            <CardActions>
                <Typography variant="overline" gutterBottom sx={{ display: 'block', mb: 0.5 }}>
                    {t("ChoseVersion")}
                </Typography>
                {packageInfo.otherVersions?.length && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}> {/* Используем Box для создания гибкого контейнера */}
                        <FormControl sx={{ m: 0, minWidth: 120 }} size="small">
                            <Select
                                value={selectedVersion}
                                onChange={(e) => setSelectedVersion(e.target.value)}
                            >
                                {packageInfo.otherVersions
                                    ?.sort((a, b) => compareVersions(a, b, "DESC"))
                                    .map((ver) => (
                                        <MenuItem key={packageInfo.id + ver} value={ver}>
                                            {ver}
                                        </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                        {
                            !packageInfo.isAddedInCart &&
                            (<Button
                                startIcon={<Add />}
                                sx={{ m: 0 }}
                                color="primary"
                                onClick={() => {
                                    cartStore.addCartItem(
                                        {
                                            packageID: packageInfo.id,
                                            packageVersion: selectedVersion,
                                            packageIconUrl: packageInfo.getPackageIconOrStockImage()
                                        }
                                    )
                                }
                                }
                                variant="contained"
                            >
                                {t("Add")}
                            </Button>)
                        }
                    </Box>
                )}
            </CardActions>
        </Card>
    );
});

export default PackageSearchResult;