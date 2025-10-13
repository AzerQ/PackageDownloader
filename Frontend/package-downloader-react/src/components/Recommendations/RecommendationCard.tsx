import * as React from 'react';
import { Box, Card, CardContent, Typography, Button, ButtonOwnProps } from '@mui/material';
import { PackageRecommendation } from '../../services/apiClient';
import { packagesSearchStore } from '../../stores/PackagesStore';
import { useTranslation } from 'react-i18next';
import {CodeView} from "./CodeView.tsx";
import {useState} from "react";


interface RecommendationCardProps {
  data: PackageRecommendation;
}

const searchPackageRecommendation = async (packageId: string) => {
  packagesSearchStore.setSearchQuery(packageId);
  await packagesSearchStore.getSearchResults();
};

type ButtonProps = Pick<ButtonOwnProps, 'color' | 'variant'>

const searchedButtonProps : ButtonProps = {
  color: 'secondary',
  variant: 'outlined'
}

const notSearchedButtonProps : ButtonProps = {
  color: 'primary',
  variant: 'contained'
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ data }) => {

  const [isCodeExpanded, setIsCodeExpanded] = React.useState(false);

  const [searched, setSearched] = useState<boolean>(false);

  const onSearchButtonClick = async () => {
    await searchPackageRecommendation(data.id);
    setSearched(true);
  }



  const buttonProps: ButtonProps = searched ? searchedButtonProps : notSearchedButtonProps;

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

          {isCodeExpanded && <CodeView code={data.codeExample}/>}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
          <Button {...buttonProps} onClick={onSearchButtonClick}>
            {t("SearchPackage")}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default RecommendationCard;