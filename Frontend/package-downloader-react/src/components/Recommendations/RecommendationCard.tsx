import * as React from 'react';
import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import { PackageRecommendation } from '../../services/apiClient';
import { observer } from 'mobx-react-lite';
import { packagesSearchStore } from '../../stores/PackagesStore';
import { recommendationsStore } from './RecommendationsList';
import { useTranslation } from 'react-i18next';


interface RecommendationCardProps {
  data: PackageRecommendation;
}

const searchPackageRecommendation = async (packageId: string) => {
  recommendationsStore.closeRecommendationsForm();
  packagesSearchStore.setSearchQuery(packageId);
  await packagesSearchStore.getSearchResults();
};


const RecommendationCard: React.FC<RecommendationCardProps> = observer(({ data }) => {

  const [isCodeExpanded, setIsCodeExpanded] = React.useState(false);

  const { t } = useTranslation();

  return (
    <Card sx={{ minWidth: 275, marginBottom: 2 }}>
      <CardContent>

        <Typography variant="h6" component="div" gutterBottom>
          {data.name}
        </Typography>


        <Typography variant="subtitle1" color="text.secondary">
          ID: {data.id}
        </Typography>


        <Box sx={{ marginTop: 1 }}>
          <Typography variant="body1" gutterBottom>
            {data.choiceDescription}
          </Typography>
        </Box>


        <Box sx={{ marginTop: 1 }}>
          <Typography variant="caption" gutterBottom>
            {t("CodeExample")}
          </Typography>

          <Button
            size="small"
            onClick={() => setIsCodeExpanded((prev) => !prev)}
            sx={{ textTransform: 'none', display: 'block' }}
          >
            {isCodeExpanded ? t("FoldCode") : t("ShowCode")}
          </Button>

          {isCodeExpanded && (
            <Box
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                padding: 1,
                marginTop: 1,
              }}
            >
              <Typography
                variant="body2"
                component="pre"
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {data.codeExample}
              </Typography>
            </Box>
          )}
        </Box>


        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
          <Button variant="contained" onClick={async () => await searchPackageRecommendation(data.id)}>
            {t("SearchPackage")}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
});

export default RecommendationCard;