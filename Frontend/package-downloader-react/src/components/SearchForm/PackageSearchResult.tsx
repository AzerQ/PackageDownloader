import { Card, CardContent, Typography, Chip, Link, CardActions, Button, CardMedia, CardHeader, Avatar } from "@mui/material";
import { PackageDetails, PackageInfo } from "../../services/apiClient";
import { observer } from "mobx-react-lite";
import { cartStore } from "../../stores/CartStore";

interface PackageSearchResultsProps {
    packageInfo: PackageInfo;
}

const PackageSearchResult: React.FC<PackageSearchResultsProps> = observer(({ packageInfo }) => {
    return (
        <Card variant="outlined">
            <CardHeader
                avatar={
                    <Avatar 
                        sx={{width:64, height:64}}
                        alt="Package icon"
                        src={Boolean(packageInfo.iconUrl) ? packageInfo.iconUrl : "https://img.icons8.com/isometric/64/box.png" }
                        variant="square"
                    />
                }
                title={packageInfo.id}
                subheader={"Version: " + packageInfo.currentVersion}
            />
            <CardContent>
               
                <Typography variant="body1" gutterBottom>
                    {packageInfo.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Author: {packageInfo.authorInfo}
                </Typography>
                <div>
                    {packageInfo.tags?.map((tag) => (
                        <Chip key={tag} label={tag} style={{ margin: '4px' }} />
                    ))}
                </div>
                {packageInfo.repositoryUrl && (
                    <Link href={packageInfo.repositoryUrl} target="_blank" rel="noopener">
                        View Repository
                    </Link>
                )}
            </CardContent>
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
            </CardActions>
        </Card>
    );
});

export default PackageSearchResult;