import React from 'react';
import { Container, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PackageCart from '../components/Cart/PackageCart';
import NotificationBanner from '../components/Notification/Notification';
import PreviewReadme from '../components/PreviewReadme/ReadmePreview.tsx';
import RecommendationsModal from '../components/Recommendations/RecommendationsModal';
import SearchForm from '../components/SearchForm/SearchForm';
import LanguageSwitcher from '../localization/LanguageSwitcher';

const PackagesDownloadPage: React.FC = () => {

  const { t } = useTranslation();

  return (
    <>
      <LanguageSwitcher />

          <Container maxWidth="xl">
            <Typography variant="h4" align="center" gutterBottom>
              {t("AppTitle")}
            </Typography>

            <SearchForm />
            <PackageCart />
            <RecommendationsModal />
            <NotificationBanner />

          </Container>

          <PreviewReadme />

    </>
  );
};

export default PackagesDownloadPage;