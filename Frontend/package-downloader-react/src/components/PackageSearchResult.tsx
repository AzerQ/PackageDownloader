import { Grid, Card, CardContent, Typography, Chip, Link } from "@mui/material";
import { PackageInfo } from "../services/apiClient";

interface PackageSearchResultsProps {
    packageInfo: PackageInfo;
}

const PackageSearchResult: React.FC<PackageSearchResultsProps> = ({ packageInfo }) => {
    return (
        <Grid item xs={12} sm={6} md={4} key={packageInfo.id}>
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
            </Card>
        </Grid>
    );
};

export default PackageSearchResult;