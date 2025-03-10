import React from 'react';
import { Container, Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PackageCart from '../components/Cart/PackageCart';
import NotificationBanner from '../components/Notification/Notification';
import PreviewReadme from '../components/ReadmePreview';
import RecommendationsModal from '../components/Recommendations/RecommendationsModal';
import SearchForm from '../components/SearchForm/SearchForm';
import LanguageSwitcher from '../localization/LanguageSwitcher';


const PackagesDownloadPage: React.FC = () => {

  const { t } = useTranslation();

  return (
    <>
      <LanguageSwitcher />

      <Grid container spacing={2}>
        <Grid item xs={6} sx={{ overflowY: "scroll", maxHeight: "80em" }}>
          <Container maxWidth="xl">
            <Typography variant="h4" align="center" gutterBottom>
              {t("AppTitle")}
            </Typography>

            <SearchForm />
            <PackageCart />
            <RecommendationsModal />
            <NotificationBanner />

          </Container>
        </Grid>
        <Grid item xs={6} sx={{ overflowY: "scroll", maxHeight: "80em" }}>
          <PreviewReadme />
        </Grid>
      </Grid>

    </>
  );
};

export default PackagesDownloadPage;