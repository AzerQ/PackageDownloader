import React from 'react';
import {  Container, Typography } from '@mui/material';
import SearchForm from './components/SearchForm/SearchForm';
import PackageCart from './components/Cart/PackageCart';
import RecommendationsModal from './components/Recommendations/RecommendationsModal';
import NotificationBanner from './components/Notification/Notification';

const App: React.FC = () => {

  return (
    <>
    <Container maxWidth="xl">
      <Typography variant="h4" align="center" gutterBottom>
        Package Downloader
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
