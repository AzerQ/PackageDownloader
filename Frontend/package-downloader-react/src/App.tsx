import React from 'react';
import {  Container, Typography } from '@mui/material';
import SearchForm from './components/SearchForm/SearchForm';
import PackageCart from './components/Cart/PackageCart';
import RecommendationsModal from './components/Recommendations/RecommendationsModal';
import NotificationBanner from './components/Notification/Notification';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './localization/LanguageSwitcher';

const App: React.FC = () => {

  const { t } = useTranslation();

  return (
    <>
    <LanguageSwitcher/>
    <Container maxWidth="xl">
      <Typography variant="h4" align="center" gutterBottom>
        {t("AppTitle")}
      </Typography>

      <SearchForm />
      <PackageCart />
      <RecommendationsModal />
      <NotificationBanner/> 

    </Container>
    </>
  );
};

export default App;
