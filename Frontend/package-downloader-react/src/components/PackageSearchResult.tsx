import { Card, CardContent, Typography, Chip, Link, CardActions, Button } from "@mui/material";
import { PackageDetails, PackageInfo } from "../services/apiClient";
import { observer } from "mobx-react-lite";
import { cartStore } from "../stores/CartStore";

interface PackageSearchResultsProps {
    packageInfo: PackageInfo;
}

const PackageSearchResult: React.FC<PackageSearchResultsProps> = observer(({ packageInfo }) => {
    return (
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6">{packageInfo.id}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Version: {packageInfo.currentVersion}
                    </Typography>
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