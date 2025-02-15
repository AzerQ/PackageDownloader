import { Card, CardContent, Typography, Chip, Link, CardActions, Button, CardHeader, Avatar, Badge, Stack } from "@mui/material";
import { PackageDetails, PackageInfo } from "../../services/apiClient";
import { observer } from "mobx-react-lite";
import { cartStore } from "../../stores/CartStore";
import DownloadIcon from '@mui/icons-material/Download'; // Импортируем иконку загрузки
import { GitHub, Public } from "@mui/icons-material";
import { packagesSearchStore } from "../../stores/PackagesStore";

interface PackageSearchResultsProps {
    packageInfo: PackageInfo;
}

const PackageSearchResult: React.FC<PackageSearchResultsProps> = observer(({ packageInfo }) => {
    return (
        <Card variant="outlined">
            {/* Заголовок карточки */}
            <CardHeader
                avatar={
                    <Avatar 
                        sx={{width:64, height:64}}
                        alt="Package icon"
                        src={Boolean(packageInfo.iconUrl) ? packageInfo.iconUrl : "https://img.icons8.com/isometric/64/box.png"}
                        variant="square"
                    />
                }
                title={packageInfo.id}
                subheader={"Version: " + packageInfo.currentVersion}
            />

            {/* Блок с количеством скачиваний */}
            <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 2, pt: 1 }}>
                <DownloadIcon color="primary" fontSize="small" /> {/* Иконка загрузки */}
                <Typography variant="subtitle2" color="text.secondary">
                    {packageInfo.downloadsCount?.toLocaleString() ?? 0} downloads {/* Форматированное число */}
                </Typography>
            </Stack>

            {/* Основное содержимое карточки */}
            <CardContent>
                <Typography variant="body1" gutterBottom>
                    {packageInfo.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Author: {packageInfo.authorInfo}
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
                            View source repository
                        </Link>
                    </Stack>
                )}
                {packageInfo.packageUrl && (
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 2, pt: 1 }}>
                        <Public color="primary" fontSize="small" /> {/* Иконка загрузки */}
                        <Link href={packageInfo.packageUrl} target="_blank" rel="noopener">
                            {`View on official ${packagesSearchStore.repositoryType} package repository site`}
                        </Link>
                    </Stack>
                )}
            </CardContent>

            {/* Действия с карточкой */}
            <CardActions>
                <Button
                    color="primary"
                    onClick={() => cartStore.addCartItem(new PackageDetails({
                        packageID: packageInfo.id,
                        packageVersion: packageInfo.currentVersion
                    }))}
                    variant="contained"
                >
                    Add
                </Button>
                <Button
                    color="secondary"
                    variant="contained"
                >
                    Select version
                </Button>
            </CardActions>
        </Card>
    );
});

export default PackageSearchResult;